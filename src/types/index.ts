/**
 * 诗歌生成系统的类型定义
 */

/** 诗歌风格类型 */
export type PoeticStyle = 'quiet' | 'bold'

/** 韵脚类型 */
export type RhymeScheme =
    | 'a'
    | 'ai'
    | 'an'
    | 'ang'
    | 'ao'
    | 'e'
    | 'ei'
    | 'en'
    | 'eng'
    | 'er'
    | 'i'
    | 'ie'
    | 'ong'
    | 'ou'
    | 'r'
    | 'u'
    | 'v'
    | ''

/** 词性标记 */
export type PartOfSpeech = 'MM' | 'MC' | 'MR' | 'DD' | 'DI' | 'DV' | 'DO' | 'DJ' | 'XA' | 'TT' | 'SS'

/** 诗歌配置 */
export interface PoetryConfig {
    /** 诗歌编号 */
    poemNumber: number
    /** 程序版本（可选） */
    version?: string
    /** 最后更新时间（可选） */
    lastUpdated?: string
}

/** 词汇记录 */
export interface WordRecord {
    /** 词语 */
    word: string
    /** 韵母 */
    vowel: string
    /** 属性（主要用于名词分类：人物、地点、时间等） */
    property: string
}

/** 句型结构 */
export interface SentenceStructure {
    /** 内部需求 */
    internalNeed: number
    /** 限制韵脚 */
    limitedRhyme: string
    /** 复合结构数 */
    compoundStructureCount: number
    /** 标点符号 */
    punctuation: string
    /** 结构元素数组 (J1-J27) */
    elements: string[]
}

/** 特殊词 */
export interface SpecialWord {
    /** 特殊词内容 */
    content: string
    /** 类型 */
    type: number
}

/** 诗句 */
export interface PoemLine {
    /** 诗句内容 */
    content: string
}

/** 工作结构 */
export interface WorkingStructure {
    /** 复合结构数 */
    compoundStructureCount: number
    /** 标点符号 */
    punctuation: string
    /** 结构元素数组 (J1-J30) */
    elements: string[]
}

/** 诗歌生成选项 */
export interface PoetryGenerationOptions {
    /** 诗歌风格 */
    style: PoeticStyle
    /** 段数 */
    paragraphCount: number
    /** 每段行数 */
    linesPerParagraph: number
    /** 是否押韵 */
    useRhyme: boolean
    /** 韵脚（当useRhyme为true时） */
    rhymeScheme?: RhymeScheme
}

/** 生成的诗歌 */
export interface GeneratedPoem {
    /** 诗歌标题 */
    title?: string
    /** 诗句数组 */
    lines: string[]
    /** 生成选项 */
    options: PoetryGenerationOptions
    /** 生成时间 */
    createdAt: Date
}

/** 词汇选择上下文 */
export interface WordSelectionContext {
    /** 词性标记 */
    partOfSpeech: PartOfSpeech
    /** 是否需要押韵 */
    needsRhyme: boolean
    /** 韵脚要求 */
    rhymeScheme?: RhymeScheme
}
