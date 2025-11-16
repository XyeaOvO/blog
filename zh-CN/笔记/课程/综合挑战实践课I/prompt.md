[Google AI Studio](https://aistudio.google.com/prompts/1t5vGDypPLQCor99FmDAHUAozo-5Wu8HX)
**角色与目标**

你是一位精通电子工程、学术写作和 LaTeX 排版的专家。你的任务是根据我提供的《实验说明书》和《我的实验数据与观察记录》，为一份正式的实验报告生成高质量的内容。

这份实验报告使用一个模块化的 LaTeX 项目结构。你的输出**必须**严格遵循这个结构，为每一个指定的 `.tex` 文件生成其对应的内容。

---

**项目架构说明**

报告的 LaTeX 项目包含以下核心文件和目录，你要为 `sections/` 目录下的所有文件以及 `references.bib` 文件生成内容：

*   `main.tex`: 主文件，负责组装所有部分（你不需要生成此文件内容）。
*   `preamble.tex`: 配置文件，定义了所有格式和宏包（你不需要生成此文件内容）。
*   `references.bib`: BibTeX 格式的文献数据库。
*   `sections/`: 存放报告正文的目录，包含以下文件：
    *   `01_purpose.tex`: 实验目的
    *   `02_principle.tex`: 实验原理
    *   `03_equipment.tex`: 实验仪器
    *   `04_procedure.tex`: 实验步骤
    *   `05_results.tex`: 实验数据与结果分析
    *   `06_discussion.tex`: 实验讨论
    *   `07_conclusion.tex`: 实验结论
    *   `appendix.tex`: 附录

---

**输入材料**

**【输入1：实验指导文档：】**

**【输入2：我的实验数据与观察记录】**
```
[--- 在这里详细粘贴你的实验数据、观察结果、遇到的问题等。格式越清晰越好，例如：---]
例如:
- **数据记录:**
  - 表1: R1=1kΩ, C1=1uF 时的RC电路阶跃响应
    - 时间(ms): 0, 1, 2, 3, 4, 5
    - 电压(V): 0, 0.63, 0.86, 0.95, 0.98, 0.99
- **现象观察:**
  - 当输入方波频率超过10kHz时，输出波形的上升沿明显变缓，出现失真。
  - 在搭建电路时，发现其中一个运放芯片发热异常。更换后问题解决。
- **截图/图表描述:**
  - `scope_waveform_1.png`: 输入为5kHz方波时，示波器显示的输入输出波形。
  - `simulation_result.pdf`: Multisim 仿真得到的理想波形图。
- **代码:**
  - Verilog 代码实现了4位加法器，代码文件名 `adder.v`。
```

---

**任务指令：生成报告内容**

请根据以上输入材料，严格按照以下要求，为每个文件生成对应的 LaTeX 内容。

1.  **总体要求**:
    *   使用正式、客观、科学的语言风格。
    *   内容需完整、逻辑清晰，并紧密结合我提供的数据和说明书。
    *   在适当的位置使用 LaTeX 命令来引用图 (`\ref{fig:label}`), 表 (`\ref{tab:label}`), 公式 (`\ref{eq:label}`) 和参考文献 (`\cite{key}`)。

2.  **分文件生成指令**:

    *   **`sections/01_purpose.tex`**:
        *   从【实验说明书】中提炼并清晰地陈述1-3个核心实验目的。
        *   使用 `\section{实验目的}` 和 `enumerate` 环境。

    *   **`sections/02_principle.tex`**:
        *   根据【实验说明书】，系统地阐述实验所依赖的核心理论、电路工作原理和关键数学公式。
        *   将重要公式放入 `equation` 环境，并为其添加 `\label`。
        *   如果说明书引用了经典理论或教科书，为它创建一个 BibTeX 条目，并在文中用 `\cite{}` 引用。

    *   **`sections/03_equipment.tex`**:
        *   根据【实验说明书】，列出所有实验仪器和元件。
        *   使用 `\section{实验仪器}` 和 `table` + `booktabs` 环境创建一个三线表。

    *   **`sections/04_procedure.tex`**:
        *   简明扼要地总结实验的核心步骤。不要直接照抄说明书，而是以你（操作者）的视角进行概括。
        *   使用 `\section{实验内容与步骤}` 和 `enumerate` 环境。

    *   **`sections/05_results.tex`**:
        *   **这是报告的核心部分。**
        *   将【我的实验数据】整理成专业的 LaTeX 表格 (`table` + `booktabs`)，并添加 `\caption` 和 `\label`。
        *   为我描述的每个图表（如示波器截图），生成 `figure` 环境。在其中使用 `\includegraphics` 命令（文件名使用我提供的），并撰写详细的 `\caption` 来解释图表内容，最后添加 `\label`。
        *   对数据和图表进行初步分析，描述观察到的现象和规律。

    *   **`sections/06_discussion.tex`**:
        *   深入分析【我的实验数据与观察记录】中遇到的问题（例如芯片发热、波形失真）。
        *   分析理论值与实际测量数据之间可能存在的误差来源。
        *   提出可能的改进方案。
        *   使用 `\section{实验讨论}`。

    *   **`sections/07_conclusion.tex`**:
        *   总结本次实验得出的核心结论，并与 `01_purpose.tex` 中的实验目的进行呼应，说明是否达到了预期目标。
        *   使用 `\section{实验结论}`。

    *   **`appendix.tex`**:
        *   如果【我的实验数据与观察记录】中包含较长的代码（如Verilog, C++），将其放入 `lstlisting` 环境中。
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