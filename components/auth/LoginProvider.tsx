"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";

type LoginContextValue = {
  openLogin: () => void;
};

const LoginContext = createContext<LoginContextValue | null>(null);

export function LoginProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const value = useMemo(() => ({ openLogin: () => setOpen(true) }), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LoginContext.Provider value={value}>
      {children}
      {mounted ? <LoginModal open={open} onClose={() => setOpen(false)} /> : null}
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
