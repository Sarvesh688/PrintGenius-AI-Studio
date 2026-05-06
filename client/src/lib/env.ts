
//const isDev = import.meta.env.MODE === 'development';
//console.log(import.meta.env.NODE_MODE,"import.meta.env.NODE_MODE")

const isProd = import.meta.env.PROD

export const ENV = {
    API_URL: isProd ? "/api" : "http://localhost:8000/api",
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || "https://print-genius-ai-studio.vercel.app",
    BASE_API_URL: isProd 
      ? (typeof window !== "undefined" ? window.location.origin : "https://print-genius-ai-studio.vercel.app")
      : "http://localhost:8000"
};
