async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (response.status === 204) {
    return null;
  }

  if (isJson) {
    return response.json();
  }

  return response.text();
}

const API_BASE = "/api/forms";

export async function apiRequest(path, { method = "GET", body, headers = {}, signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}

export const authApi = {
  me: () => apiRequest("/auth/me"),
  logout: async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
  },
};

export const solicitacaoApi = {
  list: () => apiRequest("/solicitacoes"),
  create: (payload) => apiRequest("/solicitacoes", { method: "POST", body: payload }),
  update: (id, payload) => apiRequest(`/solicitacoes/${id}`, { method: "PUT", body: payload }),
  review: (id, payload) => apiRequest(`/solicitacoes/${id}/revisao`, { method: "PATCH", body: payload }),
  legacy: (id) => apiRequest(`/solicitacoes/${id}/legado`),
  remove: (id) => apiRequest(`/solicitacoes/${id}`, { method: "DELETE" }),
};
