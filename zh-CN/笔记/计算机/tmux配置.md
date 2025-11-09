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
# =============================================================================
# tmux.conf | 优化与注释增强版
#
# 特点:
# - 前缀键: Ctrl+a
# - 导航: Vim 风格 (h,j,k,l)
# - 插件管理: TPM
# - 依赖: Nerd Font 字体 (为了主题图标), fzf (为了模糊搜索)
# =============================================================================


# =============================================================================
# 全局设置 (Global Options)
# =============================================================================

# 设置前缀键为 Ctrl+a，这是一个比默认 Ctrl+b 更方便的选择
unbind C-b
set-option -g prefix C-a
bind-key C-a send-prefix

# 缩短 Esc 键的延迟时间，提升在 Vim/Neovim 中的响应速度
set -sg escape-time 0

# 设置一个现代化的、能正确报告自身能力的终端类型
# Tc 标志用于启用 True Color (24-bit color)，让色彩更丰富
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",*256col*:Tc"

# 开启鼠标支持，实现点击切换窗口/面板、滚动查看等功能
set -g mouse on

# 增加历史记录的行数，方便回溯查看更多输出
set -g history-limit 50000

# 窗口和面板的起始序号从 1 开始，更符合直觉
set -g base-index 1
setw -g pane-base-index 1
# 关闭窗口后自动重新编号，保持序号的连续性
set -g renumber-windows on

# 允许窗口标题根据当前运行的程序自动重命名
setw -g automatic-rename on
set -g set-titles on
# 自定义标题格式：窗口索引:窗口名 - 当前进程名
set -g set-titles-string '#I:#W - #T'

# 开启焦点事件，对于 Neovim 等应用的自动重载功能至关重要
set -g focus-events on

# 延长状态栏消息的显示时间 (单位: 毫秒)
set -g display-time 1500

# 延长需要重复按键的命令的等待时间 (如调整面板大小)
set -g repeat-time 1000

# 将状态栏放到顶部，更现代的风格
set -g status-position top


# =============================================================================
# 快捷键绑定 (Key Bindings)
# =============================================================================

# 使用 r 键重载配置文件，并显示提示信息，立即生效
bind r source-file ~/.tmux.conf \; display "配置文件已重载！"

# 更直观的窗格分割方式，并保持在当前目录下
bind | split-window -h -c "#{pane_current_path}" # 垂直分割 (vertical split)
bind - split-window -v -c "#{pane_current_path}" # 水平分割 (horizontal split)

# 关闭当前窗格或窗口
bind q killp # 关闭窗格 (kill-pane)
bind w killw # 关闭窗口 (kill-window)

# 使用 Vim 的 h,j,k,l 在窗格间切换
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# [优化] 使用 Ctrl+l 清屏并清除历史记录，比单纯清屏更彻底
bind C-l send-keys 'C-l' \; clear-history

# 使用 Vim 风格的快捷键，更流畅地调整窗格大小 (可重复按键，无需再次按前缀)
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# 更方便地切换窗口 (可重复按键，无需再次按前缀)
bind -r C-h select-window -t :-
bind -r C-l select-window -t :+

# 在当前窗格中最大化/还原 (Zoom)
bind z resize-pane -Z

# 窗格同步：在一个窗格中输入，所有同步窗格会接收同样的输入。再次按下可取消。
bind S setw synchronize-panes \; display "窗格同步已 #{?synchronize-panes,开启,关闭}！"

# 启用 Vim 风格的复制模式
setw -g mode-keys vi

# 复制模式下的按键绑定 (依赖 tmux-yank 插件)
# v -> 开始选择, C-v -> 矩形选择, y -> 复制到系统剪贴板
bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi C-v send-keys -X rectangle-toggle
bind-key -T copy-mode-vi y send-keys -X copy-pipe-and-cancel

# 使用 'p' 键粘贴 (tmux-yank 插件会确保从系统剪贴板粘贴)
bind p paste-buffer


