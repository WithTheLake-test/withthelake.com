import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const base = dirname(fileURLToPath(import.meta.url))
const types = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.svg':'image/svg+xml',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp',
  '.gif':'image/gif', '.avif':'image/avif', '.ico':'image/x-icon', '.woff2':'font/woff2',
  '.woff':'font/woff', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.m4a':'audio/mp4', '.ogg':'audio/ogg',
  '.mp4':'video/mp4', '.webm':'video/webm', '.xml':'application/xml'
}

async function findFile(roots, pathname) {
  const candidates = extname(pathname) ? [pathname] : [pathname + '/index.html', pathname + '.html', pathname]
  for (const root of roots) {
    for (const relative of candidates) {
      const path = resolve(root, '.' + relative)
      if (!path.startsWith(root + sep)) continue
      try {
        const actual = await realpath(path)
        if (!actual.startsWith(root + sep)) continue
        const info = await stat(actual)
        if (info.isFile()) return {path: actual, size: info.size}
      } catch (error) {
        if (!['ENOENT','ENOTDIR'].includes(error.code)) throw error
      }
    }
  }
}

export function previewServer(roots) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost')
      if (url.pathname === '/api/contact') {
        response.writeHead(503, {'Content-Type': types['.json']})
        return response.end(JSON.stringify({ok:false,error:'로컬 미리보기에서는 문의를 전송할 수 없습니다.'}))
      }
      if (!['GET','HEAD'].includes(request.method)) {
        response.writeHead(405, {Allow:'GET, HEAD'})
        return response.end()
      }
      let pathname = decodeURIComponent(url.pathname)
      if (pathname === '/_next/image') {
        pathname = url.searchParams.get('url') || ''
        if (!/^\/(assets|uploads)\//.test(pathname)) {
          response.writeHead(404)
          return response.end()
        }
      }
      const file = await findFile(roots, pathname.replace(/\/$/, '') || '/')
      if (!file) {
        response.writeHead(404, {'Content-Type':types['.txt']})
        return response.end('페이지 또는 파일을 찾을 수 없습니다.')
      }
      const headers = {'Content-Type': types[extname(file.path).toLowerCase()] || 'application/octet-stream',
        'Content-Length':file.size, 'X-Content-Type-Options':'nosniff', 'Accept-Ranges':'bytes'}
      let start = 0, end = file.size - 1, status = 200
      if (request.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range)
        if (!range || (!range[1] && !range[2])) {
          response.writeHead(416, {'Content-Range':'bytes */'+file.size})
          return response.end()
        }
        start = range[1] ? Number(range[1]) : Math.max(0,file.size-Number(range[2]))
        end = range[1] && range[2] ? Math.min(Number(range[2]),end) : end
        if (start > end || start < 0 || start >= file.size) {
          response.writeHead(416, {'Content-Range':'bytes */'+file.size})
          return response.end()
        }
        headers['Content-Range'] = `bytes ${start}-${end}/${file.size}`
        headers['Content-Length'] = end-start+1
        status = 206
      }
      response.writeHead(status, headers)
      if (request.method === 'HEAD' || file.size === 0) return response.end()
      const stream = createReadStream(file.path, {start,end})
      stream.on('error', () => response.destroy())
      response.on('close', () => stream.destroy())
      stream.pipe(response)
    } catch (error) {
      if (response.headersSent) return response.destroy()
      response.writeHead(error instanceof URIError ? 400 : 500)
      response.end()
    }
  })
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const roots = []
  for (const directory of [resolve(base,'preview'), resolve(base,'public')]) {
    try { roots.push(await realpath(directory)) } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  if (!await findFile(roots, '/')) throw Error('preview/index.html 파일을 찾을 수 없습니다.')
  const server = previewServer(roots)
  const port = Number(process.env.PORT || 4173)
  server.listen(port,'127.0.0.1',() => console.log(`http://127.0.0.1:${server.address().port}/`))
  server.on('error', error => {console.error(error.message); process.exitCode = 1})
}
