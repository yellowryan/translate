#!/usr/bin/env node

export * from './cli'

// 如果需要直接运行命令行工具，添加以下代码
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./cli')
}
