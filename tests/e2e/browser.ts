import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { delimiter, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const distDir = join(repoRoot, 'apps/docs/.vitepress/dist')

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export type KeyName =
  'Tab' | 'Enter' | 'Space' | 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' | 'Escape'

type KeyDescriptor = {
  key: string
  code: string
  windowsVirtualKeyCode: number
  text?: string
}

const KEY_DESCRIPTORS: Record<KeyName, KeyDescriptor> = {
  Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
  Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
  Space: { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' },
  ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 },
  Home: { key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 },
  End: { key: 'End', code: 'End', windowsVirtualKeyCode: 35 },
  Escape: { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
}

export type WaitOptions = {
  timeoutMs?: number
  intervalMs?: number
  message?: string
}

type CdpResponse = {
  id?: number
  method?: string
  params?: Record<string, unknown>
  result?: Record<string, unknown>
  error?: { message?: string }
}

type PendingCommand = {
  resolve: (result: Record<string, unknown>) => void
  reject: (error: Error) => void
}

function isInsideDir(parent: string, child: string): boolean {
  const rel = relative(resolve(parent), resolve(child))
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

function findChromeBinary(): string {
  const candidates = [
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ].filter((entry): entry is string => Boolean(entry))

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  const pathDirs = (process.env.PATH ?? '').split(delimiter).filter(Boolean)
  for (const dir of pathDirs) {
    for (const binary of [
      'google-chrome',
      'google-chrome-stable',
      'chromium',
      'chromium-browser',
    ]) {
      const fullPath = join(dir, binary)
      if (existsSync(fullPath)) return fullPath
    }
  }

  throw new Error(
    'Unable to locate Chrome or Chromium binary; set CHROME_BIN to a valid executable path.',
  )
}

function ensureDocsDistBuilt(): void {
  if (existsSync(join(distDir, 'index.html'))) return
  execFileSync('pnpm', ['docs:build'], { cwd: repoRoot, stdio: 'inherit' })
}

function resolveStaticFile(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname)
  const relativePath = decoded.replace(/^\/+/, '')
  const candidates =
    relativePath === ''
      ? [join(distDir, 'index.html')]
      : [
          join(distDir, relativePath),
          join(distDir, `${relativePath}.html`),
          join(distDir, relativePath, 'index.html'),
        ]

  for (const candidate of candidates) {
    if (!isInsideDir(distDir, candidate)) continue
    if (!existsSync(candidate)) continue
    if (statSync(candidate).isFile()) return candidate
  }
  return null
}

function startStaticServer(): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer((req, res) => {
      const urlPath = (req.url ?? '/').split('?')[0]
      const filePath = resolveStaticFile(urlPath)
      if (!filePath) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end(`Not found: ${urlPath}`)
        return
      }
      const ext = extname(filePath)
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
      })
      res.end(readFileSync(filePath))
    })

    server.on('error', rejectPromise)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        rejectPromise(new Error('Failed to bind local static server port'))
        return
      }
      resolvePromise({ server, baseUrl: `http://127.0.0.1:${address.port}` })
    })
  })
}

function waitForDevToolsWs(chrome: ChildProcess, timeoutMs = 15_000): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    let stderr = ''
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      rejectPromise(new Error(`Timed out waiting for Chrome DevTools URL. stderr:\n${stderr}`))
    }, timeoutMs)

    const onData = (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
      const match = /DevTools listening on (ws:\/\/[^\s]+)/.exec(stderr)
      if (match && !settled) {
        settled = true
        clearTimeout(timer)
        chrome.stderr?.off('data', onData)
        resolvePromise(match[1])
      }
    }

    chrome.stderr?.on('data', onData)
    chrome.once('exit', (code, signal) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      rejectPromise(
        new Error(
          `Chrome exited prematurely (code=${String(code)}, signal=${String(signal)}). stderr:\n${stderr}`,
        ),
      )
    })
  })
}

function formatRemoteObject(obj: Record<string, unknown>): string {
  if (typeof obj.description === 'string') return obj.description
  if ('value' in obj) return String(obj.value)
  return JSON.stringify(obj)
}

export class BrowserSession {
  readonly baseUrl: string
  readonly errors: string[] = []

  private readonly server: Server
  private readonly chrome: ChildProcess
  private readonly ws: WebSocket
  private readonly tempRoot: string
  private nextCommandId = 1
  private readonly pending = new Map<number, PendingCommand>()
  private loadWaiters: Array<() => void> = []

