import { Icons } from "./shared";
import { NavGroup } from "./types";

export const adminNav: NavGroup[] = [
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
      {
        label: "Users",
        href: "/admin/users",
        icon: Icons.users,
      },
      {
        label: "Rooms",
        href: "/admin/rooms",
        icon: Icons.rooms,
      },
    ],
  },

  {
    heading: "Scheduling",
    items: [
      {
        label: "Room Requests",
        href: "/admin/requests",
        icon: Icons.requests,
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
    ],
  },

  {
    heading: "System",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: Icons.reports,
      },
      {
        label: "Audit Log",
        href: "/admin/audit-log",
        icon: Icons.audit,
      },
    ],
  },

  {
    heading: "Account",
    items: [
      {
        label: "Notifications",
        href: "/notifications",
        icon: Icons.notif,
      },
      {
        label: "Profile",
        href: "/profile",
        icon: Icons.profile,
      },
      {
        label: "Change Password",
        href: "/change-password",
        icon: Icons.password,
      },
    ],
  },
];