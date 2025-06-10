import { PoetryEngine } from '@/services/poetry-engine'
import { WordSelector } from '@/services/word-selector'
import type { PoeticStyle, PoetryGenerationOptions, RhymeScheme } from '@/types'

interface CliOptions {
    style?: string
    paragraphs?: number
    lines?: number
    rhyme?: boolean
    rhymeScheme?: string
    title?: string
    output?: string
    interactive?: boolean
}

async function main(): Promise<void> {
    const engine = new PoetryEngine()

    // 显示版本信息
    console.log(engine.getVersionInfo())

    // 获取命令行参数
    const args = process.argv.slice(2)
    const options = parseArguments(args)

    if (options.interactive || args.length === 0) {
        await runInteractiveMode(engine)
    } else {
        await runCommandMode(engine, options)
    }
}

/**
 * 解析命令行参数
 */
function parseArguments(args: string[]): CliOptions {
    const options: CliOptions = {}

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]

        switch (arg) {
            case '--style':
            case '-s':
                options.style = args[++i]
                break
            case '--paragraphs':
            case '-p':
                options.paragraphs = Number.parseInt(args[++i])
                break
            case '--lines':
            case '-l':
                options.lines = Number.parseInt(args[++i])
                break
            case '--rhyme':
            case '-r':
                options.rhyme = true
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    options.rhymeScheme = args[++i]
                }
                break
            case '--title':
            case '-t':
                options.title = args[++i]
                break
            case '--output':
            case '-o':
                options.output = args[++i]
                break
            case '--interactive':
            case '-i':
                options.interactive = true
                break
            case '--help':
            case '-h':
                showHelp()
                process.exit(0)
                break
        }
    }

    return options
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
    console.log(`
计算机诗人火鸟 - 使用说明

用法: node src/index.js [选项]

选项:
  -s, --style <风格>        诗歌风格: quiet(宁静) 或 bold(奔放)，默认：bold
  -p, --paragraphs <数量>   段数，默认：1
  -l, --lines <数量>        每段行数，默认：4
  -r, --rhyme [韵脚]        启用押韵，可选择指定韵脚
  -t, --title <标题>        诗歌标题
  -o, --output <路径>       输出文件路径
  -i, --interactive         交互模式
  -h, --help               显示此帮助信息

韵脚选项:
  a, ai, an, ang, ao, e, ei, en, eng, er, i, ie, ong, ou, r, u, v

示例:
  node src/index.js -s quiet -p 2 -l 4 -r a -t "春日诗"
  node src/index.js --interactive
  node src/index.js -s bold -p 1 -l 6 -o ./poems/
`)
}

/**
 * 交互模式
 */
