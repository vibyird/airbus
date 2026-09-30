/// <reference types="vite/client" />

declare module '*.yaml' {
  const value: string
  export default value
}
declare module '*.conf' {
  const value: string
  export default value
}
