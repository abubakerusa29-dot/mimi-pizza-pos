import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Req = { title: string; message: string; confirmLabel: string; resolve: (ok: boolean) => void };
let push: ((r: Req) => void) | null = null;

/** In-app replacement for window.confirm. Resolves true when the user confirms. */
export function confirmDialog(message: string, opts: { title?: string; confirmLabel?: string } = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (!push) return resolve(false);
    push({ title: opts.title ?? "Are you sure?", message, confirmLabel: opts.confirmLabel ?? "Yes, continue", resolve });
  });
}

export function ConfirmDialogHost() {
  const [req, setReq] = useState<Req | null>(null);
  useEffect(() => { push = setReq; return () => { push = null; }; }, []);
  const close = (ok: boolean) => { req?.resolve(ok); setReq(null); };
  return (
    <AlertDialog open={!!req} onOpenChange={(o) => { if (!o) close(false); }}>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{req?.title}</AlertDialogTitle>
          <AlertDialogDescription>{req?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => close(true)}>{req?.confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
