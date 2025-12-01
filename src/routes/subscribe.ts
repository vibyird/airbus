import express, { Request, Response } from 'express'
import { findSubscriber, getClashConfig } from '../service/subscribe'

const subscribe = express.Router()

subscribe.get('/:token', async (req: Request, res: Response) => {
  const token = req.params.token
  if (!token) {
    res.status(400).send('Bad Request')
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
    const userAgent = req.headers['user-agent'] || ''
    if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
      directDomains.push(...subscriber.directDomains)
      const config = await getClashConfig({
        ...subscriber,
        directDomains,
      })
      res
        .status(200)
        .setHeaders(
          new Headers({
            'Content-Type': 'application/x-yaml; charset=utf-8',
            'Content-Disposition': `attachment; filename=${subscriber.subscribeName}.yaml`,
          }),
        )
        .send(config)
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
