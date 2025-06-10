#!/usr/bin/env tsx

import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DBFFile } from 'dbffile'

/**
 * DBF 文件转 JSON 的转换脚本
 * 将 Visual FoxPro 的数据库文件转换为 JSON 格式，便于 Node.js 项目使用
 */

interface PoetryConfig {
    /** 行数 */
    lineCount: number
    /** 段落数 */
    paragraphCount: number
    /** 名词总数 */
    nounCount: number
    /** 不及物动词总数 */
    intransitiveVerbCount: number
    /** 及物动词总数 */
    transitiveVerbCount: number
    /** 形容词总数 */
    adjectiveCount: number
    /** 叹词总数 */
    interjectionCount: number
    /** 特殊词总数 */
    specialWordCount: number
    /** 句型总数 */
    structureCount: number
    /** 诗歌编号 */
    poemNumber: number
}

interface WordRecord {
    /** 词语 */
    word: string
    /** 韵母 */
    vowel: string
    /** 类别 */
    class: string
    /** 属性 */
    property: string
    /** 自由度 */
    liberty: string
    /** 频率 */
    frequency: number | null
}

interface SentenceStructure {
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

interface SpecialWord {
    /** 特殊词内容 */
    content: string
    /** 类型 */
    type: number
}

interface PoemLine {
    /** 诗句内容 */
    content: string
}

interface WorkingStructure {
    /** 复合结构数 */
    compoundStructureCount: number
    /** 标点符号 */
    punctuation: string
    /** 结构元素数组 (J1-J30) */
    elements: string[]
}

/**
 * 转换DBF文件为JSON
 */
async function convertDbfToJson(dbfPath: string, encoding = 'gb2312'): Promise<Record<string, unknown>[]> {
    if (!existsSync(dbfPath)) {
        console.warn(`文件不存在: ${dbfPath}`)
        return []
    }

    try {
        const dbf = await DBFFile.open(dbfPath, { encoding })
        const records = await dbf.readRecords()

        // 清理记录中的空白字符
        return records.map((record) => {
            const cleanRecord: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(record)) {
                if (typeof value === 'string') {
                    cleanRecord[key] = value.trim()
                } else {
                    cleanRecord[key] = value
                }
            }
            return cleanRecord
        })
    } catch (error) {
        console.error(`转换文件 ${dbfPath} 时出错:`, error)
        return []
    }
}

/**
 * 转换配置文件
 */
function convertConfig(records: Record<string, unknown>[]): PoetryConfig[] {
    return records.map((record) => ({
        lineCount: (record.HS as number) || 0,
        paragraphCount: (record.LG as number) || 0,
        nounCount: (record.MMS as number) || 0,
        intransitiveVerbCount: (record.DDS as number) || 0,
        transitiveVerbCount: (record.DJS as number) || 0,
        adjectiveCount: (record.XXS as number) || 0,
        interjectionCount: (record.TTS as number) || 0,
        specialWordCount: (record.SSS as number) || 0,
        structureCount: (record.JGS as number) || 0,
        poemNumber: (record.POEMNUM as number) || 0,
    }))
}

/**
 * 转换词汇文件
 */
function convertWords(records: Record<string, unknown>[]): WordRecord[] {
    return records.map((record) => ({
        word: (record.WORD as string) || '',
        vowel: (record.VOWEL as string) || '',
        class: (record.CLASS as string) || '',
        property: (record.PROPERTY as string) || '',
        liberty: (record.LIBERTY as string) || '',
        frequency: record.FREQUENCY as number | null,
    }))
}

/**
 * 转换句型结构文件
 */
function convertSentenceStructures(records: Record<string, unknown>[]): SentenceStructure[] {
    return records.map((record) => {
        const elements: string[] = []
        for (let i = 1; i <= 27; i++) {
            const elementKey = `J${i}`
            const element = (record[elementKey] as string) || ''
            elements.push(element)
        }

        return {
            internalNeed: (record.INTNEED as number) || 0,
            limitedRhyme: (record.LIMITED as string) || '',
            compoundStructureCount: (record.CS as number) || 0,
            punctuation: (record.PUNCT as string) || '',
            elements,
        }
    })
}

/**
 * 转换工作结构文件
 */
function convertWorkingStructures(records: Record<string, unknown>[]): WorkingStructure[] {
    return records.map((record) => {
        const elements: string[] = []
        for (let i = 1; i <= 30; i++) {
            const elementKey = `J${i}`
            const element = (record[elementKey] as string) || ''
            elements.push(element)
        }

        return {
            compoundStructureCount: (record.CS as number) || 0,
            punctuation: (record.PUNCT as string) || '',
            elements,
        }
    })
}

