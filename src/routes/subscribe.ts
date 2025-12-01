import express, { Request, Response } from 'express'
import clashConfig from '../assets/clash.yaml'
import { findSubscriber } from '../service/subscribe'

const subscribe = express.Router()

subscribe.get('/:token', async (req: Request, res: Response) => {
  const token = req.params.token
  if (!token) {
    res.status(404).send('Not Found')
    return
  }

  try {
    const subscriber = await findSubscriber(token)
    if (!subscriber) {
      res.status(404).send('Not Found')
      return
    }
    const directDomains = []
    if (process.env.DIRECT_DOMAINS) {
      directDomains.push(
        ...process.env.DIRECT_DOMAINS.split(',')
          .map((domain) => domain.trim())
          .filter(Boolean),
      )
    }

    const { subscribeName, subscribeUrl } = subscriber
    directDomains.push(...subscriber.directDomains)

    const userAgent = req.headers['user-agent'] || ''
    if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
      res
        .status(200)
        .setHeaders(
          new Headers({
            'Content-Type': 'application/x-yaml; charset=utf-8',
            'Content-Disposition': `attachment; filename=${subscribeName}.yaml`,
          }),
        )
        .send(
          clashConfig
            .replace(/\${subscribeName}/g, subscribeName)
            .replace(/\${subscribeUrl}/g, subscribeUrl)
            .replace(
              /([^\r\n]*)\$\{directDomain\}([^\r\n]*)(\r?\n)/m,
              directDomains.map((directDomain) => `$1${directDomain}$2$3`).join(''),
            ),
        )
      return
    } else {
      res.status(404).send('Not Found')
      return
    }
  } catch (error) {
    res.status(500).send('Server Error')
  }
})

export default subscribe
