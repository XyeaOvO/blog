# **面向主动三维重建的“下一最佳视角”规划全面综述：从经典基础到现代学习范式**

## **摘要**

“下一最佳视角”（Next-Best-View, NBV）规划是机器人学和计算机视觉领域中的一个基础性问题，其核心目标是自主且高效地选择一系列传感器位姿，以最少的资源消耗构建未知物体或场景的完整、精确的三维模型。在过去的几十年里，NBV方法论经历了从依赖手工设计规则和几何启发的经典算法，到利用大规模数据和强大计算能力的现代深度学习范式的深刻演变。这种演变不仅反映了人工智能技术的整体进步，也揭示了研究人员对主动感知问题理解的不断深化。然而，NBV策略的多样性和快速发展也导致了方法论的碎片化，使得研究人员和实践者难以系统地导航和标准化该领域。

本综述旨在对科研领域中的NBV任务研究现状进行一次全面、系统且深入的梳理。报告首先界定NBV问题的核心挑战、基本构成要素及其在机器人自主系统中的关键作用。随后，报告将详细剖析两大类NBV规划方法：经典的非学习方法和现代的基于学习的方法。在经典方法部分，将深入探讨基于信息论与不确定性、基于几何与前沿以及基于采样的策略，并分析其优势与固有的计算瓶颈。在基于学习的方法部分，将系统性地介绍监督学习、模仿学习、强化学习以及预测引导等前沿范式，并通过详细的框架对比，揭示它们在自主性、数据依赖性和泛化能力上的不同权衡。此外，本综述还将探讨NBV规划与新兴三维场景表示（如神经辐射场和三维高斯溅射）的协同演化、多模态信息融合以及端到端学习等前沿课题。最后，报告将审视NBV技术的实际应用、评估基准与开放挑战，并对未来的研究方向，如混合系统、终身学习和基础模型的应用，进行展望。通过对超过100篇核心出版物的系统性回顾和综合分析，本报告旨在为初学者和资深专家提供一个结构化的知识框架和富有洞察力的研究指南。

---

## **1\. 主动感知的必要性：“下一最佳视角”规划导论**

在机器人技术和自动化系统的发展进程中，赋予机器自主感知和理解其所处物理世界的能力，是一个核心且持久的追求。与被动地接收和处理预先给定的数据不同，主动感知（Active Perception）强调智能体能够通过有目的的行动来优化其信息获取过程，从而更高效、更准确地完成任务。在三维重建领域，这一理念具体化为“下一最佳视角”（Next-Best-View, NBV）规划问题。本章旨在为NBV问题建立基础性的认知框架，界定其核心挑战，阐述其基本构成，并明确其在推动机器人自主化进程中的重要意义。

### **1.1 定义NBV问题：高效信息采集的核心挑战**

NBV问题的核心目标是，在资源受限的情况下，自主地规划一个最优或次优的传感器观测序列，以高效地完成对未知物体或场景的三维重建任务 1。这里的“资源受限”是一个多维度的约束，通常包括观测次数、机器人移动的总时间或总路径长度、计算耗时，乃至无人机等平台的电池续航 1。因此，NBV的本质是在“最大化信息增益”与“最小化资源消耗”这两个相互制约的目标之间寻求最佳平衡。这使其成为主动视觉（Active Vision）和主动感知领域的一个基本问题 8。

该问题具有天然的迭代特性。系统在每个决策时刻，都必须基于已有的、不完整的观测数据，来决定下一步传感器应该移动到哪个位置，以获取对重建任务最有价值的新信息 8。这种序贯决策（Sequential Decision-Making）的特性是NBV问题复杂性的根源。一个理想的NBV策略不仅应能填补当前模型的未知区域，还应能有效处理遮挡、提高模型精度，并最终以最经济的方式达成重建目标。

在实践中，寻找全局最优的N个视点组合是一个已被证明的NP-hard问题 14，其搜索空间会随着视点数量的增加而呈指数级增长，在计算上是不可行的 6。因此，学术界和工业界的研究几乎普遍采用了一种重要的简化假设，即将问题转化为一个迭代的、贪婪的序贯决策过程 1。系统在每一步并不试图规划出未来所有视点的完整序列，而是只回答一个更简单的问题：“基于当前已有的信息，下一个能带来最大收益的视点在哪里？” 1。这种“一步最优”的贪婪策略将一个复杂的组合优化问题分解为一系列在每个时间步上更易于处理的搜索或回归任务。这一基本启发式思想贯穿了从经典算法到现代学习方法的几乎所有NBV框架，构成了该领域研究的基石。虽然这种贪婪假设使得问题变得 tractable（易于处理），但其代价是可能导致全局次优解，例如产生冗余的移动路径或在早期陷入局部最优。认识到这一固有限制，是理解许多高级NBV方法设计动机的关键，例如，那些引入路径成本惩罚的多目标效用函数 12，以及能够学习非短视（non-myopic）策略的强化学习方法。

### **1.2 问题形式化：NBV规划的三大支柱**

尽管具体的实现技术千差万别，但NBV规划问题在文献中通常被建模为一个包含三个核心组件的流程 2。这三大支柱共同定义了一个NBV系统的结构和行为。

1. **物体/场景表示 (Object/Scene Representation)**：这是NBV规划的基础，决定了系统如何存储和更新其对世界的认知。选择何种表示方式深刻影响着后续所有环节的算法设计。传统方法广泛使用显式和结构化的表示，如占据栅格图（Occupancy Grids），特别是基于八叉树的OctoMap，它能高效地表示三维空间中的已知（占据/空闲）和未知区域 2。其他表示还包括表面网格（Surface Meshes）和点云（Point Clouds） 3。近年来，随着深度学习的发展，隐式神经表示（Implicit Neural Representations），如神经辐射场（NeRF），也开始被用作场景表示，为NBV规划带来了新的机遇和挑战 19。  
2. **候选视点生成 (Candidate Viewpoint Proposal)**：在决定“去哪里”之前，系统需要先生成一组潜在的“下一最佳视角”候选集。生成策略的复杂性各不相同。最简单的方法是在围绕物体重心的一个预定义球壳或半球壳上进行均匀采样 20。更高级的策略则利用已有的场景信息来指导采样过程，其中最著名的是基于前沿（Frontier-based）的生成方法，即在已知自由空间和未知空间的边界区域生成候选视点，因为这些区域最有可能揭示新信息 2。  
3. **最优视点选择 (Optimal Viewpoint Selection)**：这是NBV算法的核心，即通过一个效用函数（Utility Function）或评估函数（Evaluation Function）对所有候选视点进行打分和排序，并最终选出得分最高的视点作为“下一最佳视角” 2。这个效用函数是NBV规划器目标的数学化身，它量化了从一个特定视点进行观测所能带来的预期收益。效用函数的具体形式多种多样，可以旨在最大化新观测到的表面积（覆盖率）、最大化模型不确定性的降低程度、最小化熵，或者综合考虑信息增益与移动成本等多个因素。

这三个组件的协同工作构成了一个完整的NBV决策循环：系统根据当前传感器数据更新其场景表示，从表示中提取信息以生成一组有前景的候选视点，然后利用效用函数评估这些视点，选择最佳者并移动传感器，如此循环往复，直到满足某个终止条件（如达到预设的覆盖率、超过视点数量预算或信息增益低于阈值）。

### **1.3 在机器人学与计算机视觉中的重要性与影响**

NBV规划作为一种核心使能技术，其影响力贯穿于机器人学和计算机视觉的众多应用领域。获取完整、精确的三维环境知识是许多高级自主任务的先决条件。

* **工业自动化与制造**：在智能制造领域，NBV被用于对新生产的零件进行自动化的三维扫描，以进行质量检测、尺寸验证和逆向工程 2。通过自主规划扫描路径，可以确保零件的所有关键特征都被高精度地捕获，同时最小化检测时间。  
* **自主探索与测绘**：搭载视觉传感器的移动机器人，尤其是无人机（UAV），利用NBV策略来系统地探索未知环境并构建地图 1。这在灾后搜救、大型基础设施（如桥梁、建筑）的巡检、农业作物长势监测以及矿业勘探等领域具有重大价值 12。  
* **机器人操作与交互**：对于需要与物体进行物理交互的任务，如抓取、装配和操作，精确的三维模型至关重要。NBV可以引导机器人从多个角度观察目标物体，以解决因遮挡而无法确定最佳抓取点的问题 26。  
* **超越三维重建的应用**：NBV的思想也延伸到了其他任务中。在**物体识别**领域，当单视角观测存在歧义时，系统可以主动规划下一个视点，以获取足以区分不同物体的判别性特征 28。在\*\*同时定位与地图构建（SLAM）\*\*领域，NBV原则可以被用来智能地权衡“探索新区域”和“重访旧区域以进行回环检测”这两个相互冲突的目标，从而在保证建图覆盖率的同时，控制定位误差的增长 30。

