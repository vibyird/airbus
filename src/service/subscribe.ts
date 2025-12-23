import { env } from 'cloudflare:workers'

interface SubscriberRecord {
  token: string
  subscribe_name: string
  subscribe_url: string
  direct_domains: string
}

interface Config {
  name: string
  subscribeName: string
  subscribeUrl: string
  directDomains: string[]
}

export async function findConfig(token: string): Promise<Config | null> {
  let subscriber = await env.DB.prepare('SELECT * FROM [subscribers] WHERE token = ?')
    .bind(token)
    .first<SubscriberRecord>()
  if (!subscriber) {
    return null
  }
  const name = subscriber.subscribe_name
  while (/^urn:airbus:/.test(subscriber.subscribe_url)) {
    token = subscriber.subscribe_url.replace(/^urn:airbus:/, '')
    subscriber = await env.DB.prepare('SELECT * FROM [subscribers] WHERE token = ?')
      .bind(token)
      .first<SubscriberRecord>()
    if (!subscriber) {
      return null
    }
  }
  return {
    name,
    subscribeName: subscriber.subscribe_name,
    subscribeUrl: subscriber.subscribe_url,
    directDomains: subscriber.direct_domains
      .split(',')
      .map((domain) => domain.trim())
      .filter(Boolean),
  }
}
