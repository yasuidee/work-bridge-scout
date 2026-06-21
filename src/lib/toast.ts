"use client";

import { create } from "zustand";

export type ToastKind = "success" | "info" | "ai";
export type Toast = { id: number; kind: ToastKind; message: string };

type ToastState = {
  toasts: Toast[];
  push: (message: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
};

let seq = 0;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = "success") => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// コンポーネント外からも呼べるヘルパー
export const toast = (message: string, kind?: ToastKind) =>
  useToast.getState().push(message, kind);