综上所述，NBV规划不仅是三维重建领域的核心技术，更是实现机器人从被动数据处理者向主动信息获取者转变的关键环节，是通往更高层次机器人智能的重要阶梯。

---

## **2\. 基础范式：经典的非学习NBV规划方法**

在深度学习浪潮兴起之前，NBV规划领域由一系列基于明确数学模型和手工设计启发式规则的经典算法主导。这些方法虽然在实现上各不相同，但其核心思想大都围绕着如何形式化地定义和最大化“信息增益”。本章将详细梳理这些经典方法的分类、原理、优势与局限，并特别指出，对计算资源的高度依赖，尤其是对光线投射（Ray-Casting）的依赖，是贯穿这些方法的一个核心挑战，也正是这一挑战催生了后续研究范式的变革。

### **2.1 基于信息论与不确定性的策略：量化未知世界**

这类方法从信息论的视角出发，将NBV问题建模为一个不确定性缩减的过程。其核心目标是选择那个能够最大化信息增益的视点，而信息增益通常通过熵（Entropy）的减少来量化 15。

* **核心原理与方法论**：  
  1. **概率化场景表示**：这类方法通常采用概率化的体素地图（如OctoMap）来表示场景。地图中的每个体素（voxel）都与一个概率值相关联，表示该体素被占据（occupied）、空闲（free）或仍为未知（unknown）的置信度 33。整个地图的不确定性可以用所有体素状态的熵之和来衡量。  
  2. **信息增益计算**：一个候选视点的信息增益被定义为：在采纳该视点的观测后，整个地图熵的预期减少量 15。为了计算这个预期值，算法需要模拟传感器的视场（Field of View, FoV）。通过从候选视点位置发射大量虚拟光线（即光线投射），算法可以判断哪些未知体素将被观测到，并据此预测熵的变化。  
  3. **视点选择**：系统会评估所有候选视点的信息增益，并选择增益最大的一个作为下一最佳视角。  
* 基于模型不确定性的变体：  
  另一类相关方法不直接关注体素的占据概率，而是聚焦于三维模型本身几何参数的不确定性。当场景被表示为一组几何图元（如平面片、二次曲面等）时，每个图元的参数（如位置、法向量）都伴随着一个协方差矩阵，用以描述其估计的不确定性 8。在这种框架下，NBV的目标是选择一个能够最大程度减小这些几何参数协方差的视点。这种思想在摄影测量学中有着深厚的根基，与“摄影测量网络设计”（Photogrammetric Network Design, PND）问题密切相关 8。近期，随着三维高斯溅射（3D Gaussian Splatting）等新表示的出现，源于最优实验设计理论的D-最优性、T-最优性等概念也被用于指导视点选择，其本质也是通过分析模型参数的Fisher信息矩阵来量化和最大化信息增益 36。

### **2.2 基于几何与前沿的探索：拓展已知世界的边界**

与基于信息论的抽象方法不同，这类方法直接对已重建的几何模型进行分析，从中寻找规划下一个视点的线索。其中最具代表性的策略是基于前沿（Frontier-based）的探索 18。

* **核心原理与方法论**：  
  1. **前沿的定义与识别**：“前沿”被定义为已知自由空间与未知空间的交界处。直观上，能够观测到前沿区域的视点最有可能拓展我们对环境的认知，发现新的场景部分。算法首先会从当前的地图（通常是占据栅格图）中提取出这些前沿区域或前沿体素。  
  2. **候选视点生成**：候选视点被生成在能够有效观测到这些前沿的位置 17。例如，可以针对每个前沿簇，计算一个能够“看到”该簇的最佳位置和朝向。  
  3. **视点选择**：一个效用函数被用来从这些候选视点中做出选择。该函数通常会综合考虑多个启发式因素，例如视点能观测到的前沿体素数量、到视点的移动距离、以及视点与前沿表面的夹角等 18。  
* 基于表面的变体：  
  一些方法直接在重建的表面模型（如三角网格或点云）上进行操作。它们通过几何分析来寻找模型中的“边界”或“孔洞”，然后规划视点以观察这些未完成的区域 3。例如，Surface Edge Explorer (SEE) 算法通过分析点云的局部密度来识别表面边界，并选择能够提高这些稀疏区域点密度的视点 3。此外，还有一些方法利用物体的几何对称性等先验知识来推断未被观测到的部分，并引导传感器去验证这些推断 12。

### **2.3 经典方法分析：优势、局限与计算瓶颈**

经典NBV方法作为该领域的奠基石，具有其独特的优势，但也存在着深刻的局限性。

* **优势**：  
  * **可解释性强**：这些方法的决策过程基于明确的物理或数学模型（如熵、几何边界），因此其行为是可预测和可解释的。  
  * **无需训练数据**：它们不依赖于大规模的标注数据集，在面对完全陌生的、无先验知识的环境时具有天然的适用性 17。  
  * **特定场景下的高效性**：在一些结构相对简单或符合其模型假设的场景中，精心设计的经典算法能够取得非常好的效果。  
* **局限与计算瓶颈**：  
  1. **计算成本高昂**：几乎所有经典方法都面临一个共同的、也是最主要的瓶颈——对光线投射（Ray-Casting）的严重依赖 2。无论是为了计算信息增益，还是为了评估候选视点的可见性，都需要模拟发射成千上万条光线并检查它们与体素地图的相交情况。这个过程的计算量巨大，并且随着环境规模、地图分辨率和候选视点数量的增加而急剧增长，严重制约了算法在大型场景中的实时应用能力。  
  2. **依赖手工设计的启发式规则**：这些方法的性能高度依赖于人工设计的效用函数和启发式规则 20。这些规则往往是经验性的，可能对特定的场景、物体或传感器类型存在“过拟合”现象，缺乏对新环境的泛化能力 20。例如，一个为室内走廊设计的基于前沿的探索策略，在开阔的室外环境中可能会因为前沿数量爆炸而失效。  
  3. **受限的动作空间**：为了缓解巨大的计算负担，许多经典方法不得不将NBV的搜索范围限制在一个较小的、预定义的离散候选视点集合中，例如均匀分布在物体周围的半球面上 20。这种做法虽然简化了问题，但很可能会错过位于该集合之外的关键视点，从而导致重建不完整或效率低下。

光线投射在经典NBV方法中扮演着一把双刃剑的角色。一方面，它提供了一种基于物理模拟的、直观且可靠的方式来评估视点的潜在价值——它直接回答了“如果我移动到这里，我能看到什么新东西？”这个问题 2。但另一方面，正是其高昂的计算成本，成为了限制该领域发展的核心瓶颈。这一瓶颈直接催生了后续研究的两大主要方向。其一，是在经典方法的框架内，寻找光线投射的“廉价替代品”，即开发各种代理效用函数（proxy utility functions）来近似信息增益，例如基于投影的方法 2 或基于碰撞检测的度量 17。其二，也是更具变革性的一条路径，是为基于学习的方法开辟了道路。许多深度学习方法的核心价值主张，正是在于它们能够通过离线训练阶段“摊销”（amortize）光线投射的成本。一个训练好的神经网络可以学习到一个复杂的非线性函数，该函数能够直接从当前的场景表示中快速预测出信息增益或最佳视点，而无需在运行时执行任何显式的光线投射 17。从这个角度看，NBV领域向深度学习的范式转移，并不仅仅是追随技术潮流，而是对经典方法根本性扩展性问题（scalability problem）的直接回应。

---

## **3\. 范式转移：基于学习的NBV策略**

