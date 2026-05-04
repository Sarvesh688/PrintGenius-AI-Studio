import { createAuthClient } from "better-auth/react"
import { ENV } from "./env"

const baseURL = ENV.BASE_API_URL || "https://printgenius-ai-studio.onrender.com"

export const authClient = createAuthClient({
  baseURL
})
