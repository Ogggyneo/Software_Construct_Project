// Production: set EXPO_PUBLIC_API_URL in Vercel environment variables.
// Local dev: set to your Mac's WiFi IP so the phone can reach the backend.
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.212.0.20:3000';

export async function apiFetch<T = any>(
  path: string,
  token: string | null,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}
