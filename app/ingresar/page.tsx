"use client";

import { useEffect } from "react";
import { useLoginModal } from "@/components/auth/LoginProvider";

export default function IngresarPage() {
  const { openLogin } = useLoginModal();

  useEffect(() => {
    openLogin();
  }, [openLogin]);

  return <section className="min-h-screen bg-background" />;
}
