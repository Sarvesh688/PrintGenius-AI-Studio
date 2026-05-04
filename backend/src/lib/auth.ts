import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins"
import { jwt } from "better-auth/plugins"
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { Env } from "../config/env.config";
import { compareValue, hashValue } from "../utils/bcrypt";

export const getAuth = () => {
  // Check if database is connected
  if (!mongoose.connection.db) {
    console.error("Database not connected when getAuth() was called");
    // Instead of throwing, we'll try to connect or return a fallback
    // For now, we'll still throw but with a more informative error
    throw new Error("Database connection not established. Call connectDatabase() first.");
  }
  return betterAuth({
    baseURL: Env.BETTER_AUTH_URL,
    secret: Env.BETTER_AUTH_SECRET,
    trustedOrigins: [
      Env.FRONTEND_ORIGIN,
      "https://print-genius-ai-studio.vercel.app",
    ],
    database: mongodbAdapter(mongoose.connection.db, {
      client: mongoose.connection.getClient()
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      password: {
        hash: hashValue,
        verify: compareValue
      },
    },
    socialProviders: {
      google: {
        clientId: Env.GOOGLE_CLIENT_ID,
        clientSecret: Env.GOOGLE_CLIENT_SECRET
      }
    },
    advanced: {
      database: {
        generateId: false //_id
      },
      cookiePrefix: "printgenius-ai",
      cookies: {
        session_token: {
          name: "printgenius_session_token",
          attributes: {
            sameSite: "none" as const,
            secure: true,
            httpOnly: true,
          }
        },
      },
      useSecureCookies: true,
    },
    plugins: [
      openAPI(),
      jwt()
    ]
  });
}
