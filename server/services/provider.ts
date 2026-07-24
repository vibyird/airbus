import clashConfig from '@server/assets/clash.yaml'
import { HTTPError } from '@server/utils/utils'
import { env } from 'cloudflare:workers'
import yaml from 'js-yaml'

interface ClashConfig {
  proxies: {
    name: string
  }[]
}

interface ProviderRecord {
  token: string
  name: string
  subscribe_uri: string
  direct_domains: string
  exclude_regex: string
}

interface Provider {
  name: string
  realName: string
  token: string
  subscribeUrl: string
  directDomains: string[]
  excludeRegex: RegExp | null
}

export async function getClashConfig(
  token: string,
  baseUrl: string,
): Promise<{ headers: Headers; body: string } | null> {
  let provider = await findProvider(token)
  if (!provider) {
    return null
  }

  const { name: fileName, realName: subscribeName, token: providerToken, subscribeUrl } = provider

  if (!fileName || !subscribeName || !providerToken || !subscribeUrl) {
    return null
  }

  const directDomains = []
  if (process.env.DIRECT_DOMAINS) {
    directDomains.push(
      ...process.env.DIRECT_DOMAINS.split(',')
        .map((domain) => domain.trim())
        .filter(Boolean),
    )
  }
  directDomains.push(...provider.directDomains)

  const headers = new Headers()
  headers.set('Content-Disposition', `attachment; filename=${fileName}.yaml`)
  headers.set('Content-Type', 'application/x-yaml; charset=UTF-8')

  const body = clashConfig
    .replace(/\${subscribeName}/g, subscribeName)
    .replace(
      /\${subscribeUrl}/g,
      /^proxy\+/.test(subscribeUrl) ? `${baseUrl}/api/provider/proxy/${providerToken}` : subscribeUrl,
    )
    .replace(/\${assetsBaseUrl}/g, process.env.ASSETS_BASE_URL || baseUrl)
    .replace(
      /([^\r\n]*)\$\{directDomain\}([^\r\n]*)(\r?\n)/m,
      directDomains.map((directDomain) => `$1${directDomain}$2$3`).join(''),
    )

  return {
    headers,
    body,
  }
}
export async function getClashProxyConfig(
  token: string,
  userAgent: string,
): Promise<{ headers: Headers; body: string } | null> {
  let provider = await findProvider(token)
  if (!provider) {
    return null
  }

  const { subscribeUrl, excludeRegex } = provider

  if (!subscribeUrl) {
    return null
  }

  const res = await fetch(/^proxy\+/.test(subscribeUrl) ? subscribeUrl.replace(/^proxy\+/, '') : subscribeUrl, {
    headers: {
      'User-Agent': userAgent,
    },
  })

  if (!res.ok) {
    throw new HTTPError(res.status, res.statusText)
  }

  const text = await res.text()
  const config = yaml.load(text) as ClashConfig
  const proxies = config.proxies
    .filter((proxy) => (excludeRegex ? !excludeRegex.test(proxy.name) : true))
    .map((proxy) => {
      proxy.name = proxy.name.replace('🇹🇼', '🇨🇳')
      return proxy
    })

  const headers = new Headers()
  for (const [k, v] of res.headers.entries()) {
    if (['profile-update-interval', 'profile-web-page-url', 'subscription-userinfo'].includes(k)) {
      headers.set(k, v)
    }
  }
  headers.set('Content-Type', 'application/x-yaml; charset=UTF-8')

  const body = yaml.dump({
    proxies,
  })

  return {
    headers,
    body,
  }
}

export async function getShadowrocketProxyConfig(
  token: string,
  userAgent: string,
): Promise<{ headers: Headers; body: string } | null> {
  let provider = await findProvider(token)
  if (!provider) {
    return null
  }

  const { subscribeUrl, excludeRegex } = provider

  if (!subscribeUrl) {
    return null
  }

  const res = await fetch(/^proxy\+/.test(subscribeUrl) ? subscribeUrl.replace(/^proxy\+/, '') : subscribeUrl, {
    headers: {
      'User-Agent': userAgent,
    },
  })

  if (!res.ok) {
    throw new HTTPError(res.status, res.statusText)
  }

  const text = await res.text()
  const lines = Buffer.from(text, 'base64')
    .toString('utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const config = []
  const status = lines.filter((line) => /^STATUS=/i.test(line)).shift()
  if (status) {
    config.push(status)
  }

  const proxies = lines
    .filter((line) => !/^STATUS=/i.test(line))
    .filter((proxy) => {
      if (!excludeRegex) {
        return true
      }
      const [, name] = proxy.split('#')
      if (!name) {
        return true
      }
      const realName = decodeURIComponent(name)
      return !excludeRegex.test(realName)
    })
    .map((proxy) => {
      const [url, name] = proxy.split('#')
      const realName = decodeURIComponent(name)
      return `${url}#${encodeURIComponent(realName.replace('🇹🇼', '🇨🇳'))}`
    })

  if (proxies.length > 0) {
    config.push(...proxies)
  }

  const headers = new Headers()
  headers.set('Content-Type', 'text/plain; charset=UTF-8')

  const body = Buffer.from(config.join('\n'), 'utf8').toString('base64')

  return {
    headers,
    body,
  }
}

export async function findProvider(token: string): Promise<Provider | null> {
  const session = env.DB.withSession()
  let provider = await session.prepare('SELECT * FROM [providers] WHERE token = ?').bind(token).first<ProviderRecord>()
  if (!provider) {
    return null
  }
  const name = provider.name
  while (/^urn:airbus:/.test(provider.subscribe_uri)) {
    token = provider.subscribe_uri.replace(/^urn:airbus:/, '')
    provider = await session.prepare('SELECT * FROM [providers] WHERE token = ?').bind(token).first<ProviderRecord>()
    if (!provider) {
      return null
    }
  }
  return {
    name,
    realName: provider.name,
    token: provider.token,
    subscribeUrl: provider.subscribe_uri,
    directDomains: provider.direct_domains
      .split(',')
      .map((domain) => domain.trim())
      .filter(Boolean),
    excludeRegex: provider.exclude_regex ? new RegExp(provider.exclude_regex) : null,
  }
}