随着深度学习在计算机视觉和机器人领域取得巨大成功，NBV规划也经历了一场深刻的范式革命。研究人员开始利用数据驱动的方法来克服经典算法在计算效率、泛化能力和启发式规则设计上的局限。基于学习的NBV策略通过从大量经验中学习，旨在获得更高效、更鲁棒、更具适应性的视点规划能力。本章将详细介绍该领域的三种主流学习范式：监督/模仿学习、强化学习和预测引导规划，并对它们进行系统性的比较分析。

### **3.1 监督学习与模仿学习：源于专家引导的视点选择**

这类方法的核心思想是利用数据来学习一个从当前场景表示到下一最佳视角的直接映射。它们将NBV问题转化为一个模式识别或回归问题，依赖于高质量的“专家”数据进行训练。

* **监督学习 (Supervised Learning, SL)**：  
  * **核心原理**：监督学习方法需要一个大规模的、带有“真值”标签的数据集。在NBV的背景下，数据集由成对的 (部分重建, 最佳NBV标签) 样本组成 40。网络的目标是学习这个输入到输出的映射关系。  
  * **方法论**：输入通常是部分重建的体素化表示（如占据栅格），然后通过一个三维卷积神经网络（3D-CNN）进行处理 39。输出可以是：1) 一个连续的六自由度（6-DoF）位姿，此时问题被视为回归问题 39；2) 在一个离散的候选视点集合上的概率分布，此时问题被视为分类问题 33。一个关键的挑战在于如何自动、高效地生成这样大规模的带标签数据集，因为确定每个样本的“真值”NBV本身就是一个计算密集型任务 40。  
* **模仿学习 (Imitation Learning, IL)**：  
  * **核心原理**：模仿学习是一种特殊的监督学习，其目标是训练一个策略网络来模仿“专家”（expert）或“神谕”（oracle）的行为。这个专家可以是一个计算成本高昂但性能优越的传统NBV算法，甚至是一个能够访问完整场景地面真值（ground-truth）信息的规划器 1。  
  * **方法论**：在训练阶段，专家根据其拥有的信息（可能是完整的或全局的）来确定在当前状态下的最优动作。策略网络则只能访问与运行时相同的部分观测信息，其任务是学习预测专家的这个最优动作。VIN-NBV框架是一个典型的例子 1。它训练了一个“视角内省网络”（View Introspection Network, VIN），该网络学习预测任意一个候选视点能够带来的重建质量提升分数。这个分数的“真值”标签由一个可以访问完整模型的“神谕”在训练时提供。在运行时，VIN网络就能快速地为大量候选视点打分，而无需进行实际的重建和比较。  
  * **应用拓展**：模仿学习也被应用于特定领域，例如在农业机器人中，策略网络通过学习人类专家的演示，学会在复杂的作物环境中进行连续的六自由度相机运动，以找到能够避开枝叶遮挡、清晰拍摄到果实的最佳视角 39。

### **3.2 强化学习：面向自主策略的探索与发现**

强化学习（Reinforcement Learning, RL）将NBV问题形式化为一个马尔可夫决策过程（Markov Decision Process, MDP），为自主发现复杂的视点规划策略提供了强大的框架。与监督学习不同，RL不需要显式的专家标签，而是通过智能体（agent）与环境的交互，根据获得的奖励信号（reward signal）进行试错学习，最终目标是最大化累积奖励 10。

* **核心原理与方法论**：  
  * **状态表示 (State/Observation)**：如何向RL智能体描述当前世界的状态是至关重要的。早期的RL-based NBV方法可能使用简单的二维图像或特征表示。而现代的先进方法，如GenNBV，则采用了信息丰富的多源状态嵌入（multi-source state embedding） 20。这种嵌入融合了来自不同传感器的信息：**几何信息**（通常从深度图中提取，编码为三维概率栅格）、**语义信息**（从RGB图像中提取，如颜色、纹理特征）以及**动作历史**（过去的相机位姿序列）。这种多模态的表示为智能体提供了对环境更全面的理解，是其做出高质量决策的基础 20。  
  * **动作空间 (Action Space)**：动作空间的设计是RL-based NBV方法创新的一个关键领域。为了克服传统方法中离散、受限动作空间的弊端，最新的研究成果显著扩展了智能体的行动自由度。例如，GenNBV和Hestia等框架采用了大的、连续的5自由度或6自由度自由空间作为动作空间，允许智能体（通常是无人机）在三维空间中自由地选择其位置和朝向，从而能够探索更复杂的路径和视角 16。  
  * **奖励函数 (Reward Function)**：奖励函数是引导智能体学习的唯一信号，其设计直接决定了最终策略的行为。在NBV任务中，一个最直观和常用的奖励是“新视点带来的表面覆盖率的提升” 20。当智能体选择一个视点后，系统会计算新观测到的表面积，并将其作为奖励。更复杂的奖励函数还会引入对移动成本（如路径长度或时间）的惩罚项，以激励智能体学习到不仅有效而且高效的探索策略 46。  
* **代表性工作**：GenNBV 20 是该领域的开创性工作之一，其核心贡献在于通过新颖的状态和动作空间设计，实现了能够泛化到完全未见过的建筑尺度场景的通用NBV策略。其他著名的RL框架还包括ScanRL 1 和Hestia 16 等。

### **3.3 预测引导的NBV：先重建，后感知**

预测引导的NBV代表了NBV规划思想上的一次飞跃。它颠覆了传统的“规划以探索未知”的逻辑。在这种新范式下，系统不再直接去寻找能够看到“未知”区域的视点，而是首先利用一个强大的深度生成模型，根据当前有限的、部分的观测数据，来“预测”出物体的完整三维形状。然后，NBV任务的目标就转变为：规划一条最高效的路径，去“验证”和“修正”这个预测出来的完整模型 33。

* **核心原理与方法论**：  
  1. **初始观测**：机器人首先从一个或几个初始视点捕获物体的部分点云。  
  2. **三维形状补全**：一个预先训练好的三维形状补全网络（例如，Pred-NBV中使用的PoinTr-C模型）接收这个不完整的点云作为输入，并输出一个完整的、预测的物体点云模型 33。这个网络通常在大型三维模型数据集（如ShapeNet）上进行训练，学会了特定类别物体（如飞机、汽车）的通用形状先验。  
  3. **基于预测的视点规划**：现在，NBV规划器拥有了一个完整的（尽管是预测的）三维模型。它可以利用这个模型来精确地计算出哪个候选视点能够观测到最多的“先前未被观测到，但在预测模型中存在的”点。同时，效用函数还可以方便地结合移动成本等因素，因为完整的路径规划可以在这个已知的预测模型上进行 33。  
  4. **迭代验证与修正**：机器人移动到选定的NBV位置，获取新的真实观测数据，并用这些数据来更新和修正其对物体模型的认知。这个过程不断重复，直到重建达到所需的精度。  
* **代表性工作**：Pred-NBV 33 和服务于多智能体系统的MAP-NBV 49 是该方向的代表性工作。实验证明，通过利用强大的形状先验来“预见”未知区域，这种方法在覆盖率效率上显著优于不使用预测的基线方法 33。

这三种学习范式——模仿学习/监督学习、强化学习和预测引导规划——并非相互排斥，而是可以被看作处在一个由“自主性”和“数据依赖性”定义的光谱上。监督学习和模仿学习位于一端，它们高度依赖于高质量的、由专家或真值定义的标注数据；它们的核心是“复制”智能。强化学习位于中间，它通过试错来“发现”智能，具有更高的自主性，但其性能高度依赖于人工设计的奖励函数，这个函数隐式地编码了任务目标。而预测引导方法则位于一个不同的维度上，它们利用在大型数据集上预训练的强大生成模型所蕴含的先验知识来指导规划；它们的“智能”更多地体现在利用一个学习到的感知模型来赋能一个经典的规划器。这三者之间没有绝对的优劣，而是存在着权衡。当专家数据易于获取时，模仿学习非常高效（如VIN-NBV）；当一个高质量的模拟器可用时，强化学习在实现泛化和探索大动作空间方面表现强大（如GenNBV）；当可以学习到强大的类别级形状先验时，预测引导方法在以物体为中心的重建任务中效率极高（如Pred-NBV）。未来的发展方向可能在于结合这些范式优点的混合方法，例如，使用强化学习，但其奖励函数由一个预测模型的置信度来提供。

### **3.4 现代学习型NBV框架对比分析**

