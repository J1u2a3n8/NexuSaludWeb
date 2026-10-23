import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { ActiveNavTab, AdminUser } from '../../types';
import { X } from 'lucide-react';

interface AdminShellProps {
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
  children: React.ReactNode;
}

export function AdminShell({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  counts,
  children,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex h-full shrink-0">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          currentUser={currentUser}
          onLogout={onLogout}
          counts={counts}
        />
      </div>

      {/* Mobile Drawer (visible when mobileMenuOpen is true) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú móvil"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              currentUser={currentUser}
              onLogout={onLogout}
              counts={counts}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminTopBar
          activeTab={activeTab}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
