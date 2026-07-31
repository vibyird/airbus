export interface UserRecord {
  uid: number
  nickname: string
  email: string
  password: string
}

export interface SessionRecord {
  token: string
  uid: number
  expires: string
}

export type User = Omit<UserRecord, 'password'>

export type Env = {
  Variables: {
    user: User
  }
}
