import { httpServerHandler } from 'cloudflare:node'
import App from 'koa'
import Router from 'koa-router'
import favicon from './assets/favicon.ico'
import index from './assets/index.html'
import subscribe from './routes/subscribe'

const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = index
})

router.get('/favicon.ico', async (ctx) => {
  ctx.set('Content-Type', 'image/x-icon')
  ctx.body = Buffer.from(favicon)
})

router.use('/subscribe', subscribe.routes())

router.use(async (ctx) => {
  ctx.status = 404
  ctx.body = 'Not Found'
})

const app = new App()

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000)
export default httpServerHandler({ port: 3000 })
