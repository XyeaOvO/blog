# 基于卷积神经网络的CIFAR-10图像分类实验报告
<center> <div style='height:2mm;'> </div> <div style="font-family:华文楷体;font-size:14pt;">未来学院 2023217804班陈墨涵 2023212641</div> </center>

---

#### **摘要**

本项目旨在解决A1实验中全连接网络（FCN）无法有效利用图像空间信息的根本局限。为此，我们设计并实现了一个基于残差连接的深度卷积神经网络（CNN）。为了提升实验的可复现性与代码的可维护性，整个项目采用了 **PyTorch Lightning** 进行训练流程的抽象，并利用 **Hydra** 进行配置管理与超参数调优。我们系统性地探究了不同网络深度、归一化方法（Batch Normalization vs. Group Normalization）、预激活（Pre-activation）结构以及高级数据增强策略（**MixUp** 与 **CutMix**）对模型性能的影响。通过全面的实验与分析，我们的最佳模型在CIFAR-10测试集上达到了 **[填写你的最终准确率]** 的准确率，相较于A1的FCN模型实现了质的飞跃。实验结果表明，残差结构是构建高性能深度模型的关键，而MixUp/CutMix等正则化技术在抑制过拟合并提升模型泛化能力方面扮演了至关重要的角色。

---

### **1. 引言**

#### **1.1 任务背景**
在A1作业中，我们使用全连接神经网络（FCN）在CIFAR-10数据集上取得了初步的分类成果。然而，其实验结论也暴露了FCN的本质缺陷：通过将图像展平（Flatten）为一维向量，模型完全丢失了像素点之间宝贵的空间邻接关系。这导致模型难以学习到如纹理、边缘、形状等对图像理解至关重要的局部特征，从而在区分视觉相似的类别（如“猫”与“狗”）时表现不佳。

卷积神经网络（CNN）通过其核心的**卷积核（Kernel）** 与**池化（Pooling）** 操作，专门为处理网格状数据（如图像）而设计。它能够逐层、分级地从原始像素中提取从简单到复杂的空间特征，更符合人类视觉的感知机理。本次实验的核心任务便是利用CNN的这一结构优势，以期在CIFAR-10分类任务上取得性能的显著突破。

#### **1.2 实验目标**
本实验的主要目标包括：
*   设计并实现一个模块化的、基于残差连接的卷积神经网络，验证其相较于FCN的性能优势。
*   应用**Dropout**和多种**归一化方法**（Normalization），深入理解它们在CNN中对模型训练稳定性和泛化能力的影响。
*   通过交叉验证，为复杂的CNN模型系统性地寻找最优的超参数组合。
*   **（附加题）** 探究更深层次的网络架构（通过增加残差块）、预激活（Pre-activation）变体，以及**MixUp**和**CutMix**等高级正则化方法对模型性能的极限提升作用。

#### **1.3 技术栈：PyTorch Lightning + Hydra**
为了提升开发效率、学习现代框架，本次实验重构了代码架构：
*   **PyTorch Lightning**: 将原始PyTorch代码中的工程样板（如训练循环、验证循环、优化器步骤、设备管理等）进行抽象和自动化，使我们能更专注于模型结构和实验逻辑本身。
*   **Hydra**: 提供了一种强大而灵活的配置管理方案。所有的超参数（模型结构、优化器、数据增强等）都在独立的`.yaml`配置文件中定义，使得运行不同实验、追踪实验配置和复现结果变得极为简便高效。

---

### **2. 实验设计**

#### **2.1 数据集与预处理**
*   **数据集**: CIFAR-10，数据划分与A1保持一致（训练集40000，验证集10000，测试集10000）。
*   **基础数据增强**: 我们沿用了A1中被证明行之有效的增强策略，包括随机裁剪、水平翻转、颜色抖动、随机旋转和随机擦除，以构建一个强大的数据基线。
*   **（附加）高级数据增强：MixUp 与 CutMix**
    *   **MixUp**: 通过对两张图片及其标签进行线性插值，生成新的训练样本。这鼓励模型在不同类别之间形成更平滑的决策边界，增强了泛化能力。
    *   **CutMix**: 将一张图像的随机区域裁剪并粘贴到另一张图像上，标签也按区域面积比例进行混合。这迫使模型不再依赖于图像中最具辨识度的单一区域，而是学习利用更全面的上下文信息。
    我们通过一个`collate_fn`在数据加载阶段以一定概率随机应用这两种策略之一。

#### **2.2 模型：残差网络**
我们设计了一个高度模块化的卷积网络`Cifar10ConvNet`，其核心是**残差块（Residual Block）**，允许信息通过捷径跨层流动，极大地缓解了深度网络训练中的梯度消失问题。

