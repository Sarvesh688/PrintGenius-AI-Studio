import { createAuthClient } from "better-auth/react"

const isProd = import.meta.env.PROD
const baseURL = isProd 
  ? window.location.origin  // Production: use Vercel domain (proxied to Render)
  : "http://localhost:8000"  // Development: use local backend directly

export const authClient = createAuthClient({
  baseURL
})
