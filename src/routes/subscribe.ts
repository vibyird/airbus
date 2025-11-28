import express, { Request, Response } from 'express'
import { rewriteClash } from '../service/subscribe.js'

const subscribe = express.Router()

subscribe.get('', async (req: Request, res: Response) => {
  const token = req.query.token as string

  try {
    const userAgent = req.headers['user-agent'] || ''
    if (/clash/i.test(userAgent) || /stash/i.test(userAgent)) {
      const data = await rewriteClash(token)

      res
        .status(200)
        .setHeaders(
          new Headers({
            'Content-Type': 'application/x-yaml; charset=utf-8',
            'Content-Disposition': 'attachment; filename=airbus.yaml',
          }),
        )
        .send(data)

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
