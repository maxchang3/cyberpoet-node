import type { PoeticStyle, RhymeScheme, SentenceStructure, WorkingStructure } from '@/types'
import type { DataService } from './data-service'

/**
 * 句型结构生成器 - 负责创建诗歌的句型结构
 * 还原自原始 Visual FoxPro 的 create_structure 过程
 */
export class StructureGenerator {
    private dataService: DataService

    constructor(dataService: DataService) {
        this.dataService = dataService
    }

    /**
     * 创建诗歌结构
     * @param paragraphCount 段数
     * @param linesPerParagraph 每段行数
     * @param style 诗歌风格
     * @param rhymeScheme 韵脚（可选）
     * @returns 工作结构数组
     */
    public createStructure(
        paragraphCount: number,
        linesPerParagraph: number,
        style: PoeticStyle,
        rhymeScheme?: RhymeScheme
    ): WorkingStructure[] {
        const sentenceStructures = this.dataService.getSentenceStructures()
        const structureCount = sentenceStructures.length

        // 生成临时结构
        const tempStructures: SentenceStructure[] = []

        for (let lineIndex = 1; lineIndex <= linesPerParagraph; lineIndex++) {
            const needsRhyme = this.shouldLineRhyme(lineIndex, linesPerParagraph)
            let selectedStructure: SentenceStructure

            if (style === 'quiet') {
                // 宁静风格：选择原始结构数小于10的句型
                selectedStructure = this.selectQuietStructure(sentenceStructures, needsRhyme, rhymeScheme)
            } else {
                // 奔放风格：可以选择任意句型
                selectedStructure = this.selectBoldStructure(sentenceStructures, needsRhyme, rhymeScheme)
            }

            tempStructures.push(selectedStructure)
        }

        // 为每个段落复制结构并处理成工作结构
        const workingStructures: WorkingStructure[] = []

        for (let paragraphIndex = 1; paragraphIndex <= paragraphCount; paragraphIndex++) {
            for (let lineIndex = 1; lineIndex <= linesPerParagraph; lineIndex++) {
                const baseStructure = tempStructures[lineIndex - 1]
                const needsRhyme = this.shouldLineRhyme(paragraphIndex, paragraphCount)

                // 处理结构元素，扩展复合结构
                const processedStructure = this.processStructureElements(baseStructure, needsRhyme, rhymeScheme)

                workingStructures.push(processedStructure)
            }
        }

        return workingStructures
    }

    /** 判断是否需要押韵 */
    private shouldLineRhyme(lineIndex: number, totalLines: number): boolean {
        if (totalLines % 2 === 0) {
            // 偶数行：第1行和偶数行押韵
            return lineIndex === 1 || lineIndex % 2 === 0
        }
        // 奇数行：奇数行押韵
        return (lineIndex + 1) % 2 === 0
    }

    /** 选择宁静风格的句型结构 */
    private selectQuietStructure(
        structures: SentenceStructure[],
        needsRhyme: boolean,
        rhymeScheme?: RhymeScheme
    ): SentenceStructure {
        let attempts = 0
        const maxAttempts = 100 // 防止无限循环

        while (attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * structures.length)
            const structure = structures[randomIndex]

            // 宁静风格：不选择原始结构数大于等于10的句型
            const isQuiet = structure.elements[9] === '' // J10字段为空表示结构数小于10

            if (!isQuiet) {
                attempts++
                continue
            }

            // 检查韵脚要求
            if (needsRhyme && rhymeScheme && structure.compoundStructureCount === 0) {
                if (structure.limitedRhyme !== rhymeScheme && structure.limitedRhyme !== 'E') {
                    attempts++
                    continue
                }
            }

            return structure
        }

        // 如果无法找到合适的结构，返回第一个结构
        return structures[0]
    }

    /** 选择奔放风格的句型结构 */
    private selectBoldStructure(
        structures: SentenceStructure[],
        needsRhyme: boolean,
        rhymeScheme?: RhymeScheme
    ): SentenceStructure {
        let attempts = 0
        const maxAttempts = 100 // 防止无限循环

        while (attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * structures.length)
            const structure = structures[randomIndex]

            // 检查韵脚要求
            if (needsRhyme && rhymeScheme && structure.compoundStructureCount === 0) {
                if (structure.limitedRhyme !== rhymeScheme && structure.limitedRhyme !== 'E') {
                    attempts++
                    continue
                }
            }

            return structure
        }

        // 如果无法找到合适的结构，返回第一个结构
        return structures[0]
    }

    /** 处理结构元素，扩展复合结构 */
    private processStructureElements(
        structure: SentenceStructure,
        needsRhyme: boolean,
        rhymeScheme?: RhymeScheme
    ): WorkingStructure {
        const processedElements: string[] = []

        for (let i = 0; i < 27; i++) {
            const element = structure.elements[i] || ''

            if (element === '') {
                break
            }

            // 处理特殊的复合结构
            if (element === 'Dd' && structure.limitedRhyme === 'E') {
                // 扩展为 DV+着+DO 结构
                processedElements.push('DV', '着', 'DO')
            } else if (element.length === 2 && element[0] === element[0].toLowerCase()) {
                // 处理小写开头的元素（如：Mm）
                processedElements.push(element.toUpperCase())
            } else {
                processedElements.push(element)
            }
        }

        // 补足到30个元素
        while (processedElements.length < 30) {
            processedElements.push('')
        }

        return {
            compoundStructureCount: structure.compoundStructureCount,
            punctuation: structure.punctuation,
            elements: processedElements,
        }
    }

    /** 随机选择句型结构 */
    private getRandomStructure(structures: SentenceStructure[]): SentenceStructure {
        const randomIndex = Math.floor(Math.random() * structures.length)
        return structures[randomIndex]
    }
}
