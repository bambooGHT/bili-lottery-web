const createWsUrl = (path: string, params: Record<string, string>) => {
  const url = new URL(path, import.meta.env.VITE_API_URL.replace(/^http/, "ws"));

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

export const api = {
  ws: (user: string, key: string) =>
    new WebSocket(createWsUrl("/ws", { user, key })),
};