为了系统地梳理当前基于学习的NBV研究前沿，下表对几个具有里程碑意义的现代框架进行了多维度的对比。这个表格旨在提供一个清晰、结构化的概览，帮助读者快速理解各个框架的核心设计理念、技术创新点以及它们之间的差异。这种特征化的比较揭示了不同的哲学思想——例如，是模仿一个全知的“神谕”，还是让智能体自主探索，亦或是“先预测再验证”——以及它们所催生的具体技术创新，如多源嵌入、5D自由动作空间和直接质量预测等。

| 框架 | 核心范式 | 输入表示 | 动作空间 | 主要目标/奖励 | 关键创新/贡献 | 相关文献 |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **VIN-NBV** | 模仿学习 | 三维特征网格（源自部分重建） | 采样的候选视点 | 最大化预测的重建质量提升 | 提出“视角内省网络”（VIN），直接预测重建质量，超越了将覆盖率作为质量代理的传统做法。 | 1 |
| **GenNBV** | 强化学习 (PPO) | 多源嵌入（几何、语义、动作历史） | 连续5D自由空间（位置+朝向） | 最大化表面覆盖率 | 实现了可泛化至未见场景的端到端策略，具有巨大的动作空间和丰富的状态表示。 | \[20, 45, 56, 57\] |
| **Pred-NBV** | 预测引导规划 | 部分点云 | 采样的候选视点 | 最大化对*预测*模型的信息增益 \+ 最小化控制成本 | 利用三维形状补全网络预测物体完整形态，然后规划路径以验证该预测。 | 33 |
| **NeU-NBV** | 不确定性引导（主动学习） | RGB图像集合 | 采样的候选视点 | 最大化神经渲染模型中的视角不确定性 | 采用无地图规划，利用基于图像的神经渲染模型（类NeRF）的不确定性估计来指导探索。 | \[50, 51, 52\] |
| **Hestia** | 强化学习（分层） | 体素网格（占据） | 分层5-DoF（先注视点，再视点位置） | 最大化体素表面覆盖率 | 采用分层策略简化动作空间；将体素视为立方体（6个面）以进行更精确的覆盖率计算。 | \[16, 47, 50\] |

---

## **4\. 新兴前沿与高级主题**

NBV研究领域正处在一个激动人心的交叉点上，它不仅在不断吸收机器学习领域的最新成果，还在与三维场景表示、多模态传感等相关领域发生着深刻的协同演化。本章将探讨NBV研究的最新前沿动态，重点关注其如何与神经场景表示等先进技术相结合，以及如何从单纯的几何重建向更复杂的、任务驱动的、多模态的感知规划演进。

### **4.1 面向神经场景表示的NBV：引导NeRF与3D高斯溅射**

神经辐射场（Neural Radiance Fields, NeRF）和三维高斯溅射（3D Gaussian Splatting, 3DGS）的兴起，为三维场景表示和新视角合成带来了革命性的突破。这些方法能够生成照片般逼真的图像，但其成功在很大程度上依赖于密集且分布良好的输入视图集 20。数据采集过程的低效和对输入视图质量的敏感性，为NBV规划创造了一个全新的、极具价值的应用场景：主动地选择最少且信息量最丰富的视点，来训练一个高质量的神经表示模型。

* **方法论与核心思想**：  
  * **不确定性引导的探索**：这一策略的核心是量化一个已部分训练的神经表示模型的不确定性。NBV的目标是找到模型最“不自信”的那个视点，并从该视点采集数据以最大程度地减少模型的不确定性 19。NeU-NBV便是一个杰出代表，它提出了一种在基于图像的神经渲染中估计不确定性的新技术。该方法无需构建显式的三维地图，而是直接根据当前图像集训练一个初步的神经渲染模型，然后评估大量候选视点，选择渲染结果不确定性最高的视点作为NBV，从而以一种“无地图”的方式高效探索未知场景 51。  
  * **信息论方法的再应用**：经典的最优实验设计理论正在被重新发掘并应用于现代神经表示。例如，通过分析3DGS模型参数（如高斯球的位置、形状、颜色等）的Fisher信息矩阵，可以从理论上推导出增加一个新视点所能带来的信息增益。这种方法为视点选择提供了坚实的数学基础 36。FisherRF是该方向的先进方法，它能够在不进行额外网络训练的情况下，通过分析3DGS的内部参数来量化信息，从而指导视点选择 53。

这种NBV与神经表示的结合，体现了场景表示技术与主动感知规划之间日益紧密的协同演化关系。在经典时代，世界模型（如体素网格）是一个被动的数据结构，NBV规划器是一个独立的模块，它向地图“查询”信息（例如，“未知体素在哪里？”）。而在神经表示时代，世界模型本身变成了一个可微的、活跃的函数。这个模型不仅可以被查询其当前状态，还可以被查询其“不确定性”，甚至可以计算信息增益相对于相机位姿的“梯度” 19。这种可微性等新特性催生了全新的NBV算法。研究人员不再局限于在离散的候选视点中进行采样和测试，而是可以直接利用梯度下降等优化方法，在连续的位姿空间中直接求解能够最大化信息增益的NBV 19。这标志着从传统的“先感知-后规划”（sense-then-plan）模式向更加融合的“边感知-边规划”（sense-while-planning）模式的转变。世界模型不再仅仅是一张地图，它已经成为规划过程中不可或缺的、活跃的一部分。NBV的未来与三维场景表示的未来已密不可分。

### **4.2 语义与多模态视点规划：超越纯粹几何**

传统的NBV任务目标通常聚焦于几何完整性，即“我是否看到了所有的表面？”。然而，随着机器人应用场景的日益复杂，NBV的目标正在向语义和任务导向的完整性演进，即“我是否获取了足以完成特定任务的信息？”。

* **融合语义信息**：现代的NBV规划器开始将语义信息融入决策过程。例如，基于强化学习的GenNBV框架在其状态表示中就包含了一个从RGB图像中提取的语义嵌入，这使得其策略不仅能基于深度（几何），还能基于颜色、纹理等外观信息（语义）来做决策 20。在更具体的应用中，如GS-NBV，系统利用语义信息来识别牛油果，并规划出最适合机械臂进行“采摘”这一特定任务的视点，而不仅仅是完整地看到牛油果的表面 54。  
* **多模态传感（视觉与触觉）**：NBV的边界正在扩展到视觉之外的其他传感模态。“Next Best Sense”框架将FisherRF的思想从“下一最佳视角”扩展到了“下一最佳感知”，它不仅引导相机（视觉），还引导一个触觉传感器（触觉） 53。该系统利用从视觉数据中估计出的深度不确定性，来决定在物体的哪个位置进行触摸能够获取最多的信息。这对于处理视觉传感器难以感知的特殊材质（如镜面、透明物体）尤为有效，从而构建了一个更加全面的主动感知系统。  
* **任务驱动的可供性（Affordance）**：对于像抓取这样的交互任务，NBV的规划可以由任务特定的可供性来驱动。ACE-NBV规划器的目标不是重建物体，而是尽快找到一个可行的抓取位姿。它通过不断地从新视点进行观察，并利用一个学习到的模型来预测从这些未曾见过的视角下可能存在的抓取可供性，从而引导视点规划 55。

### **4.3 端到端框架与对泛化能力的追求**

* **端到端学习的愿景**：当前的一个主要研究趋势是开发一体化的、端到端（end-to-end）训练的策略模型，这种模型能够将原始的传感器输入直接映射到NBV动作输出 20。GenNBV是这一趋势的典型代表，它的策略网络接收原始的RGB-D图像和历史位姿序列，直接输出一个连续的5D动作向量（三维位置和二维朝向），省去了传统流程中许多手工设计的中间步骤 20。  
* **泛化性的挑战与机遇**：推动端到端学习方法发展的一个核心动机，是为了克服传统基于规则的方法在面对新场景时泛化能力差的弱点 20。通过在多样化的大型数据集（如Houses3K, OmniObject3D）上进行训练，这些端到端的策略旨在学习到能够适应不同物体几何形状、外观和环境布局的、更具鲁棒性的探索行为 1。  
* **端到端方法的挑战**：尽管功能强大，但这种一体化的“黑箱”模型也带来了新的挑战。它们通常缺乏可解释性，使得调试和验证变得困难，这在安全关键型应用中是一个严重的问题。此外，训练这些复杂的端到端模型需要海量的、高质量的（通常是模拟的）数据和强大的计算资源，并且在从模拟环境迁移到真实世界（sim-to-real）时常常会遇到性能下降的问题 34。

