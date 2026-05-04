
//const isDev = import.meta.env.MODE === 'development';
//console.log(import.meta.env.NODE_MODE,"import.meta.env.NODE_MODE")

export const ENV = {
    API_URL: "/api",  // Proxied through Vercel to Render
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || "https://print-genius-ai-studio.vercel.app",
    BASE_API_URL: typeof window !== "undefined" ? window.location.origin : "https://print-genius-ai-studio.vercel.app"
};
