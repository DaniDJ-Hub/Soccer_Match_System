const SESSION_KEY = "sesion_jaguar";

// NOTE: mirrors the original project's simple hardcoded credential check.
// For a real production deployment, replace this with a proper auth
// provider (NextAuth, Clerk, etc.) and move credentials server-side.
const USUARIOS = [{ usuario: "jaguar", password: "jaguar123" }];

export function login(usuario: string, password: string): boolean {
  const ok = USUARIOS.some(
    (u) => u.usuario === usuario.trim().toLowerCase() && u.password === password
  );
  if (ok && typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, "1");
  }
  return ok;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