async function runInteractiveMode(engine: PoetryEngine): Promise<void> {
    const readline = await import('node:readline/promises')
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    try {
        let continuePoetry = true

        while (continuePoetry) {
            console.log('\n请输入以下内容，以使我的创作多少有点根据：')

            // 获取风格
            const styleInput = await rl.question('你要宁静的风格吗？（反之则是奔放的风格）[Y/N]: ')
            const style: PoeticStyle = styleInput.toUpperCase() === 'Y' ? 'quiet' : 'bold'

            // 获取段数
            const paragraphsInput = await rl.question('分多少段（请输入数字，输入1为不分段）？: ')
            const paragraphs = Number.parseInt(paragraphsInput) || 1

            // 获取行数
            let linesPrompt: string
            if (paragraphs === 1) {
                linesPrompt = '您让我作多少行的诗呢（请输入数字）？: '
            } else {
                linesPrompt = '每段多少行（请输入数字）？: '
            }
            const linesInput = await rl.question(linesPrompt)
            const lines = Number.parseInt(linesInput) || 4

            // 获取押韵选项
            const rhymeInput = await rl.question('需要押韵吗（最好不要，因为押韵后灵感会受到一定束缚）[Y/N]？: ')
            const useRhyme = rhymeInput.toUpperCase() === 'Y'

            let rhymeScheme: RhymeScheme | undefined
            if (useRhyme) {
                console.log('请输入韵脚(v代表ü, r代表知、吃、诗、日的韵母, z代表资、雌、思的韵母)')
                const rhymeInput = await rl.question(
                    '[选择以下之一：a, ai, an, ang, ao, e(o,uo), ei(ui), en(in,un,vn), eng(ing), er, i, ie(ve), ong, ou(iu), r(z), u, v]: '
                )
                rhymeScheme = WordSelector.normalizeRhymeScheme(rhymeInput)
            }

            // 生成选项
            const options: PoetryGenerationOptions = {
                style,
                paragraphCount: paragraphs,
                linesPerParagraph: lines,
                useRhyme,
                rhymeScheme,
            }

            console.log('\n正在生成诗歌，请稍候...')

            try {
                const poem = engine.generatePoetry(options)

                console.log('\n诗已全部写完了，请欣赏吧！')
                console.log('=====================================')

                for (const line of poem.lines) {
                    console.log(`  ${line}`)
                }

                console.log('=====================================')

                // 询问是否满意
                const satisfiedInput = await rl.question('\n满意吗？[Y/N]: ')
                if (satisfiedInput.toUpperCase() === 'Y') {
                    const title = await rl.question('请赐题：')

                    // 询问保存方式
                    const saveChoice = await rl.question('保存到文件吗？[Y/N]（N为仅显示内容）: ')

                    if (saveChoice.toUpperCase() === 'Y') {
                        // 保存到默认的poems目录
                        const { existsSync, mkdirSync } = await import('node:fs')
                        const poemsDir = './poems'

                        if (!existsSync(poemsDir)) {
                            mkdirSync(poemsDir, { recursive: true })
                        }

                        const filePath = await engine.savePoetry(poem, title, poemsDir)
                        console.log('好，我将它存起来，以供以后欣赏……')
                        console.log(`\n诗歌已保存到：${filePath}`)
                    } else {
                        const content = await engine.savePoetry(poem, title)
                        console.log('好，我将它记录下来，以供以后欣赏……')
                        console.log('\n保存的内容：')
                        console.log(content)
                    }
                } else {
                    console.log('唉，那我就把它扔到纸篓里了！')
                }
            } catch (error) {
                console.error('生成诗歌时出错：', error)
            }

            // 询问是否继续
            const continueInput = await rl.question('\n再作一首如何？没关系，不费劲儿的！[Y/N]: ')
            continuePoetry = continueInput.toUpperCase() === 'Y'
        }

        console.log('\n那么，我先歇歇喝口水啦！')
    } finally {
        rl.close()
    }
}

/**
 * 命令行模式
 */
async function runCommandMode(engine: PoetryEngine, options: CliOptions): Promise<void> {
    const style: PoeticStyle = options.style === 'quiet' ? 'quiet' : 'bold'
    const paragraphs = options.paragraphs || 1
    const lines = options.lines || 4
    const useRhyme = options.rhyme || false
    const rhymeScheme = options.rhymeScheme ? WordSelector.normalizeRhymeScheme(options.rhymeScheme) : undefined

    const generationOptions: PoetryGenerationOptions = {
        style,
        paragraphCount: paragraphs,
        linesPerParagraph: lines,
        useRhyme,
        rhymeScheme,
    }

    try {
        console.log('正在生成诗歌，请稍候...')
        const poem = engine.generatePoetry(generationOptions)

        console.log('\n生成的诗歌：')
        console.log('=====================================')

        for (const line of poem.lines) {
            console.log(`  ${line}`)
        }

        console.log('=====================================')

        // 如果指定了标题或输出路径，保存诗歌
        if (options.title || options.output) {
            const title = options.title || '无题'

            if (options.output) {
                // 确保输出目录存在
                const { existsSync, mkdirSync } = await import('node:fs')
                if (!existsSync(options.output)) {
                    mkdirSync(options.output, { recursive: true })
                }

                const filePath = await engine.savePoetry(poem, title, options.output)
                console.log(`\n诗歌已保存到：${filePath}`)
            } else {
                const content = await engine.savePoetry(poem, title)
                console.log('\n保存格式预览：')
                console.log(content)
            }
        }
    } catch (error) {
        console.error('生成诗歌时出错：', error)
        process.exit(1)
    }
}

// 如果直接运行此文件，执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error)
}
