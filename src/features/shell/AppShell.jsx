import {
  Bell,
  Calculator,
  Database,
  LogOut,
  Search,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { getVisibleNavigation } from "../auth/authRules";

const viewTitles = {
  priceEstimation: "Price Estimation",
  masterData: "Price List / Master Data",
  userManagement: "User Management",
};

const viewDescriptions = {
  priceEstimation:
    "Manage draft and created price estimates from one workspace.",
  masterData: "Maintain catalog rates, defaults, and audit history.",
  userManagement: "Manage app-level user roles and access status.",
};

const navIcons = {
  priceEstimation: Calculator,
  masterData: Database,
  userManagement: Users,
};

const routeByView = {
  priceEstimation: "/estimates",
  masterData: "/master-data",
  userManagement: "/users",
};

function viewFromPath(pathname) {
  if (pathname.startsWith("/master-data")) return "masterData";
  if (pathname.startsWith("/users")) return "userManagement";
  return "priceEstimation";
}

export function AppShell({ onSignOut, profile, children }) {
  const location = useLocation();
  const activeView = viewFromPath(location.pathname);
  const navigationItems = getVisibleNavigation(profile);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
      <div className="relative flex min-h-screen p-3 lg:p-5">
        <aside className="hidden w-72 shrink-0 overflow-hidden rounded-4xl border border-white/70 bg-white/88 text-slate-900 shadow-2xl shadow-slate-300/60 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-sm font-black tracking-wider text-white shadow-xl shadow-blue-600/25">
                RAB
              </div>
              <div>
                <p className="text-base font-black tracking-tight">
                  RAB Calculator
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Print & finishing studio
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-3" aria-label="Primary">
            <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Menu
            </p>
            {navigationItems.map((item) => {
              const Icon = navIcons[item.key] ?? Sparkles;
              return (
                <NavLink
                  className={({ isActive }) =>
                    `group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold transition ${
                      isActive || activeView === item.key
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/25"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                  end={item.key === "priceEstimation"}
                  key={item.key}
                  to={routeByView[item.key]}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/10 group-hover:bg-white/30">
                    <Icon size={18} strokeWidth={2.4} />
                  </span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-5">
          <header className="sticky top-3 z-20 rounded-[1.75rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-300/40 backdrop-blur-xl lg:top-5">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
                  Admin workspace
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                  {viewTitles[activeView] ?? "Dashboard"}
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {viewDescriptions[activeView]}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="hidden rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-right text-xs text-slate-600 sm:block">
                  <p className="font-black text-slate-900">
                    {profile?.name || profile?.email || "User"}
                  </p>
                  <p>{profile?.role}</p>
                </div>
                <Button onClick={onSignOut}>
                  <LogOut size={17} />
                  Sign out
                </Button>
              </div>
            </div>
            <nav
              className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3 lg:hidden"
              aria-label="Mobile primary"
            >
              {navigationItems.map((item) => {
                const Icon = navIcons[item.key] ?? Sparkles;
                return (
                  <NavLink
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-bold ${
                        isActive || activeView === item.key
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`
                    }
                    end={item.key === "priceEstimation"}
                    key={item.key}
                    to={routeByView[item.key]}
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </header>

          <section className="flex-1 p-1 pt-5 sm:p-5 lg:p-7">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
