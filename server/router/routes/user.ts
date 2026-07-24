import { authenticateUser } from '@server/services/user'
import { Hono as Router } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

const router = new Router()

router.post('/login', async (ctx) => {
  const { email, password } = await ctx.req.json<{
    email: string
    password: string
  }>()
  if (!email || !password) {
    throw new HTTPException(400)
  }
  const data = await authenticateUser(email, password)
  if (!data) {
    throw new HTTPException(401)
  }

  const url = new URL(ctx.req.url)
  setCookie(ctx, 'token', data.token, {
    expires: data.expires,
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
  })
  return ctx.json({
    user: data.user,
  })
})

router.post('/logout', async (ctx) => {
  deleteCookie(ctx, 'token')
  return ctx.text('ok')
})

export default router
