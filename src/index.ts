import Router from '@koa/router'
import { httpServerHandler } from 'cloudflare:node'
import App from 'koa'
import subscribe from './routes/subscribe'

const router = new Router()

router.use('/subscribe', subscribe.routes(), subscribe.allowedMethods())

const app = new App()

app.use(router.routes()).use(router.allowedMethods())

app.use(async (ctx) => {
  ctx.throw(404)
})

app.listen(3000)

export default httpServerHandler({ port: 3000 })
