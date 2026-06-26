import App from 'koa'
import router from './router/index'
import { httpServerHandler } from 'cloudflare:node'

const app = new App()

app.use(router.routes()).use(router.allowedMethods())

app.use(async (ctx) => {
  ctx.throw(404)
})

app.listen(3000)

export default httpServerHandler({ port: 3000 })
