import type { Argv } from 'yargs'
import process from 'node:process'
import OpenAI from 'openai'
import restoreCursor from 'restore-cursor'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import validateKey from './validate'
import { resolveConfig } from './config.ts'
import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'

// 配置文件路径
const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '', '.translate.config.json')
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 检查并获取配置
async function getOrCreateConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: '请输入您的 DeepSeek API Key:',
        validate: (input) => input.length > 0 || '请输入有效的 API Key',
      },
      {
        type: 'input',
        name: 'defaultTargetLang',
        message: '请输入默认的目标翻译语言:',
        default: 'cn(中文)',
      },
    ])

    const config = {
      apiKey: answers.apiKey,
      defaultTargetLang: answers.defaultTargetLang,
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
    return config
  }

  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}

// 初始化配置
const config = await getOrCreateConfig()

const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: DEEPSEEK_API_URL,
})


// 设置命令行参数
yargs(hideBin(process.argv))
  .command('translate <text>', 'Translate text to target language', (yargs: Argv) => {
    return yargs
      .positional('text', {
        describe: 'Text to translate',
        type: 'string',
      })
      .option('to', {
        alias: 't',
        describe: 'Target language',
        type: 'string',
        default: config.defaultTargetLang,
      })
  }, async (argv) => {
    let exitCode
    exitCode = await resolveConfig(argv)

    process.exit(exitCode)
  })
  .help()
  .alias('help', 'h')
  .argv

restoreCursor()
