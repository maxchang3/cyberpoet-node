# CyberPoet.js

<pre align="center">
　　听吧！
　　23 岁的计算机诗人火鸟将为您歌唱！
</pre>

使用 Node.js（TypeScript）重新实现刘慈欣的计算机诗人（电子诗人），基于诸葛恒的改编版。

> [!NOTE]
> 目前，本项目的大部分过程由 Github Copilot（Claude Sonnet 4）实现。主要为了探索一些可能性，因此可能一些实现或逻辑有所欠缺，欢迎 PR 改进。

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- pnpm (推荐) 或 npm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd cyberpoet-node

# 安装依赖
pnpm install
```

### 运行

#### 交互式模式

```bash
pnpm start
```

系统会依次询问：
- 风格选择（宁静 / 奔放）
- 段数设置
- 每段行数
- 是否押韵
- 韵脚选择（如果选择押韵）

#### 命令行模式

```bash
# 生成奔放风格，2 段，每段 3 行，押韵（ao 韵）
pnpm start --style bold --stanzas 2 --lines 3 --rhyme --rhyme-ending ao

# 生成宁静风格，1 段，每段 4 行，不押韵
pnpm start --style quiet --stanzas 1 --lines 4

# 查看帮助
pnpm start --help
```

### 命令行参数

| 参数             | 简写 | 描述                                    | 默认值  |
| ---------------- | ---- | --------------------------------------- | ------- |
| `--style`        | `-s` | 诗歌风格: `quiet`(宁静) 或 `bold`(奔放) | `bold`  |
| `--stanzas`      | `-n` | 段数 (1-10)                             | `1`     |
| `--lines`        | `-l` | 每段行数 (1-20)                         | `4`     |
| `--rhyme`        | `-r` | 是否押韵                                | `false` |
| `--rhyme-ending` | `-e` | 韵脚 (如: ao, an, ing)                  | -       |
| `--output`       | `-o` | 输出文件路径                            | -       |
| `--help`         | `-h` | 显示帮助信息                            | -       |

## 📖 示例输出

### 奔放风格示例

```
你专制得如此遇不年百
所以军医在祈求上帝
你把我碰撞吧！
```

### 宁静风格示例

```
她是我的哥特式大教堂！
你像鸟群一样炽热
我好想和烟民去潜游
我的西奈旷野，我的收音机，我的地下掩体啊！
```

## 🏗️ 项目结构

```
cyberpoet-node/
├── src/
│   ├── index.ts              # CLI 入口文件
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   ├── services/
│   │   ├── data-service.ts   # 数据访问层
│   │   ├── word-selector.ts  # 词汇选择服务
│   │   ├── structure-generator.ts # 句型结构生成器
│   │   └── poetry-engine.ts  # 诗歌生成引擎
│   └── data/                 # JSON 数据文件
│       ├── nouns.json        # 名词库 (5421 个)
│       ├── adjectives.json   # 形容词库 (1606 个)
│       ├── transitive-verbs.json # 及物动词库 (1424 个)
│       ├── intransitive-verbs.json # 不及物动词库 (875 个)
│       └── ...
├── scripts/
│   └── convert-dbf-to-json.ts # DBF 转 JSON 工具
├── tests/                    # 测试文件
├── cp/                       # 原始 Visual FoxPro 代码*
├── .source/                  # prompt、DBFFile 的 README、inspect 代码。
└── ...
```

<sup>* 来自 [wanghaoyucn/cyberpoet](https://github.com/wanghaoyucn/cyberpoet)</sup> 

## 🔧 开发

### DBF 数据转换

如果需要重新转换原始 DBF 文件：

```bash
pnpm convert-dbf
```
