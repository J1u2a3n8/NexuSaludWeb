import React from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Building2,
  Stethoscope,
  Truck,
  CarFront,
  Sparkles,
  LogOut,
  HeartPulse,
} from 'lucide-react';
import { ActiveNavTab, AdminUser } from '../../types';

interface AdminSidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  currentUser: AdminUser;
  onLogout: () => void;
  counts: {
    users: number;
    pharmacies: number;
    clinics: number;
    doctors: number;
    ambulanceCompanies: number;
    ambulances: number;
    sponsorships: number;
  };
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  counts,
  onCloseMobile,
}: AdminSidebarProps) {
  const navItems: {
    id: ActiveNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'overview', label: 'Inicio / Resumen', icon: LayoutDashboard },
    { id: 'users', label: 'Usuarios', icon: Users, count: counts.users },
    { id: 'pharmacies', label: 'Farmacias', icon: Store, count: counts.pharmacies },
    { id: 'clinics', label: 'Clínicas y Hospitales', icon: Building2, count: counts.clinics },
    { id: 'doctors', label: 'Doctores', icon: Stethoscope, count: counts.doctors },
    {
      id: 'ambulance-companies',
      label: 'Compañías de ambulancias',
      icon: Truck,
      count: counts.ambulanceCompanies,
    },
    { id: 'ambulances', label: 'Ambulancias', icon: CarFront, count: counts.ambulances },
    {
      id: 'sponsorships',
      label: 'Patrocinios (Global)',
      icon: Sparkles,
      count: counts.sponsorships,
    },
  ];

  const handleNavClick = (tabId: ActiveNavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
      {/* Brand & Environment header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">Nexa</span>
              <span className="text-base font-extrabold text-sky-600 tracking-tight">Salud</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
              Back-office Bolivia
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80">
          Admin
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Directorio & Operaciones
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-sky-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-md ml-1 shrink-0 ${
                    isActive
                      ? 'bg-sky-100/80 text-sky-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current logged admin profile & logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200/60">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
