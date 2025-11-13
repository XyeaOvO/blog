#### **1. 项目概述**

本项目旨在开发一个基于循环神经网络（RNN/LSTM）的AI诗歌生成工具。该工具将使用Pytorch Lightning进行训练，并能够生成多种类型的古典中文诗词，包括：
*   **主题引导诗 (Prompt-based Poetry)**: 以用户给定的主题、标题或句子作为开头进行续写。
*   **藏头诗 (Acrostic Poetry)**: 根据用户提供的汉字生成藏头诗。
*   **常规诗 (Standard Poetry)**: 从单个字或词开始，自由生成诗句。

此文档详细说明了项目的技术要求、代码结构、模块功能及交付标准，旨在为开发人员提供一份清晰、可执行的实现蓝图。开发者的任务是完成所有代码的编写，无需进行实验设计或报告撰写。

#### **2. 技术规格**

*   **核心框架:** PyTorch & PyTorch Lightning
*   **配置管理:** Hydra
*   **实验跟踪:** Weights & Biases (WandB)
*   **环境管理:** Mamba
*   **代码规范与自动化:** Ruff & **Pre-commit**

#### **3. 项目与目录结构**

项目 `poetry-generator` 应采用以下模块化的目录结构。所有训练产物（日志、模型、词汇表）将被自动保存在 `outputs/` 目录下，并已在 `.gitignore` 中配置忽略。

```
poetry-generator/
├── conf/                     # Hydra 配置文件目录
│   ├── config.yaml           # 主配置文件
│   ├── data/
│   │   └── poetry.yaml       # 数据处理配置
│   ├── model/
│   │   ├── rnn.yaml          # RNN 模型配置
│   │   └── lstm.yaml         # LSTM 模型配置
│   └── trainer/
│       └── default.yaml      # PyTorch Lightning Trainer 配置
│
├── data/
│   └── poetry.txt            # 原始诗词数据集
│
├── src/
│   └── poetry_generator/     # 主 Python 包
│       ├── __init__.py
│       ├── data/
│       │   ├── __init__.py
│       │   └── datamodule.py # LightningDataModule 的实现
│       ├── models/
│       │   ├── __init__.py
│       │   ├── core.py       # 定义纯PyTorch模型 (nn.Module)
│       │   └── lightning.py  # 定义LightningModule，包装core.py中的模型
│       └── pipelines/
│           ├── __init__.py
│           ├── generate.py   # 推理与生成脚本
│           └── train.py      # 训练主脚本
│
├── scripts/                  # 辅助脚本
│   └── run_sweep.sh          # 运行WandB Sweep的脚本
│
├── .pre-commit-config.yaml   # Pre-commit 钩子配置文件
├── environment.yml           # Mamba 环境配置文件
├── pyproject.toml            # 项目配置，用于Ruff
├── sweep.yaml                # WandB Sweep 配置文件
├── .gitignore
└── README.md
```

#### **4. 环境与工具配置**

**4.1 Mamba 环境 (`environment.yml`)**
```yaml
name: poetry-generator
channels:
  - pytorch
  - nvidia
  - conda-forge
dependencies:
  - python=3.10
  - pytorch
  - torchvision
  - torchaudio
  - pytorch-cuda=11.8 # 可根据实际CUDA版本调整
  - pytorch-lightning
  - hydra-core
  - wandb
  - numpy
  - ruff
  - mamba
  - pre-commit
```

**4.2 Ruff 代码规范 (`pyproject.toml`)**
```toml
[tool.ruff]
select = ["E", "F"] # 启用Flake8的错误(E)和pyflakes(F)规则
line-length = 88

[tool.ruff.format]
quote-style = "double"
```

