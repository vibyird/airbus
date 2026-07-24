import { findUserByToken } from '@server/services/user'
import { Hono as Router } from 'hono'
import { getCookie } from 'hono/cookie'

const router = new Router()

router.get('/init', async (ctx) => {
  const token = getCookie(ctx, 'token')
  if (token) {
    const user = await findUserByToken(token)
    if (user) {
      return ctx.json({
        user,
      })
    }
  }
  return ctx.json({
    user: null,
  })
})

export default router
