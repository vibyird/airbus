import { env } from 'cloudflare:workers'
import clash from '../assets/clash.yaml'

interface SubscriberRecord {
  token: string
  subscribe_name: string
  subscribe_url: string
  direct_domains: string
}

interface Subscriber {
  subscribeName: string
  subscribeUrl: string
  directDomains: string[]
}

export async function findSubscriber(token: string): Promise<Subscriber | null> {
  const subscriber = await env.DB.prepare('SELECT * FROM [subscribers] WHERE token = ?')
    .bind(token)
    .first<SubscriberRecord>()
  if (!subscriber) {
    return null
  }
  return {
    subscribeName: subscriber.subscribe_name,
    subscribeUrl: subscriber.subscribe_url,
    directDomains: subscriber.direct_domains
      .split(',')
      .map((domain) => domain.trim())
      .filter(Boolean),
  }
}

export async function getClashConfig({
  subscribeName,
  subscribeUrl,
  directDomains,
}: {
  subscribeName: string
  subscribeUrl: string
  directDomains: string[]
}): Promise<string> {
  const regex = /([^\r\n]*)\$\{directDomain\}([^\r\n]*)(\r?\n)/m
  const match = clash.match(regex)
  if (!match) {
    throw new Error('Direct domain placeholder not found in template')
  }
  const [line] = match

  return clash
    .replace(/\${subscribeName}/g, subscribeName)
    .replace(/\${subscribeUrl}/g, subscribeUrl)
    .replace(regex, directDomains.map((directDomain) => line.replace(regex, `$1${directDomain}$2$3`)).join(''))
}