**4.3 Pre-commit 钩子 (`.pre-commit-config.yaml`)**
```yaml
# See https://pre-commit.com for more information
# See https://pre-commit.com/hooks.html for more hooks
repos:
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
    -   id: trailing-whitespace
    -   id: end-of-file-fixer
    -   id: check-yaml
    -   id: check-added-large-files
-   repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
    -   id: ruff
        args: [--fix, --exit-non-zero-on-fix]
    -   id: ruff-format
```
---
#### **5. 模块实现细节**

**5.1 数据模块 (`src/poetry_generator/data/datamodule.py`)**

*   **类:** `PoetryDataModule(pl.LightningDataModule)`
*   **`__init__(self, data_path: str, batch_size: int, seq_length: int, val_split: float)`**:
    *   接收数据路径、批处理大小、序列长度和验证集划分比例。
*   **`setup(self, stage: str)`**:
    *   读取 `data/poetry.txt`，进行清洗。
    *   构建词汇表 (`self.vocab`)，以及 `self.char_to_ix` 和 `self.ix_to_char` 映射。
    *   **重要:** 将构建好的词汇表映射 **保存为 `vocab.json`**，以便推理时复用。具体保存路径由训练脚本管理。
    *   将全部文本转为数字索引序列，并根据 `seq_length` 构建输入-目标对。
    *   根据 `val_split` 将数据集划分为训练集和验证集。
*   **`train_dataloader(self)` / `val_dataloader(self)`**: 返回对应的DataLoader实例。

**5.2 模型核心架构 (`src/poetry_generator/models/core.py`)**

*   **类:** `PoetryCoreModel(nn.Module)`
*   **`__init__(self, model_type: str, vocab_size: int, embedding_dim: int, hidden_dim: int, n_layers: int)`**:
    *   定义 `self.embedding`, `self.rnn` (`nn.RNN` 或 `nn.LSTM`, `batch_first=True`), `self.linear` 层。
*   **`forward(self, input_tensor, hidden_state)`**: 返回 `logits` 和下一个 `hidden_state`。

**5.3 模型训练逻辑 (`src/poetry_generator/models/lightning.py`)**

*   **类:** `PoetryLightningModel(pl.LightningModule)`
*   **`__init__(self, ...)`**: 实例化核心模型 `self.model`，定义损失函数 `nn.CrossEntropyLoss`，并使用 `self.save_hyperparameters()` 保存所有参数。
*   **`training_step` / `validation_step`**: 实现标准的训练和验证逻辑，并使用 `self.log()` 记录损失。
*   **`configure_optimizers(self)`**: 返回 `torch.optim.AdamW` 优化器。
*   **`generate(self, start_indices: list, max_len: int, temperature: float)`**:
    *   **核心生成逻辑**: 实现单步、温度控制的字符采样。
    *   接收**数字索引列表**作为输入，返回生成的**数字索引列表**。
    *   该方法不应涉及任何文本编解码，只处理张量。

**5.4 训练与生成流程**

*   **训练脚本 (`src/poetry_generator/pipelines/train.py`)**:
    *   使用 `@hydra.main(config_path="../../../conf", config_name="config.yaml", version_base=None)`。
    *   Hydra将为每次运行自动创建唯一的输出目录。
    *   实例化`DataModule`和`LightningModel`。
    *   在`DataModule.setup()`被调用后，将生成的`vocab.json`保存到当前Hydra运行的输出目录中。
    *   初始化`WandbLogger`和`ModelCheckpoint`，并确保模型检查点也保存在同一输出目录。
    *   初始化 `pl.Trainer` 并调用 `.fit()` 启动训练。
*   **生成脚本 (`src/poetry_generator/pipelines/generate.py`)**:
    *   脚本应通过命令行参数接收**模型检查点路径** (`--ckpt_path`) 和 **词汇表文件路径** (`--vocab_path`)。
    *   加载模型和词汇表。
    *   实现**用户友好的生成函数**，负责文本与索引的编解码，并调用模型内的 `generate` 方法：
        *   `generate_from_prompt(model, vocab, prompt: str, ...)`
        *   `generate_acrostic(model, vocab, head: str, ...)`

