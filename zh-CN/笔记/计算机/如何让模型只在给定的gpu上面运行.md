- 在命令行启动脚本时加前缀 CUDA_VISIBLE_DEVICES=<目标GPU索引>，例如 CUDA_VISIBLE_DEVICES=1 python train.py --mode
train，这样进程只看到那块卡。
- 若需要在代码里固定，可在导入 Torch 前设置环境变量：os.environ["CUDA_VISIBLE_DEVICES"] = "1"，或在模型/张量创建前调用
torch.cuda.set_device(0)（索引会映射到上面“可见”的那张卡）。
- 运行时可用 torch.cuda.current_device() 或 nvidia-smi 检查脚本有没有落在预期 GPU 上。