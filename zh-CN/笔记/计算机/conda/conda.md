conda doctor 
conda config --show channels
conda config --show-sources
conda info
conda list pytorch

一次安装：
mamba create -n pytorch_env python=3.11 pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia -c conda-forge