import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import { useAuthStore } from "./store/authStore";
import FloatingNav from "./components/shared/FloatingNav";
import NexiaChat from "./components/ecommerce/NexiaChat";
import { useEffect } from "react";
import CartDrawer from "./components/ecommerce/CartDrawer";
import TopNavbar from "./components/shared/TopNavbar";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-zinc-950 text-white antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);
  const isAuthPage = location.pathname.startsWith("/auth");

  useEffect(() => {
    if (!token && !isAuthPage) {
      navigate("/auth/login");
    } else if (token && isAuthPage) {
      navigate(
        "/",
        { replace: true }, // Supaya tidak bisa back ke login setelah login sukses);
      );
    }
  }, [token, isAuthPage, navigate]);

  return (
    <>
      {/* Tampilkan Navbar & AI Chat HANYA jika bukan di halaman Login/Register */}
      {!isAuthPage && (
        <>
          <TopNavbar />
          <FloatingNav />
          <NexiaChat />
          <CartDrawer />
        </>
      )}

      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
