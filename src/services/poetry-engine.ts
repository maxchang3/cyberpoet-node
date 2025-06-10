import type {
    GeneratedPoem,
    PartOfSpeech,
    PoetryGenerationOptions,
    WordSelectionContext,
    WorkingStructure,
} from '@/types'
import { DataService } from './data-service'
import { StructureGenerator } from './structure-generator'
import { WordSelector } from './word-selector'

/**
 * 诗歌生成引擎 - 核心诗歌生成逻辑
 * 还原自原始Visual FoxPro的cpzh和cpzhy程序逻辑
 */
export class PoetryEngine {
    private dataService: DataService
    private wordSelector: WordSelector
    private structureGenerator: StructureGenerator

    constructor() {
        this.dataService = DataService.getInstance()
        this.wordSelector = new WordSelector(this.dataService)
        this.structureGenerator = new StructureGenerator(this.dataService)
    }

    /**
     * 生成诗歌
     * @param options 生成选项
     * @returns 生成的诗歌
     */
    public generatePoetry(options: PoetryGenerationOptions): GeneratedPoem {
        console.log(
            `开始生成诗歌，风格：${options.style}，段数：${options.paragraphCount}，每段行数：${options.linesPerParagraph}`
        )

        // 创建诗歌结构
        const structures = this.structureGenerator.createStructure(
            options.paragraphCount,
            options.linesPerParagraph,
            options.style,
            options.rhymeScheme
        )

        // 生成诗句
        const lines: string[] = []
        let lineNumber = 1

        for (const structure of structures) {
            const line = this.generateLine(structure, options)
            lines.push(line)
            lineNumber++
        }

        console.log('诗歌生成完成！')

        return {
            lines,
            options,
            createdAt: new Date(),
        }
    }

    /**
     * 生成单行诗句
     * @param structure 工作结构
     * @param options 生成选项
     * @returns 生成的诗句
     */
    private generateLine(structure: WorkingStructure, options: PoetryGenerationOptions): string {
        let line = ''
        let elementIndex = 0

        while (elementIndex < 27) {
            const element = structure.elements[elementIndex] || ''

            if (element === '') {
                break
            }

            // 判断是否为词性标记
            if (this.isPartOfSpeech(element)) {
                // 规范化词性标记
                const partOfSpeech = this.normalizePartOfSpeech(element)
                const word = this.selectWordForElement(partOfSpeech, options)
                line += word

                // 处理特殊的复合动词结构
                if (partOfSpeech === 'DV' || partOfSpeech === 'DO') {
                    elementIndex += 2 // 跳过后续的修饰符
                }
            } else {
                // 直接添加标点符号或修饰符
                line += element
            }

            elementIndex++
        }

        // 添加句尾标点
        line += structure.punctuation

        return line.trim()
    }

    /**
     * 为结构元素选择词汇
     * @param partOfSpeech 词性
     * @param options 生成选项
     * @returns 选择的词汇
     */
    private selectWordForElement(partOfSpeech: PartOfSpeech, options: PoetryGenerationOptions): string {
        const context: WordSelectionContext = {
            partOfSpeech,
            needsRhyme: options.useRhyme,
            rhymeScheme: options.rhymeScheme,
        }

        return this.wordSelector.selectWord(context)
    }

    /**
     * 将遗留的词性标记规范化为标准格式
     * @param element 原始元素
     * @returns 规范化的词性标记
     */
    private normalizePartOfSpeech(element: string): PartOfSpeech {
        // 处理遗留格式映射
        const legacyMappings: Record<string, PartOfSpeech> = {
            XX: 'XA', // 形容词
            Mm: 'MM', // 名词
            Mr: 'MR', // 人物名词
            Mc: 'MC', // 地点名词
            DB: 'DD', // 动词（暂时映射为不及物动词）
            Dd: 'DD', // 不及物动词
            Dv: 'DV', // 进行时动词
            Do: 'DO', // 结果补语动词
        }

        // 如果是遗留格式，进行转换
        if (element in legacyMappings) {
            return legacyMappings[element]
        }

        // 处理大小写混合的标准格式（如 Mm -> MM）
        const upperElement = element.toUpperCase()
        const partOfSpeechTags: PartOfSpeech[] = ['MM', 'MC', 'MR', 'DD', 'DI', 'DV', 'DO', 'DJ', 'XA', 'TT', 'SS']
        if (partOfSpeechTags.includes(upperElement as PartOfSpeech)) {
            return upperElement as PartOfSpeech
        }

        // 如果已经是标准格式，直接返回
        if (partOfSpeechTags.includes(element as PartOfSpeech)) {
            return element as PartOfSpeech
        }

        // 默认返回名词
        console.warn(`未知的词性标记: ${element}，默认使用名词 (MM)`)
        return 'MM'
    }

