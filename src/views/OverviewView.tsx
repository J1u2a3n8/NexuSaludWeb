import React from 'react';
import {
  Store,
  Building2,
  Stethoscope,
  Truck,
  Sparkles,
  Users,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  ActiveNavTab,
  Pharmacy,
  Clinic,
  Doctor,
  AmbulanceCompany,
  Ambulance,
  SponsorshipCampaign,
  AdminUser,
} from '../types';
import { CampaignStatusBadge, SponsorshipTierBadge } from '../components/common/Badge';

interface OverviewViewProps {
  onNavigate: (tab: ActiveNavTab) => void;
  pharmacies: Pharmacy[];
  clinics: Clinic[];
  doctors: Doctor[];
  ambulanceCompanies: AmbulanceCompany[];
  ambulances: Ambulance[];
  sponsorships: SponsorshipCampaign[];
  users: AdminUser[];
}

export function OverviewView({
  onNavigate,
  pharmacies,
  clinics,
  doctors,
  ambulanceCompanies,
  ambulances,
  sponsorships,
  users,
}: OverviewViewProps) {
  // Aggregate stats
  const activeSponsorships = sponsorships.filter((s) => s.status === 'ACTIVE');
  const totalMonthlyBob = activeSponsorships.reduce((acc, curr) => acc + curr.amountBob, 0);

  const pharmacies24h = pharmacies.filter((p) => p.isOpen24Hours).length;
  const pharmaciesDelivery = pharmacies.filter((p) => p.hasOwnDelivery).length;

  const clinicsEmergency = clinics.filter((c) => c.emergencyAvailable || c.isOpen24Hours).length;

  const adminUsersCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
            Nexa Salud Bolivia · Panel de Control
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Resumen General del Ecosistema
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            Supervisión y control administrativo para Cochabamba, Santa Cruz de la Sierra, La Paz y
            demás departamentos del Estado Plurinacional de Bolivia.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('sponsorships')}
            className="px-4 py-2.5 bg-white text-sky-700 hover:bg-sky-50 text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Gestionar Patrocinios</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Monthly Revenue BOB */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Patrocinios Activos
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              Bs. {totalMonthlyBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">{activeSponsorships.length} campañas</span>
              <span>vigentes en directorio</span>
            </div>
          </div>
        </div>

        {/* KPI: Pharmacies */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Farmacias Registradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {pharmacies.length}
            </div>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
              <span>{pharmacies24h} con turno 24h</span>
              <span>·</span>
              <span>{pharmaciesDelivery} con delivery</span>
            </div>
          </div>
        </div>

        {/* KPI: Clinics */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clínicas y Hospitales
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {clinics.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              <span>{clinicsEmergency} con servicio de urgencias</span>
            </div>
          </div>
        </div>

        {/* KPI: Ambulances */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Flota de Ambulancias
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {ambulances.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              <span>En {ambulanceCompanies.length} empresas y clínicas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Quick Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Directorios y Catálogos Médicos
          </h2>
          <span className="text-xs text-slate-400">Acceso directo a gestión CRUD</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card: Farmacias */}
          <div
            onClick={() => onNavigate('pharmacies')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Farmacias</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Catálogo de sucursales, horarios 24h, delivery propio e integración de stock vía API.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{pharmacies.length} registradas</span>
              <span className="text-sky-600 font-semibold group-hover:underline">Administrar</span>
            </div>
          </div>

          {/* Card: Clínicas & Hospitales */}
          <div
            onClick={() => onNavigate('clinics')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Clínicas y Hospitales</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Centros médicos de 2do y 3er nivel, áreas de emergencias y convenios hospitalarios.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{clinics.length} centros</span>
              <span className="text-indigo-600 font-semibold group-hover:underline">Administrar</span>
            </div>
          </div>

          {/* Card: Doctores */}
          <div
            onClick={() => onNavigate('doctors')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Doctores Especialistas</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Médicos colegiados, especialidades clínicas asociadas y hospitales de atención.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>{doctors.length} médicos</span>
              <span className="text-emerald-600 font-semibold group-hover:underline">Administrar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Sponsorships + Emergency & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Active campaigns spotlight */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patrocinios Destacados en App Móvil</h3>
              <p className="text-xs text-slate-500">Campañas con prioridad alta vigentes en Bolivia</p>
            </div>
            <button
              onClick={() => onNavigate('sponsorships')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Ver todas ({sponsorships.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activeSponsorships.slice(0, 4).map((camp) => (
              <div key={camp.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {camp.targetName}
                    </span>
                    <SponsorshipTierBadge tier={camp.tier} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="capitalize">{camp.targetType}</span>
                    <span>·</span>
                    <span className="font-mono">Prioridad: {camp.priority}</span>
                    <span>·</span>
                    <span>Hasta: {camp.endsAt}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-slate-900">
                    Bs. {camp.amountBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </div>
                  <CampaignStatusBadge status={camp.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right col: Red SOS & Security summary */}
        <div className="space-y-4">
          {/* Ambulances summary */}
          <div
            onClick={() => onNavigate('ambulances')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Red SOS Ambulancias</h4>
                  <p className="text-[11px] text-slate-500">{ambulances.length} unidades activas</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Users summary */}
          <div
            onClick={() => onNavigate('users')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Administradores</h4>
                  <p className="text-[11px] text-slate-500">{adminUsersCount} administradores activos</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Coverage note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Cobertura Departamental</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cochabamba, Santa Cruz de la Sierra y La Paz cuentan con sincronización de farmacias
              de turno 24 horas y asignación de ambulancias geolocalizadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
