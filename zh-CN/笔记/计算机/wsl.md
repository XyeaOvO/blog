## 安装
**Windows 管理员 PowerShell：**

```
# 将 WSL 的默认版本设置为 2，确保之后安装的都是 WSL2
wsl --set-default-version 2

# 在线安装最新的 Ubuntu 发行版
wsl --install -d Ubuntu
```

**安装常用工具：**
```
sudo apt update && sudo apt -y upgrade
sudo apt -y install curl wget git unzip ca-certificates
```
**查看当前 shell：**

`echo $SHELL`

## 2. 配置代理（持久化）
```sh
nano ~/.bashrc
```

```sh
# ===============================================================
# ==================   Proxy Settings for WSL2   ================
# ===============================================================

# --- 自动获取 Windows 主机的 IP 地址 (通过默认网关) ---
# 这是最可靠的方法，因为它直接查询路由表来找到主机。
export HOST_IP=$(ip route show | grep -i default | awk '{ print $3}')

# --- 代理服务器的端口 ---
# 根据你自己的代理软件设置进行修改
export PROXY_PORT=7897

# --- 设置 http, https, 和 all_proxy 环境变量 ---
# 注意：all_proxy 的协议头取决于你的代理类型 (http, socks5, etc.)
if [ -n "$HOST_IP" ]; then
    export http_proxy="http://${HOST_IP}:${PROXY_PORT}"
    export https_proxy="http://${HOST_IP}:${PROXY_PORT}"
    export all_proxy="socks5://${HOST_IP}:${PROXY_PORT}"

    # --- 设置不走代理的地址 (可选，但建议保留) ---
    export no_proxy="localhost,127.0.0.1,.local,${HOST_IP}"

    # --- (可选) 打印代理信息，方便确认 ---
    echo "Proxy enabled. Using Host IP: ${HOST_IP}"
else
    echo "Proxy Warning: Could not determine Host IP. Proxy not set."
fi

# ===============================================================
```

## 3. 验证代理是否生效

```
# 验证代理变量是否设置成功
echo $http_proxy

# 测试连接 (会返回 HTTP 头信息，如果成功则代理有效)
curl -I https://www.google.com

# (可选) 临时取消代理并再次测试 (应该会失败或超时)
unset http_proxy https_proxy && curl -I https://www.google.com
```

## 4. apt 国内源与代理配置

### 4.1 推荐：不走代理 + 国内源
```
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo tee /etc/apt/sources.list >/dev/null <<'EOF'
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ noble main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ noble-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ noble-backports main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ noble-security main restricted universe multiverse
EOF

echo 'Acquire::ForceIPv4 "true";' | sudo tee /etc/apt/apt.conf.d/99force-ipv4

sudo apt update && sudo apt -y upgrade
```

### 4.2 如果必须走代理（仅支持 HTTP 端口）
```
# 动态生成 apt 代理配置文件
HOST_IP=$(ip route show | grep -i default | awk '{ print $3}')
PROXY_PORT=7897 # 注意这里的端口要和你代理工具的 HTTP 端口一致
sudo tee /etc/apt/apt.conf.d/80proxy >/dev/null <<EOF
Acquire::http::Proxy  "http://${HOST_IP}:${PROXY_PORT}/";
Acquire::https::Proxy "http://${HOST_IP}:${PROXY_PORT}/";
EOF
```
## 5. 安装 Google Chrome
**重要前提**: Google Chrome 是一个图形界面 (GUI) 应用。为了在 WSL 中运行它，你的系统必须支持 Linux GUI 应用：

- ✅ **Windows 11 用户**: 你可以无缝运行，无需任何额外配置。
- ⚠️ **Windows 10 用户**: 你必须先安装并配置一个 X Server (如 VcXsrv)，这是一个复杂的过程。本教程不涉及此部分。
1. 下载：
`wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb`
2. 安装：
`sudo apt install ./google-chrome-stable_current_amd64.deb`
3. 验证：
`google-chrome --version`

## 6. 安装 Node.js 22.x

### 方法 A：使用 nvm（推荐）
```
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 22
nvm alias default 22
nvm use 22

node -v
npm -v
```
## 7. 修复 npm 全局权限问题

1. 新建目录：

`mkdir -p ~/.npm-global`

2. 修改 npm 前缀：

`npm config set prefix '~/.npm-global'`

3. 编辑 `~/.bashrc`：

`nano ~/.bashrc`

在末尾添加：

`export PATH=$HOME/.npm-global/bin:$PATH`

4. 保存退出（Ctrl+O, 回车，Ctrl+X）。
    
5. 生效：
    

`source ~/.bashrc`

6. 验证：

`npm root -g`

应输出 `/home/你的用户名/.npm-global/lib/node_modules`。