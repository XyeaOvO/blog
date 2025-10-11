  在 PowerShell 里依次执行：

  # 找出占用 6006 的进程
  netstat -ano | findstr :6006

  # 假设上一步输出的最后一列是 12345，确认进程是哪个应用
  tasklist /FI "PID eq 12345"

  # 如需结束它
  taskkill /PID 12345 /F
