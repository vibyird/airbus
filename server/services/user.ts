import type { SessionRecord, User, UserRecord } from '@server/types/data'
import { compareHashAndPassword, generateHashFromPassword } from '@server/utils/password'
import { env } from 'cloudflare:workers'
import crypto from 'crypto'

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const session = env.DB.withSession()
  let user = await session.prepare('SELECT * FROM [users] WHERE email = ?').bind(email).first<UserRecord>()
  if (!user) {
    return null
  }
  const isMatch = await compareHashAndPassword(user.password, password)
  if (!isMatch) {
    return null
  }
  return {
    uid: user.uid,
    nickname: user.nickname,
    email: user.email,
  }
}

export async function createSession(uid: number): Promise<{ token: string; expires: Date }> {
  const session = env.DB.withSession()
  const token = crypto.randomBytes(24).toString('base64url')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 设置过期时间为 1 天后
  await session
    .prepare('INSERT INTO [sessions] (token, uid, expires) VALUES (?, ?, ?)')
    .bind(token, uid, expires.toISOString())
    .run()
  return {
    token,
    expires,
  }
}

async function findUser(uid: number): Promise<User | null> {
  const session = env.DB.withSession()
  let user = await session.prepare('SELECT * FROM [users] WHERE uid = ?').bind(uid).first<UserRecord>()
  if (!user) {
    return null
  }
  return user
}

export async function findUserByToken(token: string): Promise<User | null> {
  const session = env.DB.withSession()
  let userSession = await session.prepare('SELECT * FROM [sessions] WHERE token = ?').bind(token).first<SessionRecord>()
  if (!userSession) {
    return null
  }
  const { expires } = userSession
  if (Date.parse(expires) < Date.now()) {
    return null
  }
  return findUser(userSession.uid)
}

export async function updateUserPassword(uid: number, password: string): Promise<void> {
  const hash = await generateHashFromPassword(password)
  const session = env.DB.withSession()
  await session.prepare('UPDATE [users] SET password = ? WHERE uid = ?').bind(hash, uid).run()
}

export async function cleanUserSession(): Promise<void> {
  const session = env.DB.withSession()
  await session.prepare("DELETE FROM [sessions] WHERE datetime(expires) < datetime('now')").run()
}
