export interface User {
  uid: number
  nickname: string
  email: string
}

export interface Provider {
  name: string
  realName: string
  token: string
  subscribeUrl: string
  directDomains: string[]
  excludeRegex: RegExp | null
}
