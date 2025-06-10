import { PoetryEngine } from '@/services/poetry-engine'
import type { PoetryGenerationOptions } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('PoetryEngine', () => {
    let engine: PoetryEngine

    beforeEach(() => {
        vi.useFakeTimers()
        engine = new PoetryEngine()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('诗歌生成功能', () => {
        it('应该能够生成基本诗歌', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 4,
                useRhyme: false,
            }

            const poem = engine.generatePoetry(options)

            expect(poem.lines).toHaveLength(4)
            expect(poem.options).toEqual(options)
            expect(poem.createdAt).toBeInstanceOf(Date)

            // 检查每行都不为空
            poem.lines.forEach((line: string) => {
                expect(line.trim().length).toBeGreaterThan(0)
            })
        })

        it('应该能够生成不同风格的诗歌', () => {
            const testCases = [
                { style: 'quiet' as const, expectedLines: 2 },
                { style: 'bold' as const, expectedLines: 3 },
            ]

            testCases.forEach(({ style, expectedLines }) => {
                const options: PoetryGenerationOptions = {
                    style,
                    paragraphCount: 1,
                    linesPerParagraph: expectedLines,
                    useRhyme: false,
                }

                const poem = engine.generatePoetry(options)

                expect(poem).toBeDefined()
                expect(poem.lines.length).toBe(expectedLines)
                expect(poem.options.style).toBe(style)
            })
        })

        it('应该能够生成多段诗歌', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 3,
                linesPerParagraph: 2,
                useRhyme: false,
            }

            const poem = engine.generatePoetry(options)

            expect(poem).toBeDefined()
            expect(poem.lines.length).toBe(6) // 3段 × 2行
        })

        it('应该能够生成押韵诗歌', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 4,
                useRhyme: true,
                rhymeScheme: 'a',
            }

            const poem = engine.generatePoetry(options)

            expect(poem).toBeDefined()
            expect(poem.lines.length).toBe(4)
            expect(poem.options.useRhyme).toBe(true)
            expect(poem.options.rhymeScheme).toBe('a')
        })
    })

    describe('诗歌保存功能', () => {
        it('应该能够生成保存格式的内容', async () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 2,
                useRhyme: false,
            }

            const poem = engine.generatePoetry(options)
            const content = await engine.savePoetry(poem, '测试诗歌')

            expect(content).toContain('测试诗歌')
            expect(content).toContain('作品第')

            // 检查诗句是否包含在内容中
            poem.lines.forEach((line: string) => {
                expect(content).toContain(line)
            })
        })

        it('保存内容应该包含正确的编号格式', async () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 1,
                useRhyme: false,
            }

            const poem = engine.generatePoetry(options)
            const content = await engine.savePoetry(poem, '编号测试')

            // 检查编号格式（应该是6位数）
            const numberMatch = content.match(/作品第(\d{6})号/)
            expect(numberMatch).toBeTruthy()
            if (numberMatch) {
                expect(numberMatch[1].length).toBe(6)
            }
        })
    })

    describe('版本信息功能', () => {
        it('应该能够返回版本信息字符串', () => {
            const versionInfo = engine.getVersionInfo()

            // 只测试基本的返回类型和非空性
            expect(typeof versionInfo).toBe('string')
            expect(versionInfo.length).toBeGreaterThan(0)
        })

        it('应该能够获取诗人年龄信息', () => {
            // Mock 一个固定的时间点进行测试
            const mockDate = new Date('2025-06-10T12:00:00.000Z')
            vi.setSystemTime(mockDate)

            const ageInfo = engine.getPoetAge()

            expect(typeof ageInfo).toBe('string')
            expect(ageInfo.includes('计算机诗人火鸟将为您歌唱')).toBe(true)

            // 使用快照测试确保输出一致性
            expect(ageInfo).toMatchSnapshot()
        })

        it('应该能够正确计算诗人的月龄（不足一岁时）', () => {
            // Mock 到诗人出生后几个月
            const mockDate = new Date('2002-08-15T12:00:00.000Z')
            vi.setSystemTime(mockDate)

            const ageInfo = engine.getPoetAge()

            expect(typeof ageInfo).toBe('string')
            expect(ageInfo.includes('个月大的计算机诗人火鸟将为您歌唱')).toBe(true)
            expect(ageInfo).toMatchSnapshot()
        })

        it('应该能够正确计算诗人的天数（不足一个月时）', () => {
            // Mock 到诗人出生后几天
            const mockDate = new Date('2002-04-20T12:00:00.000Z')
            vi.setSystemTime(mockDate)

            const ageInfo = engine.getPoetAge()

            expect(typeof ageInfo).toBe('string')
            expect(ageInfo.includes('天大的计算机诗人火鸟将为您歌唱')).toBe(true)
            expect(ageInfo).toMatchSnapshot()
        })
    })

    describe('随机性和一致性测试', () => {
        it('相同参数应该能够生成不同的诗歌（随机性）', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 2,
                useRhyme: false,
            }

            const poems: string[] = []

            // 生成多首诗
            for (let i = 0; i < 5; i++) {
                const poem = engine.generatePoetry(options)
                poems.push(poem.lines.join(''))
            }

            // 应该有不同的结果
            const uniquePoems = new Set(poems)
            expect(uniquePoems.size).toBeGreaterThan(1)
        })

        it('生成的诗歌应该符合基本的中文格式', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 3,
                useRhyme: false,
            }

            const poem = engine.generatePoetry(options)

            poem.lines.forEach((line: string) => {
                // 检查不为空
                expect(line.trim().length).toBeGreaterThan(0)

                // 检查不包含异常字符
                expect(line).not.toMatch(/undefined|null|NaN/)

                // 检查长度合理（中文诗句一般不会太长）
                expect(line.length).toBeLessThan(100)
            })
        })
    })

    describe('错误处理', () => {
        it('应该能够处理极端参数', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 1,
                useRhyme: false,
            }

            expect(() => {
                engine.generatePoetry(options)
            }).not.toThrow()
        })

        it('应该能够处理押韵参数但没有指定韵脚的情况', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 1,
                linesPerParagraph: 2,
                useRhyme: true,
                // 没有指定 rhymeScheme
            }

            expect(() => {
                engine.generatePoetry(options)
            }).not.toThrow()
        })
    })

    describe('性能测试', () => {
        it('应该能够生成大量诗歌内容', () => {
            const options: PoetryGenerationOptions = {
                style: 'bold',
                paragraphCount: 5,
                linesPerParagraph: 8,
                useRhyme: false,
            }

            const poem = engine.generatePoetry(options)

            expect(poem.lines.length).toBe(40) // 5段 × 8行
            // 验证所有行都有内容
            poem.lines.forEach((line) => {
                expect(line.trim().length).toBeGreaterThan(0)
            })
        })
    })
})
