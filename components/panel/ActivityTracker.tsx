"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ActivityTracker() {
  const pathname = usePathname();
  const enabled = useRef(true);

  useEffect(() => {
    enabled.current = true;

    const send = (kind: "visit" | "heartbeat" | "end", extra?: Record<string, string>) => {
      if (!enabled.current) return;
      const body = JSON.stringify({ kind, path: pathname, ...extra });
      if (kind === "end" && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/panel/audit/ping",
          new Blob([body], { type: "application/json" }),
        );
        return;
      }
      void fetch("/api/panel/audit/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "same-origin",
        keepalive: true,
      }).then((response) => {
        if (response.status === 401 || response.status === 204) {
          enabled.current = false;
        }
      }).catch(() => {
        /* el ping no debe romper el panel */
      });
    };

    send("visit");
    const interval = window.setInterval(() => send("heartbeat"), 15000);
    const onHide = () => {
      if (document.visibilityState === "hidden") send("heartbeat");
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname]);

  return null;
}

export function trackVideoOpen(title: string, source = "") {
  void fetch("/api/panel/audit/ping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ kind: "video", title, source }),
  }).catch(() => {
    /* el registro de video no debe romper la navegación */
  });
}