# =============================================================================
# 外观与主题 (Theme & Status Bar)
# =============================================================================
# 这部分主要由下面的 Catppuccin 主题插件自动配置，此处仅为备用设置

# 窗格边框
set -g pane-border-style "fg=colour238"    # 默认边框颜色
set -g pane-active-border-style "fg=colour51,bg=default" # 活动窗格边框颜色

# 消息和命令行的颜色
set -g message-style "fg=white,bg=black,bold"

# 高亮当前活动窗口的标签样式
setw -g window-status-current-style "fg=white,bg=red,bold"
setw -g window-status-current-format " #I:#W#F "

# 非活动窗口的标签样式
setw -g window-status-style "fg=gray,bg=default"
setw -g window-status-format " #I:#W#F "


# =============================================================================
# TPM 插件管理器 (TPM Plugin Manager)
# =============================================================================
#
# 安装/更新插件步骤:
# 1. 在下面用 set -g @plugin '...' 添加新插件
# 2. 启动 tmux 后按下前缀键 `Ctrl+a` + `I` (大写的I) 来安装新插件
# 3. 按下前缀键 `Ctrl+a` + `U` (大写的U) 来更新所有已安装插件
#
# =============================================================================

# 插件列表
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible' # 一套合理的 Tmux 默认配置，作为基础

# 核心功能插件
set -g @plugin 'tmux-plugins/tmux-resurrect' # 保存和恢复 Tmux 会话
set -g @plugin 'tmux-plugins/tmux-continuum' # 自动保存和恢复
set -g @plugin 'tmux-plugins/tmux-yank'      # 改进的复制机制，与系统剪贴板无缝集成

# 主题插件 (需要 Nerd Font 字体支持以获得最佳图标效果)
set -g @plugin 'catppuccin/tmux'
set -g @catppuccin_flavour 'mocha' # 可选: latte, frappe, macchiato, mocha
set -g @catppuccin_window_left_separator ""
set -g @catppuccin_window_right_separator " "
set -g @catppuccin_window_middle_separator " █"
set -g @catppuccin_window_number_position "right"
set -g @catppuccin_status_modules_right "directory date_time"
set -g @catppuccin_status_left_separator  " "
set -g @catppuccin_status_right_separator ""
set -g @catppuccin_directory_text "#{b:pane_current_path}" # 仅显示当前目录名，路径更简洁

# 效率与导航插件
set -g @plugin 'sainnhe/tmux-fzf' # 使用 fzf 进行窗口、窗格、会话的模糊搜索切换
set -g @plugin 'tmux-plugins/tmux-open' # 在浏览器中快速打开高亮的URL或文件
set -g @plugin 'tmux-plugins/tmux-prefix-highlight' # 当按下前缀键时在状态栏高亮提示

# 实现 Vim 和 Tmux 窗格的无缝跳转 (需要在 vim/nvim 中也安装此插件)
set -g @plugin 'christoomey/vim-tmux-navigator'


# =============================================================================
# 插件具体配置 (Plugin Options)
# =============================================================================

# tmux-resurrect 插件设置
# 保存 Neovim 会话 (如果是用 Vim, 请改为 'session')
set -g @resurrect-strategy-nvim 'session'
# 保存窗格内容，非常有用但可能会占用较多资源
set -g @resurrect-capture-pane-contents 'on'

# continuum 插件设置
set -g @continuum-restore 'on' # 启动 tmux 时自动恢复上次的会话
set -g @continuum-save-interval '15' # 每 15 分钟自动保存一次

# tmux-prefix-highlight 设置
set -g @prefix_highlight_show_copy_mode 'on'
set -g @prefix_highlight_show_sync_mode 'on'


# =============================================================================
# 初始化 TPM (必须放在配置文件的最后)
# =============================================================================
run '~/.tmux/plugins/tpm/tpm'
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