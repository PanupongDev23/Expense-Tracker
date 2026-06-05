"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, LayoutDashboard, Settings } from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  transactions: CreditCard,
  budget: BarChart3,
  settings: Settings
};

type NavLinkProps = {
  href: string;
  label: string;
  icon: keyof typeof icons;
};

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  const Icon = icons[icon];

  return (
    <Link
      href={href}
      className={[
        "inline-flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
        active ? "bg-[#205b45] text-white" : "text-[#465044] hover:bg-[#eef1e8] hover:text-[#151813]"
      ].join(" ")}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
