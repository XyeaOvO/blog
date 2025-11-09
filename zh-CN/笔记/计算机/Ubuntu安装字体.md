wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/JetBrainsMono.zip
### **第一步：安装 `unzip` 工具**

首先，确保你的系统安装了解压工具。如果没装，用下面的命令安装：

```bash
sudo apt update
sudo apt install unzip
```

---

### **第二步：为用户创建字体目录**

我们将把字体安装在当前用户的主目录下，这是最推荐的做法，因为它不需要管理员权限，也不会影响其他用户。

标准的字体目录是 `~/.local/share/fonts`。我们用下面的命令来创建它（如果目录已存在，这个命令也不会报错）：

```bash
mkdir -p ~/.local/share/fonts
```

---

### **第三步：解压字体到目标目录**

现在，我们将下载的 `JetBrainsMono.zip` 文件解压到刚刚创建的字体目录中。为了保持整洁，我们最好为它创建一个单独的子目录。

假设你的 `JetBrainsMono.zip` 文件在你的“下载” (Downloads) 文件夹里：

```bash
# 首先进入下载目录
cd ~/Downloads

# 解压字体文件到我们创建的字体目录中
unzip JetBrainsMono.zip -d ~/.local/share/fonts/JetBrainsMono
```
> **解释**：`-d` 参数告诉 `unzip` 命令将文件解压到指定的目标目录。

---

### **第四步：更新系统字体缓存**

仅仅把字体文件放进目录是不够的，我们还需要告诉系统有新字体了。使用 `fc-cache` 命令来刷新字体缓存。

```bash
fc-cache -f -v
```
> **解释**：`-f` 表示强制刷新，`-v` 会显示详细过程，你可以看到系统正在扫描字体目录。

---

### **第五步：验证字体是否安装成功**

你可以用 `fc-list` 命令来检查字体是否已经被系统识别。

```bash
fc-list | grep "JetBrainsMono Nerd"```

如果安装成功，你应该能看到一长串包含 "JetBrainsMono Nerd Font" 的输出，这证明系统已经找到了这款字体。

---

### **第六步：在你的终端中配置字体（最关键的一步！）**

现在字体已经安装到系统里了，你需要告诉你的终端模拟器去**使用**它。

**对于默认的 Ubuntu 终端 (GNOME Terminal):**

1.  打开你的终端。
2.  点击终端窗口右上角的**菜单按钮**（通常是三条横线）。
3.  选择 **“首选项” (Preferences)**。
4.  在弹出的窗口中，选择你的配置文件（例如 “Unnamed” 或你自定义的配置），然后点击 **“文本” (Text)** 选项卡。
5.  在“字体” (Font) 部分，**勾选 “自定义字体” (Custom font)**。
6.  点击当前显示的字体名称（例如 `Monospace Regular`）。
7.  在弹出的字体选择对话框中，**在搜索框里输入 `JetBrainsMono Nerd`**。
8.  从列表中选择 **`JetBrainsMono Nerd Font`** (通常选择 Regular 或 Medium 字重)。
9.  点击右下角的 **“选择” (Select)** 按钮，然后关闭首选项窗口。

### **第七步：重启终端并最终测试**

为了让所有设置完全生效，**完全关闭你所有的终端窗口，然后重新打开一个新的**。

在新终端里，运行 `tmux` 或者直接在命令行里粘贴下面的测试字符：

```bash
echo " █  Nerd Fonts Test Successful  █ "
```

如果你能看到漂亮的箭头和方块图标，而不是一些奇怪的方框或者问号，**那么恭喜你，Nerd Font 已经完美配置成功了！** 你的 `tmux` 状态栏现在也应该能正确显示所有图标了。

---

### **总结一下命令：**

```bash
# 1. (如果需要) 安装unzip
sudo apt install unzip

# 2. 创建目录
mkdir -p ~/.local/share/fonts

# 3. 解压 (假设文件在下载目录)
cd ~/Downloads
unzip JetBrainsMono.zip -d ~/.local/share/fonts/JetBrainsMono

# 4. 刷新缓存
fc-cache -f -v

# 5. 验证
fc-list | grep "JetBrainsMono Nerd"
```
完成这些命令后，记得去终端设置里**手动选择**这款字体。