import { resolve } from 'node:path'
import { exec } from 'tinyexec'
import { expect, it } from 'vitest'

it('translate cli should just work', async () => {
  const binPath = resolve(__dirname, '../bin/taze.mjs')

  const proc = await exec(process.execPath, [binPath], { throwOnError: true })

  expect(proc.stderr).toBe('')
})
