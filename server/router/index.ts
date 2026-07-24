import { Hono as Router } from 'hono'
import { HTTPException } from 'hono/http-exception'
import http from 'http'
import provider from './routes/provider'
import site from './routes/site'
import subscribe from './routes/subscribe'
import user from './routes/user'

const router = new Router().basePath('/api')

router.get('/', (ctx) => {
  return ctx.json({ name: 'Airbus', version: '1.0.0' })
})

router.route('/site', site)
router.route('/user', user)
router.route('/provider', provider)
router.route('/subscribe', subscribe)

router.onError((err, ctx) => {
  let exception = new HTTPException(500)
  if (err instanceof HTTPException) {
    exception = err
  }
  return ctx.text(http.STATUS_CODES[exception.status] ?? '', exception.status)
})

router.notFound((ctx) => {
  return ctx.text(http.STATUS_CODES[404] ?? '', 404)
})

export default router
