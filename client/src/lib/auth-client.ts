import { createAuthClient } from "better-auth/react"

const baseURL = typeof window !== "undefined" 
  ? window.location.origin  // Use same domain as frontend (proxied through Vercel)
  : "https://print-genius-ai-studio.vercel.app"

export const authClient = createAuthClient({
  baseURL
})