    /**
     * 判断字符串是否为词性标记
     * @param element 元素字符串
     * @returns 是否为词性标记
     */
    private isPartOfSpeech(element: string): boolean {
        const partOfSpeechTags = ['MM', 'MC', 'MR', 'DD', 'DI', 'DV', 'DO', 'DJ', 'XA', 'TT', 'SS']

        // 直接匹配标准的词性标记
        if (partOfSpeechTags.includes(element)) {
            return true
        }

        // 处理大小写混合的变体（如 Mm, Mr, Xa 等）
        const upperElement = element.toUpperCase()
        if (partOfSpeechTags.includes(upperElement)) {
            return true
        }

        // 处理特殊的遗留格式
        const legacyMappings: Record<string, boolean> = {
            XX: true, // 可能表示形容词 (XA)
            Mm: true, // 可能表示名词 (MM)
            Mr: true, // 可能表示人物名词 (MR)
            Mc: true, // 可能表示地点名词 (MC)
            DB: true, // 可能表示动词
            Dd: true, // 可能表示动词
            Dv: true, // 可能表示进行时动词
            Do: true, // 可能表示结果补语动词
        }

        return element in legacyMappings
    }

    /**
     * 保存诗歌到文件
     * @param poem 生成的诗歌
     * @param title 诗歌标题
     * @param outputPath 输出路径（可选）
     */
    public async savePoetry(poem: GeneratedPoem, title: string, outputPath?: string): Promise<string> {
        const config = this.dataService.getCurrentConfig()
        const poemNumber = config.poemNumber.toString().padStart(6, '0')
        const filename = `cp${poemNumber}.txt`

        let content = ''
        content += '**************************************\n'
        content += `${title}\n`
        content += `（作品第${poemNumber}号）\n`
        content += '**************************************\n'

        for (const line of poem.lines) {
            content += `${line}\n`
        }

        if (outputPath) {
            const { writeFileSync } = await import('node:fs')
            const { join } = await import('node:path')
            const fullPath = join(outputPath, filename)
            writeFileSync(fullPath, content, 'utf-8')

            // 更新配置中的诗歌编号
            await this.dataService.updatePoemNumber()

            return fullPath
        }

        return content
    }

    /**
     * 获取诗歌年龄信息（从原始程序的计算逻辑迁移）
     * @returns 年龄描述字符串
     */
    public getPoetAge(): string {
        const birthDate = new Date(2002, 3, 4) // 2002年4月4日
        const now = new Date()

        const ageYears = now.getFullYear() - birthDate.getFullYear()
        const ageMonths = now.getMonth() - birthDate.getMonth()
        const ageDays = now.getDate() - birthDate.getDate()

        if (ageYears !== 0) {
            return `${ageYears}岁的计算机诗人火鸟将为您歌唱！`
        }
        if (ageMonths !== 0) {
            return `${ageMonths}个月大的计算机诗人火鸟将为您歌唱！`
        }
        return `${ageDays}天大的计算机诗人火鸟将为您歌唱！`
    }

    /**
     * 获取程序版本信息
     * @returns 版本信息字符串
     */
    public getVersionInfo(): string {
        return `
≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌

　　听吧！
　　${this.getPoetAge()}
　　　　　　　　　　　　　　　　　　Version 2.0 (Node.js)
生日：2002年4月4日　　　　　　　　┌────────────────────────────────────┐
星座：白羊座　　　　　　　　　　　│原作：刘慈欣　　　　　　　　　　　　│
籍贯：山西平定娘子关　　　　　　　│改编：诸葛恒　　　　　　　　　　　　│
爱好：写诗　　　　　　　　　　　　│迁移：Github Copilot Claude Sonnet 4│
　　　　　　　　　　　　　　　　　└────────────────────────────────────┘
　　　　　　　　　　　　　最后更新于 2025 年 6 月 10 日

≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌≌
`
    }
}
