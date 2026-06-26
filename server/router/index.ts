import Router from '@koa/router'
import subscribe from './routes/subscribe'

const router = new Router({ prefix: '/api' })

router.get('/', (ctx) => {
  ctx.body = { name: 'Airbus', version: '1.0.0' }
  return
})

router.use('/subscribe', subscribe.routes(), subscribe.allowedMethods())

export default router
