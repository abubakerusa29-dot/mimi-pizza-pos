import { createFileRoute, redirect } from "@tanstack/react-router";

// Old POS/admin address. The POS now runs as a desktop app; send visitors to the public homepage.
export const Route = createFileRoute("/riders")({
  beforeLoad: () => { throw redirect({ to: "/", replace: true }); },
});