---

## **5\. 应用、评估与基准测试**

本章旨在将前述理论和算法的讨论与实际应用和评估实践相结合。我们将考察NBV技术在不同领域的具体应用案例，并深入分析当前研究社区用于衡量和比较不同NBV算法性能的度量标准、数据集和模拟环境。此外，我们还将探讨标准化基准测试在该领域面临的持续挑战。

### **5.1 NBV的实践应用：案例研究**

NBV规划技术已经从理论研究走向实际应用，在多个领域展现出其作为自动化关键技术的价值。

* **工业检测与智能制造**：在工业4.0的背景下，NBV对于自主生成机器人工作单元或新制造零件的三维数字孪生至关重要。这些模型被用于自动化质量控制、缺陷检测和逆向工程 5。在动态变化的生产环境中，NBV技术支持按需（on-demand）生成最新的工作空间模型，摆脱了对可能已过时的静态CAD模型的依赖 17。  
* **自主探索与测绘**：无人机（UAV）和地面移动机器人是NBV技术的典型载体。它们利用NBV算法自主探索未知环境并构建精确的三维地图。这些应用遍及灾后响应（快速评估受灾区域）、大型基础设施（如桥梁、电力线路、建筑物）的结构健康监测、精准农业（监测作物生长状况）等多个领域 1。  
* **特定领域的专业应用**：NBV的思想也被应用于解决高度专业化的问题。在**农业机器人**领域，NBV被用来引导机械臂和相机穿过茂密的枝叶，以找到适合采摘的果实 42。在**文化遗产保护**领域，NBV技术被用于对文物进行高保真度的三维数字化存档 60。在**机器人抓取**领域，NBV帮助机器人在杂乱无章的环境中主动调整视角，以解决遮挡问题，找到稳健的抓取点 26。

### **5.2 评估体系：度量、数据集与模拟器**

为了量化和比较不同NBV算法的性能，研究社区已经发展出一套包含多种度量、标准数据集和高保真模拟器的评估体系。

* **性能评估度量**：  
  * **效率度量 (Efficiency Metrics)**：这类指标衡量算法的资源消耗。最常见的包括完成重建所需的**视点总数**、机器人移动的**总路径长度或总耗时**，以及算法在每个决策步骤的**计算时间** 2。为了综合评估效率和完整性，研究人员还提出了**覆盖率随时间变化的曲线下面积（AUC）**，这个单一指标能够更好地反映算法在整个重建过程中的综合效率 20。  
  * **完整性/覆盖率度量 (Completeness/Coverage Metrics)**：这是最核心的评估指标之一，通常以**表面覆盖率百分比**来表示。它衡量重建模型覆盖了地面真值模型总表面积的多少比例 2。  
  * **精度/质量度量 (Accuracy/Quality Metrics)**：当评估最终重建模型的质量时，会采用不同的度量。对于以新视角合成为目标的应用（特别是基于神经渲染的方法），评估指标通常借鉴自图像生成领域，包括**峰值信噪比（PSNR）**、**结构相似性指数（SSIM）和学习感知图像块相似度（LPIPS）** 62。对于几何精度，则通常使用\*\*倒角距离（Chamfer Distance, CD）**和**推土机距离（Earth Mover's Distance, EMD）\*\*来比较重建点云与地面真值点云之间的差异 34。  
* **数据集与模拟器**：  
  * **标准数据集**：大规模的三维模型数据集是训练和测试（特别是基于学习的）NBV算法的基础。常用的数据集包括：**ShapeNet**（包含大量不同类别的日常物体模型）33、**Houses3K**（包含大量房屋建筑模型）1、**OmniObject3D**（一个大规模、多类别的物体数据集）1 以及 **Mechanical Components Benchmark**（用于工业零件重建）43。  
  * **高保真模拟器**：对于需要与环境进行大量交互的强化学习方法，高保真的物理模拟器是必不可少的。当前主流的模拟器包括 **NVIDIA Isaac Gym**（以其大规模并行计算能力著称）20、**AirSim**（专注于无人机和自动驾驶模拟）33 和 **Gazebo**（ROS生态系统中的标准模拟器）61。

### **5.3 标准化基准测试的持续挑战**

尽管评估体系日益完善，但NBV领域长期以来一直面临着一个严峻的挑战：缺乏被广泛接受的标准化基准测试（Standardized Benchmarking）64。不同的研究工作往往采用各自选择的测试物体、传感器模型、模拟环境和评估指标，这使得在不同论文之间进行公平、直接的性能比较变得极为困难 64。一个算法在某个特定数据集上表现优异，并不能保证它在其他场景下也同样有效。

为了解决这个问题，已经有研究者尝试提出标准化的解决方案，例如设计具有特定挑战性几何特征（如深腔、薄壁、自遮挡、不同曲率的表面）的“标准测试物体”，并配套一套形式化的基准评估准则，该准则综合了覆盖率、精度和效率等多个维度的指标 64。然而，推动整个社区采纳统一的基准仍然是一项艰巨的任务。

在评估NBV系统时，存在一个根本性的目标分歧。一派研究关注以重建为中心的度量，如覆盖率、倒角距离等，其核心问题是“模型建得有多好？”。另一派则更关注下游任务的性能，如抓取成功率、物体分类准确率等，其核心问题是“这个模型对于完成任务是否足够好？”。例如，对于一个抓取任务，一个只重建了70%但清晰展示了物体把手的模型，远比一个重建了95%但把手被遮挡的模型更有价值 26。这种评估目标的二元性体现在那些以抓取成功率 26 或物体识别准确率 28 作为最终评判标准的论文中。这意味着，NBV领域可能需要向更加任务感知的基准测试范式发展。一个真正有效的NBV基准测试体系，可能不应是一套单一的指标，而应是一个包含多个子任务的测试套件，每个子任务都有其特定的、与任务性能直接相关的评估标准。一个在无人机测绘任务中达到“SOTA”（state-of-the-art）的NBV规划器，在机器人货箱拣选任务中可能表现平平，而评估协议应当能够反映出这种差异。

---

## **6\. 综合、开放挑战与未来方向**

经过对NBV规划领域从经典基础到现代学习范式的系统性梳理，本章旨在对整个研究轨迹进行批判性综合，识别当前仍未解决的关键挑战，并展望未来可能的研究方向。NBV领域正从一个相对独立的感知规划问题，演变为一个与机器人学习、场景表示和任务执行深度融合的、更加宏大的主动智能感知体系的核心组成部分。

### **6.1 NBV研究轨迹的批判性综合**

NBV领域的发展路径清晰地反映了人工智能技术的宏观演进趋势。它始于**经典方法时代**，其特点是依赖于可解释的数学模型（如信息论、几何学）和手工设计的启发式规则。这些方法虽然在理论上清晰、无需训练，但普遍受困于高昂的计算成本和有限的泛化能力，使其难以应对复杂、多变的真实世界环境 17。

随后，**学习范式时代**的到来标志着一场深刻的变革。深度学习的引入，使得系统能够从数据中自动学习复杂的视点选择策略，极大地提升了计算效率和对新场景的适应性。这一时代内部也呈现出多元化的发展：从模仿专家行为的监督/模仿学习，到通过自主探索发现策略的强化学习，再到利用生成模型“预见”未知世界的预测引导规划。

如今，NBV研究的目标也在不断深化。早期的目标是“**看得更多**”（how to see more），即最大化几何覆盖率。随后，随着神经渲染等技术的发展，目标演变为“**看得更好**”（how to see better），即以最少的视点实现最高的重建质量。而当前的前沿趋势则是“**看到关键**”（how to see what matters），即将NBV规划与具体的下游任务（如抓取、识别）和语义理解紧密结合。这种目标的演进，标志着NBV研究的成熟，及其与更广泛的机器人智能目标的深度融合。

### **6.2 开放性问题与当前挑战**

尽管取得了显著进展，NBV领域仍面临一系列亟待解决的开放性问题。

