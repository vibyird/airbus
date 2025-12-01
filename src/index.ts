import { httpServerHandler } from 'cloudflare:node'
import App from 'koa'
import Router from 'koa-router'
import subscribe from './routes/subscribe'

const router = new Router()

router.use('/subscribe', subscribe.routes())

const app = new App()

app.use(router.routes()).use(router.allowedMethods())

app.use(async (ctx) => {
  if (ctx.status === 404) {
    ctx.set('Content-Type', 'text/plain; charset=utf-8')
    ctx.body = 'Not Found'
  }
  if (ctx.status === 500) {
    ctx.set('Content-Type', 'text/plain; charset=utf-8')
    ctx.body = 'Server Error'
  }
})

app.listen(3000)
export default httpServerHandler({ port: 3000 })
