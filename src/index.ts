import { httpServerHandler } from 'cloudflare:node'
import express from 'express'
import index from './assets/index.html'
import subscribe from './routes/subscribe'

const app = express()

app.use('/subscribe', subscribe)

app.get('/', async (req, res) => {
  res.send(index)
})

app.use(async (req, res) => {
  res.status(404).send('Not Found')
})

app.listen(3000)
export default httpServerHandler({ port: 3000 })
