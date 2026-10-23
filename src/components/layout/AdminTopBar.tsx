import React from 'react';
import { Menu, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import { ActiveNavTab, AdminUser } from '../../types';

interface AdminTopBarProps {
  activeTab: ActiveNavTab;
  currentUser: AdminUser;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
}

export function AdminTopBar({
  activeTab,
  currentUser,
  onLogout,
  onOpenMobileMenu,
}: AdminTopBarProps) {
  const tabTitles: Record<ActiveNavTab, { section: string; title: string }> = {
    overview: { section: 'Panel de Control', title: 'Resumen General' },
    users: { section: 'Seguridad', title: 'Gestión de Usuarios' },
    pharmacies: { section: 'Directorios Médicos', title: 'Farmacias' },
    clinics: { section: 'Directorios Médicos', title: 'Clínicas y Hospitales' },
    doctors: { section: 'Directorios Médicos', title: 'Doctores Especialistas' },
    'ambulance-companies': { section: 'Emergencias SOS', title: 'Compañías de Ambulancias' },
    ambulances: { section: 'Emergencias SOS', title: 'Flota de Ambulancias' },
    sponsorships: { section: 'Comercial & Monetización', title: 'Campañas de Patrocinio' },
  };

  const currentInfo = tabTitles[activeTab];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile menu trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú de navegación"
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500">
          <span className="font-medium text-slate-400 hidden sm:inline">{currentInfo.section}</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 hidden sm:inline" />
          <span className="font-bold text-slate-900 text-sm sm:text-base">{currentInfo.title}</span>
        </nav>
      </div>

      {/* Right: Environment badge + Admin profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bolivia (BOB)</span>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
            <div className="text-[11px] font-mono text-slate-500">{currentUser.email}</div>
          </div>

          <div
            className="w-9 h-9 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
            title={currentUser.name}
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>

          <button
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
