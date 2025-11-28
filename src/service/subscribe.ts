import { env } from 'cloudflare:workers'
import clash from '../assets/clash.yaml'

type Subscriber = {
  token: string
  subscribe_name: string
  subscribe_url: string
  direct_domains: string
}

export async function rewriteClash(token: string): Promise<string> {
  const subscriber = await env.DB.prepare('SELECT * FROM [subscribers] WHERE token = ?').bind(token).first<Subscriber>()
  if (!subscriber) {
    throw new Error('Token is not valid')
  }
  const { subscribe_name: subscribeName, subscribe_url: subscribeUrl, direct_domains: directDomains } = subscriber

  const text = clash.replace(/\${subscribeName}/g, subscribeName).replace(/\${subscribeUrl}/g, subscribeUrl)

  const regex = /^([^\r\n,]+),\$\{directDomain\},([^\r\n,]+\r?\n)/m
  const match = text.match(regex)

  if (!match) {
    throw new Error('Direct domain placeholder not found in template')
  }

  const [, prefix, suffix] = match
  const replace = directDomains
    .split(',')
    .map((directDomain) => `${prefix},${directDomain},${suffix}`)
    .join('')

  const body = text.replace(regex, replace)
  return body
}