---

#### **6. 配置管理 (Hydra)**

*   **`conf/config.yaml`**:
    ```yaml
    defaults:
      - data: poetry
      - model: lstm
      - trainer: default
      - _self_
    
    # 产物将保存在 hydra.run.dir 指定的目录中
    
    project_name: "poetry-generator"
    run_name: "${model.name}-h${model.hidden_dim}-s${data.seq_length}"
    ```
*   **`conf/data/poetry.yaml`**:
    ```yaml
    data_path: "data/poetry.txt"
    batch_size: 64
    seq_length: 48
    val_split: 0.05 # 验证集划分比例
    ```
*   **`conf/model/lstm.yaml`**:
    ```yaml
    name: lstm
    embedding_dim: 128
    hidden_dim: 256
    n_layers: 2
    learning_rate: 0.001
    ```

---

#### **7. 超参数搜索 (WandB Sweeps)**

**`sweep.yaml`**:
```yaml
program: src/poetry_generator/pipelines/train.py
method: bayes
metric:
  name: val_loss
  goal: minimize
parameters:
  model:
    parameters:
      name: {values: ['lstm', 'rnn']}
      learning_rate: {distribution: uniform, min: 0.0001, max: 0.01}
      hidden_dim: {values: [128, 256, 512]}
      n_layers: {values: [2, 3]}
  data:
    parameters:
      seq_length: {values: [32, 48, 64]}
```

---

#### **8. 工作流程与代码质量**

1.  **代码格式化**: 提交代码前，必须运行 `ruff check . --fix && ruff format .`。
2.  **README**: 撰写一份详细且现代化的`README.md`。必须包含以下内容，可参考模板：

    ```markdown
    # AI 古典诗词生成器 (AI Poetry Generator)

    ![Python Version](https://img.shields.io/badge/Python-3.10+-blue.svg)
    ![Framework](https://img.shields.io/badge/PyTorch-Lightning-8A2BE2.svg)
    ![Code Style](https://img.shields.io/badge/Code%20Style-Ruff-black.svg)
    ![License](https://img.shields.io/badge/License-MIT-green.svg)

    这是一个基于 RNN/LSTM 和 PyTorch Lightning 实现的古典中文诗歌生成项目，能够生成主题引导诗、藏头诗等多种类型的诗词。

    ## ✨ 功能特性

    *   **主题引导**: 给定任意标题或句子，模型将围绕其意境进行续写。
    *   **藏头诗**: 轻松生成工整的藏头诗。
    *   **现代化工具链**: 使用 Hydra, WandB, Ruff 等现代工具进行高效开发与实验。
    *   **高度可复现**: 通过 Mamba 环境和清晰的脚本，确保训练和推理过程可复现。

    ## 🚀 快速开始

    ### 1. 环境设置

    确保你已经安装了 Mamba (或 Conda)。然后创建并激活环境：

    ```bash
    mamba env create -f environment.yml
    mamba activate poetry-generator
    ```

    ### 2. 单次训练

    运行一次训练，所有配置由 `conf/` 目录下的文件定义。你可以通过命令行覆盖任何参数。

    ```bash
    # 使用默认的 LSTM 模型进行训练
    python -m poetry_generator.pipelines.train

    # 或者，切换为 RNN 模型并修改批处理大小
    python -m poetry_generator.pipelines.train model=rnn data.batch_size=32
    ```
    训练完成后，最佳模型的检查点 (`.ckpt`) 和词汇表 (`vocab.json`) 将保存在 `outputs/` 目录下一个以日期和时间命名的文件夹中。

    ### 3. 超参数搜索

    使用 Weights & Biases Sweeps 进行自动超参数搜索。

    ```bash
    # 步骤 1: 初始化 Sweep 并获取 SWEEP_ID
    sh scripts/run_sweep.sh

    # 步骤 2: 运行 agent (将下面的占位符替换为你的实际ID)
    wandb agent <YOUR_ENTITY/YOUR_PROJECT/YOUR_SWEEP_ID>
    ```

    ### 4. 生成诗歌

    使用 `generate.py` 脚本加载训练好的模型进行创作。

    ```bash
    # 设置模型和词汇表路径 (替换为你的实际路径)
    CKPT_PATH="outputs/YYYY-MM-DD/HH-MM-SS/checkpoints/best_model.ckpt"
    VOCAB_PATH="outputs/YYYY-MM-DD/HH-MM-SS/vocab.json"

    # 示例 1: 主题引导生成
    python -m poetry_generator.pipelines.generate \
      --ckpt_path $CKPT_PATH \
      --vocab_path $VOCAB_PATH \
      --prompt "春江花月夜" \
      --max_len 100

    # 示例 2: 生成藏头诗
    python -m poetry_generator.pipelines.generate \
      --ckpt_path $CKPT_PATH \
      --vocab_path $VOCAB_PATH \
      --acrostic "人工智能"
    ```
    ```




