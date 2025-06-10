import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PoemLine, PoetryConfig, SentenceStructure, SpecialWord, WordRecord, WorkingStructure } from '@/types'

/**
 * 数据访问层 - 负责加载和管理诗歌生成所需的数据
 */
export class DataService {
    private static instance: DataService
    private dataDir: string
    private configDir: string

    // 缓存的数据
    private config: PoetryConfig | null = null
    private nouns: WordRecord[] | null = null
    private adjectives: WordRecord[] | null = null
    private intransitiveVerbs: WordRecord[] | null = null
    private transitiveVerbs: WordRecord[] | null = null
    private interjections: WordRecord[] | null = null
    private sentenceStructures: SentenceStructure[] | null = null
    private workingStructures: WorkingStructure[] | null = null
    private specialWords: SpecialWord[] | null = null
    private poemLines: PoemLine[] | null = null

    private constructor() {
        this.dataDir = join(process.cwd(), 'src', 'data')
        this.configDir = process.cwd()
    }

    /** 获取单例实例 */
    public static getInstance(): DataService {
        if (!DataService.instance) {
            DataService.instance = new DataService()
        }
        return DataService.instance
    }

    /** 加载JSON文件 */
    private loadJsonFile<T>(filename: string): T {
        try {
            const filePath = join(this.dataDir, filename)
            const content = readFileSync(filePath, 'utf-8')
            return JSON.parse(content) as T
        } catch (error) {
            throw new Error(`无法加载数据文件 ${filename}: ${error}`)
        }
    }

    /** 加载配置文件 */
    private loadConfigFile(): PoetryConfig {
        try {
            const configPath = join(this.configDir, 'config.json')
            const content = readFileSync(configPath, 'utf-8')
            return JSON.parse(content) as PoetryConfig
        } catch (error) {
            throw new Error(`无法加载配置文件: ${error}`)
        }
    }

    /** 获取配置数据 */
    public getConfig(): PoetryConfig {
        if (!this.config) {
            this.config = this.loadConfigFile()
        }
        return this.config
    }

    /** 获取当前配置 */
    public getCurrentConfig(): PoetryConfig {
        return this.getConfig()
    }

    /** 更新诗歌编号并保存配置 */
    public async updatePoemNumber(): Promise<void> {
        if (!this.config) {
            this.config = this.loadConfigFile()
        }

        // 更新诗歌编号
        this.config.poemNumber += 1

        // 保存到文件
        try {
            const { writeFileSync } = await import('node:fs')
            const configPath = join(this.configDir, 'config.json')
            writeFileSync(configPath, JSON.stringify(this.config, null, 2), 'utf-8')
        } catch (error) {
            console.warn('保存配置文件失败:', error)
            // 不抛出错误，因为这不应该阻止诗歌生成
        }
    }

    /** 获取名词数据 */
    public getNouns(): WordRecord[] {
        if (!this.nouns) {
            this.nouns = this.loadJsonFile<WordRecord[]>('nouns.json')
        }
        return this.nouns
    }

    /** 获取形容词数据 */
    public getAdjectives(): WordRecord[] {
        if (!this.adjectives) {
            this.adjectives = this.loadJsonFile<WordRecord[]>('adjectives.json')
        }
        return this.adjectives
    }

    /** 获取不及物动词数据 */
    public getIntransitiveVerbs(): WordRecord[] {
        if (!this.intransitiveVerbs) {
            this.intransitiveVerbs = this.loadJsonFile<WordRecord[]>('intransitive-verbs.json')
        }
        return this.intransitiveVerbs
    }

    /** 获取及物动词数据 */
    public getTransitiveVerbs(): WordRecord[] {
        if (!this.transitiveVerbs) {
            this.transitiveVerbs = this.loadJsonFile<WordRecord[]>('transitive-verbs.json')
        }
        return this.transitiveVerbs
    }

    /** 获取叹词数据 */
    public getInterjections(): WordRecord[] {
        if (!this.interjections) {
            this.interjections = this.loadJsonFile<WordRecord[]>('interjections.json')
        }
        return this.interjections
    }

    /** 获取句型结构数据 */
    public getSentenceStructures(): SentenceStructure[] {
        if (!this.sentenceStructures) {
            this.sentenceStructures = this.loadJsonFile<SentenceStructure[]>('sentence-structures.json')
        }
        return this.sentenceStructures
    }

    /** 获取工作结构数据 */
    public getWorkingStructures(): WorkingStructure[] {
        if (!this.workingStructures) {
            this.workingStructures = this.loadJsonFile<WorkingStructure[]>('working-structures.json')
        }
        return this.workingStructures
    }

    /** 获取特殊词数据 */
    public getSpecialWords(): SpecialWord[] {
        if (!this.specialWords) {
            this.specialWords = this.loadJsonFile<SpecialWord[]>('special-words.json')
        }
        return this.specialWords
    }

    /** 获取诗句数据 */
    public getPoemLines(): PoemLine[] {
        if (!this.poemLines) {
            this.poemLines = this.loadJsonFile<PoemLine[]>('poem-lines.json')
        }
        return this.poemLines
    }

    /** 根据词性获取对应的词汇数据 */
    public getWordsByPartOfSpeech(partOfSpeech: string): WordRecord[] {
        switch (partOfSpeech) {
            case 'MM':
            case 'MC':
            case 'MR':
                return this.getNouns()
            case 'DD':
            case 'DI':
            case 'DV':
            case 'DO':
                return this.getIntransitiveVerbs()
            case 'DJ':
                return this.getTransitiveVerbs()
            case 'XA':
                return this.getAdjectives()
            case 'TT':
                return this.getInterjections()
            case 'SS':
                return this.getSpecialWords().map((sw) => ({
                    word: sw.content,
                    vowel: '',
                    property: '',
                }))
            default:
                throw new Error(`未支持的词性: ${partOfSpeech}`)
        }
    }

    /** 重置缓存 */
    public clearCache(): void {
        this.config = null
        this.nouns = null
        this.adjectives = null
        this.intransitiveVerbs = null
        this.transitiveVerbs = null
        this.interjections = null
        this.sentenceStructures = null
        this.workingStructures = null
        this.specialWords = null
        this.poemLines = null
    }
}
