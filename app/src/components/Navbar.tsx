"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────
export type UserRole = "admin" | "instructor" | "student";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number; // notification count
  end?: boolean; // exact match for active check
}

interface NavGroup {
  heading?: string;
  items: NavItem[];
}

// ─────────────────────────────────────────────────────────────
// Icons (inline SVG, no extra dep)
// ─────────────────────────────────────────────────────────────
const Icon = ({ d, d2 }: { d: string; d2?: string }) => (
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
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

const Icons = {
  dashboard: (
    <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" />
  ),
  rooms: (
    <Icon
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
      d2="M9 21V12h6v9"
    />
  ),
  requests: (
    <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12v4M10 14h4" />
  ),
  schedule: <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  users: (
    <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  ),
  load: <Icon d="M12 20V10M18 20V4M6 20v-4" />,
  enlistment: (
    <Icon d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  ),
  reports: (
    <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />
  ),
  audit: (
    <Icon d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  ),
  classes: (
    <Icon d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  ),
  myload: (
    <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  ),
  profile: (
    <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8" />
  ),
  notif: (
    <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  ),
  chevron: <Icon d="M15 18l-6-6 6-6" />,
  menu: <Icon d="M3 12h18M3 6h18M3 18h18" />,
  logout: (
    <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  ),
  mystudents: (
    <Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197L15 21z" />
  ),
};

// ─────────────────────────────────────────────────────────────
// Nav config per role
// ─────────────────────────────────────────────────────────────
function getNav(role: UserRole): NavGroup[] {
  if (role === "admin") {
    return [
      {
        items: [
          {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: Icons.dashboard,
            end: true,
          },
        ],
      },
      {
        heading: "Management",
        items: [
          { label: "Users", href: "/admin/users", icon: Icons.users },
          { label: "Rooms", href: "/admin/rooms", icon: Icons.rooms },
          {
            label: "Room Requests",
            href: "/admin/requests",
            icon: Icons.requests,
            badge: 5,
          },
          {
            label: "Master Schedule",
            href: "/admin/schedule",
            icon: Icons.schedule,
          },
        ],
      },
      {
        heading: "Faculty",
        items: [
          {
            label: "Faculty Load",
            href: "/admin/faculty-load",
            icon: Icons.load,
          },
          {
            label: "Enlistments",
            href: "/admin/enlistments",
            icon: Icons.enlistment,
            badge: 3,
          },
        ],
      },
      {
        heading: "Reports",
        items: [
          { label: "Reports", href: "/admin/reports", icon: Icons.reports },
          { label: "Audit Log", href: "/admin/audit-log", icon: Icons.audit },
        ],
      },
    ];
  }

  if (role === "instructor") {
    return [
      {
        items: [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: Icons.dashboard,
            end: true,
          },
        ],
      },
      {
        heading: "Scheduling",
        items: [
          { label: "Browse Rooms", href: "/rooms", icon: Icons.rooms },
          { label: "My Requests", href: "/requests", icon: Icons.requests },
          { label: "My Schedule", href: "/schedule", icon: Icons.schedule },
        ],
      },
      {
        heading: "Load & Students",
        items: [
          { label: "Faculty Load", href: "/instructor/faculty-load", icon: Icons.myload },
          {
            label: "Enlistments",
            href: "/enlistments",
            icon: Icons.mystudents,
            badge: 2,
          },
        ],
      },
      {
        heading: "Account",
        items: [
          { label: "Profile", href: "/profile", icon: Icons.profile },
          { label: "Notifications", href: "/notifications", icon: Icons.notif },
        ],
      },
    ];
  }

  // student
  return [
    {
      items: [
        {
          label: "Dashboard",
          href: "/student/dashboard",
          icon: Icons.dashboard,
          end: true,
        },
      ],
    },
    {
      heading: "My Classes",
      items: [
        {
          label: "My Schedule",
          href: "/student/schedule",
          icon: Icons.schedule,
        },
        {
          label: "Browse Classes",
          href: "/student/classes",
          icon: Icons.classes,
        },
      ],
    },
    {
      heading: "Enlistment",
      items: [
        {
          label: "My Enlistments",
          href: "/student/enlistments",
          icon: Icons.enlistment,
        },
      ],
    },
    {
      heading: "Account",
      items: [
        { label: "Profile", href: "/profile", icon: Icons.profile },
        { label: "Notifications", href: "/notifications", icon: Icons.notif },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// User avatar initials
// ─────────────────────────────────────────────────────────────
const ROLE_COLOR: Record<
  UserRole,
  { bg: string; text: string; badge: string }
> = {
  admin: { bg: "#eef2ff", text: "#3730a3", badge: "#6366f1" },
  instructor: { bg: "#fff8e6", text: "#92620a", badge: "#f0a500" },
  student: { bg: "#e8f5ee", text: "#1a7a3c", badge: "#22a050" },
};

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
interface SidebarProps {
  role: UserRole;
  userName: string;
  collapsed: boolean;
}

function Sidebar({ role, userName, collapsed }: SidebarProps) {
  const pathname = usePathname();
  const groups = getNav(role);
  const colors = ROLE_COLOR[role];

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function isActive(href: string, end?: boolean): boolean {
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
      {/* Logo row */}
      <div
        className="flex items-center gap-3 px-4 border-b"
        style={{
          height: "var(--topbar-height)",
          borderColor: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        {/* Icon mark */}
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-primary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 8L30 13.5V25L20 30.5L10 25V13.5L20 8Z"
              fill="#22a050"
            />
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
        {groups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-1" : ""}>
            {/* Group heading */}
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

            {/* Nav items */}
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
                      : {
                          color: "var(--color-text-secondary)",
                        }
                  }
                >
                  {/* Icon */}
                  <span
                    className="shrink-0 relative"
                    style={active ? { color: "var(--color-primary)" } : {}}
                  >
                    {item.icon}
                    {/* Badge dot when collapsed */}
                    {item.badge && collapsed && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{ background: "var(--color-error)" }}
                      />
                    )}
                  </span>

                  {/* Label + badge count */}
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
        ))}
      </nav>

      {/* User footer */}
      <div
        className="border-t p-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className={[
            "flex items-center gap-3 rounded-lg p-2",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          {/* Avatar */}
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: colors.bg, color: colors.text }}
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
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              title="Sign out"
              className="shrink-0 p-1.5 rounded-md transition-colors"
              style={{ color: "var(--color-text-muted)" }}
            >
              {Icons.logout}
            </button>
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
  collapsed: boolean;
  onToggle: () => void;
}

