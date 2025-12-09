# 深度学习代码规范：张量形状管理 SOP

**版本**：1.0
**目的**：消除张量形状歧义，杜绝维度对齐错误（如 `BCHW` vs `BHWC`），降低调试成本。
**适用范围**：所有涉及 Tensor 操作的模型定义、数据预处理及前向传播代码。

## 0. 核心工具链准备
在项目中必须安装并使用以下库：

```bash
pip install jaxtyping typeguard einops
```

*   **`jaxtyping`**: 用于类型标注（支持 PyTorch/NumPy）。
*   **`typeguard`** (或 `beartype`): 用于运行时检查，让类型标注不仅仅是注释。
*   **`einops`**: 用于直观的张量维度变换。

---

## 1. 数据结构定义规范 (Input Layer)

**原则**：严禁在核心模型接口中使用 `Dict[str, Tensor]` 或 `Tuple[Tensor, ...]`。

### SOP 执行步骤：
1.  所有复杂输入必须定义为 Python `dataclass`。
2.  在 dataclass 中使用 `jaxtyping` 明确标注每个字段的形状。
3.  对于已知的固定维度（如 RGB 通道），**必须写死数字**（如 `3`）而非变量名，以防止通道/长宽混淆。

**✅ 标准范例：**
```python
from dataclasses import dataclass
from torch import Tensor
from jaxtyping import Float, Bool, Int

@dataclass
class PerceptionInput:
    # 强制检查：必须是 RGB (3通道)，且放在第2维
    images: Float[Tensor, "batch 3 height width"]
    
    # 强制检查：必须是 4x4 变换矩阵
    lidar_pose: Float[Tensor, "batch 4 4"]
    
    # 掩码通常只有 1 个通道
    valid_mask: Bool[Tensor, "batch 1 height width"]
```

---

## 2. 函数签名规范 (Interface Layer)

**原则**：函数签名必须具备“自文档化”能力，IDE 悬停即见形状。

### SOP 执行步骤：
1.  输入参数优先使用上面定义的 `dataclass`。
2.  如果是单独的 Tensor 参数，必须使用 `Float/Int[Tensor, "..."]` 标注。
3.  **关键步骤**：在开发/调试阶段，给 `forward` 或 `__call__` 加上运行时类型检查装饰器（如 `@typechecked`）。

**✅ 标准范例：**
```python
import torch.nn as nn
from typeguard import typechecked

class FeatureExtractor(nn.Module):
    
    @typechecked  # <--- 运行时检查，形状不对直接报错
    def forward(
        self, 
        inputs: PerceptionInput,  # 使用 Step 1 的类
        confidence: Float[Tensor, "batch"] 
    ) -> Float[Tensor, "batch embedding_dim"]:
        
        # ... 代码逻辑
        pass
```

---

## 3. 内部逻辑实现规范 (Logic Layer)

**原则**：禁止使用“依赖隐式顺序”的原生算子（`view`, `permute`, `transpose`），除非是极简单的操作（如 `.T`）。

### SOP 执行步骤：
1.  **维度重排**：必须使用 `einops.rearrange`，并完整写出源模式和目标模式。
2.  **维度规约**：必须使用 `einops.reduce`（替代 `mean()`, `sum()`），明确指出在哪个维度操作。
3.  **矩阵乘法**：复杂乘法建议使用 `torch.einsum`。

**❌ 禁止行为：**
```python
# 禁止：谁知道 1 是哪个维度？如果输入变成 BHWC 就会错得离谱
x = x.permute(0, 3, 1, 2) 
# 禁止：-1 掩盖了真实维度
x = x.view(B, C, -1)
```

**✅ 标准范例：**
```python
from einops import rearrange, reduce

# 场景：将 transformer 输出 (B, N, C) 还原为图像 (B, C, H, W)
# 这里的 h=16, w=16 是显式校验，如果 N != 256，这里会直接报错
feat_map = rearrange(
    inputs.images, 
    "b (h w) c -> b c h w", 
    h=16, w=16
)

# 场景：全局平均池化
# 无论输入是 BCHW 还是 BHWC，指定 'h w' 永远不会错
global_feat = reduce(feat_map, "b c h w -> b c", "mean")
```

---

## 4. 变量命名规范 (Naming Convention)

**原则**：当通过局部变量传递 Tensor 时，如果该 Tensor 经历了形状变换，变量名应体现当前维度状态（可选，但在复杂逻辑中推荐）。

### SOP 执行步骤：
1.  使用后缀法命名关键中间变量。

**✅ 标准范例：**
```python
# 原始特征
feat_bchw = encoder(x)

# 变换后
feat_bhwc = rearrange(feat_bchw, "b c h w -> b h w c")
flat_feat_bnc = rearrange(feat_bhwc, "b h w c -> b (h w) c")

# 这样当你写 flat_feat_bnc.shape 时，你心里非常清楚它是 [B, N, C]
```

---

## 快速查阅清单 (Checklist)

每次提交代码前（Code Review），请自查以下几点：

| 检查项 | 是否达标 | 修正方案 |
| :--- | :---: | :--- |
| **输入不是 Dict** | ☐ | 使用 `@dataclass` 包装输入 |
| **签名含形状** | ☐ | 使用 `jaxtyping` 标注，如 `Float[Tensor, "b c h w"]` |
| **通道维已写死** | ☐ | RGB图像必须标注为 `... 3 ...` 而非 `... c ...` |
| **无裸露 View** | ☐ | 将 `x.view()` 替换为 `einops.rearrange` |
| **无裸露 Permute**| ☐ | 将 `x.permute()` 替换为 `einops.rearrange` |

---

### 为什么这一套 SOP 能解决你的问题？

1.  **不再遗忘**：你不需要记忆 `Dict` 里有什么，IDE 会提示你 `dataclass` 的属性。你不需要记忆 `Tensor` 形状，鼠标悬停函数签名就能看到。
2.  **杜绝 BCHW/BHWC 混淆**：
    *   **入口处**：`jaxtyping` 里的 `"batch 3 h w"` 会像看门狗一样，一旦你传入 `[B, H, W, 3]`，运行时检查器会立刻抛出异常。
    *   **过程中**：`einops` 的 `rearrange` 强制你写出维度名字，逻辑显式化。