其主要结构如下：
1.  **Stem层**: 一个初始的卷积层，用于将输入图像的3通道扩展为更高维度的特征图。
2.  **Stages**: 由多个串联的残差块（`ConvResidualBlock`或`PreActResidualBlock`）组成。网络的深度（`stage_blocks`）和宽度（`stage_channels`）都可以通过Hydra配置进行灵活调整。
3.  **池化与分类器**: 在通过所有卷积阶段后，使用自适应平均池化（`AdaptiveAvgPool2d`）将特征图降维，最后送入一个或多个全连接层进行分类。

可配置超参数包括：
*   **网络深度与宽度**: `stage_blocks`和`stage_channels`。
*   **归一化方法**: `normalization` (`"batch"` 或 `"group"`)。
*   **预激活结构**: `preactivation` (`True` 或 `False`)，决定了BatchNorm和ReLU相对于卷积层的位置。
*   **Dropout率**: 分别为卷积层（`conv_dropout`）和分类器（`classifier_dropout`）设置。

#### **2.3 实验环境与超参数搜索**
*   **硬件**: 3 x NVIDIA RTX 3090
*   **软件**: PyTorch, PyTorch Lightning, Hydra, Weights & Biases (W&B)

---

### **3. 实验结果与分析**

#### **3.1 Baseline：CNN vs. FCN**
首先，我们将一个相当基础的的CNN模型（stem_channels: 16、conv_channels: [16, 32, 64]、conv_blocks: [3]，100epoches，无高级增强）的性能与A1中的最佳FCN模型（3000epoches）进行对比。
![[Pic/Pasted image 20251112234902.png]]
![[Pic/Pasted image 20251102134413.png]]
图一：CNN（红色）与FCN（蓝色）的训练/验证准确率对比曲线图
**结果分析**: 如图所示，即使是基础的CNN模型，在测试集上的准确率也轻松超过了A1中经过精细调优的FCN模型（例如，从71.49%提升至83.00%）。这直观地证明了卷积操作在提取图像空间特征方面的压倒性优势。

#### **3.2 模型架构探索**
**3.2.1 网络深度与残差结构的影响**



**结果分析**:
[在此处分析你的实验结果。例如：]
实验表明，简单地增加网络深度（例如，从`(2,2,2)`个块增加到`(4,4,4)`个块）并不能保证性能的持续提升，甚至可能出现退化。然而，所有基于残差块的模型均显著优于不带残差连接的普通CNN。这验证了残差连接对于成功训练深度网络的关键作用，它确保了梯度能够顺畅地反向传播，从而让更深层的网络能够学习到有意义的特征。

**3.2.2 归一化方法对比 (Batch Norm vs. Group Norm)**

`[在此处插入使用BatchNorm和GroupNorm的两个模型在相同配置下的训练曲线对比图]`

**结果分析**:
[在此处分析你的实验结果。例如：]
在我们的实验设置中（batch size为[填写你的batch size]），Batch Normalization展现出微弱的性能优势和更快的收敛速度。这符合其设计初衷，即利用整个批次的数据进行统计，从而提供更稳定和准确的归一化。然而，Group Normalization也取得了极具竞争力的结果，并且理论上在小批量训练场景下会更加稳定。对于此任务，两者都是有效的选择，但BatchNorm是默认的最优选。

#### **3.3 正则化策略分析 (附加题)**
**3.3.1 Dropout位置的影响**

`[如果做了相关实验，在此处插入对比图或描述结果]`

**结果分析**:
[在此处分析你的实验结果。例如：]
我们发现，在分类器的全连接层前使用较高的Dropout率（`classifier_dropout` ≈ 0.5）是抑制过拟合最有效的方式。在卷积层之间使用较低的Dropout率（`conv_dropout` ≈ 0.1-0.2）也能带来一定的性能提升，但效果不如在分类器处应用显著。这表明模型过拟合的主要风险发生在从空间特征到类别概率的高度参数化的映射阶段。

**3.3.2 MixUp与CutMix的效果**

`[在此处插入有/无MixUp/CutMix模型的验证准确率和训练损失对比图]`

**结果分析**:
[在此处分析你的实验结果。例如：]
引入MixUp和CutMix的组合后，模型的性能得到了进一步的显著提升（约提升了[填写百分比]）。从图中可以看出，使用这些增强策略后，训练损失下降得更为平缓，同时验证集准确率能够达到一个更高的高原期，且训练集与验证集准确率之间的差距（overfitting gap）明显减小。这证明了MixUp/CutMix作为强大的隐式正则化方法，能有效迫使模型学习更鲁棒、更具泛化能力的特征。

