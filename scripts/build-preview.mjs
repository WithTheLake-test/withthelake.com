import { spawnSync } from 'node:child_process'
import { cp, mkdtemp, rename, rm, stat, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const preview = resolve(project,'preview')
const deps = join(project,'node_modules')
try { await stat(join(deps,'next','dist','bin','next')) } catch { throw Error('먼저 프로젝트에서 npm ci를 실행해 주세요.') }

const scratch = await mkdtemp(join(tmpdir(),'withthelake-export-'))
// Stage in the destination filesystem before replacing the previous build.
const stage = await mkdtemp(join(project,'.preview-stage-'))
const backup = join(stage,'previous')
let preserveBackup = false
try {
  for (const path of ['src','content','public','package.json','tsconfig.json','next.config.ts','postcss.config.mjs']) {
    await cp(join(project,path),join(scratch,path),{
      recursive:true,
      filter: filename => !['admin','api','uploads'].some(name => filename === join(project,'src','app',name))
    })
  }
  await symlink(deps,join(scratch,'node_modules'),'dir')
  const cmd = spawnSync(process.execPath,[join(deps,'next','dist','bin','next'),'build','--webpack'], {
    cwd:scratch, stdio:'inherit', env:{...process.env,NEXT_PUBLIC_PREVIEW_ONLY:'true',NEXT_TELEMETRY_DISABLED:'1'}
  })
  if (cmd.error) throw cmd.error
  if (cmd.status !== 0) throw Error('정적 미리보기 빌드 실패')
  await cp(join(scratch,'out'),join(stage,'built'),{recursive:true})
  try { await rename(preview,backup) } catch(error) { if (error.code !== 'ENOENT') throw error }
  try { await rename(join(stage,'built'),preview) } catch(error) {
    try { await rename(backup,preview) } catch (restore) {
      if (restore.code !== 'ENOENT') {
        preserveBackup = true
        throw new AggregateError([error, restore],'이전 미리보기 위치: '+backup)
      }
    }
    throw error
  }
  console.log('미리보기를 만들었습니다. '+basename(preview)+'/index.html')
} finally {
  await rm(scratch,{recursive:true,force:true})
  if (!preserveBackup) await rm(stage,{recursive:true,force:true})
}
