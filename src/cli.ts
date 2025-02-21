import type { Argv } from 'yargs'
import process from 'node:process'
import axios from 'axios'
import OpenAI from 'openai'
import ora from 'ora'
import pc from 'picocolors'
import restoreCursor from 'restore-cursor'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import validateKey from './validate'

validateKey()

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_KEY,
})

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

async function translateWithDeepseek(text: string, targetLang: string) {
  const response = await axios.post(DEEPSEEK_API_URL, {
    messages: [
      {
        role: 'system',
        content: `You are a translator. Translate the following text to ${targetLang}. Only return the translated text without any explanations.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  }, {
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  return response.data.choices[0].message.content
}

async function detectLanguage(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a language detector. Return only the language name in English. For example: \'English\', \'Chinese\', \'Japanese\', etc.',
        },
        {
          role: 'user',
          content: `Detect the language of this text: "${text}"`,
        },
      ],
    })
    return response.choices[0].message.content?.trim()
  }
  catch (error) {
    console.error(pc.red('Language detection failed, falling back to auto detection'))
    return 'auto'
  }
}

async function translate(text: string, targetLang: string) {
  const spinner = ora('Detecting language...').start()

  try {
    const sourceLanguage = await detectLanguage(text)
    spinner.text = `Translating from ${pc.cyan(sourceLanguage)} to ${pc.cyan(targetLang)}...`

    const result = await Promise.race([
      translateWithDeepseek(text, targetLang),
    ])

    spinner.succeed(pc.green('Translation completed!'))
    console.log(`\n${pc.cyan(`${sourceLanguage} → ${targetLang}:`)}`)
    console.log(result)
  }
  catch (error) {
    spinner.fail(pc.red('Translation failed!'))
    console.error(error)
    process.exit(1)
  }
}

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
        default: 'English',
      })
  }, async (argv) => {
    await translate(argv.text || '', argv.to)
  })
  .help()
  .alias('help', 'h')
  .argv

restoreCursor()
