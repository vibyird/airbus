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
