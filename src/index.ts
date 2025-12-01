import { httpServerHandler } from 'cloudflare:node'
import express from 'express'
import favicon from './assets/favicon.ico'
import index from './assets/index.html'
import subscribe from './routes/subscribe'

const app = express()

app.get('/', async (req, res) => {
  res.send(index)
})

app.get('/favicon.ico', async (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon')
  res.send(Buffer.from(favicon))
})

app.use('/subscribe', subscribe)

app.use(async (req, res) => {
  res.status(404).send('Not Found')
})

app.listen(3000)
export default httpServerHandler({ port: 3000 })
