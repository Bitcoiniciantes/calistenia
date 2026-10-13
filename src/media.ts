/** URL de asset em public/, respeitando o base path do deploy. */
export function pub(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
