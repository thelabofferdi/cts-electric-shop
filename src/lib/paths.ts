export const shopHomePath = "/";

export function shopProductPath(slug: string): string {
  return `/moto/${slug}`;
}

export function shopAnchor(id: string): string {
  if (!id) return shopHomePath;
  if (typeof window !== "undefined" && window.location.pathname === shopHomePath) {
    return `#${id}`;
  }
  return `${shopHomePath}#${id}`;
}