---
#### **9. 提交规范**

为保证代码库的整洁和历史记录的可读性，所有代码提交应遵循以下规范。

**5.1 Git 分支管理**
*   **`main` 分支**: 项目主分支，始终保持稳定。**禁止直接向 `main` 分支推送代码**。
*   **特性分支 (Feature Branch)**: 所有新功能、修复或文档都必须在新分支上进行。分支命名应采用 `类型/简短描述` 的格式 (e.g., `feature/add-generator-cli`, `fix/datamodule-bug`)。

**5.2 Commit 信息规范 (建议)**
为了清晰地追溯项目历史，**强烈建议**所有提交信息遵循 **Conventional Commits** 规范。
*   **格式**: `<type>(<scope>): <subject>`
*   **示例**:
    *   `feat(model): implement core lstm module`
    *   `fix(data): correct vocab saving path`
    *   `docs(readme): add usage instructions`

**5.3 自动化质量检查 (Pre-commit)**
本项目使用 `pre-commit` 框架在每次提交前自动执行代码质量检查（格式化与Linting）。
1.  **安装钩子**: 在首次克隆项目并创建环境后，必须在项目根目录运行以下命令来激活 `pre-commit`：
    ```bash
    pre-commit install
    ```
2.  **工作流程**:
    *   当你执行 `git commit` 时，`.pre-commit-config.yaml` 中定义的钩子会自动运行。
    *   如果代码不符合规范（例如，格式错误），钩子可能会自动修复它。修复后，你需要重新 `git add` 修改的文件，然后再次 `git commit`。
    *   如果钩子报告了无法自动修复的错误，你需要手动修复它们，然后才能成功提交。
    *   **所有提交到远程仓库的代码都必须能够通过 pre-commit 的所有检查。**

---

#### **10. 交付物与验收标准**

1.  **代码库:** 完整的、与本文档描述一致的代码库。
2.  **可复现性:**
    *   `mamba env create -f environment.yml` 必须成功创建环境。
    *   `python -m poetry_generator.pipelines.train` 必须无错启动训练。
    *   训练结束后，必须在对应的Hydra输出目录中产出**模型检查点 (`.ckpt`)** 和 **词汇表文件 (`vocab.json`)**。
    *   `sh scripts/run_sweep.sh` 必须成功启动WandB Sweep。
3.  **功能性:**
    *   `python -m poetry_generator.pipelines.generate` 必须能够加载检查点和词汇表，并成功生成**主题引导诗**和**藏头诗**。
4.  **代码质量:**
    *   所有Python代码必须通过Ruff的检查和格式化。
    *   代码逻辑清晰，有适当注释，遵循模块化和关注点分离原则。
    *   **Git历史记录清晰**，所有分支和提交信息均符合规范。