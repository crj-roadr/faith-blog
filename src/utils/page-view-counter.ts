export function formatPageViewCount(count: number): string {
  return new Intl.NumberFormat("zh-CN").format(count)
}
