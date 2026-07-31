import { useStore } from '@/stores/default'

export class HTTPError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'HTTPError'
  }
}

export async function request<T = void>(
  uri: string,
  {
    method,
    data,
    handleUnauthenticated = true,
  }: Partial<{
    method: string
    data: any
    handleUnauthenticated: boolean
  }> = {},
): Promise<T> {
  const store = useStore()
  const init: RequestInit = {
    method: method ?? (data ? 'POST' : 'GET'),
  }
  if (data) {
    init['headers'] = {
      'Content-Type': 'application/json',
    }
    init['body'] = JSON.stringify(data)
  }
  try {
    store.showLoading()
    const res = await fetch(`/api/${uri.replace(/^\/*/, '')}`, init)
    if (!res.ok) {
      if (handleUnauthenticated && res.status === 401) {
        store.showSnackbar({
          color: 'error',
          message: '登录失效，请重新登录',
        })
        store.setUser(null)
      }
      throw new HTTPError(res.status, res.statusText)
    }
    if ((res.headers.get('Content-Type') ?? '').startsWith('application/json')) {
      const data = await res.json()
      return data as T
    }
    const data = res.text()
    return data as T
  } finally {
    store.hideLoading()
  }
}
