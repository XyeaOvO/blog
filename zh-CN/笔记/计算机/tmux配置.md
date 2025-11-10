### **Tmux 安装与配置教程**

本教程将带你完成以下步骤：

1.  **第一步：安装 Tmux 和必要依赖**
2.  **第二步：安装 Nerd Font 字体 (为了漂亮的图标)**
3.  **第三步：安装 TPM - Tmux 插件管理器**
4.  **第四步：配置 `~/.tmux.conf` - 核心配置文件**
5.  **第五步：首次启动和安装插件**
6.  **第六步：核心功能使用指南**
7.  **第七步：与 Vim/Neovim 的无缝集成**

---

### **第一步：安装 Tmux 和必要依赖**

首先，我们需要在你的系统上安装 `tmux` 本体以及后续插件需要的一些命令行工具。

**1. 安装 Tmux**

*   **macOS (使用 Homebrew):**
    ```bash
    brew install tmux
    ```
*   **Debian / Ubuntu (使用 apt):**
    ```bash
    sudo apt update
    sudo apt install tmux
    ```
*   **Fedora / CentOS / RHEL (使用 dnf/yum):**
    ```bash
    sudo dnf install tmux
    ```
*   **Arch Linux (使用 pacman):**
    ```bash
    sudo pacman -S tmux
    ```

**2. 安装依赖工具**

这些工具将被我们的插件用来实现更强大的功能。

*   `git`: 用于下载插件。
*   `fzf`: 用于实现模糊搜索功能。
*   剪贴板工具: `xclip` (Linux/X11), `wl-copy` (Linux/Wayland) 或 `pbcopy` (macOS)，用于系统剪贴板集成。

```bash
# Debian / Ubuntu
sudo apt install git fzf xclip

# Fedora / CentOS
sudo dnf install git fzf xclip

# Arch Linux
sudo pacman -S git fzf xclip

# macOS
brew install git fzf
```

---

### **第二步：安装 Nerd Font 字体 (关键步骤)**

我们的主题插件 `Catppuccin` 使用了很多特殊图标（如 , █）来美化状态栏。这些图标需要 **Nerd Font** 字体才能正确显示，否则你会看到乱码或方框。

1.  **访问 Nerd Fonts 官网**: [https://www.nerdfonts.com/font-downloads](https://www.nerdfonts.com/font-downloads)
2.  **选择并下载一款字体**: 推荐 `FiraCode Nerd Font` 或 `JetBrainsMono Nerd Font`。
3.  wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/JetBrainsMono.zip
4.  **安装字体**:
    *   下载后解压，在你的系统中安装所有字体文件（通常是双击字体文件，然后点击“安装”）。
5.  **配置你的终端**: **这是最重要的一步**。打开你终端模拟器（如 iTerm2, Kitty, Windows Terminal, Alacritty, GNOME Terminal 等）的设置，将**主字体**设置为你刚刚安装的 Nerd Font 字体（例如，选择 `FiraCode Nerd Font`）。

> **检查**：重启终端后，尝试复制粘贴这个图标 `` 到你的终端里。如果能正常显示，说明字体配置成功。

---

### **第三步：安装 TPM (Tmux Plugin Manager)**

TPM 是目前最流行的 `tmux` 插件管理器，它可以让我们轻松地添加、更新和移除插件。

打开你的终端，运行以下命令来克隆 TPM 的仓库到指定位置：

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

---

### **第四步：配置 `.tmux.conf` - 核心配置文件**

这是整个教程的核心。我们将创建一个强大且注释详尽的配置文件。

在你的用户主目录下创建一个名为 `.tmux.conf` 的文件：

```bash
touch ~/.tmux.conf
```

然后，将下面的所有内容复制并粘贴到 `~/.tmux.conf` 文件中。

```tmux

```

---

### **第五步：首次启动和安装插件**

现在所有准备工作都已就绪，让我们来激活这一切。

1.  **关闭所有现有的 `tmux` 会话** (如果之前有打开过)。
2.  **启动一个新的 `tmux` 会话**，在终端中输入：
    ```bash
    tmux
    ```
3.  你可能会看到一个基本的状态栏，底部可能提示一些错误，这很正常，因为插件还没有安装。
4.  **安装插件**：现在，按下你的**前缀键 `Ctrl + a`** (松开)，然后立即按**大写的 `I`** (就像 `Install` 的首字母)。
5.  你会看到 `TPM` 开始在底部状态栏显示插件安装进度。等待它完成，直到显示 "TMUX environment reloaded."。

至此，你的 `tmux` 已经配置完毕！状态栏应该已经变成了漂亮的 Catppuccin 主题风格。

---

### **第六步：核心功能使用指南**

你的新 `tmux` 环境非常强大，以下是你最常用的一些快捷键：

| 功能 | 快捷键 | 描述 |
| :--- | :--- | :--- |
| **重载配置** | `Ctrl+a` + `r` | 修改 `.tmux.conf` 后，用此快捷键立即生效。 |
| **垂直分割** | `Ctrl+a` + `|` | 将当前窗格左右分割。 |
| **水平分割** | `Ctrl+a` + `-` | 将当前窗格上下分割。 |
| **切换窗格** | `Ctrl+a` + `h/j/k/l` | 使用 Vim 键位在窗格间移动。 |
| **调整大小** | `Ctrl+a` + `H/J/K/L` (可连按) | 向左/下/上/右调整窗格大小。 |
| **最大化窗格** | `Ctrl+a` + `z` | 将当前窗格最大化/恢复。 |
| **新建窗口** | `Ctrl+a` + `c` | 创建一个新窗口 (标签页)。 |
| **切换窗口** | `Ctrl+a` + `n/p` 或 `Ctrl+a` + `数字` | 切换到下一个/上一个或指定编号的窗口。 |
| **模糊搜索** | `Ctrl+a` + `F` | 使用 `fzf` 快速搜索并切换窗口/窗格。 |
| **进入复制模式** | `Ctrl+a` + `[` | 进入滚动和复制模式。 |
| **复制** | 在复制模式下，用`v`选择，`y`复制。 | 复制的内容会进入系统剪贴板。 |
| **粘贴** | `Ctrl+a` + `]` | 粘贴内容。 |

---

### **第七步：与 Vim/Neovim 的无缝集成**

我们安装了 `vim-tmux-navigator` 插件，它允许你使用相同的 `Ctrl + h/j/k/l` 快捷键在 Vim/Neovim 的分割窗口和 `tmux` 的窗格之间无缝跳转。

要启用这个功能，你还需要在你的 Vim/Neovim 配置中安装对应的插件。

*   **如果你使用 `vim-plug`:**
    ```vim
    Plug 'christoomey/vim-tmux-navigator'
    ```
*   **如果你使用 `packer.nvim` (Lua):**
    ```lua
    use 'christoomey/vim-tmux-navigator'
    ```
*   **如果你使用 `lazy.nvim` (Lua):**
    ```lua
    { 'christoomey/vim-tmux-navigator' }
    ```

安装好 Vim/Neovim 端的插件后，重启 Vim/Neovim。现在，你可以像在单个应用中一样，在所有分割的窗格（无论它属于 `tmux` 还是 Vim）之间自由穿梭了！

---

**恭喜你！** 你现在拥有了一个专业、高效且美观的 `tmux` 开发环境。欢迎来到高效终端工作的新世界！