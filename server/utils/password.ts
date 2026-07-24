import crypto, { getHashes } from 'crypto'

export async function generateHashFromPassword(
  password: string,
  {
    saltLen = 16,
    iterations = 10000,
    digest = 'sha512',
    keylen = 64,
  }: Partial<{
    saltLen: number
    iterations: number
    digest: string
    keylen: number
  }> = {},
): Promise<string> {
  const salt = crypto.randomBytes(saltLen)

  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) {
        return reject(err)
      }
      resolve(
        `\$pbkdf2-${digest}\$i=${iterations}\$${salt
          .toString('base64url')
          .replaceAll('-', '+')
          .replaceAll('_', '/')}\$${derivedKey.toString('base64url').replaceAll('-', '+').replaceAll('_', '/')}`,
      )
    })
  })

  return hash
}

export async function compareHashAndPassword(hash: string, password: string): Promise<boolean> {
  const [, algorithm, options, base64Salt, base64Key] = hash.split('$')
  if (!algorithm.startsWith('pbkdf2-') || !/^i=[1-9]\d*$/.test(options) || !base64Salt || !base64Key) {
    return false
  }

  const digest = algorithm.replace('pbkdf2-', '')
  if (!getHashes().includes(digest)) {
    return false
  }

  const iterations = parseInt(options.replace('i=', ''))
  const salt = Buffer.from(base64Salt.replaceAll('+', '-').replaceAll('/', '_'), 'base64url')
  const key = Buffer.from(base64Key.replaceAll('+', '-').replaceAll('/', '_'), 'base64url')
  if (iterations <= 0 || !salt.length || !key.length) {
    return false
  }

  const derivedKey = await new Promise<Buffer<ArrayBuffer>>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, key.length, digest, (err, derivedKey) => {
      if (err) {
        return reject(err)
      }
      resolve(derivedKey)
    })
  })

  return crypto.timingSafeEqual(key, derivedKey)
}
