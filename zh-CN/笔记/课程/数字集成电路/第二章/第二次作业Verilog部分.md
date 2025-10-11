<center> <div style='height:2mm;'> </div> <div style="font-family:华文楷体;font-size:14pt;">未来学院 2023217804班陈墨涵 2023212641</div> </center>
### pmos延时大于nmos

![[Pic/Pasted image 20251008202159.png]]
仿真结果：
![[Pic/Pasted image 20251008202238.png]]
当a从0变1时候，10ns+0.1ns 到 10ns+0.2ns 这段时间里，在会出现nmos导通但pmos还没截止的情况，导致输出节点 out 同时被 Vdd 和 Gnd 驱动，即红色的 'X' 未知状态。

同理，当a从1变0时候，20ns+0.1ns 到 20ns+0.2ns 这段时间里，在会出现nmos截止，pmos也截止的情况，导致输出节点 out 同时不被 Vdd 和 Gnd 驱动，即黄色的 'z' 高阻态。
### nmos延时大于pmos
![[Pic/Pasted image 20251008202703.png]]
如图，原理相似，仿真结果取反即可。