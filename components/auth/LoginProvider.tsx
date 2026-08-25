"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";

type LoginContextValue = {
  openLogin: () => void;
};

const LoginContext = createContext<LoginContextValue | null>(null);

export function LoginProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openLogin: () => setOpen(true) }), []);

  return (
    <LoginContext.Provider value={value}>
      {children}
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </LoginContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLoginModal must be used within LoginProvider");
  }
  return context;
}
