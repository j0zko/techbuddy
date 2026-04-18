const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function jsonOrThrow(res) {
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

export async function sendChat({ messages, mode, hardwareData, signal } = {}) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode, hardwareData }),
    signal,
  });
  return jsonOrThrow(res);
}

export async function fetchHardware({ signal } = {}) {
  const res = await fetch(`${BASE}/api/diagnose`, { signal });
  return jsonOrThrow(res);
}
