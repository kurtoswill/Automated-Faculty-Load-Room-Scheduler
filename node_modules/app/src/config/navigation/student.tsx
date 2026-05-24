import { Icons } from "./shared";
import { NavGroup } from "./types";

export const regularStudentNav: NavGroup[] = [
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
    heading: "Academics",
    items: [
      {
        label: "My Schedule",
        href: "/student/schedule",
        icon: Icons.schedule,
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

export const irregularStudentNav: NavGroup[] = [
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
    heading: "Academics",
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