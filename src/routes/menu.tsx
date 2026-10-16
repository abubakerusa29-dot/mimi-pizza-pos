import { createFileRoute, redirect } from "@tanstack/react-router";

// Old public menu address; the homepage now holds the digital menu.
export const Route = createFileRoute("/menu")({
  beforeLoad: () => { throw redirect({ to: "/", hash: "menu" }); },
});