/**
 * 转换特殊词文件
 */
function convertSpecialWords(records: Record<string, unknown>[]): SpecialWord[] {
    return records.map((record) => ({
        content: (record.AA as string) || '',
        type: (record.TY as number) || 0,
    }))
}

/**
 * 转换诗句文件
 */
function convertPoemLines(records: Record<string, unknown>[]): PoemLine[] {
    return records.map((record) => ({
        content: (record.POEM as string) || '',
    }))
}

/**
 * 主转换函数
 */
async function main(): Promise<void> {
    const cpDir = join(process.cwd(), 'cp')
    const dataDir = join(process.cwd(), 'src', 'data')

    // 确保data目录存在
    if (!existsSync(dataDir)) {
        await import('node:fs/promises').then((fs) => fs.mkdir(dataDir, { recursive: true }))
    }

    console.log('开始转换DBF文件到JSON...')

    // 转换配置文件
    try {
        const configRecords = await convertDbfToJson(join(cpDir, 'cpcs.DBF'))
        const config = convertConfig(configRecords)
        writeFileSync(join(dataDir, 'config.json'), JSON.stringify(config, null, 2), 'utf8')
        console.log('✅ 配置文件转换完成: config.json')
    } catch (error) {
        console.error('❌ 配置文件转换失败:', error)
    }

    // 转换词汇文件
    const wordFiles = [
        { dbf: 'noun.DBF', json: 'nouns.json', name: '名词' },
        { dbf: 'adj.DBF', json: 'adjectives.json', name: '形容词' },
        { dbf: 'verbi.DBF', json: 'intransitive-verbs.json', name: '不及物动词' },
        { dbf: 'verbt.DBF', json: 'transitive-verbs.json', name: '及物动词' },
        { dbf: 'interj.DBF', json: 'interjections.json', name: '叹词' },
    ]

    for (const { dbf, json, name } of wordFiles) {
        try {
            const records = await convertDbfToJson(join(cpDir, dbf))
            const words = convertWords(records)
            writeFileSync(join(dataDir, json), JSON.stringify(words, null, 2), 'utf8')
            console.log(`✅ ${name}文件转换完成: ${json} (${words.length} 条记录)`)
        } catch (error) {
            console.error(`❌ ${name}文件转换失败:`, error)
        }
    }

    // 转换句型结构文件
    try {
        const structureRecords = await convertDbfToJson(join(cpDir, 'cpjg.DBF'))
        const structures = convertSentenceStructures(structureRecords)
        writeFileSync(join(dataDir, 'sentence-structures.json'), JSON.stringify(structures, null, 2), 'utf8')
        console.log(`✅ 句型结构文件转换完成: sentence-structures.json (${structures.length} 条记录)`)
    } catch (error) {
        console.error('❌ 句型结构文件转换失败:', error)
    }

    // 转换工作结构文件
    try {
        const workingRecords = await convertDbfToJson(join(cpDir, 'cpjgd.DBF'))
        const workingStructures = convertWorkingStructures(workingRecords)
        writeFileSync(join(dataDir, 'working-structures.json'), JSON.stringify(workingStructures, null, 2), 'utf8')
        console.log(`✅ 工作结构文件转换完成: working-structures.json (${workingStructures.length} 条记录)`)
    } catch (error) {
        console.error('❌ 工作结构文件转换失败:', error)
    }

    // 转换特殊词文件
    try {
        const specialRecords = await convertDbfToJson(join(cpDir, 'Cpss.DBF'))
        const specialWords = convertSpecialWords(specialRecords)
        writeFileSync(join(dataDir, 'special-words.json'), JSON.stringify(specialWords, null, 2), 'utf8')
        console.log(`✅ 特殊词文件转换完成: special-words.json (${specialWords.length} 条记录)`)
    } catch (error) {
        console.error('❌ 特殊词文件转换失败:', error)
    }

    // 转换诗句文件
    try {
        const poemRecords = await convertDbfToJson(join(cpDir, 'cp.DBF'))
        const poemLines = convertPoemLines(poemRecords)
        writeFileSync(join(dataDir, 'poem-lines.json'), JSON.stringify(poemLines, null, 2), 'utf8')
        console.log(`✅ 诗句文件转换完成: poem-lines.json (${poemLines.length} 条记录)`)
    } catch (error) {
        console.error('❌ 诗句文件转换失败:', error)
    }

    console.log('\n🎉 所有DBF文件转换完成！')
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error)
}

export {
    convertDbfToJson,
    convertConfig,
    convertWords,
    convertSentenceStructures,
    convertWorkingStructures,
    convertSpecialWords,
    convertPoemLines,
}
