import pc from 'picocolors'
function validateEnv() {
  const requiredEnvVars = ['OPENAI_API_KEY', 'DEEPSEEK_API_KEY']
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missingEnvVars.length > 0) {
    console.error(pc.red('Error: Missing required environment variables:'))
    missingEnvVars.forEach(envVar => {
      console.error(pc.red(`- ${envVar}`))
    })
    console.log('\n请创建 .env 文件并设置以下环境变量：')
    console.log(pc.cyan('OPENAI_API_KEY=你的OpenAI密钥'))
    console.log(pc.cyan('DEEPSEEK_API_KEY=你的Deepseek密钥'))
    process.exit(1)
  }
}

export default validateEnv;
