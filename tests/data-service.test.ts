import { beforeEach, describe, expect, it } from 'vitest'
import { DataService } from '../src/services/data-service'

describe('DataService', () => {
    let dataService: DataService

    beforeEach(() => {
        dataService = DataService.getInstance()
        dataService.clearCache() // 确保每次测试都重新加载数据
    })

    describe('基本数据加载功能', () => {
        it('应该能够加载配置数据', () => {
            const config = dataService.getConfig()
            expect(config).toBeDefined()
            expect(typeof config.poemNumber).toBe('number')
        })

        it('应该能够获取当前配置', () => {
            const config = dataService.getCurrentConfig()
            expect(config).toBeDefined()
            expect(typeof config.poemNumber).toBe('number')
        })

        it('应该能够加载名词数据', () => {
            const nouns = dataService.getNouns()
            expect(nouns).toBeDefined()
            expect(Array.isArray(nouns)).toBe(true)
            expect(nouns.length).toBeGreaterThan(0)

            // 检查数据结构
            const firstNoun = nouns[0]
            expect(firstNoun).toHaveProperty('word')
            expect(firstNoun).toHaveProperty('vowel')
            expect(firstNoun).toHaveProperty('class')
            expect(firstNoun).toHaveProperty('property')
        })

        it('应该能够加载形容词数据', () => {
            const adjectives = dataService.getAdjectives()
            expect(adjectives).toBeDefined()
            expect(Array.isArray(adjectives)).toBe(true)
            expect(adjectives.length).toBeGreaterThan(0)
        })

        it('应该能够加载动词数据', () => {
            const intransitiveVerbs = dataService.getIntransitiveVerbs()
            const transitiveVerbs = dataService.getTransitiveVerbs()

            expect(intransitiveVerbs).toBeDefined()
            expect(transitiveVerbs).toBeDefined()
            expect(intransitiveVerbs.length).toBeGreaterThan(0)
            expect(transitiveVerbs.length).toBeGreaterThan(0)
        })

        it('应该能够加载叹词数据', () => {
            const interjections = dataService.getInterjections()
            expect(interjections).toBeDefined()
            expect(Array.isArray(interjections)).toBe(true)
            expect(interjections.length).toBeGreaterThan(0)
        })

        it('应该能够加载句型结构数据', () => {
            const structures = dataService.getSentenceStructures()
            expect(structures).toBeDefined()
            expect(Array.isArray(structures)).toBe(true)
            expect(structures.length).toBeGreaterThan(0)

            // 检查结构字段
            const firstStructure = structures[0]
            expect(firstStructure).toHaveProperty('elements')
            expect(firstStructure).toHaveProperty('punctuation')
            expect(Array.isArray(firstStructure.elements)).toBe(true)
        })
    })

    describe('根据词性获取词汇', () => {
        it('应该能够根据词性获取正确的词汇', () => {
            const nounsByMM = dataService.getWordsByPartOfSpeech('MM')
            const nounsByMC = dataService.getWordsByPartOfSpeech('MC')
            const nounsByMR = dataService.getWordsByPartOfSpeech('MR')
            const adjectivesByXA = dataService.getWordsByPartOfSpeech('XA')

            expect(nounsByMM).toEqual(dataService.getNouns())
            expect(nounsByMC).toEqual(dataService.getNouns())
            expect(nounsByMR).toEqual(dataService.getNouns())
            expect(adjectivesByXA).toEqual(dataService.getAdjectives())
        })

        it('应该对未知词性抛出错误', () => {
            expect(() => {
                dataService.getWordsByPartOfSpeech('UNKNOWN')
            }).toThrow('未支持的词性: UNKNOWN')
        })
    })

    describe('词汇数量统计', () => {
        it('应该能够获取正确的词汇数量', () => {
            const nounCount = dataService.getWordsByPartOfSpeech('MM').length
            const adjectiveCount = dataService.getWordsByPartOfSpeech('XA').length

            expect(nounCount).toBeGreaterThan(0)
            expect(adjectiveCount).toBeGreaterThan(0)
            expect(nounCount).toBe(dataService.getNouns().length)
            expect(adjectiveCount).toBe(dataService.getAdjectives().length)
        })
    })

    describe('缓存功能', () => {
        it('应该能够清除缓存', () => {
            // 先加载一些数据
            dataService.getNouns()
            dataService.getAdjectives()

            // 清除缓存
            dataService.clearCache()

            // 再次加载应该重新读取文件
            const nouns = dataService.getNouns()
            expect(nouns).toBeDefined()
        })

        it('应该使用单例模式', () => {
            const instance1 = DataService.getInstance()
            const instance2 = DataService.getInstance()

            expect(instance1).toBe(instance2)
        })
    })

    describe('数据完整性检查', () => {
        it('名词数据应该包含正确的韵母信息', () => {
            const nouns = dataService.getNouns()
            const nounsWithVowels = nouns.filter((noun) => noun.vowel && noun.vowel.length > 0)

            expect(nounsWithVowels.length).toBeGreaterThan(0)

            // 检查一些常见韵母
            const commonVowels = ['a', 'ai', 'an', 'ang', 'ao', 'e', 'ei', 'en', 'eng', 'i', 'ou']
            const foundVowels = new Set(nouns.map((noun) => noun.vowel).filter((vowel) => vowel))

            const hasCommonVowels = commonVowels.some((vowel) => foundVowels.has(vowel))
            expect(hasCommonVowels).toBe(true)
        })

        it('动词数据应该包含带分隔符的复合动词', () => {
            const intransitiveVerbs = dataService.getIntransitiveVerbs()
            const verbsWithSlash = intransitiveVerbs.filter((verb) => verb.word.includes('/'))

            expect(verbsWithSlash.length).toBeGreaterThan(0)

            // 检查分隔符格式
            verbsWithSlash.forEach((verb) => {
                expect(verb.word.split('/').length).toBe(2)
            })
        })

        it('句型结构应该包含有效的元素', () => {
            const structures = dataService.getSentenceStructures()

            structures.forEach((structure) => {
                expect(structure.elements.length).toBe(27)

                // 检查是否有非空元素
                const nonEmptyElements = structure.elements.filter((element: string) => element.length > 0)
                expect(nonEmptyElements.length).toBeGreaterThan(0)
            })
        })
    })
})