* **泛化性与鲁棒性**：这是基于学习的方法面临的最核心挑战。尽管在特定数据集上训练的模型表现出色，但要实现对任意未知物体和“野外”（in the wild）环境的真正泛化仍然非常困难。在模拟环境中训练的策略在迁移到真实机器人时，往往会因为“模拟-真实”差距（sim-to-real gap）而导致性能显著下降 17。  
* **动态与非结构化环境**：目前绝大多数NBV研究都基于一个核心假设：场景是静态的。如何开发能够有效处理移动物体、动态光照变化、以及与人共存等动态元素的NBV规划器，是一个重要但探索不足的开放问题。  
* **多智能体协同**：虽然已有初步工作（如MAP-NBV 49）开始探索多机器人协同NBV，但如何设计高效、去中心化、且能在通信带宽受限的情况下工作的协同策略，以避免信息冗余并实现高效的并行探索，仍然是一个复杂的挑战 58。  
* **长时程规划与贪婪策略的局限性**：当前占主导地位的贪婪式、一步最优的规划方法虽然计算高效，但无法保证全局最优。如何将更具远见的非短视规划（non-myopic planning）思想（例如，通过蒙特卡洛树搜索或更高级的RL算法）融入NBV，同时又避免过高的计算开销，是提升NBV策略全局效率的关键研究方向 65。  
* **物理与安全约束的深度融合**：在真实世界中部署NBV系统，规划器必须与机器人的运动规划和控制模块紧密集成，充分考虑平台的运动学和动力学约束、碰撞避免以及操作安全性。这些在模拟中常常被简化的实际问题，是实现可靠自主系统的关键 10。

### **6.3 未来展望：迈向终身学习与真正自主的感知**

展望未来，NBV的研究将朝着更加智能、自适应和一体化的方向发展。

* **混合式方法**：未来的NBV系统很可能会是结合了不同范式优点的混合体。例如，可以利用快速的深度学习模型来提供一个“有前景”的探索区域或一个粗略的效用估计，然后在这个缩小的范围内，使用更具理论保证的经典优化方法进行精细的视点求解。这种结合了学习的效率和经典方法的可解释性的策略，有望在性能和可靠性之间取得更好的平衡 17。  
* **终身学习与在线自适应**：未来的机器人系统需要在其整个生命周期中持续地学习和适应新环境。这意味着NBV规划器需要具备在线学习的能力，而不是仅仅依赖于离线训练。自监督学习方法，即系统能够在执行任务的过程中自主收集数据并进行模型更新，是实现这一目标的重要途径 40。  
* **基础模型赋能主动感知**：大规模视觉-语言模型和视觉基础模型（如SAM2 53）的崛起，为主动感知带来了前所未有的机遇。未来的NBV规划器或许能够直接理解并执行自然语言指令（例如，“去找到一个能看清红色杯子把手的角度”），或者利用基础模型强大的零样本（zero-shot）分割和识别能力，为任何未知场景提供丰富的语义先验，而无需针对性地训练。  
* **统一的主动感知理论**：从更宏观的视角看，NBV只是更广泛的主动感知问题的一个子集。未来的研究趋势将是构建更统一的框架，该框架不仅协同优化“下一个最佳视角”，还可能同时优化传感器的内部参数（如曝光、焦距）、主动光源的控制，甚至包括物理交互动作（例如，通过推开一个物体来解决遮挡问题）。最终的目标是实现一个能够综合运用其所有感知和行动能力，以最智能的方式与世界交互，从而获取完成任务所需信息的具身智能体（embodied intelligent agent）。

总之，NBV规划正从一个定义明确的几何问题，演变为一个开放式的、与学习、交互和任务深度耦合的智能决策问题。未来的突破将越来越依赖于多学科的交叉融合，推动机器人向着真正自主的感知和行动能力迈进。

#### **Works cited**

