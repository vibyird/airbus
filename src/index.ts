import { httpServerHandler } from 'cloudflare:node'
import express from 'express'
import notFound from './assets/404.html'
import index from './assets/index.html'
import subscribe from './routes/subscribe.js'

const app = express()

const api = express.Router()

api.use('/subscribe', subscribe)

app.use('/api', api)

app.get('/', async (req, res) => {
  res.send(index)
})

app.use(async (req, res) => {
  res.status(404).send(notFound)
})

app.listen(3000)
export default httpServerHandler({ port: 3000 })