---

### **4. 最佳模型与性能评估**
通过W&B的超参数扫描，我们筛选出在验证集上表现最佳的一组配置，并将其在完整的训练集（训练集+验证集）上重新训练，最终在测试集上进行评估。

**最佳模型配置 (通过Hydra加载):**

| 超参数类别 | 参数 | 最佳值 |
| :--- | :--- | :--- |
| **架构** | `model.stage_channels` | `[填写值]` |
| | `model.stage_blocks` | `[填写值]` |
| | `model.normalization` | `[填写值]` |
| | `model.preactivation` | `[填写值]` |
| **优化** | `optimizer.lr` | `[填写值]` |
| | `optimizer.weight_decay`| `[填写值]` |
| **正则化** | `model.classifier_dropout`| `[填写值]` |
| | `data.mixup_alpha` | `[填写值]` |
| | `data.cutmix_alpha` | `[填写值]` |
| **最终性能** | **验证集最高准确率** | **[填写值]%** |
| | **测试集准确率** | **[填写值]%** |

**训练曲线:**

`[在此处插入最佳模型的最终训练/验证曲线图]`

**混淆矩阵:**

`[在此处插入最佳模型在测试集上的混淆矩阵图]`

**结果分析**:
与A1的混淆矩阵相比，最佳CNN模型在所有类别上都表现出更高的准确性。尤其值得注意的是，之前混淆严重的类别对，如 **cat/dog** 和 **automobile/truck**，其混淆程度得到了**极大缓解**。例如，被错分为dog的cat数量从[填写A1的数值]下降到了[填写A2的数值]。这强有力地证明了CNN成功学习到了区分这些类别的关键局部特征（如动物的耳朵轮廓、车辆的格栅形状等），而这是FCN无法做到的。

**定性结果:**

`[在此处插入一些有趣的分类结果图，例如：FCN分错但CNN分对的样本]`

---

### **5. 结论与展望**

#### **5.1 结论总结**
本次实验成功地设计、训练并评估了一个高性能的卷积神经网络分类器。通过从FCN到CNN的升级，并引入现代化的工程实践（PyTorch Lightning + Hydra）与先进的正则化技术，我们取得了以下关键结论：
1.  **CNN的结构优势**: 凭借卷积和池化操作，CNN能够有效捕获图像的空间层次特征，其性能远超忽略空间信息的FCN，测试集准确率从 **71.49%** 提升至 **[填写你的最终准确率]%**。
2.  **残差连接的重要性**: 残差结构是构建和训练深度CNN模型的关键技术，有效解决了梯度消失问题。
3.  **高级正则化的威力**: MixUp和CutMix等数据增强方法是强大的正则化工具，能显著提升模型的泛化能力，是冲击更高性能的必备策略。
4.  **工程实践的价值**: PyTorch Lightning和Hydra的结合极大地提升了实验的效率、可读性和可复现性。

#### **5.2 思考与展望**
尽管我们的CNN模型取得了优异的成绩，但计算机视觉领域仍在飞速发展。未来的探索方向可以包括：
1.  **更先进的架构**: 探索如Vision Transformer (ViT) 等正在兴起的、基于注意力机制的新型网络架构，并与CNN进行性能对比。
2.  **自监督学习**: 尝试使用自监督预训练方法（如SimCLR, MAE）在无标签数据上预训练模型，再在CIFAR-10上进行微调，这可能进一步提升模型性能。
3.  **更复杂的任务**: 将当前的模型和框架迁移到更具挑战性的任务上，如目标检测或图像分割。

---
### **参考文献**

 Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2012). ImageNet Classification with Deep Convolutional Neural Networks. *Advances in Neural Information Processing Systems*, 25.

 He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep Residual Learning for Image Recognition. *In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*.

 Zhang, H., Cisse, M., Dauphin, Y. N., & Lopez-Paz, D. (2018). mixup: Beyond Empirical Risk Minimization. *In International Conference on Learning Representations (ICLR)*.

 Yun, S., Han, D., Oh, S. J., Chun, S., Choe, J., & Yoo, Y. (2019). CutMix: Regularization Strategy to Train Strong Classifiers with Localizable Features. *In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*.

 Ioffe, S., & Szegedy, C. (2015). Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift. *In International Conference on Machine Learning (ICML)*.

 Falcon, W., & The PyTorch Lightning team. (2019). PyTorch Lightning. *GitHub*.

 Yadan, O. (2019). Hydra - A framework for elegantly configuring complex applications. *GitHub*.