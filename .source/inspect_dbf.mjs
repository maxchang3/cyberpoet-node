import { DBFFile } from 'dbffile'

async function inspectDBF(filename) {
    try {
        // 尝试不同的编码
        const encodings = ['GB2312', 'GBK', 'GB18030', 'UTF-8', 'ISO-8859-1']
        let dbf
        let workingEncoding = 'ISO-8859-1'

        for (const encoding of encodings) {
            try {
                dbf = await DBFFile.open(`./cp/${filename}`, { encoding })
                workingEncoding = encoding
                break
            } catch (err) {
                // 尝试下一个编码
            }
        }

        if (!dbf) {
            dbf = await DBFFile.open(`./cp/${filename}`)
        }

        console.log(`\n=== ${filename} (encoding: ${workingEncoding}) ===`)
        console.log(`Records: ${dbf.recordCount}`)
        console.log('Fields:', dbf.fields)

        // 读取前几条记录看看数据格式
        const records = await dbf.readRecords(3)
        console.log('Sample records:', records)
    } catch (err) {
        console.log(`Error reading ${filename}:`, err.message)
    }
}

// 检查主要的DBF文件
const files = ['cp.DBF', 'cpjg.DBF', 'cpjgd.DBF', 'noun.DBF', 'adj.DBF', 'verbi.DBF', 'verbt.DBF', 'interj.DBF']
for (const file of files) {
    await inspectDBF(file)
}
