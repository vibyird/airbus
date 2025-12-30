import { env } from 'cloudflare:workers'

interface ProviderRecord {
  token: string
  name: string
  subscribe_uri: string
  direct_domains: string
}

interface Provider {
  name: string
  realName: string
  token: string
  subscribeUrl: string
  directDomains: string[]
}

export async function findProvider(token: string): Promise<Provider | null> {
  let provider = await env.DB.prepare('SELECT * FROM [providers] WHERE token = ?').bind(token).first<ProviderRecord>()
  if (!provider) {
    return null
  }
  const name = provider.name
  while (/^urn:airbus:/.test(provider.subscribe_uri)) {
    token = provider.subscribe_uri.replace(/^urn:airbus:/, '')
    provider = await env.DB.prepare('SELECT * FROM [providers] WHERE token = ?').bind(token).first<ProviderRecord>()
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
  }
}
