<center> <div style='height:2mm;'> </div> <div style="font-family:华文楷体;font-size:14pt;">未来学院 2023217804班陈墨涵 2023212641</div> </center>
### 1.题目
![[Pic/Pasted image 20251008174926.png]]
### 2. 题目分析
我们设输出为 F，由图易得：
F = (A & B) | (B & C) | (A & C)
### 3. Verilog 代码实现
我这里使用在线Verilog模拟器[Edit code - EDA Playground](https://www.edaplayground.com/)
#### 3.1 使用 `assign` 语句的实现

`assign` 语句用于描述组合逻辑，它将逻辑表达式直接、连续地赋值给一个 `wire` 型的输出。这种方式非常直观，代码如下：

```verilog
// 文件名: design.sv
// 模块名: logic_design_assign
module logic_design_assign (
  input      A,
  input      B,
  input      C,
  output     F
);

  // 直接将化简后的逻辑表达式赋值给输出F
  assign F = (A & B) | (B & C) | (A & C);

endmodule
```
#### 3.2 使用 `always` 块的实现

`always` 过程块也可以用来描述组合逻辑。通过使用敏感列表 `@(*)`，我们可以让该过程块在任何输入信号（A, B, C）发生变化时重新计算输出F的值。需要注意的是，在 `always` 块内被赋值的信号必须被声明为 `reg` 类型。

```verilog
// 文件名: design.sv
// 模块名: logic_design_always
module logic_design_always (
  input      A,
  input      B,
  input      C,
  output reg F   // 输出被定义为 reg 类型
);

  // 使用 always 块描述组合逻辑
  // @(*) 表示任何输入变化都会触发块内代码的执行
  always @(*) begin
    F = (A & B) | (B & C) | (A & C);
  end

endmodule
```

### 4. 仿真验证

#### 4.1 测试平台 (Testbench) 设计

为了验证我们设计的正确性，需要编写一个Testbench。该Testbench的主要功能是：
1.  实例化被测试的设计模块（DUT）。
2.  产生完备的输入激励信号，即遍历A, B, C从`3'b000`到`3'b111`的所有8种可能。
3.  在每个输入下，将电路的实际输出 `F_out` 与根据卡诺图得到的预期输出 `F_expected` 进行对比。
4.  通过打印信息，清晰地展示对比结果。

#### 4.2 Testbench 代码
```verilog
// 文件名: testbench.sv
module testbench;

  // 声明变量用于连接DUT
  reg  A_tb, B_tb, C_tb;
  wire F_tb;
  
  // 实例化被测试模块 (此处以 assign 版本为例)
  logic_design_assign dut (
    .A(A_tb),
    .B(B_tb),
    .C(C_tb),
    .F(F_tb)
  );
  
  // 产生激励并显示结果
  initial begin
    logic expected_F;

    $display("Time | A B C | F_out | F_expected");
    $display("-----------------------------------");

    // 循环遍历所有8种输入组合
    for (integer i = 0; i < 8; i = i + 1) begin
      {A_tb, B_tb, C_tb} = i;
      #10; // 延时10ns以便观察

      // 根据卡诺图计算预期结果
      case ({A_tb, B_tb, C_tb})
        3'b000: expected_F = 0;
        3'b001: expected_F = 0;
        3'b010: expected_F = 0;
        3'b011: expected_F = 1;
        3'b100: expected_F = 0;
        3'b101: expected_F = 1;
        3'b110: expected_F = 1;
        3'b111: expected_F = 1;
      endcase
      
      $display("%4t | %b %b %b |   %b   |     %b", $time, A_tb, B_tb, C_tb, F_tb, expected_F);
    end

    #10;
    $finish;
  end

endmodule
```

### 5 仿真
#### 5.1 `assign` 版本仿真结果
![[Pic/Pasted image 20251008180403.png]]
#### 5.2 `always` 版本仿真结果
![[Pic/Pasted image 20251008180443.png]]

从控制台可以看出，对于从`000`到`111`的所有8种输入组合，电路的实际输出 `F_out` 与我们预期的输出 `F_expected` 完全一致，说明设计正确。