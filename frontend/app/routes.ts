import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("auth/login", "routes/auth.login.tsx"),
  route("auth/register", "routes/auth.register.tsx"),
  route("product/:id", "routes/product.$id.tsx"),
  route("katalog", "routes/katalog.tsx"),
] satisfies RouteConfig;
