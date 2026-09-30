# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Deploy to Vercel

Create a Vercel project from this repository and set its **Root Directory** to `frontend`. The included `vercel.json` configures the Vite build, publishes `dist`, and sends client-side routes to the React app.

Add these environment variables in the Vercel project settings for every environment you deploy:

- `VITE_API_URL`: the public backend URL ending in `/api`, for example `https://api.example.com/api`.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID, if Google sign-in is enabled.
- `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`: Cloudinary settings, if image uploads are enabled.
- `VITE_CASHFREE_ENV`: `sandbox` or `production`, matching the backend Cashfree credentials.

The Express backend must be deployed separately and reachable over HTTPS. Configure its `CLIENT_URL` to the Vercel site origin (include any preview origins you need, separated by commas), and set `FRONTEND_URL` to the production frontend URL for payment redirects. Also configure the backend secrets and service credentials, including `MONGO_URL` and `JWT_SECRET`, in the backend host's environment settings. After changing frontend variables, redeploy because Vite embeds them at build time.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
