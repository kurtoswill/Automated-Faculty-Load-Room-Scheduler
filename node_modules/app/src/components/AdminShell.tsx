"use client";

import { useState } from "react";

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "grid" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Rooms", href: "/admin/rooms", icon: "door" },
    { label: "Requests", href: "/admin/requests", icon: "inbox" },
    { label: "Schedule", href: "/admin/schedule", icon: "calendar" },
    { label: "Faculty Load", href: "/admin/faculty-load", icon: "chart" },
    { label: "Reports", href: "/admin/reports", icon: "doc" },
    { label: "Audit Log", href: "/admin/audit-log", icon: "log" },
];

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function NavIcon({ type }: { type: string }) {
    const cls = "w-[18px] h-[18px] shrink-0";
    const p: React.SVGProps<SVGSVGElement> = {
        fill: "none", viewBox: "0 0 24 24",
        stroke: "currentColor", strokeWidth: 1.75,
        className: cls,
    };
    switch (type) {
        case "grid": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>;
        case "users": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>;
        case "door": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
        case "inbox": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" /></svg>;
        case "calendar": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
        case "chart": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
        case "doc": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
        case "log": return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>;
        default: return null;
    }
}

// ─── AdminShell ───────────────────────────────────────────────────────────────
interface AdminShellProps {
    children: React.ReactNode;
    activeNav?: string;
}

export default function AdminShell({ children, activeNav = "/admin/dashboard" }: AdminShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const sidebarW = collapsed ? "68px" : "240px";

    return (
        <div className="page-shell">
            {/* ── Topbar ── */}
            <header className="topbar">
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={() => setCollapsed((p) => !p)}
                        className="btn btn-ghost p-2 rounded-md"
                        aria-label="Toggle sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <a href="/admin/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-none" style={{ color: "var(--color-text)" }}>Dalisay</p>
                            <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Admin</p>
                        </div>
                    </a>

                    {/* Search */}
                    <div className="relative ml-6 hidden md:block" style={{ width: 280 }}>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </span>
                        <input type="search" placeholder="Search rooms, users, sections…" style={{ paddingLeft: "2.5rem", height: 36, fontSize: "0.8125rem" }} readOnly />
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost relative p-2 rounded-lg" aria-label="Notifications">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-error)" }} />
                    </button>
                    <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: "transparent" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-surface-2)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: "var(--color-primary)" }}>A</div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-medium leading-none" style={{ color: "var(--color-text)" }}>Administrator</p>
                            <p className="text-[11px] leading-none mt-0.5" style={{ color: "var(--color-text-muted)" }}>admin@cvsu.edu.ph</p>
                        </div>
                    </button>
                </div>
            </header>

            {/* ── Sidebar ── */}
            <aside className="sidebar transition-all duration-300 overflow-hidden" style={{ width: sidebarW }}>
                <nav className="flex flex-col gap-0.5 px-3 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeNav === item.href;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 whitespace-nowrap"
                                style={{
                                    backgroundColor: isActive ? "var(--color-primary-muted)" : undefined,
                                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: "0.875rem",
                                }}
                            >
                                <NavIcon type={item.icon} />
                                {!collapsed && <span>{item.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {!collapsed && (
                    <div className="px-4 pb-5 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "var(--color-primary-muted)" }}>
                            <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>2025–2026 1st Semester</p>
                            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>Active scheduling period</p>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── Page content ── */}
            <main
                className="transition-all duration-300 min-h-screen"
                style={{
                    paddingTop: "calc(var(--topbar-height) + 2rem)",
                    paddingLeft: "calc(" + sidebarW + " + 2rem)",
                    paddingRight: "2rem",
                    paddingBottom: "2rem",
                }}
            >
                {children}
            </main>
        </div>
    );
}
