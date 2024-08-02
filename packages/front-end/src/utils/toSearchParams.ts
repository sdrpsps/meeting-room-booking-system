// 将参数对象转换为 URLSearchParams
export const toSearchParams = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined) {
      searchParams.append(key, String(params[key]));
    }
  }
  return searchParams;
};
