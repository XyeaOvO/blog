## 打开
**Linux 系统处于安全考虑，默认下载的 `.AppImage` 文件没有“可执行权限”**。系统把它当成了一个普通文档，而不是一个程序，所以才会问你要用什么软件打开它。

你不需要安装任何额外的软件来“打开”它，只需要给这个文件加上**运行权限**即可。

请尝试以下两种方法之一来解决：

### 方法一：图形界面设置（最简单）

1.  在文件管理器中，找到这个 `Obsidian-1.10.3.AppImage` 文件。
2.  **右键点击**该文件，选择 **“属性” (Properties)**。
3.  在弹出的窗口中，切换到 **“权限” (Permissions)** 标签页。
4.  找到 **“允许作为程序执行文件” (Allow executing file as program)** 或者类似的选项，**勾选**它。
5.  关闭属性窗口。
6.  现在再次**双击**该文件，Obsidian 应该就能正常启动了。

---

### 方法二：使用终端命令（更快捷）

如果你熟悉或者愿意尝试命令行，也可以这样操作：

1.  在存放该文件的文件夹空白处右键，选择 **“在终端打开” (Open in Terminal)**。
2.  输入以下命令并回车（赋予可执行权限）：
    ```bash
    chmod +x Obsidian-1.10.3.AppImage
    ```
3.  现在你可以直接双击文件运行，或者在终端里输入以下命令运行：
    ```bash
    ./Obsidian-1.10.3.AppImage
    ```

---

### ⚠️ 进阶问题：如果还是打不开（缺少 FUSE 支持）

如果你使用的是 **Ubuntu 22.04 或更高版本**（或者基于它的系统），即便给了权限可能也打不开（点击没反应）。这是因为新系统默认缺少 AppImage 运行所需的 `libfuse2` 库。

**解决方法：**
打开终端，输入以下命令安装依赖库：

```bash
sudo apt update
sudo apt install libfuse2
```

安装完成后，再次双击 AppImage 文件即可运行。
## 优雅打开
你说得很对，每次都要打开文件夹去双击文件，确实**非常不优雅**，也不符合 Linux “高效”的使用习惯。

为了像普通软件一样，能直接在**应用程序菜单（启动器）**、**Dock 栏**或者通过**搜索**（如按 Win 键搜索）打开 Obsidian，你需要把它“集成”到系统中。

这里有两个方案，推荐 **方案一**，一劳永逸，最优雅。

---

### 方案一：使用神器 AppImageLauncher（最推荐 🔥）

这是 Linux 下专门管理 AppImage 文件的工具。安装它之后，你以后下载任何 AppImage 文件，双击运行时，它会弹窗问你：**“要不要把这个软件集成到系统菜单里？”**

一旦点击“是”，它会自动：
1.  把文件移动到一个专门的文件夹（不用你手动整理）。
2.  **自动创建图标**添加到你的开始菜单/启动器。
3.  以后你可以直接搜索 "Obsidian" 启动，和安装的软件一模一样。

**安装方法 (以 Ubuntu/Debian 为例):**

打开终端，输入以下命令安装：

```bash
sudo add-apt-repository ppa:appimagelauncher-team/stable
sudo apt update
sudo apt install appimagelauncher
```
*(如果是非 Ubuntu 系统，可以在 GitHub 搜索 AppImageLauncher 下载对应版本)*

安装完后，再次双击你的 Obsidian AppImage 文件，点击 "Integrate and Run" 即可。

---

### 方案二：手动创建快捷方式（如果不愿安装额外软件）

如果你不想安装额外的工具，可以通过创建一个 `.desktop` 文件来手动“注册”这个软件。

**步骤如下：**

1.  **归档文件**：
    为了防止你误删，先把你下载的 `Obsidian-1.10.3.AppImage` 移动到一个固定的位置，比如在主目录下建一个 `Applications` 文件夹放进去。
    *(假设路径是：`/home/你的用户名/Applications/Obsidian.AppImage`)*

2.  **创建图标文件**：
    打开终端，输入以下命令来创建一个启动器文件：
    ```bash
    gedit ~/.local/share/applications/obsidian.desktop
    ```
    *(如果没有 gedit，可以用 nano 或其他编辑器)*

3.  **粘贴内容**：
    在打开的文件中，粘贴以下内容（**注意修改 Icon 和 Exec 的路径**）：

```ini
[Desktop Entry]
Name=Obsidian
Comment=Obsidian Note Taking
# 下面这一行：请把你存放 AppImage 的真实路径填在 Exec= 后面
Exec=/home/你的用户名/Applications/Obsidian-1.10.3.AppImage
# 下面这一行：Obsidian 的图标路径，如果没有图标，可以不填或者去网上下载一个 png 放在同目录
Icon=text-editor
Terminal=false
Type=Application
Categories=Office;Utility;
StartupNotify=true
```

4.  **保存退出**。

现在，你按键盘上的 `Super` (Win) 键，在菜单里搜索 **Obsidian**，你应该就能看到它了！你可以把它右键“添加到收藏夹”或“固定到 Dock 栏”。
