import Router from '@koa/router'
import provider from './routes/provider'
import subscribe from './routes/subscribe'

const router = new Router({ prefix: '/api' })

router.get('/', (ctx) => {
  ctx.body = { name: 'Airbus', version: '1.0.0' }
  return
})

router.use('/provider', provider.routes(), provider.allowedMethods())
router.use('/subscribe', subscribe.routes(), subscribe.allowedMethods())

export default router
