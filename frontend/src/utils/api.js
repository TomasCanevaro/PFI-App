
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    // Si el token expiró o no es válido → redirijo al login
    if (res.status === 401) {
      alert("Sesión expirada. Iniciá sesión nuevamente.");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    return res;
  } catch (err) {
    console.error("Error de red o servidor:", err);
  }
}