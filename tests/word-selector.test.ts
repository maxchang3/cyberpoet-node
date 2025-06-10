import { DataService } from '@/services/data-service'
import { WordSelector } from '@/services/word-selector'
import type { WordSelectionContext } from '@/types'
import { beforeEach, describe, expect, it } from 'vitest'

describe('WordSelector', () => {
    let wordSelector: WordSelector
    let dataService: DataService

    beforeEach(() => {
        dataService = DataService.getInstance()
        wordSelector = new WordSelector(dataService)
    })

    describe('基本词汇选择', () => {
        it('应该能够选择名词 (MM)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'MM',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
        })

        it('应该能够选择形容词 (XA)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'XA',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
        })

        it('应该能够选择叹词 (TT)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'TT',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
        })
    })

    describe('动词选择逻辑', () => {
        it('应该正确处理不及物动词 (DD)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'DD',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
            // 不应该包含分隔符
            expect(word.includes('/')).toBe(false)
        })

        it('应该正确处理简单动词 (DI)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'DI',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
            // 简单动词不应该包含分隔符
            expect(word.includes('/')).toBe(false)
        })

        it('应该正确处理进行时动词 (DV)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'DV',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
            // 进行时动词应该包含"着"
            expect(word.includes('着')).toBe(true)
        })

        it('应该正确处理结果补语动词 (DO)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'DO',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
            // 结果补语动词应该包含"得"
            expect(word.includes('得')).toBe(true)
        })
    })

    describe('名词属性选择', () => {
        it('应该正确选择地点名词 (MC)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'MC',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)

            // 验证选择的词确实是地点相关的（通过检查原始数据）
            const nouns = dataService.getNouns()
            const selectedNoun = nouns.find((noun) => noun.word === word)
            if (selectedNoun) {
                expect(['时间', '地点', '地名'].includes(selectedNoun.property)).toBe(true)
            }
        })

        it('应该正确选择人物名词 (MR)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'MR',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)

            // 验证选择的词确实是人物相关的
            const nouns = dataService.getNouns()
            const selectedNoun = nouns.find((noun) => noun.word === word)
            if (selectedNoun) {
                expect(['人物', '人名'].includes(selectedNoun.property)).toBe(true)
            }
        })
    })

    describe('押韵功能', () => {
        it('应该能够选择押韵词汇', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'MM',
                needsRhyme: true,
                rhymeScheme: 'a',
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)

            // 验证选择的词确实押 'a' 韵
            const nouns = dataService.getNouns()
            const selectedNoun = nouns.find((noun) => noun.word === word)
            if (selectedNoun) {
                expect(selectedNoun.vowel).toBe('a')
            }
        })

        it('应该能够处理不同的韵脚', () => {
            const rhymeSchemes = ['a', 'ai', 'an', 'ao', 'e', 'i', 'ou'] as const

            for (const rhyme of rhymeSchemes) {
                // 检查是否有对应韵脚的词汇
                const nouns = dataService.getNouns()
                const rhymingNouns = nouns.filter((noun) => noun.vowel === rhyme)

                if (rhymingNouns.length > 0) {
                    const context: WordSelectionContext = {
                        partOfSpeech: 'MM',
                        needsRhyme: true,
                        rhymeScheme: rhyme,
                    }

                    const word = wordSelector.selectWord(context)
                    expect(typeof word).toBe('string')
                    expect(word.length).toBeGreaterThan(0)
                }
            }
        })

        it('当没有匹配韵脚的词汇时应该回退到普通选择', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'MM',
                needsRhyme: true,
                rhymeScheme: '' as const, // 使用空字符串作为无效韵脚
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            expect(word.length).toBeGreaterThan(0)
        })
    })

    describe('韵脚规范化', () => {
        it('应该正确规范化韵脚', () => {
            expect(WordSelector.normalizeRhymeScheme('o')).toBe('e')
            expect(WordSelector.normalizeRhymeScheme('uo')).toBe('e')
            expect(WordSelector.normalizeRhymeScheme('ui')).toBe('ei')
            expect(WordSelector.normalizeRhymeScheme('in')).toBe('en')
            expect(WordSelector.normalizeRhymeScheme('un')).toBe('en')
            expect(WordSelector.normalizeRhymeScheme('vn')).toBe('en')
            expect(WordSelector.normalizeRhymeScheme('ing')).toBe('eng')
            expect(WordSelector.normalizeRhymeScheme('ve')).toBe('ie')
            expect(WordSelector.normalizeRhymeScheme('iu')).toBe('ou')
            expect(WordSelector.normalizeRhymeScheme('z')).toBe('r')
            expect(WordSelector.normalizeRhymeScheme('a')).toBe('a') // 不变
        })

        it('应该处理大小写', () => {
            expect(WordSelector.normalizeRhymeScheme('A')).toBe('a')
            expect(WordSelector.normalizeRhymeScheme('AI')).toBe('ai')
            expect(WordSelector.normalizeRhymeScheme('UO')).toBe('e')
        })

        it('应该处理前后空白字符', () => {
            expect(WordSelector.normalizeRhymeScheme(' a ')).toBe('a')
            expect(WordSelector.normalizeRhymeScheme('  ai  ')).toBe('ai')
        })
    })

    describe('特殊词汇处理', () => {
        it('应该能够处理特殊词汇 (SS)', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'SS',
                needsRhyme: false,
            }

            const word = wordSelector.selectWord(context)
            expect(typeof word).toBe('string')
            // 特殊词汇可能为空字符串
        })
    })

    describe('错误处理', () => {
        it('应该对未支持的词性抛出错误', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'UNKNOWN' as 'MM', // 强制转换为支持的类型进行测试
                needsRhyme: false,
            }

            expect(() => {
                wordSelector.selectWord(context)
            }).toThrow('未支持的词性: UNKNOWN')
        })
    })

    describe('随机性测试', () => {
        it('应该能够产生不同的结果（随机性）', () => {
            const context: WordSelectionContext = {
                partOfSpeech: 'MM',
                needsRhyme: false,
            }

            const results = new Set<string>()

            // 多次生成，应该有不同的结果
            for (let i = 0; i < 20; i++) {
                const word = wordSelector.selectWord(context)
                results.add(word)
            }

            // 应该有多个不同的结果（除非词库非常小）
            expect(results.size).toBeGreaterThan(1)
        })
    })
})
