这是为您准备的 **Ubuntu 24.04 标准最佳实践 (Standard Best Practice)** 配置指南。

**核心策略：**
*   **TeX Live:** 使用 Ubuntu 官方 `apt` 源安装 `texlive-full`。虽然它可能比 CTAN 官网慢半年，但它最稳定、自动管理依赖、不需要手动配环境变量，是新用户的**绝对首选**。
*   **VS Code:** 使用 Microsoft 官方 `apt` 源安装。**千万不要用 Ubuntu 软件中心的 Snap 版**，因为 Snap 的沙盒机制会导致 VS Code 无法读取系统里的 LaTeX 编译器，带来无尽的权限报错。

请依次复制以下代码块到终端执行。

### 第一步：安装 TeX Live (编译器全家桶)

这步下载量较大 (约 4-6GB)，请耐心等待。

```bash
# 1. 更新系统索引
sudo apt update

# 2. 安装完整版 TeX Live (包含所有宏包、字体、编译器)
# 这里的 "best practice" 是直接装 full，避免未来缺包报错
sudo apt install -y texlive-full latexmk
```

### 第二步：安装 VS Code (官方 DEB 源版)

这一步会添加微软官方源，确保你安装的是正版且能自动更新的 `.deb` 版本，而不是阉割权限的 Snap 版。

```bash
# 1. 安装必要的依赖
sudo apt install -y software-properties-common apt-transport-https wget gpg

# 2. 导入微软 GPG 密钥 (一行命令，不要断开)
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg && sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg && rm packages.microsoft.gpg

# 3. 添加 VS Code 仓库源
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null

# 4. 更新缓存并安装
sudo apt update
sudo apt install -y code
```

### 第三步：安装 LaTeX Workshop 插件

直接用 CLI 命令让 VS Code 安装插件，不需要打开软件点点点。

```bash
code --install-extension James-Yu.latex-workshop
```

### 第四步：写入最佳配置 (settings.json)

这一步通过命令行直接覆盖 VS Code 的用户配置文件。配置包含了**自动编译**、**使用 latexmk (自动处理引用)** 和 **编译后自动清理垃圾文件**。

*注意：这会覆盖你现有的 VS Code 用户全局设置。如果你是全新安装，直接运行即可。*

```bash
# 确保配置目录存在
mkdir -p ~/.config/Code/User

# 写入最佳配置
cat > ~/.config/Code/User/settings.json <<EOF
{
    "security.workspace.trust.enabled": false,
    "editor.wordWrap": "on",
    
    // === LaTeX Workshop 核心设置 ===
    
    // 禁止弹出烦人的编译错误弹窗，改为底部状态栏提示
    "latex-workshop.message.error.show": false,
    "latex-workshop.message.warning.show": false,

    // 保存文件时自动编译 (核心体验)
    "latex-workshop.latex.autoBuild.run": "onSave",

    // 编译出错时尝试清理并重试
    "latex-workshop.latex.autoBuild.cleanAndRetry.enabled": true,

    // 编译成功后自动清理辅助文件 (.aux, .log 等)
    "latex-workshop.latex.autoClean.run": "onBuilt",
    "latex-workshop.latex.clean.fileTypes": [
        "*.aux", "*.bbl", "*.blg", "*.idx", "*.ind", "*.lof", "*.lot", 
        "*.out", "*.toc", "*.acn", "*.acr", "*.alg", "*.glg", "*.glo", 
        "*.gls", "*.ist", "*.fls", "*.log", "*.fdb_latexmk", "*.synctex.gz"
    ],

    // === 编译工具链配置 (使用 xelatex) ===
    // 能够完美支持中文和现代字体
    "latex-workshop.latex.recipes": [
        {
            "name": "xelatexmk",
            "tools": ["xelatexmk"]
        }
    ],
    "latex-workshop.latex.tools": [
        {
            "name": "xelatexmk",
            "command": "latexmk",
            "args": [
                "-xelatex",
                "-synctex=1",
                "-interaction=nonstopmode",
                "-file-line-error",
                "-outdir=%OUTDIR%",
                "%DOC%"
            ]
        }
    ],

    // PDF 阅读器配置 (VSCode 内置标签页)
    "latex-workshop.view.pdf.viewer": "tab",
    
    // 启用正反向跳转 (Ctrl + Click)
    "latex-workshop.view.pdf.internal.synctex.keybinding": "ctrl-click"
}
EOF
```

### 第五步：验证环境

创建一个测试文件来确认一切正常。

```bash
# 1. 创建一个测试文件夹
mkdir -p ~/latex_test
cd ~/latex_test

# 2. 写入一个包含中文的测试文件
cat > test.tex <<EOF
\documentclass{ctexart}
\title{环境测试成功}
\author{Ubuntu User}
\date{\today}
\begin{document}
\maketitle
你好，Ubuntu！
This is a test document compiled with XeLaTeX.
\begin{equation}
E = mc^2
\end{equation}
\end{document}
EOF

# 3. 用 VS Code 打开当前文件夹
code .
```

**最后一步操作：**
1.  VS Code 打开后，点击左侧文件列表中的 `test.tex`。
2.  按下 `Ctrl + S` 保存。
3.  观察左下角状态栏，应显示 `Build` 图标转动，随后变为 `√`。
4.  右上角会自动弹出 PDF 预览窗口（如果没有，点击右上角的小放大镜图标）。
5.  如果看到了中文“你好，Ubuntu！”，恭喜，你的本地 LaTeX 最佳实践环境配置完成。