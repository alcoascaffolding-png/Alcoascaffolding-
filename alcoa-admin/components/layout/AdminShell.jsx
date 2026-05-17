"use client";

import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

export function AdminShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  function toggleSidebar() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileNavOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      )}

      <AppSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onNavigate={closeMobileNav}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppTopbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
