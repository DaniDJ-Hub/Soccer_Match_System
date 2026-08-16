import { type ReactNode } from "react";
import { Button } from "@/components/button";

export function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
}: {
  message: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card shadow-elevated w-full max-w-sm rounded-2xl p-6 text-center">
        <p className="mb-4">{message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
