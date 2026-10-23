import React, { useState, useEffect } from 'react';
import {
  ActiveNavTab,
  AdminUser,
  Pharmacy,
  Clinic,
  Doctor,
  Specialty,
  AmbulanceCompany,
  Ambulance,
  SponsorshipCampaign,
  DirectoryType,
  ToastMessage,
  UserStatus,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_SPECIALTIES,
  INITIAL_PHARMACIES,
  INITIAL_CLINICS,
  INITIAL_DOCTORS,
  INITIAL_AMBULANCE_COMPANIES,
  INITIAL_AMBULANCES,
  INITIAL_SPONSORSHIPS,
} from './data/mockData';
import { ToastContainer } from './components/common/Toast';
import { AdminShell } from './components/layout/AdminShell';
import { LoginView } from './views/LoginView';
import { OverviewView } from './views/OverviewView';
import { UsersView } from './views/UsersView';
import { PharmaciesView } from './views/PharmaciesView';
import { ClinicsView } from './views/ClinicsView';
import { DoctorsView } from './views/DoctorsView';
import { AmbulanceCompaniesView } from './views/AmbulanceCompaniesView';
import { AmbulancesView } from './views/AmbulancesView';
import { SponsorshipsView } from './views/SponsorshipsView';
import { Sparkles, HelpCircle, GitBranch, Key, X, Check } from 'lucide-react';

