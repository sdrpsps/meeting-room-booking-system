interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
}

async function fetchWrapper<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers, ...restOptions } = options;
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}${url}`, {
    ...restOptions,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.data || "请求失败");
  }

  return response.json() as Promise<T>;
}

export default fetchWrapper;
