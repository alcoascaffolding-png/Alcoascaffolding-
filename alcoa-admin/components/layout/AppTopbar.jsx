"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, Sun, Moon, ChevronDown, Search, Maximize, Minimize2 } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { useCommandPalette } from "@/components/layout/CommandPalette";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function syncFullscreen() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  async function toggleFullscreen() {
    const root = document.documentElement;
    const canEnter = typeof root.requestFullscreen === "function";
    const canExit = typeof document.exitFullscreen === "function";

    if (!canEnter && !canExit) {
      toast.error("Fullscreen is not supported in this browser");
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await root.requestFullscreen();
      }
    } catch {
      toast.error("Unable to toggle fullscreen");
    }
  }

  const label = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={toggleFullscreen}
      aria-label={label}
      title={label}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}

export function AppTopbar({ onToggleSidebar }) {
  const { data: session } = useSession();
  const { setOpen: setCommandOpen } = useCommandPalette();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent));
  }, []);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AU";

  async function handleSignOut() {
    await signOut({ redirect: false });
    toast.success("Signed out successfully");
    // Full navigation so login remounts with forced light theme (avoids dark-mode input clash)
    window.setTimeout(() => {
      window.location.assign("/login");
    }, 400);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 shadow-sm shadow-slate-900/[0.03]">
      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-9 w-full max-w-md justify-start gap-2 text-muted-foreground sm:flex"
          onClick={() => setCommandOpen(true)}
          aria-label="Open search and navigation"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">Search pages and records…</span>
          <kbd className="pointer-events-none ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 sm:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <FullscreenToggle />
        <NotificationCenter />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-accent">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {user?.name || "Admin"}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {user?.role && (
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
