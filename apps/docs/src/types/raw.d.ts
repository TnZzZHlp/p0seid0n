/** Vite resolves `?raw` imports to the file text at build time. */
declare module '*?raw' {
  const content: string
  export default content
}
