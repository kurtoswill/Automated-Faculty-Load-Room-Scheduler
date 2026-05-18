"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { adminNav } from "@/config/navigation/admin";
import { instructorNav } from "@/config/navigation/instructor";
import {
  irregularStudentNav,
  regularStudentNav,
} from "@/config/navigation/student";

import { Icons } from "@/config/navigation/shared";
import { NavGroup, UserRole } from "@/config/navigation/types";

// ─────────────────────────────────────────────────────────────
// Navigation resolver
// ─────────────────────────────────────────────────────────────
function getNav(role: UserRole, isIrregular = false): NavGroup[] {
  switch (role) {
    case "admin":
      return adminNav;
    case "instructor":
      return instructorNav;
    case "student":
      return isIrregular ? irregularStudentNav : regularStudentNav;
    default:
      return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Role colors
// ─────────────────────────────────────────────────────────────
const ROLE_COLOR: Record<
  UserRole,
  {
    bg: string;
    text: string;
    badge: string;
  }
> = {
  admin: {
    bg: "#eef2ff",
    text: "#3730a3",
    badge: "#6366f1",
  },
  instructor: {
    bg: "#fff8e6",
    text: "#92620a",
    badge: "#f0a500",
  },
  student: {
    bg: "#e8f5ee",
    text: "#1a7a3c",
    badge: "#22a050",
  },
};

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
interface SidebarProps {
  role: UserRole;
  userName: string;
  collapsed: boolean;
  isIrregular?: boolean;
}

function Sidebar({
  role,
  userName,
  collapsed,
  isIrregular = false,
}: SidebarProps) {
  const pathname = usePathname();

  const groups = getNav(role, isIrregular);
  const colors = ROLE_COLOR[role];
  const [accountOpen, setAccountOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function isActive(href: string, end?: boolean) {
    if (end) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="sidebar flex flex-col transition-all duration-300"
      style={{
        width: collapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 border-b"
        style={{
          height: "var(--topbar-height)",
          borderColor: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "var(--color-primary)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path d="M20 8L30 13.5V25L20 30.5L10 25V13.5L20 8Z" fill="#22a050" />
            <path
              d="M15.5 20.5L18.5 23.5L25 17"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <p
              className="text-[13.5px] font-bold leading-tight whitespace-nowrap"
              style={{ color: "var(--color-text)" }}
            >
              SchedMaster
            </p>
            <p
              className="text-[10px] font-medium uppercase tracking-wider whitespace-nowrap"
              style={{ color: "var(--color-text-muted)" }}
            >
              {role === "admin"
                ? "Admin Portal"
                : role === "instructor"
                  ? "Instructor Portal"
                  : isIrregular
                    ? "Irregular Student"
                    : "Student Portal"}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto py-3 px-2"
        style={{ scrollbarWidth: "none" }}
      >
        {groups.map((group, gi) => {
          const isAccountGroup = group.heading === "Account";

          if (isAccountGroup) return null;

          return (
            <div key={gi} className={gi > 0 ? "mt-1" : ""}>
              {/* Heading */}
              {group.heading && !collapsed && (
                <p
                  className="px-3 pt-4 pb-1 text-[10.5px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {group.heading}
                </p>
              )}

              {group.heading && collapsed && (
                <div
                  className="my-2 mx-3 border-t"
                  style={{ borderColor: "var(--color-border)" }}
                />
              )}

              {/* Items */}
              {group.items.map((item) => {
                const active = isActive(item.href, item.end);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "flex items-center gap-3 rounded-lg transition-all duration-150 mb-0.5",
                      collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
                    ].join(" ")}
                    style={
                      active
                        ? {
                            background: "var(--color-primary-muted)",
                            color: "var(--color-primary)",
                          }
                        : { color: "var(--color-text-secondary)" }
                    }
                  >
                    <span
                      className="shrink-0 relative"
                      style={active ? { color: "var(--color-primary)" } : {}}
                    >
                      {item.icon}

                      {item.badge && collapsed && (
                        <span
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                          style={{ background: "var(--color-error)" }}
                        />
                      )}
                    </span>

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-[13px] font-medium whitespace-nowrap">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: active
                                ? "var(--color-primary)"
                                : "var(--color-error)",
                              color: "#fff",
                              minWidth: "18px",
                              textAlign: "center",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className="border-t p-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Account Dropdown */}
        {!collapsed && (
          <div className="mb-2">
            <button
              onClick={() => setAccountOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span className="shrink-0">{Icons.profile}</span>
              <span className="flex-1 text-left text-[13px] font-medium">
                Account
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${
                  accountOpen ? "rotate-180" : ""
                }`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                accountOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"
              }`}
            >
              {groups
                .find((g) => g.heading === "Account")
                ?.items.map((item) => {
                  const active = isActive(item.href, item.end);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 ml-2"
                      style={
                        active
                          ? {
                              background: "var(--color-primary-muted)",
                              color: "var(--color-primary)",
                            }
                          : { color: "var(--color-text-secondary)" }
                      }
                    >
                      <span>{item.icon}</span>
                      <span className="text-[13px] font-medium">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* User */}
        <div
          className={[
            "flex items-center gap-3 rounded-lg p-2",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{
              background: colors.bg,
              color: colors.text,
            }}
          >
            {initials}
          </div>

          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p
                className="text-[12.5px] font-semibold truncate leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                {userName}
              </p>
              <p
                className="text-[11px] capitalize"
                style={{ color: "var(--color-text-muted)" }}
              >
                {role}
                {isIrregular && role === "student" ? " · Irregular" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────

interface TopbarProps {
  role: UserRole;
  pageTitle: string;
  onToggle: () => void;
  isIrregular?: boolean;
}

function Topbar({
  role,
  pageTitle,
  onToggle,
  isIrregular = false,
}: TopbarProps) {
  const chipLabel =
    role === "student" && isIrregular
      ? "Irregular"
      : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <header className="topbar" style={{ paddingLeft: "1.5rem" }}>
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="p-2 rounded-lg mr-3 transition-colors"
        style={{ color: "var(--color-text-secondary)" }}
        aria-label="Toggle sidebar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Title */}
      <h2
        className="text-[15px] font-semibold flex-1"
        style={{ color: "var(--color-text)" }}
      >
        {pageTitle}
      </h2>

      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative p-2 rounded-lg transition-colors mr-2"
        style={{ color: "var(--color-text-secondary)" }}
        aria-label="Notifications"
      >
        {Icons.notif}

        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: "var(--color-error)" }}
        />
      </Link>

      {/* Role Chip */}
      <span
        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
        style={{
          background: ROLE_COLOR[role].bg,
          color: ROLE_COLOR[role].text,
        }}
      >
        {chipLabel}
      </span>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// App Shell
// ─────────────────────────────────────────────────────────────

interface AppShellProps {
  role: UserRole;
  userName: string;
  pageTitle: string;
  children: React.ReactNode;
  isIrregular?: boolean;
}

export default function AppShell({
  role,
  userName,
  pageTitle,
  children,
  isIrregular = false,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="page-shell">
      <Sidebar
        role={role}
        userName={userName}
        collapsed={collapsed}
        isIrregular={isIrregular}
      />

      <Topbar
        role={role}
        pageTitle={pageTitle}
        onToggle={() => setCollapsed((current) => !current)}
        isIrregular={isIrregular}
      />

      <main
        className="main-content transition-all duration-300"
        style={{
          marginLeft: collapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}