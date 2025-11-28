## 0. 背景：从 VGGT/MapAnything 到 NeRF
* 原来只用过 **VGGT / MapAnything** 这类前馈 3D 模型：给一堆图 → 一次性吐相机位姿、深度和点云。
* 这次想尝试 **NeRF / Gaussian Splatting** 这种 **“单场景优化”的三维表示**，选择了：

  * 框架：**Nerfstudio**
  * 包管理：**uv**
  * 机器：**Ubuntu 22.04 + 4× RTX 3090**

目标是：

> 用 uv 从零搭好环境 → 跑通 Nerfstudio 的 demo → 开始理解训练日志和 viewer。

---

## 1. 环境和 Python 管理：全程用 uv

### 1.1 安装 uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
# source ~/.bashrc
uv --version
```

之后所有 Python 相关操作都走 `uv pip` + `uv venv`。

### 1.2 创建工程目录和虚拟环境

```bash
mkdir -p ~/nerfstudio-uv
cd ~/nerfstudio-uv

uv python install 3.10     
uv venv .venv -p 3.10
source .venv/bin/activate
```

---

## 2. 用 uv 安装 PyTorch

### 2.1 安装 PyTorch 2.1.2 + cu118

```bash
uv pip install --upgrade pip

UV_HTTP_TIMEOUT=600 uv pip install \
  "torch==2.1.2+cu118" \
  "torchvision==0.16.2+cu118" \
  --extra-index-url https://download.pytorch.org/whl/cu118
```

* 下载很慢 / 会超时：通过调大 `UV_HTTP_TIMEOUT`、必要时换国内镜像（清华等）来解决。

安装后做一次 sanity check：

```bash
python - << 'PY'
import torch
print("CUDA available:", torch.cuda.is_available())
print("CUDA in torch:", torch.version.cuda)
print("GPU count:", torch.cuda.device_count())
for i in range(torch.cuda.device_count()):
    print(i, torch.cuda.get_device_name(i))
PY
```

---

## 3. 安装 tiny-cuda-nn：从报错到成功编译

目标：装上 **tiny-cuda-nn (tinycudann)**，让 nerfacto 的 NeRF 实现走高性能 backend。

### 3.1 第一道坑：build isolation 找不到 torch

一开始直接：

```bash
TCNN_CUDA_ARCHITECTURES=86 uv pip install \
  "git+https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch"
```

报错：

> `ModuleNotFoundError: No module named 'torch'`

原因：uv 的「隔离构建环境」里没有 torch。

解决：加 `--no-build-isolation`，让构建直接用当前 venv 的 torch：

```bash
TCNN_CUDA_ARCHITECTURES=86 uv pip install \
  --no-build-isolation \
  "git+https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch"
```

### 3.2 第二道坑：CUDA 12.1 vs cu118 mismatch

系统 CUDA 是 12.1，torch 是 cu118（11.8），编译时触发：

> `The detected CUDA version (12.1) mismatches the version that was used to compile PyTorch (11.8).`

解决思路有几种，你走的是**让扩展编译用 CUDA 11.8 的路线**：

1. 安装 **CUDA Toolkit 11.8**（不动现有驱动），装到 `/usr/local/cuda-11.8`。

2. 设置环境变量：

   ```bash
   export CUDA_HOME=/usr/local/cuda-11.8
   export PATH="$CUDA_HOME/bin:$PATH"
   export LD_LIBRARY_PATH="$CUDA_HOME/lib64:$LD_LIBRARY_PATH"
   export TCNN_CUDA_ARCHITECTURES=86   # 3090 是 8.6
   ```

3. 再次安装：

   ```bash
   TCNN_CUDA_ARCHITECTURES=86 uv pip install \
     --no-build-isolation \
     "git+https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch"
   ```

最后成功输出：

```text
Built tinycudann ...
Installed tinycudann==2.0
```

验证：

```bash
python - << 'PY'
import tinycudann as tcnn
print("tcnn OK, version:", getattr(tcnn, "__version__", "unknown"))
PY
# tcnn OK, version: unknown
```

至此，**PyTorch + tcnn 环境 OK**。

---

## 4. 安装 Nerfstudio 和 COLMAP

### 4.1 用 uv 装 nerfstudio

```bash
UV_HTTP_TIMEOUT=600 uv pip install nerfstudio
ns-train --help | head -n 20
```

### 4.2 装 COLMAP（SfM/MVS，用来解算相机）

```bash
sudo apt-get update
sudo apt-get install -y colmap
```

Nerfstudio 的 `ns-process-data images` 会自动调用它。

---

## 5. 跑通第一个 demo：poster + nerfacto + 多卡

### 5.1 下载 demo 数据

```bash
cd ~/nerfstudio-uv
source .venv/bin/activate

ns-download-data nerfstudio --capture-name=poster
# 得到 data/nerfstudio/poster
```

### 5.2 单卡训练 nerfacto

```bash
ns-train nerfacto --data data/nerfstudio/poster
```

终端会给出 viewer 地址，例如：

```text
Viewer at: http://0.0.0.0:7007
```

浏览器打开 `http://127.0.0.1:7007` 就能看到训练中的场景。

### 5.3 4×3090 多卡训练
多卡命令是：

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3 ns-train nerfacto \
  --machine.num-devices 4 \
  --data data/nerfstudio/poster
```

`train-num-rays-per-batch` 控制的是：

> 每块 GPU 每个 iteration 采多少条 ray（总 batch = 该值 × num_devices）。

你目前常用的是 `4096`，就等价于：

* 每 GPU：4096 ray/step
* 4 卡全局：16384 ray/step

---

## 6. 看懂终端里的训练日志

Nerfstudio 训练时会持续打印，例如：

```text
Step (% Done)   Train Iter (time)   ETA (time)         Train Rays / Sec
60 (0.20%)      303.901 ms          2 h, 31 m, 38 s    76.63 K
```

含义：

* **Step (% Done)**：当前 iteration 和整体完成百分比（默认 max-num-iterations = 30000）。
* **Train Iter (time)**：每一步训练耗时。
* **ETA (time)**：按当前速度估计离结束还要多久。
* **Train Rays / Sec**：每秒训练的 ray 数量（吞吐量）。

调 `train-num-rays-per-batch` 的时候，你就是在 trade-off：

* **更大 batch** → 一步算更多 ray → GPU 利用率高、梯度更平滑；
* 但 **迭代更慢，多卡同步 / IO 等 overhead↑**，到某个点后收益会变小甚至变负。

---

## 7. 新版 Nerfstudio Viewer 的使用要点

你截的那张图是 **新 UI**，和网上很多旧截图不一样，但核心功能都在：

### 7.1 切换 RGB / Depth / Normals

在右边面板：

> **Control → Render Options → Output type**

默认是 `rgb`，展开可以选：

* `depth`：看深度分布；
* `normals`：看法线，判断几何是否合理；
* 还有 accumulation、prob_depth 等调试视图。

`Max res` 决定预览分辨率，卡够的话可以拉高一点。

### 7.2 指标（PSNR 等）在哪里看？

* Viewer 不再默认画训练曲线；
* 指标主要来源：

  * 终端里的文本日志；
  * 或者训练时用 `--vis viewer+wandb` 把数据同步到 WandB；
  * 或者训完后跑 `ns-eval` 输出一份 metrics JSON。

Viewer 现在主要用于：

* 交互式浏览场景；
* 画 camera path；
* 控制渲染相关参数。