function Topbar({ role, pageTitle, collapsed, onToggle }: TopbarProps) {
  return (
    <header
      className="topbar"
      style={{
        paddingLeft: "1.5rem",
      }}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="p-2 rounded-lg mr-3 transition-colors"
        style={{ color: "var(--color-text-secondary)" }}
        aria-label="Toggle sidebar"
      >
        {Icons.menu}
      </button>

      {/* Title */}
      <h2
        className="text-[15px] font-semibold flex-1"
        style={{ color: "var(--color-text)" }}
      >
        {pageTitle}
      </h2>

      {/* Notification bell */}
      <button
        className="relative p-2 rounded-lg transition-colors mr-2"
        style={{ color: "var(--color-text-secondary)" }}
        aria-label="Notifications"
      >
        {Icons.notif}
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: "var(--color-error)" }}
        />
      </button>

      {/* Role chip */}
      <span
        className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
        style={{
          background: ROLE_COLOR[role].bg,
          color: ROLE_COLOR[role].text,
        }}
      >
        {role}
      </span>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// AppShell — wrap every role-protected page with this
// ─────────────────────────────────────────────────────────────
interface AppShellProps {
  role: UserRole;
  userName: string;
  pageTitle: string;
  children: React.ReactNode;
}

export default function AppShell({
  role,
  userName,
  pageTitle,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="page-shell">
      <Sidebar role={role} userName={userName} collapsed={collapsed} />
      <Topbar
        role={role}
        pageTitle={pageTitle}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
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
