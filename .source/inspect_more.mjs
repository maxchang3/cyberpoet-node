import { DBFFile } from 'dbffile'

async function inspectMoreDBF() {
    const files = ['cpcs.DBF', 'Cpss.DBF']

    for (const filename of files) {
        try {
            const dbf = await DBFFile.open(`./cp/${filename}`, { encoding: 'GB2312' })
            console.log(`\n=== ${filename} ===`)
            console.log(`Records: ${dbf.recordCount}`)
            console.log('Fields:', dbf.fields)

            // 读取所有记录看看数据格式
            const records = await dbf.readRecords()
            console.log('All records:', records)
        } catch (err) {
            console.log(`Error reading ${filename}:`, err.message)
        }
    }
}

await inspectMoreDBF()
