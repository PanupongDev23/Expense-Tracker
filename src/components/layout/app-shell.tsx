import { Wallet } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { NavLink } from "@/components/layout/nav-link";

type AppShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/transactions", label: "Transactions", icon: "transactions" as const },
  { href: "/budget", label: "Budget", icon: "budget" as const },
  { href: "/settings", label: "Settings", icon: "settings" as const }
];

export function AppShell({ userEmail, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dedfd8] bg-white px-4 py-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-[#205b45] text-white">
            <Wallet size={21} />
          </div>
          <div>
            <p className="text-base font-semibold text-[#151813]">Expense Tracker</p>
            <p className="text-xs text-[#67715f]">Personal finance</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="space-y-3 border-t border-[#e6e7e0] pt-4">
          <p className="truncate text-xs font-medium text-[#67715f]">{userEmail}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#dedfd8] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#205b45] text-white">
                <Wallet size={19} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#151813]">Expense Tracker</p>
                <p className="truncate text-xs text-[#67715f]">{userEmail}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
          <nav className="mt-3 grid grid-cols-4 gap-2">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
