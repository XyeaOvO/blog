**角色与目标**

你是一位精通NLP、学术写作和 LaTeX 排版的专家。你的任务是根据我提供的实验说明，全面，仔细阅读我的项目代码，在/docs下面放置你的所有文件，为一份正式的实验报告生成高质量的内容。

这份实验报告使用一个模块化的 LaTeX 项目结构。你的输出**必须**严格遵循这个结构，为每一个指定的 `.tex` 文件生成其对应的内容。

---

**项目架构说明（仅供参考）**

报告的 LaTeX 项目包含以下核心文件和目录，你要为 `sections/` 目录下的所有文件以及 `references.bib` 文件生成内容：

*   `main.tex`: 主文件，负责组装所有部分（你不需要生成此文件内容）。
*   `preamble.tex`: 配置文件，定义了所有格式和宏包（你不需要生成此文件内容）。
*   `references.bib`: BibTeX 格式的文献数据库。
*   `sections/`: 存放报告正文的目录，包含以下文件：
    *   `01_purpose.tex`: 实验目的
    *   `02_principle.tex`: 实验原理
    *   `03_equipment.tex`: 实验环境
    *   `04_procedure.tex`: 实验步骤
    *   `05_results.tex`: 实验数据与结果分析
    *   `06_discussion.tex`: 实验讨论
    *   `07_conclusion.tex`: 实验结论
    *   `appendix.tex`: 附录

---

**输入材料**

**【输入1：实验说明：】**
  
A3:循环神经网络(20 points)

·任务:训练一个循环神经网络，实现AI写诗(20points)

·数据:提供的古代诗词数据集+自选诗词

本题目考察如何设计并实现一个基于循环神经网络的写诗工具。设置本题目的如下:

--理解循环神经网络的基本结构、代码实现及训练过程

--比较RNN、LSTM的不同之处

--生成藏头诗（以“未来学院元班”为藏头，另外再自选一个藏头标题）、超长诗（超过20句）、自定义主题或设置，并作结果分析

---

**任务指令：生成报告内容**

请根据以上输入材料，严格按照以下要求，为每个文件生成对应的 LaTeX 内容。

1.  **总体要求**:
	-    在/docs下面放置你的所有文件。
    *   使用正式、客观、科学的语言风格。
    *   内容需完整、逻辑清晰，并紧密结合我提供的数据和说明书。
    *   在适当的位置使用 LaTeX 命令来引用图 (`\ref{fig:label}`), 表 (`\ref{tab:label}`), 公式 (`\ref{eq:label}`) 和参考文献 (`\cite{key}`)。

2.  **分文件生成指令**:

    *   **`sections/01_purpose.tex`**:
        *   清晰地陈述1-3个核心实验目的。
        *   使用 `\section{实验目的}` 和 `enumerate` 环境。

    *   **`sections/02_principle.tex`**:
        *   系统地阐述实验所依赖的核心理论、关键数学公式。
        *   将重要公式放入 `equation` 环境，并为其添加 `\label`。
        *   如果说明书引用了经典理论或教科书，为它创建一个 BibTeX 条目，并在文中用 `\cite{}` 引用。

    *   **`sections/03_equipment.tex`**:
        *   列出所有实验环境。
        *   使用 `\section{实验环境}` 和 `table` + `booktabs` 环境创建一个三线表。

    *   **`sections/04_procedure.tex`**:
        *   简明扼要地总结实验的核心步骤。不要直接照抄说明书，而是以你（操作者）的视角进行概括。
        *   使用 `\section{实验内容与步骤}` 和 `enumerate` 环境。

    *   **`sections/05_results.tex`**:
        *   **这是报告的核心部分。**
        *   将实验数据整理成专业的 LaTeX 表格 (`table` + `booktabs`)，并添加 `\caption` 和 `\label`。
        *   为我描述的每个图表（如示波器截图），生成 `figure` 环境。在其中使用 `\includegraphics` 命令，并撰写详细的 `\caption` 来解释图表内容，最后添加 `\label`。
        *   对数据和图表进行初步分析，描述观察到的现象和规律。

    *   **`sections/06_discussion.tex`**:
        *   深入分析我的代码中做的所有有价值的优化。
        *   分析理论值与实际测量数据之间可能存在的误差来源。
        *   提出可能的改进方案。
        *   使用 `\section{实验讨论}`。

    *   **`sections/07_conclusion.tex`**:
        *   总结本次实验得出的核心结论，并与 `01_purpose.tex` 中的实验目的进行呼应，说明是否达到了预期目标。
        *   使用 `\section{实验结论}`。

    *   **`appendix.tex`**:
        *   如果【我的实验数据与观察记录】中包含较长的代码，将其放入 `lstlisting` 环境中。
        *   使用 `\section{附录：完整源代码}`。

    *   **`references.bib`**:
        *   为你所有引用的文献（无论是原理中提到的理论，还是参考的书籍）生成 BibTeX 条目。

---

**输出格式**

请严格按照以下格式输出，为每个文件提供一个独立的 LaTeX 代码块，并使用文件名作为标题。

```
	### File: sections/01_purpose.tex```latex
	[... 此处是 01_purpose.tex 的内容 ...]
	```
	
	### File: sections/02_principle.tex
	```latex
	[... 此处是 02_principle.tex 的内容 ...]
	```
	
	... (以此类推，直到最后一个文件) ...
	
	### File: references.bib
	```bibtex
	[... 此处是 references.bib 的内容 ...]
	```
```