1. VIN-NBV: A View Introspection Network for Next-Best-View Selection for Resource-Efficient 3D Reconstruction \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2505.06219v1](https://arxiv.org/html/2505.06219v1)  
2. PB-NBV: Efficient Projection-Based Next-Best-View Planning Framework for Reconstruction of Unknown Objects \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2501.10663v1](https://arxiv.org/html/2501.10663v1)  
3. Next Best View Planning with an Unstructured Representation \- ESP, accessed November 3, 2025, [https://robotic-esp.com/papers/border\_dphil19.pdf](https://robotic-esp.com/papers/border_dphil19.pdf)  
4. Next-best-view algorithm for object reconstruction \- SPIE Digital Library, accessed November 3, 2025, [https://www.spiedigitallibrary.org/conference-proceedings-of-spie/3523/0000/Next-best-view-algorithm-for-object-reconstruction/10.1117/12.327001.full](https://www.spiedigitallibrary.org/conference-proceedings-of-spie/3523/0000/Next-best-view-algorithm-for-object-reconstruction/10.1117/12.327001.full)  
5. \[2501.10663\] PB-NBV: Efficient Projection-Based Next-Best-View Planning Framework for Reconstruction of Unknown Objects \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2501.10663](https://arxiv.org/abs/2501.10663)  
6. (PDF) VIN-NBV: A View Introspection Network for Next-Best-View Selection for Resource-Efficient 3D Reconstruction \- ResearchGate, accessed November 3, 2025, [https://www.researchgate.net/publication/391658673\_VIN-NBV\_A\_View\_Introspection\_Network\_for\_Next-Best-View\_Selection\_for\_Resource-Efficient\_3D\_Reconstruction](https://www.researchgate.net/publication/391658673_VIN-NBV_A_View_Introspection_Network_for_Next-Best-View_Selection_for_Resource-Efficient_3D_Reconstruction)  
7. Integrating One-Shot View Planning with a Single Next-Best View via Long-Tail Multiview Sampling \- YouTube, accessed November 3, 2025, [https://www.youtube.com/watch?v=yXddeLhdYmU](https://www.youtube.com/watch?v=yXddeLhdYmU)  
8. Developing Visual Sensing Strategies through Next Best View Planning, accessed November 3, 2025, [http://vigir.missouri.edu/\~gdesouza/Research/Conference\_CDs/IEEE\_IROS\_2009/papers/1297.pdf](http://vigir.missouri.edu/~gdesouza/Research/Conference_CDs/IEEE_IROS_2009/papers/1297.pdf)  
9. Next best view planning for active model improvement \- BMVA Archive, accessed November 3, 2025, [https://bmva-archive.org.uk/bmvc/2009/Papers/Paper436/Paper436.pdf](https://bmva-archive.org.uk/bmvc/2009/Papers/Paper436/Paper436.pdf)  
10. Learning the Next Best View for 3D Point Clouds via Topological Features \- NSF Public Access Repository, accessed November 3, 2025, [https://par.nsf.gov/servlets/purl/10320003](https://par.nsf.gov/servlets/purl/10320003)  
11. Tree-based search of the next best view/state for three-dimensional ..., accessed November 3, 2025, [http://personal.cimat.mx:8181/\~murrieta/Papersonline/Vaetal\_IJARS18.pdf](http://personal.cimat.mx:8181/~murrieta/Papersonline/Vaetal_IJARS18.pdf)  
12. Guided Next Best View for 3D Reconstruction of Large Complex Structures \- MDPI, accessed November 3, 2025, [https://www.mdpi.com/2072-4292/11/20/2440](https://www.mdpi.com/2072-4292/11/20/2440)  
13. Autonomous Generation of Complete 3D Object Models Using Next Best View Manipulation Planning \- Artificial Intelligence, accessed November 3, 2025, [http://ai.cs.washington.edu/www/media/papers/nbv-icra-11-final.pdf](http://ai.cs.washington.edu/www/media/papers/nbv-icra-11-final.pdf)  
14. View Planning for 3D Object Reconstruction with a Mobile Manipulator Robot \- INAOE, accessed November 3, 2025, [https://ccc.inaoep.mx/\~mdprl/documentos/30914.pdf](https://ccc.inaoep.mx/~mdprl/documentos/30914.pdf)  
15. Automatic View Selection Using Viewpoint Entropy and its Application to Image-Based Modelling, accessed November 3, 2025, [https://vccimaging.org/Publications/Vazquez2003AVS/Vazquez2003AVS.pdf](https://vccimaging.org/Publications/Vazquez2003AVS/Vazquez2003AVS.pdf)  
16. Hestia: Hierarchical Next-Best-View Exploration for Systematic Intelligent Autonomous Data Collection \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2508.01014v1](https://arxiv.org/html/2508.01014v1)  
17. A Next-Best-View Method for Complex 3D Environment Exploration Using Robotic Arm with Hand-Eye System \- MDPI, accessed November 3, 2025, [https://www.mdpi.com/2076-3417/15/14/7757](https://www.mdpi.com/2076-3417/15/14/7757)  
18. Next-Best Stereo: Extending Next-Best View Optimisation For Collaborative Sensors, accessed November 3, 2025, [https://personalpages.surrey.ac.uk/s.hadfield/papers/Mendez16.pdf](https://personalpages.surrey.ac.uk/s.hadfield/papers/Mendez16.pdf)  
19. \[2303.16739\] Active Implicit Object Reconstruction using Uncertainty-guided Next-Best-View Optimization \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2303.16739](https://arxiv.org/abs/2303.16739)  
20. GenNBV: Generalizable Next-Best-View Policy ... \- CVF Open Access, accessed November 3, 2025, [https://openaccess.thecvf.com/content/CVPR2024/papers/Chen\_GenNBV\_Generalizable\_Next-Best-View\_Policy\_for\_Active\_3D\_Reconstruction\_CVPR\_2024\_paper.pdf](https://openaccess.thecvf.com/content/CVPR2024/papers/Chen_GenNBV_Generalizable_Next-Best-View_Policy_for_Active_3D_Reconstruction_CVPR_2024_paper.pdf)  
21. Quality-driven Next-Best-View Planning for Autonomous 3D Reconstruction with an Aerial Robot, accessed November 3, 2025, [https://activep-ws.github.io/accepted\_papers/8\_Quality\_driven\_Next\_Best\_Vie.pdf](https://activep-ws.github.io/accepted_papers/8_Quality_driven_Next_Best_Vie.pdf)  
22. Fast Frontier-Based Information-Driven Autonomous Exploration with an MAV \- Imperial College London, accessed November 3, 2025, [https://www.doc.ic.ac.uk/\~sleutene/publications/Papatheodorou\_Dai\_ICRA\_2020.pdf](https://www.doc.ic.ac.uk/~sleutene/publications/Papatheodorou_Dai_ICRA_2020.pdf)  
23. Online Next-Best-View Planner for 3D-Exploration and Inspection ..., accessed November 3, 2025, [https://www.researchgate.net/publication/358180878\_Online\_Next-Best-View\_Planner\_for\_3D-Exploration\_and\_Inspection\_With\_a\_Mobile\_Manipulator\_Robot](https://www.researchgate.net/publication/358180878_Online_Next-Best-View_Planner_for_3D-Exploration_and_Inspection_With_a_Mobile_Manipulator_Robot)  
24. \[2307.05832\] Bag of Views: An Appearance-based Approach to Next-Best-View Planning for 3D Reconstruction \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2307.05832](https://arxiv.org/abs/2307.05832)  
25. Sampling-Based Next-Best-View Planning for Autonomous Photography & Inspection \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2403.05477v1](https://arxiv.org/html/2403.05477v1)  
26. Closed-Loop Next-Best-View Planning for Target ... \- GitHub Pages, accessed November 3, 2025, [https://jenjenchung.github.io/anthropomorphic/Papers/Breyer2022closed.pdf](https://jenjenchung.github.io/anthropomorphic/Papers/Breyer2022closed.pdf)  
27. (PDF) A structured review and taxonomy of next-best-view strategies ..., accessed November 3, 2025, [https://www.researchgate.net/publication/394527374\_A\_structured\_review\_and\_taxonomy\_of\_next-best-view\_strategies\_for\_3D\_reconstruction](https://www.researchgate.net/publication/394527374_A_structured_review_and_taxonomy_of_next-best-view_strategies_for_3D_reconstruction)  
28. Next Best View Planning for Object Recognition in Mobile Robotics \- CEUR-WS.org, accessed November 3, 2025, [https://ceur-ws.org/Vol-1782/paper\_6.pdf](https://ceur-ws.org/Vol-1782/paper_6.pdf)  
29. \[2110.06766\] Next-Best-View Estimation based on Deep Reinforcement Learning for Active Object Classification \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2110.06766](https://arxiv.org/abs/2110.06766)  
30. Next-Best-View Visual SLAM for Bounded-Error Area Coverage, accessed November 3, 2025, [http://robots.engin.umich.edu/publications/akim-2012a.pdf](http://robots.engin.umich.edu/publications/akim-2012a.pdf)  
31. An Information Gain Formulation for Active Volumetric 3D Reconstruction \- Robotics and Perception Group, accessed November 3, 2025, [https://rpg.ifi.uzh.ch/docs/ICRA16\_Isler.pdf](https://rpg.ifi.uzh.ch/docs/ICRA16_Isler.pdf)  
32. An Information Theoretic Approach for Next Best View Planning in 3-D Reconstruction \- ResearchGate, accessed November 3, 2025, [https://www.researchgate.net/profile/Joachim-Hornegger/publication/220929881\_An\_Information\_Theoretic\_Approach\_for\_Next\_Best\_View\_Planning\_in\_3-D\_Reconstruction/links/0fcfd50decc1cb144b000000/An-Information-Theoretic-Approach-for-Next-Best-View-Planning-in-3-D-Reconstruction.pdf](https://www.researchgate.net/profile/Joachim-Hornegger/publication/220929881_An_Information_Theoretic_Approach_for_Next_Best_View_Planning_in_3-D_Reconstruction/links/0fcfd50decc1cb144b000000/An-Information-Theoretic-Approach-for-Next-Best-View-Planning-in-3-D-Reconstruction.pdf)  
33. Pred-NBV: Prediction-guided Next-Best-View Planning for 3D Object Reconstruction \- NSF PAR, accessed November 3, 2025, [https://par.nsf.gov/servlets/purl/10489772](https://par.nsf.gov/servlets/purl/10489772)  
34. Pred-NBV: Prediction-guided Next-Best-View Planning for 3D Object Reconstruction \- GitHub Pages, accessed November 3, 2025, [https://mit-spark.github.io/robotRepresentations-RSS2023/assets/papers/3.pdf](https://mit-spark.github.io/robotRepresentations-RSS2023/assets/papers/3.pdf)  
35. Next-Best-View Planning for Exploration and Autonomous 3D-Modeling in Static Environments with Irregular Depth Noise using Interval Probabilities \- Deutsches Zentrum für Luft- und Raumfahrt, accessed November 3, 2025, [https://elib.dlr.de/101448/1/VonLoesecke2015.pdf](https://elib.dlr.de/101448/1/VonLoesecke2015.pdf)  
36. POp-GS: Next Best View in 3D-Gaussian Splatting with P-Optimality, accessed November 3, 2025, [https://openaccess.thecvf.com/content/CVPR2025/papers/Wilson\_POp-GS\_Next\_Best\_View\_in\_3D-Gaussian\_Splatting\_with\_P-Optimality\_CVPR\_2025\_paper.pdf](https://openaccess.thecvf.com/content/CVPR2025/papers/Wilson_POp-GS_Next_Best_View_in_3D-Gaussian_Splatting_with_P-Optimality_CVPR_2025_paper.pdf)  
37. An Efficient Projection-Based Next-best-view Planning Framework for Reconstruction of Unknown Objects \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2409.12096v1](https://arxiv.org/html/2409.12096v1)  
38. Deep Reinforcement Learning for Next Best View Planning in Autonomous Robot-Based 3D Reconstruction | Request PDF \- ResearchGate, accessed November 3, 2025, [https://www.researchgate.net/publication/391690829\_Deep\_Reinforcement\_Learning\_for\_Next\_Best\_View\_Planning\_in\_Autonomous\_Robot-Based\_3D\_Reconstruction](https://www.researchgate.net/publication/391690829_Deep_Reinforcement_Learning_for_Next_Best_View_Planning_in_Autonomous_Robot-Based_3D_Reconstruction)  
39. Enhanced View Planning for Robotic Harvesting: Tackling Occlusions with Imitation Learning | Request PDF \- ResearchGate, accessed November 3, 2025, [https://www.researchgate.net/publication/389821575\_Enhanced\_View\_Planning\_for\_Robotic\_Harvesting\_Tackling\_Occlusions\_with\_Imitation\_Learning](https://www.researchgate.net/publication/389821575_Enhanced_View_Planning_for_Robotic_Harvesting_Tackling_Occlusions_with_Imitation_Learning)  
40. Supervised Learning of the Next-Best-View for 3D Object ..., accessed November 3, 2025, [https://www.researchgate.net/publication/339513000\_Supervised\_Learning\_of\_the\_Next-Best-View\_for\_3D\_Object\_Reconstruction](https://www.researchgate.net/publication/339513000_Supervised_Learning_of_the_Next-Best-View_for_3D_Object_Reconstruction)  
41. Supervised Learning of the Next-Best-View for 3D Object Reconstruction, accessed November 3, 2025, [https://jivg.org/wp-content/uploads/2020/02/2020\_mendoza\_prl\_supervised\_accepted.pdf](https://jivg.org/wp-content/uploads/2020/02/2020_mendoza_prl_supervised_accepted.pdf)  
42. Enhanced View Planning for Robotic Harvesting: Tackling Occlusions with Imitation Learning \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2503.10334v1](https://arxiv.org/html/2503.10334v1)  
43. TMRL-NBV: Triangular mesh-based reinforcement learning for next-best-view in active 3D reconstruction | MATEC Web of Conferences, accessed November 3, 2025, [https://www.matec-conferences.org/articles/matecconf/abs/2025/07/matecconf\_maiqs2025\_03002/matecconf\_maiqs2025\_03002.html](https://www.matec-conferences.org/articles/matecconf/abs/2025/07/matecconf_maiqs2025_03002/matecconf_maiqs2025_03002.html)  
44. Deep Reinforcement Learning for Next-Best-View Planning in Agricultural Applications, accessed November 3, 2025, [https://www.hrl.uni-bonn.de/publications/zeng22icra.pdf](https://www.hrl.uni-bonn.de/publications/zeng22icra.pdf)  
45. GenNBV: Generalizable Next-Best-View Policy for Active 3D Reconstruction \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2402.16174v1](https://arxiv.org/html/2402.16174v1)  
46. Deep Reinforcement Learning for Next Best View Planning in Autonomous Robot-Based 3D Reconstruction \- Consensus, accessed November 3, 2025, [https://consensus.app/papers/deep-reinforcement-learning-for-next-best-view-planning-in-belke-beiki/4cd00f8400dd511db57bbaa616e47356/](https://consensus.app/papers/deep-reinforcement-learning-for-next-best-view-planning-in-belke-beiki/4cd00f8400dd511db57bbaa616e47356/)  
47. (PDF) Hestia: Hierarchical Next-Best-View Exploration for Systematic Intelligent Autonomous Data Collection \- ResearchGate, accessed November 3, 2025, [https://www.researchgate.net/publication/394294714\_Hestia\_Hierarchical\_Next-Best-View\_Exploration\_for\_Systematic\_Intelligent\_Autonomous\_Data\_Collection](https://www.researchgate.net/publication/394294714_Hestia_Hierarchical_Next-Best-View_Exploration_for_Systematic_Intelligent_Autonomous_Data_Collection)  
48. MAP-NBV: Multi-agent Prediction-guided Next-Best-View Planning for Active 3D Object Reconstruction \- RAAS Lab, accessed November 3, 2025, [http://raaslab.org/projects/MAPNBV/](http://raaslab.org/projects/MAPNBV/)  
49. \[2307.04004\] MAP-NBV: Multi-agent Prediction-guided Next-Best-View Planning for Active 3D Object Reconstruction \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2307.04004](https://arxiv.org/abs/2307.04004)  
50. NeU-NBV: Next Best View Planning Using Uncertainty Estimation in Image-Based Neural Rendering | Request PDF \- ResearchGate, accessed November 3, 2025, [https://www.researchgate.net/publication/376494409\_NeU-NBV\_Next\_Best\_View\_Planning\_Using\_Uncertainty\_Estimation\_in\_Image-Based\_Neural\_Rendering](https://www.researchgate.net/publication/376494409_NeU-NBV_Next_Best_View_Planning_Using_Uncertainty_Estimation_in_Image-Based_Neural_Rendering)  
51. \[2303.01284\] NeU-NBV: Next Best View Planning Using Uncertainty Estimation in Image-Based Neural Rendering \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2303.01284](https://arxiv.org/abs/2303.01284)  
52. \[IROS2023\] NeU-NBV: Next Best View Planning Using Uncertainty Estimation in Image-Based Neural Rendering \- GitHub, accessed November 3, 2025, [https://github.com/dmar-bonn/neu-nbv](https://github.com/dmar-bonn/neu-nbv)  
53. Next Best Sense: Guiding Vision and Touch with FisherRF for 3D ..., accessed November 3, 2025, [https://arm.stanford.edu/next-best-sense](https://arm.stanford.edu/next-best-sense)  
54. \[2506.23369\] GS-NBV: a Geometry-based, Semantics-aware Viewpoint Planning Algorithm for Avocado Harvesting under Occlusions \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2506.23369](https://arxiv.org/abs/2506.23369)  
55. Affordance-Driven Next-Best-View Planning for Robotic Grasping \- Proceedings of Machine Learning Research, accessed November 3, 2025, [https://proceedings.mlr.press/v229/zhang23i/zhang23i.pdf](https://proceedings.mlr.press/v229/zhang23i/zhang23i.pdf)  
56. GenNBV: Generalizable Next-Best-View Policy for Active 3D Reconstruction \- arXiv, accessed November 3, 2025, [https://arxiv.org/abs/2402.16174](https://arxiv.org/abs/2402.16174)  
57. GenNBV: Generalizable Next-Best-View Policy for Active 3D Reconstruction, accessed November 3, 2025, [https://gennbv.tech/](https://gennbv.tech/)  
58. Efficient 3D Exploration with Distributed Multi-UAV Teams: Integrating Frontier-Based and Next-Best-View Planning \- MDPI, accessed November 3, 2025, [https://www.mdpi.com/2504-446X/8/11/630](https://www.mdpi.com/2504-446X/8/11/630)  
59. (PDF) Assessment of next-best-view algorithms performance with ..., accessed November 3, 2025, [https://www.researchgate.net/publication/305141853\_Assessment\_of\_next-best-view\_algorithms\_performance\_with\_various\_3D\_scanners\_and\_manipulator](https://www.researchgate.net/publication/305141853_Assessment_of_next-best-view_algorithms_performance_with_various_3D_scanners_and_manipulator)  
60. Boundary Exploration of Next Best View Policy in 3D Robotic Scanning \- arXiv, accessed November 3, 2025, [https://arxiv.org/html/2412.10444v1](https://arxiv.org/html/2412.10444v1)  
61. A Qualitative Comparison of the State-of-the-Art Next-Best-View ..., accessed November 3, 2025, [https://www.bjmc.lu.lv/fileadmin/user\_upload/lu\_portal/projekti/bjmc/Contents/13\_1\_08\_Aristovs.pdf](https://www.bjmc.lu.lv/fileadmin/user_upload/lu_portal/projekti/bjmc/Contents/13_1_08_Aristovs.pdf)  
62. A Survey of 3D Reconstruction: The Evolution from Multi-View Geometry to NeRF and 3DGS, accessed November 3, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12473764/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12473764/)  
63. What are some of the well accepted evaluation metrics for 3D reconstruction? Also how do you evaluate a scene reconstructed from methods such as V-SLAM or Visual Odometry? \- Reddit, accessed November 3, 2025, [https://www.reddit.com/r/computervision/comments/1fnh9c4/what\_are\_some\_of\_the\_well\_accepted\_evaluation/](https://www.reddit.com/r/computervision/comments/1fnh9c4/what_are_some_of_the_well_accepted_evaluation/)  
64. (PDF) Benchmarking 3D Reconstructions from Next Best View ..., accessed November 3, 2025, [https://www.researchgate.net/publication/221280471\_Benchmarking\_3D\_Reconstructions\_from\_Next\_Best\_View\_Planning](https://www.researchgate.net/publication/221280471_Benchmarking_3D_Reconstructions_from_Next_Best_View_Planning)  
65. Where to Look Next: Learning Viewpoint Recommendations for Informative Trajectory Planning \- Autonomous Multi-Robots Lab, accessed November 3, 2025, [https://autonomousrobots.nl/assets/files/publications/22-lodel-icra.pdf](https://autonomousrobots.nl/assets/files/publications/22-lodel-icra.pdf)