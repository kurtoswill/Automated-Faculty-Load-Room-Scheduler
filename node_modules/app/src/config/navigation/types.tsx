import React from "react";

export type UserRole = "admin" | "instructor" | "student";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  end?: boolean;
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
}