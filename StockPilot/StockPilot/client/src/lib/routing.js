export function getRouterBasename(baseUrl = '/') {
  return String(baseUrl).replace(/\/+$/, '') || '/';
}
