import type { RhymeScheme, WordRecord, WordSelectionContext } from '../types/index'
import type { DataService } from './data-service'

/**
 * 词汇选择服务 - 负责根据规则选择合适的词汇
 */
export class WordSelector {
    private dataService: DataService

    constructor(dataService: DataService) {
        this.dataService = dataService
    }

    /**
     * 根据上下文选择词汇
     * 还原自原始 Visual FoxPro 的 select_word 过程
     */
    public selectWord(context: WordSelectionContext): string {
        const { partOfSpeech, needsRhyme, rhymeScheme } = context
        const words = this.dataService.getWordsByPartOfSpeech(partOfSpeech)

        switch (partOfSpeech) {
            case 'MM':
            case 'TT':
            case 'DJ':
            case 'XA':
                return this.selectBasicWord(words, needsRhyme, rhymeScheme)

            case 'DD':
                return this.selectIntransitiveVerb(words, needsRhyme, rhymeScheme)

            case 'MC':
                return this.selectLocationNoun(words, needsRhyme, rhymeScheme)

            case 'MR':
                return this.selectPersonNoun(words, needsRhyme, rhymeScheme)

            case 'DI':
                return this.selectSimpleVerb(words)

            case 'DV':
                return this.selectProgressiveVerb(words, needsRhyme, rhymeScheme)

            case 'DO':
                return this.selectResultativeVerb(words)

            case 'SS':
                return this.selectSpecialWord()

            default:
                throw new Error(`未支持的词性: ${partOfSpeech}`)
        }
    }

    /** 选择基本词汇（名词、叹词、及物动词、形容词） */
    private selectBasicWord(words: WordRecord[], needsRhyme: boolean, rhymeScheme?: RhymeScheme): string {
        if (needsRhyme && rhymeScheme) {
            const rhymingWords = words.filter((word) => word.vowel === rhymeScheme)
            if (rhymingWords.length > 0) {
                return this.getRandomWord(rhymingWords).word
            }
        }
        return this.getRandomWord(words).word
    }

    /** 选择不及物动词（DD） */
    private selectIntransitiveVerb(words: WordRecord[], needsRhyme: boolean, rhymeScheme?: RhymeScheme): string {
        const selectedWord =
            needsRhyme && rhymeScheme ? this.getRandomRhymingWord(words, rhymeScheme) : this.getRandomWord(words)

        // 处理动词的分隔符格式（如：骑/马）
        const wordText = selectedWord.word
        const slashIndex = wordText.indexOf('/')
        if (slashIndex !== -1) {
            return wordText.substring(0, slashIndex) + wordText.substring(slashIndex + 1)
        }
        return wordText
    }

    /** 选择地点名词（MC） */
    private selectLocationNoun(words: WordRecord[], needsRhyme: boolean, rhymeScheme?: RhymeScheme): string {
        const locationWords = words.filter(
            (word) => word.property === '时间' || word.property === '地点' || word.property === '地名'
        )

        if (needsRhyme && rhymeScheme) {
            const rhymingLocationWords = locationWords.filter((word) => word.vowel === rhymeScheme)
            if (rhymingLocationWords.length > 0) {
                return this.getRandomWord(rhymingLocationWords).word
            }
        }

        if (locationWords.length === 0) {
            throw new Error('没有找到合适的地点名词')
        }
        return this.getRandomWord(locationWords).word
    }

    /** 选择人物名词（MR） */
    private selectPersonNoun(words: WordRecord[], needsRhyme: boolean, rhymeScheme?: RhymeScheme): string {
        const personWords = words.filter((word) => word.property === '人物' || word.property === '人名')

        if (needsRhyme && rhymeScheme) {
            const rhymingPersonWords = personWords.filter((word) => word.vowel === rhymeScheme)
            if (rhymingPersonWords.length > 0) {
                return this.getRandomWord(rhymingPersonWords).word
            }
        }

        if (personWords.length === 0) {
            throw new Error('没有找到合适的人物名词')
        }
        return this.getRandomWord(personWords).word
    }

    /** 选择简单动词（DI） - 不包含分隔符的动词 */
    private selectSimpleVerb(words: WordRecord[]): string {
        const simpleVerbs = words.filter((word) => !word.word.includes('/'))
        if (simpleVerbs.length === 0) {
            throw new Error('没有找到合适的简单动词')
        }
        return this.getRandomWord(simpleVerbs).word
    }

    /** 选择进行时动词（DV） - 添加"着"后缀 */
    private selectProgressiveVerb(words: WordRecord[], needsRhyme: boolean, rhymeScheme?: RhymeScheme): string {
        let candidateWords = words.filter((word) => word.word.includes('/'))

        if (needsRhyme && rhymeScheme) {
            const rhymingWords = candidateWords.filter((word) => word.vowel === rhymeScheme)
            if (rhymingWords.length > 0) {
                candidateWords = rhymingWords
            }
        }

        if (candidateWords.length === 0) {
            throw new Error('没有找到合适的进行时动词')
        }

        const selectedWord = this.getRandomWord(candidateWords)
        const wordText = selectedWord.word
        const slashIndex = wordText.indexOf('/')
        if (slashIndex !== -1) {
            return wordText.substring(0, slashIndex) + '着' + wordText.substring(slashIndex + 1)
        }
        return wordText + '着'
    }

    /** 选择结果补语动词（DO） - 添加"得"后缀 */
    private selectResultativeVerb(words: WordRecord[]): string {
        const candidateWords = words.filter((word) => word.word.includes('/'))

        if (candidateWords.length === 0) {
            throw new Error('没有找到合适的结果补语动词')
        }

        const selectedWord = this.getRandomWord(candidateWords)
        const wordText = selectedWord.word
        const slashIndex = wordText.indexOf('/')
        if (slashIndex !== -1) {
            return wordText.substring(slashIndex + 1).trim() + wordText.substring(0, slashIndex) + '得'
        }
        return wordText + '得'
    }

    /** 选择特殊词汇（SS） */
    private selectSpecialWord(): string {
        const specialWords = this.dataService.getSpecialWords()
        if (specialWords.length === 0) {
            return '' // 如果没有特殊词，返回空字符串
        }
        const randomIndex = Math.floor(Math.random() * specialWords.length)
        return specialWords[randomIndex].content
    }

    /** 获取随机词汇 */
    private getRandomWord(words: WordRecord[]): WordRecord {
        if (words.length === 0) {
            throw new Error('词汇列表为空')
        }
        const randomIndex = Math.floor(Math.random() * words.length)
        return words[randomIndex]
    }

    /** 获取随机押韵词汇 */
    private getRandomRhymingWord(words: WordRecord[], rhymeScheme: RhymeScheme): WordRecord {
        const rhymingWords = words.filter((word) => word.vowel === rhymeScheme)
        return this.getRandomWord(rhymingWords)
    }

    /** 规范化韵脚 - 还原自原始代码的韵脚转换逻辑 */
    public static normalizeRhymeScheme(rhyme: string): RhymeScheme {
        const normalizedRhyme = rhyme.toLowerCase().trim()

        switch (normalizedRhyme) {
            case 'o':
            case 'uo':
                return 'e'
            case 'ui':
                return 'ei'
            case 'in':
            case 'un':
            case 'vn':
                return 'en'
            case 'ing':
                return 'eng'
            case 've':
                return 'ie'
            case 'iu':
                return 'ou'
            case 'z':
                return 'r'
            default:
                return normalizedRhyme as RhymeScheme
        }
    }
}
