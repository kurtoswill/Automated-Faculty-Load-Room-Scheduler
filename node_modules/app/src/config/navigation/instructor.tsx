import { Icons } from "./shared";
import { NavGroup } from "./types";

export const instructorNav: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/instructor/dashboard",
        icon: Icons.dashboard,
        end: true,
      },
    ],
  },

  {
    heading: "Scheduling",
    items: [
      {
        label: "Browse Rooms",
        href: "/instructor/rooms",
        icon: Icons.rooms,
      },
      {
        label: "Create Request",
        href: "/requests/create",
        icon: Icons.requests,
      },
      {
        label: "My Requests",
        href: "/requests",
        icon: Icons.requests,
      },
      {
        label: "My Schedule",
        href: "/instructor/schedule",
        icon: Icons.schedule,
      },
    ],
  },

  {
    heading: "Teaching",
    items: [
      {
        label: "Faculty Load",
        href: "/instructor/faculty-load",
        icon: Icons.load,
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