import { findUserByToken } from '@server/services/user'
import type { Env } from '@server/types/data'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

export default function Auth({ throwException = true }: Partial<{ throwException: boolean }> = {}) {
  return createMiddleware<Env>(async (ctx, next) => {
    const token = getCookie(ctx, 'token')
    if (token) {
      const user = await findUserByToken(token)
      if (user) {
        ctx.set('user', user)
        await next()
        return
      }
    }
    if (throwException) {
      throw new HTTPException(401)
    }
    await next()
  })
}