  private constructor(
    baseUrl: string,
    server: Server,
    chrome: ChildProcess,
    ws: WebSocket,
    tempRoot: string,
  ) {
    this.baseUrl = baseUrl
    this.server = server
    this.chrome = chrome
    this.ws = ws
    this.tempRoot = tempRoot

    this.ws.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data)) as CdpResponse
      if (typeof payload.id === 'number') {
        const entry = this.pending.get(payload.id)
        if (!entry) return
        this.pending.delete(payload.id)
        if (payload.error) {
          entry.reject(new Error(payload.error.message ?? 'Unknown CDP error'))
        } else {
          entry.resolve(payload.result ?? {})
        }
        return
      }

      if (payload.method === 'Page.loadEventFired') {
        const waiters = this.loadWaiters
        this.loadWaiters = []
        for (const notify of waiters) notify()
      } else if (payload.method === 'Runtime.exceptionThrown') {
        const details = payload.params?.exceptionDetails as
          { text?: string; exception?: Record<string, unknown> } | undefined
        const detailText = details?.exception
          ? formatRemoteObject(details.exception)
          : (details?.text ?? 'Uncaught page exception')
        this.errors.push(`Page exception: ${detailText}`)
      } else if (payload.method === 'Runtime.consoleAPICalled') {
        const type = payload.params?.type
        if (type === 'error') {
          const args = (payload.params?.args as Array<Record<string, unknown>> | undefined) ?? []
          const rendered = args.map(formatRemoteObject).join(' ')
          this.errors.push(`Console error: ${rendered}`)
        }
      }
    })
  }

  static async launch(): Promise<BrowserSession> {
    ensureDocsDistBuilt()
    const chromeBinary = findChromeBinary()
    const { server, baseUrl } = await startStaticServer()

    const tempRoot = mkdtempSync(join(tmpdir(), 'p0seid0n-e2e-'))
    const profileDir = join(tempRoot, 'profile')

    const chrome = spawn(
      chromeBinary,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-crash-reporter',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
        '--blink-settings=primaryPointerType=4,availablePointerTypes=4,primaryHoverType=2,availableHoverTypes=2',
        '--window-size=1280,900',
        `--user-data-dir=${profileDir}`,
        '--remote-debugging-port=0',
        'about:blank',
      ],
      {
        env: {
          ...process.env,
          HOME: tempRoot,
          XDG_CONFIG_HOME: join(tempRoot, 'config'),
          XDG_CACHE_HOME: join(tempRoot, 'cache'),
        },
        stdio: ['ignore', 'ignore', 'pipe'],
      },
    )

    try {
      const browserWsUrl = await waitForDevToolsWs(chrome)
      const listUrl = browserWsUrl
        .replace(/^ws:\/\//, 'http://')
        .replace(/\/devtools.*$/, '/json/list')
      const targets = (await fetch(listUrl).then((r) => r.json())) as Array<{
        type: string
        webSocketDebuggerUrl: string
      }>
      const pageTarget = targets.find((target) => target.type === 'page')
      if (!pageTarget) {
        throw new Error('Chrome did not expose a page DevTools target')
      }

      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
      await new Promise<void>((resolveOpen, rejectOpen) => {
        ws.addEventListener('open', () => resolveOpen(), { once: true })
        ws.addEventListener(
          'error',
          () => rejectOpen(new Error('Failed to open DevTools WebSocket')),
          {
            once: true,
          },
        )
      })

      const session = new BrowserSession(baseUrl, server, chrome, ws, tempRoot)
      await session.send('Page.enable')
      await session.send('Runtime.enable')
      await session.send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      })
      return session
    } catch (error) {
      chrome.kill('SIGKILL')
      server.close()
      rmSync(tempRoot, { recursive: true, force: true })
      throw error
    }
  }

  clearErrors(): void {
    this.errors.length = 0
  }

  async goto(pathname: string): Promise<void> {
    this.clearErrors()
    const targetUrl = new URL(pathname, this.baseUrl).toString()
    const loaded = new Promise<void>((resolveLoad) => {
      this.loadWaiters.push(resolveLoad)
    })

    await this.send('Page.navigate', { url: targetUrl })
    await loaded

    await this.waitFor(
      () => {
        const app = document.querySelector('#app') as (Element & { __vue_app__?: unknown }) | null
        return document.readyState === 'complete' && Boolean(app?.__vue_app__)
      },
      [],
      { timeoutMs: 10_000, message: `Timed out waiting for VitePress hydration at ${pathname}` },
    )
    await this.nextFrame()
  }

  async nextFrame(): Promise<void> {
    await this.evalExpression(
      'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
      true,
    )
  }

  async evaluate<T, A extends unknown[] = []>(fn: (...args: A) => T, ...args: A): Promise<T> {
    const serializedArgs = args.map((arg) => JSON.stringify(arg)).join(', ')
    const expression = `(${fn.toString()})(${serializedArgs})`
    return this.evalExpression<T>(expression)
  }

  async waitFor<T, A extends unknown[] = []>(
    fn: (...args: A) => T | false | null | undefined,
    args: A = [] as unknown as A,
    options: WaitOptions = {},
  ): Promise<Exclude<T, false | null | undefined>> {
    const timeoutMs = options.timeoutMs ?? 5000
    const intervalMs = options.intervalMs ?? 25
    const deadline = Date.now() + timeoutMs
    let lastValue: unknown

    while (Date.now() <= deadline) {
      lastValue = await this.evaluate(fn, ...args)
      if (lastValue !== false && lastValue !== null && lastValue !== undefined) {
        return lastValue as Exclude<T, false | null | undefined>
      }
      await new Promise((resolveSleep) => setTimeout(resolveSleep, intervalMs))
    }

    throw new Error(
      options.message ??
        `waitFor timed out after ${timeoutMs}ms (last value: ${JSON.stringify(lastValue)})`,
    )
  }

  async hover(selector: string, index = 0): Promise<void> {
    const point = await this.scrollAndGetCenter(selector, index)
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: point.x,
      y: point.y,
    })
    await this.nextFrame()
  }

  async click(selector: string, index = 0): Promise<void> {
    const point = await this.scrollAndGetCenter(selector, index)
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: point.x,
      y: point.y,
    })
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: point.x,
      y: point.y,
      button: 'left',
      clickCount: 1,
    })
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: point.x,
      y: point.y,
      button: 'left',
      clickCount: 1,
    })
    await this.nextFrame()
  }

  async pressKey(key: KeyName): Promise<void> {
    const descriptor = KEY_DESCRIPTORS[key]
    await this.send('Input.dispatchKeyEvent', {
      type: descriptor.text ? 'keyDown' : 'rawKeyDown',
      key: descriptor.key,
      code: descriptor.code,
      windowsVirtualKeyCode: descriptor.windowsVirtualKeyCode,
      text: descriptor.text,
      unmodifiedText: descriptor.text,
    })
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: descriptor.key,
      code: descriptor.code,
      windowsVirtualKeyCode: descriptor.windowsVirtualKeyCode,
    })
    await this.nextFrame()
  }

  async setReducedMotion(reduced: boolean): Promise<void> {
    await this.send('Emulation.setEmulatedMedia', {
      features: [
        {
          name: 'prefers-reduced-motion',
          value: reduced ? 'reduce' : 'no-preference',
        },
      ],
    })
    await this.nextFrame()
  }

  async close(): Promise<void> {
    for (const entry of this.pending.values()) {
      entry.reject(new Error('BrowserSession closed'))
    }
    this.pending.clear()

    try {
      this.ws.close()
    } catch {
      // WebSocket may already be closed.
    }

    if (this.chrome.exitCode === null) {
      await new Promise<void>((resolveExit) => {
        const timer = setTimeout(() => {
          this.chrome.kill('SIGKILL')
          resolveExit()
        }, 2000)
        this.chrome.once('exit', () => {
          clearTimeout(timer)
          resolveExit()
        })
        this.chrome.kill('SIGTERM')
      })
    }

    await new Promise<void>((resolveClose) => {
      this.server.close(() => resolveClose())
    })
    rmSync(this.tempRoot, { recursive: true, force: true })
  }

  private async scrollAndGetCenter(
    selector: string,
    index: number,
  ): Promise<{ x: number; y: number }> {
    const point = await this.evaluate(
      (sel: string, idx: number) => {
        const matches = document.querySelectorAll(sel)
        const target = matches.item(idx) as HTMLElement | null
        if (!target) return null
        target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
        const rect = target.getBoundingClientRect()
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        }
      },
      selector,
      index,
    )

    if (!point || point.width <= 0 || point.height <= 0) {
      throw new Error(`Element not visible or missing for selector "${selector}" (index ${index})`)
    }
    return { x: point.x, y: point.y }
  }

  private async evalExpression<T>(expression: string, awaitPromise = false): Promise<T> {
    const response = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise,
    })

    if (response.exceptionDetails) {
      const details = response.exceptionDetails as {
        text?: string
        exception?: Record<string, unknown>
      }
      const message = details.exception
        ? formatRemoteObject(details.exception)
        : (details.text ?? 'Evaluation error')
      throw new Error(`Browser evaluation failed: ${message}`)
    }

    const resultObj = response.result as { value?: T } | undefined
    return resultObj?.value as T
  }

  private send(
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const id = this.nextCommandId++
    return new Promise((resolvePromise, rejectPromise) => {
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}
