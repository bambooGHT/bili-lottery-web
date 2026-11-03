/**
 * @param currentTime 时间戳(秒数)
 * @param endTime 时间戳(秒数)
 */
export const formatRemain = (currentTime: number, endTime: number): string => {
  const remaining = Math.max(0, endTime - currentTime);
  if (!remaining) return "已结束";
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(Math.floor(remaining % 60)).padStart(2, '0');
  return `${m}分${s}秒`;
};

export function formatJoinTotal(n: number): string {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);
}