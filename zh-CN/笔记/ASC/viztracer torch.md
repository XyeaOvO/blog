针对你当前的使用场景 (`torchrun --nproc_per_node=1 train.py`)，直接在前面加 `viztracer` 是不行的，因为 `viztracer` 会去分析 `torchrun` 这个启动器进程，而不是你的 `train.py`。

这里有三种最常用的解决方案，**推荐程度从高到低**：

### 方法一：代码侵入式（最推荐，最精准）

深度学习训练通常会有漫长的“数据加载”和“模型初始化”过程，而且往往涉及成千上万个迭代。如果你只想分析**某几个核心 Iteration** 的性能（比如查找 GPU 瓶颈），这种方法最好，生成的报告文件也不会大到打不开。

在你的 `train.py` 中修改：

```python
# 1. 引入库
from viztracer import VizTracer

def main():
    # ... 模型初始化代码 ...
    
    # 2. 初始化 Tracer
    # output_file: 结果保存路径
    # ignore_c_function: 设为 True 可以减小文件体积，只看 Python 层面的调用
    tracer = VizTracer(output_file="result.json", ignore_c_function=True)
    
    # ... Dataloader 循环 ...
    for epoch in range(epochs):
        for i, batch in enumerate(dataloader):
            
            # 3. 只在特定的 step 开启记录 (例如第 10 到 20 步)
            if i == 10:
                tracer.start()
            
            # --- 你的训练代码 ---
            optimizer.zero_grad()
            output = model(input)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            # ------------------
            
            # 4. 停止并保存
            if i == 20:
                tracer.stop()
                tracer.save() # 保存文件
                print("VizTracer result saved!")
                return # 分析完就可以退出了，没必要跑完
```

**运行方式：**
不需要改变你的启动命令，依然使用：
```bash
torchrun --nproc_per_node=1 train.py
```

---

### 方法二：命令行包裹（无需改代码，全量分析）

如果你不想改代码，且想看程序从启动到结束的全过程。你需要利用 `torchrun` 本质上是在调用 `torch.distributed.run` 模块这一特性。

你可以让 `viztracer` 去执行 `torch.distributed.run`，并加上 `--log_subprocess` 参数，这样它能追踪到启动器生成的子进程（也就是你的 `train.py`）。

**运行命令：**

```bash
viztracer --log_subprocess --output_file result.json --ignore_c_function -m torch.distributed.run --nproc_per_node=1 train.py
```

*   `--log_subprocess`: **关键参数**。因为 `torch.distributed.run` 会生成子进程来运行 `train.py`，必须加这个才能捕获到训练脚本的信息。
*   `-m torch.distributed.run`: 这完全等价于 `torchrun`。
*   `--ignore_c_function`: (可选) 强烈建议加上。PyTorch 底层全是 C++ 调用，不加这个生成的文件会巨大且极其卡顿，除非你专门调试 C 扩展。

---

### 方法三：手动模拟单卡环境（最轻量）

既然你设置了 `--nproc_per_node=1`，意味着其实就是一个单进程训练。`torchrun` 在这种情况下主要是在设置环境变量（`MASTER_ADDR`, `RANK`, `WORLD_SIZE` 等）。

你可以直接跳过 `torchrun`，直接用 `viztracer` 运行脚本，但需要手动补齐环境变量（有些脚本如果不从 torchrun 启动会报错）：

**运行命令：**

```bash
# 模拟 torchrun 设置的环境变量
export MASTER_ADDR=localhost
export MASTER_PORT=12355
export RANK=0
export WORLD_SIZE=1

# 直接运行 viztracer
viztracer --output_file result.json --ignore_c_function train.py
```

### 总结

*   **想精细分析瓶颈（推荐）：** 用 **方法一**，只包裹 `train_step` 那个循环。
*   **想看程序启动慢不慢：** 用 **方法二**。
*   **文件太大打不开？** 记得加上 `--ignore_c_function`，或者减少录制的 step 数量。

分析完后，使用 `vizviewer result.json` 在浏览器中查看即可。