export default function App() {
  // Session state: starts logged in with Nexalud Admin for immediate prototype interaction
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(INITIAL_USERS[0]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('overview');

  // Entities state
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [specialties, setSpecialties] = useState<Specialty[]>(INITIAL_SPECIALTIES);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [ambulanceCompanies, setAmbulanceCompanies] = useState<AmbulanceCompany[]>(
    INITIAL_AMBULANCE_COMPANIES
  );
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [sponsorships, setSponsorships] = useState<SponsorshipCampaign[]>(INITIAL_SPONSORSHIPS);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // QA / Guide modal state
  const [isQaGuideOpen, setIsQaGuideOpen] = useState(false);

  // Add toast helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync route in URL hash for realistic back-office navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'login') {
        setCurrentUser(null);
      } else if (
        [
          'overview',
          'users',
          'pharmacies',
          'clinics',
          'doctors',
          'ambulance-companies',
          'ambulances',
          'sponsorships',
        ].includes(hash)
      ) {
        setActiveTab(hash as ActiveNavTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setActiveTab('overview');
    window.location.hash = '#/overview';
    addToast({
      type: 'success',
      title: 'Sesión iniciada con éxito',
      message: `Bienvenido de vuelta, ${user.name}.`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.location.hash = '#/login';
    addToast({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Ha salido del panel de administración de Nexa Salud.',
    });
  };

  // -----------------------
  // Users Actions
  // -----------------------
  const handleCreateAdmin = (data: { name: string; email: string; phone: string }) => {
    const newUser: AdminUser = {
      id: `usr-${String(users.length + 1).padStart(3, '0')}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    addToast({
      type: 'success',
      title: 'Administrador registrado',
      message: `Se ha creado la cuenta para ${newUser.name} (${newUser.email}).`,
    });
  };

  const handleToggleUserStatus = (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    addToast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: newStatus === 'ACTIVE' ? 'Cuenta activada' : 'Cuenta desactivada',
      message: `El estado del usuario se actualizó a ${newStatus}.`,
    });
  };

  // -----------------------
  // Pharmacies Actions
  // -----------------------
  const handleSavePharmacy = (data: Partial<Pharmacy> & { id?: string }) => {
    if (data.id) {
      setPharmacies((prev) =>
        prev.map((p) => (p.id === data.id ? ({ ...p, ...data } as Pharmacy) : p))
      );
      addToast({
        type: 'success',
        title: 'Farmacia actualizada',
        message: `Los cambios en "${data.name}" han sido guardados.`,
      });
    } else {
      const newPharm: Pharmacy = {
        id: `pharm-${String(pharmacies.length + 1).padStart(3, '0')}`,
        name: data.name || '',
        city: data.city || 'Cochabamba',
        address: data.address || '',
        latitude: data.latitude || -17.3935,
        longitude: data.longitude || -66.157,
        phones: data.phones || ['+591 4 4251234'],
        hasOwnDelivery: !!data.hasOwnDelivery,
        isOpen24Hours: !!data.isOpen24Hours,
        websiteUrl: data.websiteUrl,
        apiBaseUrl: data.apiBaseUrl,
        apiConfig: data.apiConfig,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setPharmacies((prev) => [newPharm, ...prev]);
      addToast({
        type: 'success',
        title: 'Farmacia creada',
        message: `Se registró "${newPharm.name}" en ${newPharm.city}.`,
      });
    }
  };

  const handleTogglePharmacyStatus = (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setPharmacies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    addToast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: newStatus === 'ACTIVE' ? 'Farmacia restaurada' : 'Farmacia desactivada',
      message: 'El estado en el catálogo de Nexa Salud ha sido actualizado.',
    });
  };

  // -----------------------
  // Clinics Actions
  // -----------------------
  const handleSaveClinic = (data: Partial<Clinic> & { id?: string }) => {
    if (data.id) {
      setClinics((prev) =>
        prev.map((c) => (c.id === data.id ? ({ ...c, ...data } as Clinic) : c))
      );
      addToast({
        type: 'success',
        title: 'Centro médico actualizado',
        message: `Se actualizaron los datos de "${data.name}".`,
      });
    } else {
      const newClinic: Clinic = {
        id: `clinic-${String(clinics.length + 1).padStart(3, '0')}`,
        name: data.name || '',
        city: data.city || 'Cochabamba',
        address: data.address || '',
        latitude: data.latitude || -17.3824,
        longitude: data.longitude || -66.1465,
        phones: data.phones || ['+591 4 4293800'],
        isOpen24Hours: !!data.isOpen24Hours,
        emergencyAvailable: data.emergencyAvailable ?? true,
        websiteUrl: data.websiteUrl,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setClinics((prev) => [newClinic, ...prev]);
      addToast({
        type: 'success',
        title: 'Centro médico registrado',
        message: `"${newClinic.name}" fue agregado al directorio de ${newClinic.city}.`,
      });
    }
  };

  const handleToggleClinicStatus = (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setClinics((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    addToast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: newStatus === 'ACTIVE' ? 'Centro médico restaurado' : 'Centro médico desactivado',
      message: 'Los cambios se reflejan en la red de clínicas.',
    });
  };

  // -----------------------
  // Doctors Actions
  // -----------------------
  const handleSaveDoctor = (data: Partial<Doctor> & { id?: string }) => {
    if (data.id) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === data.id ? ({ ...d, ...data } as Doctor) : d))
      );
      addToast({
        type: 'success',
        title: 'Perfil médico actualizado',
        message: `Se actualizaron los datos de Dr(a). ${data.firstName} ${data.lastName}.`,
      });
    } else {
      const newDoctor: Doctor = {
        id: `doc-${String(doctors.length + 1).padStart(3, '0')}`,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        city: data.city || 'Cochabamba',
        phones: data.phones || ['+591 70712345'],
        specialtyIds: data.specialtyIds || ['spec-ped'],
        clinicIds: data.clinicIds || [],
        licenseNumber: data.licenseNumber,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setDoctors((prev) => [newDoctor, ...prev]);
      addToast({
        type: 'success',
        title: 'Doctor registrado',
        message: `Dr(a). ${newDoctor.firstName} ${newDoctor.lastName} se añadió al catálogo.`,
      });
    }
  };

  const handleToggleDoctorStatus = (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    addToast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: newStatus === 'ACTIVE' ? 'Doctor restaurado' : 'Doctor desactivado',
      message: 'Disponibilidad actualizada en la búsqueda médica.',
    });
  };

  // -----------------------
  // Ambulance Companies Actions
  // -----------------------
  const handleSaveCompany = (data: Partial<AmbulanceCompany> & { id?: string }) => {
    if (data.id) {
      setAmbulanceCompanies((prev) =>
        prev.map((ac) => (ac.id === data.id ? ({ ...ac, ...data } as AmbulanceCompany) : ac))
      );
      addToast({
        type: 'success',
        title: 'Compañía actualizada',
        message: `Se actualizaron los datos de "${data.name}".`,
      });
    } else {
      const newComp: AmbulanceCompany = {
        id: `amb-comp-${String(ambulanceCompanies.length + 1).padStart(3, '0')}`,
        name: data.name || '',
        city: data.city || 'Cochabamba',
        address: data.address || '',
        latitude: data.latitude || -17.3912,
        longitude: data.longitude || -66.1785,
        phones: data.phones || ['+591 4 4401122'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setAmbulanceCompanies((prev) => [newComp, ...prev]);
      addToast({
        type: 'success',
        title: 'Compañía de ambulancias creada',
        message: `Se registró "${newComp.name}" en ${newComp.city}.`,
      });
    }
  };

  const handleToggleCompanyStatus = (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setAmbulanceCompanies((prev) =>
      prev.map((ac) => (ac.id === id ? { ...ac, status: newStatus } : ac))
    );
    addToast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: newStatus === 'ACTIVE' ? 'Compañía restaurada' : 'Compañía desactivada',
      message: 'Estado del operador de ambulancias actualizado.',
    });
  };

  // -----------------------
  // Ambulances Actions
  // -----------------------
  const handleSaveAmbulance = (data: Partial<Ambulance> & { id?: string }) => {
    if (data.id) {
      setAmbulances((prev) =>
        prev.map((a) => (a.id === data.id ? ({ ...a, ...data } as Ambulance) : a))
      );
      addToast({
        type: 'success',
        title: 'Ambulancia actualizada',
        message: `Se guardaron los cambios para la unidad móvil ${data.plate}.`,
      });
    } else {
      const newAmb: Ambulance = {
        id: `amb-${String(ambulances.length + 1).padStart(3, '0')}`,
        plate: data.plate || 'BO-100',
        ownerType: data.ownerType || 'COMPANY',
        ambulanceCompanyId: data.ambulanceCompanyId,
        clinicId: data.clinicId,
        city: data.city || 'Cochabamba',
        phones: data.phones || ['+591 70712345'],
        vehicleModel: data.vehicleModel,
        equipmentLevel: data.equipmentLevel || 'Básica',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setAmbulances((prev) => [newAmb, ...prev]);
      addToast({
        type: 'success',
        title: 'Ambulancia registrada',
        message: `Unidad móvil ${newAmb.plate} incorporada a la red de auxilio.`,
      });
    }
  };

  const handleToggleAmbulanceStatus = (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setAmbulances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    addToast({
      type: newStatus === 'ACTIVE' ? 'success' : 'warning',
      title: newStatus === 'ACTIVE' ? 'Ambulancia restaurada' : 'Ambulancia dada de baja',
      message: 'Disponibilidad para atención de llamadas SOS actualizada.',
    });
  };

  // -----------------------
  // Sponsorship Campaigns Actions & Synchronization
  // -----------------------
  const handleSaveCampaign = (data: Partial<SponsorshipCampaign> & { id?: string }) => {
    if (data.id) {
      setSponsorships((prev) =>
        prev.map((c) => (c.id === data.id ? ({ ...c, ...data } as SponsorshipCampaign) : c))
      );
      addToast({
        type: 'success',
        title: 'Campaña actualizada',
        message: `La campaña para "${data.targetName}" fue modificada.`,
      });
    } else {
      const newCamp: SponsorshipCampaign = {
        id: `spon-${String(sponsorships.length + 1).padStart(3, '0')}`,
        targetId: data.targetId || '',
        targetName: data.targetName || '',
        targetType: data.targetType || 'pharmacy',
        tier: data.tier || 'FEATURED',
        priority: data.priority || 7,
        amountBob: data.amountBob || 2000,
        startsAt: data.startsAt || new Date().toISOString().split('T')[0],
        endsAt: data.endsAt || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: data.notes,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setSponsorships((prev) => [newCamp, ...prev]);

      // Sync entity activeSponsorshipTier
      syncEntityTier(newCamp.targetType, newCamp.targetId, newCamp.tier);

      addToast({
        type: 'success',
        title: 'Campaña de patrocinio activada',
        message: `Patrocinio ${newCamp.tier} asignado a "${newCamp.targetName}".`,
      });
    }
  };

  const handleCampaignStatusChange = (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => {
    const targetCamp = sponsorships.find((c) => c.id === campaignId);
    setSponsorships((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status } : c))
    );

    if (targetCamp) {
      if (status === 'ACTIVE') {
        syncEntityTier(targetCamp.targetType, targetCamp.targetId, targetCamp.tier);
      } else {
        syncEntityTier(targetCamp.targetType, targetCamp.targetId, undefined);
      }
    }

    addToast({
      type: status === 'ACTIVE' ? 'success' : 'warning',
      title: status === 'ACTIVE' ? 'Campaña reactivada' : 'Campaña cancelada',
      message: `El estado de la campaña se actualizó a ${status}.`,
    });
  };

  const syncEntityTier = (
    type: DirectoryType,
    id: string,
    tier: SponsorshipCampaign['tier'] | undefined
  ) => {
    if (type === 'pharmacy') {
      setPharmacies((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activeSponsorshipTier: tier } : p))
      );
    } else if (type === 'clinic') {
      setClinics((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activeSponsorshipTier: tier } : c))
      );
    } else if (type === 'doctor') {
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, activeSponsorshipTier: tier } : d))
      );
    } else if (type === 'ambulance-company') {
      setAmbulanceCompanies((prev) =>
        prev.map((ac) => (ac.id === id ? { ...ac, activeSponsorshipTier: tier } : ac))
      );
    }
  };

  // If no user is logged in, show LoginView
  if (!currentUser) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} users={users} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  // Active counts for sidebar badges
  const counts = {
    users: users.length,
    pharmacies: pharmacies.length,
    clinics: clinics.length,
    doctors: doctors.length,
    ambulanceCompanies: ambulanceCompanies.length,
    ambulances: ambulances.length,
    sponsorships: sponsorships.length,
  };

  return (
    <>
      <AdminShell
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        counts={counts}
      >
        {activeTab === 'overview' && (
          <OverviewView
            onNavigate={handleSelectTab}
            pharmacies={pharmacies}
            clinics={clinics}
            doctors={doctors}
            ambulanceCompanies={ambulanceCompanies}
            ambulances={ambulances}
            sponsorships={sponsorships}
            users={users}
          />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={users}
            onCreateAdmin={handleCreateAdmin}
            onToggleStatus={handleToggleUserStatus}
          />
        )}

        {activeTab === 'pharmacies' && (
          <PharmaciesView
            pharmacies={pharmacies}
            campaigns={sponsorships}
            onSavePharmacy={handleSavePharmacy}
            onToggleStatus={handleTogglePharmacyStatus}
            onSaveCampaign={handleSaveCampaign}
            onCampaignStatusChange={handleCampaignStatusChange}
          />
        )}

        {activeTab === 'clinics' && (
          <ClinicsView
            clinics={clinics}
            campaigns={sponsorships}
            onSaveClinic={handleSaveClinic}
            onToggleStatus={handleToggleClinicStatus}
            onSaveCampaign={handleSaveCampaign}
            onCampaignStatusChange={handleCampaignStatusChange}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsView
            doctors={doctors}
            specialties={specialties}
            clinics={clinics}
            campaigns={sponsorships}
            onSaveDoctor={handleSaveDoctor}
            onToggleStatus={handleToggleDoctorStatus}
            onSaveCampaign={handleSaveCampaign}
            onCampaignStatusChange={handleCampaignStatusChange}
          />
        )}

        {activeTab === 'ambulance-companies' && (
          <AmbulanceCompaniesView
            companies={ambulanceCompanies}
            campaigns={sponsorships}
            onSaveCompany={handleSaveCompany}
            onToggleStatus={handleToggleCompanyStatus}
            onSaveCampaign={handleSaveCampaign}
            onCampaignStatusChange={handleCampaignStatusChange}
          />
        )}

        {activeTab === 'ambulances' && (
          <AmbulancesView
            ambulances={ambulances}
            companies={ambulanceCompanies}
            clinics={clinics}
            onSaveAmbulance={handleSaveAmbulance}
            onToggleStatus={handleToggleAmbulanceStatus}
          />
        )}

        {activeTab === 'sponsorships' && (
          <SponsorshipsView
            campaigns={sponsorships}
            pharmacies={pharmacies}
            clinics={clinics}
            doctors={doctors}
            ambulanceCompanies={ambulanceCompanies}
            onSaveCampaign={handleSaveCampaign}
            onStatusChange={handleCampaignStatusChange}
          />
        )}
      </AdminShell>

      {/* Floating QA & Review Helper (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsQaGuideOpen(!isQaGuideOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Guía QA & Rutas</span>
        </button>
      </div>

      {/* QA Guide Modal */}
      {isQaGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Guía de Verificación QA & Exportación
                </h3>
              </div>
              <button
                onClick={() => setIsQaGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">
                  Repositorio y Rama de Exportación
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                  <div>https://github.com/Nexus-Salud/nexalud_web_app</div>
                  <div className="text-emerald-700 font-bold">Rama de destino: dev</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                  Accesos Rápidos a Rutas del Mockup
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'overview', label: '1. Resumen Inicio' },
                    { id: 'users', label: '2. Usuarios (/admin/users)' },
                    { id: 'pharmacies', label: '3. Farmacias CRUD' },
                    { id: 'clinics', label: '4. Clínicas CRUD' },
                    { id: 'doctors', label: '5. Doctores CRUD' },
                    { id: 'ambulance-companies', label: '6. Cías. Ambulancias' },
                    { id: 'ambulances', label: '7. Ambulancias' },
                    { id: 'sponsorships', label: '8. Patrocinios Global' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        handleSelectTab(r.id as ActiveNavTab);
                        setIsQaGuideOpen(false);
                      }}
                      className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                        activeTab === r.id
                          ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">
                  Credenciales de Prueba (/login)
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>
                      <strong className="text-slate-800">nexalud_admin@gmail.com</strong> (Pass: admin123)
                    </span>
                    <span className="text-emerald-600 font-bold">ADMIN / ACTIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong className="text-slate-800">clever.admin@nexa.test</strong> (Pass: admin123)
                    </span>
                    <span className="text-emerald-600 font-bold">ADMIN / ACTIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong className="text-slate-800">dev@nexa.test</strong> (Pass: user123)
                    </span>
                    <span className="text-rose-600 font-bold">USER / Sin permisos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong className="text-slate-800">disabled@nexa.test</strong> (Pass: admin123)
                    </span>
                    <span className="text-amber-600 font-bold">ADMIN / Inactivo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsQaGuideOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold hover:bg-rose-100"
                >
                  Probar Pantalla de Login (/login)
                </button>
                <button
                  type="button"
                  onClick={() => setIsQaGuideOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </>
  );
}
