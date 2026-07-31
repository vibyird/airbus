import Auth from '@server/router/middlewares/auth'
import { authenticateUser, createSession, updateUserPassword } from '@server/services/user'
import type { Env } from '@server/types/data'
import { Hono as Router } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

const router = new Router<Env>()

router.get('/init', Auth({ throwException: false }), async (ctx) => {
  return ctx.json({
    user: ctx.get('user') ?? null,
  })
})

router.post('/login', async (ctx) => {
  const url = new URL(ctx.req.url)
  const { email, password } = await ctx.req.json<{
    email: string
    password: string
  }>()
  if (!email || !password) {
    throw new HTTPException(400)
  }

  const user = await authenticateUser(email, password)
  if (!user) {
    throw new HTTPException(401)
  }

  const { token, expires } = await createSession(user.uid)

  setCookie(ctx, 'token', token, {
    expires: expires,
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
  })
  return ctx.json({
    user,
  })
})

router.post('/change-password', async (ctx) => {
  const { email, password, newPassword } = await ctx.req.json<{
    email: string
    password: string
    newPassword: string
  }>()
  if (!email || !password || !newPassword) {
    throw new HTTPException(400)
  }

  const user = await authenticateUser(email, password)
  if (!user) {
    throw new HTTPException(401)
  }

  await updateUserPassword(user.uid, newPassword)

  deleteCookie(ctx, 'token')

  return ctx.text('ok')
})

router.post('/logout', async (ctx) => {
  deleteCookie(ctx, 'token')
  return ctx.text('ok')
})

export default router
