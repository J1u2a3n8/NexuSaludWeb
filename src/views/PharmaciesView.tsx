import React, { useState, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Pencil,
  Power,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code2,
  Clock,
  Bike,
  X,
  MapPin,
} from 'lucide-react';
import { Pharmacy, BOLIVIAN_CITIES, SponsorshipCampaign } from '../types';
import {
  StatusBadge,
  SponsorshipTierBadge,
  Badge,
} from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PhoneInputList } from '../components/common/PhoneInputList';
import { SponsorshipDrawer } from '../components/sponsorship/SponsorshipDrawer';

interface PharmaciesViewProps {
  pharmacies: Pharmacy[];
  campaigns: SponsorshipCampaign[];
  onSavePharmacy: (data: Partial<Pharmacy> & { id?: string }) => void;
  onToggleStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  onSaveCampaign: (data: Partial<SponsorshipCampaign> & { id?: string }) => void;
  onCampaignStatusChange: (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => void;
}

export function PharmaciesView({
  pharmacies,
  campaigns,
  onSavePharmacy,
  onToggleStatus,
  onSaveCampaign,
  onCampaignStatusChange,
}: PharmaciesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Drawer / Form state for create / edit
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState(BOLIVIAN_CITIES[0]);
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState<number>(-17.3935);
  const [formLongitude, setFormLongitude] = useState<number>(-66.157);
  const [formPhones, setFormPhones] = useState<string[]>(['+591 ']);
  const [formHasOwnDelivery, setFormHasOwnDelivery] = useState(false);
  const [formIsOpen24Hours, setFormIsOpen24Hours] = useState(false);
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formApiBaseUrl, setFormApiBaseUrl] = useState('');
  const [formApiConfig, setFormApiConfig] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sponsorship Drawer state
  const [sponsorshipTarget, setSponsorshipTarget] = useState<Pharmacy | null>(null);

  // Soft delete / restore confirm modal
  const [confirmPharmacy, setConfirmPharmacy] = useState<Pharmacy | null>(null);

  // Loading skeleton toggle
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Filtered pharmacies
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phones.some((phone) => phone.includes(searchQuery));

      const matchCity = cityFilter === 'ALL' || p.city === cityFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchCity && matchStatus;
    });
  }, [pharmacies, searchQuery, cityFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingPharmacy(null);
    setFormName('');
    setFormCity(BOLIVIAN_CITIES[0]);
    setFormAddress('');
    setFormLatitude(-17.3935);
    setFormLongitude(-66.157);
    setFormPhones(['+591 ']);
    setFormHasOwnDelivery(false);
    setFormIsOpen24Hours(false);
    setFormWebsiteUrl('');
    setFormApiBaseUrl('');
    setFormApiConfig('{\n  "syncStock": true,\n  "updateIntervalMins": 30\n}');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleOpenEdit = (pharm: Pharmacy) => {
    setEditingPharmacy(pharm);
    setFormName(pharm.name);
    setFormCity(pharm.city);
    setFormAddress(pharm.address);
    setFormLatitude(pharm.latitude);
    setFormLongitude(pharm.longitude);
    setFormPhones(pharm.phones && pharm.phones.length > 0 ? pharm.phones : ['+591 ']);
    setFormHasOwnDelivery(pharm.hasOwnDelivery);
    setFormIsOpen24Hours(pharm.isOpen24Hours);
    setFormWebsiteUrl(pharm.websiteUrl || '');
    setFormApiBaseUrl(pharm.apiBaseUrl || '');
    setFormApiConfig(pharm.apiConfig || '{\n  "syncStock": true\n}');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formAddress.trim()) {
      setFormError('Nombre y dirección son campos obligatorios.');
      return;
    }

    const cleanPhones = formPhones.filter((p) => p.trim() && p.trim() !== '+591');
    if (cleanPhones.length === 0) {
      setFormError('Debe ingresar al menos un teléfono de contacto válido.');
      return;
    }

    onSavePharmacy({
      id: editingPharmacy ? editingPharmacy.id : undefined,
      name: formName.trim(),
      city: formCity,
      address: formAddress.trim(),
      latitude: Number(formLatitude),
      longitude: Number(formLongitude),
      phones: cleanPhones,
      hasOwnDelivery: formHasOwnDelivery,
      isOpen24Hours: formIsOpen24Hours,
      websiteUrl: formWebsiteUrl.trim() || undefined,
      apiBaseUrl: formApiBaseUrl.trim() || undefined,
      apiConfig: formApiConfig.trim() || undefined,
      status: editingPharmacy ? editingPharmacy.status : 'ACTIVE',
    });

    setIsFormDrawerOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!confirmPharmacy) return;
    const nextStatus = confirmPharmacy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onToggleStatus(confirmPharmacy.id, nextStatus);
    setConfirmPharmacy(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Farmacias Registradas
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredPharmacies.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Administración del directorio de farmacias, turnos 24 horas y patrocinios comerciales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsSimulatedLoading(true);
              setTimeout(() => setIsSimulatedLoading(false), 500);
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Refrescar
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Farmacia</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, dirección o teléfono..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:outline-hidden focus:border-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Ciudad:
          </span>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">Todas las ciudades</option>
            {BOLIVIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Estado:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Main Content: Table or Loading */}
      {isSimulatedLoading ? (
        <SkeletonTable rows={4} cols={7} />
      ) : filteredPharmacies.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No se encontraron farmacias"
          description="Ajuste los filtros o registre una nueva sucursal de farmacia en el sistema."
          actionLabel="Registrar Farmacia"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Farmacia / Cadena</th>
                  <th className="py-3 px-4">Ciudad</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4">Teléfonos</th>
                  <th className="py-3 px-4">Características</th>
                  <th className="py-3 px-4">Patrocinio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPharmacies.map((pharm) => (
                  <tr key={pharm.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{pharm.name}</div>
                      {pharm.websiteUrl && (
                        <a
                          href={pharm.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-600 hover:underline inline-flex items-center gap-1 font-mono mt-0.5"
                        >
                          <span>{pharm.websiteUrl.replace('https://', '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {pharm.city}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={pharm.address}>
                      {pharm.address}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {pharm.phones.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {pharm.isOpen24Hours && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            24 Horas
                          </span>
                        )}
                        {pharm.hasOwnDelivery && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Bike className="w-3 h-3" />
                            Delivery
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {pharm.activeSponsorshipTier ? (
                        <SponsorshipTierBadge tier={pharm.activeSponsorshipTier} />
                      ) : (
                        <span className="text-[11px] text-slate-400">Estándar</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={pharm.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSponsorshipTarget(pharm)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Patrocinios</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pharm)}
                          title="Editar farmacia"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmPharmacy(pharm)}
                          title={pharm.status === 'ACTIVE' ? 'Desactivar farmacia' : 'Restaurar farmacia'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            pharm.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {pharm.status === 'ACTIVE' ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tablet & Mobile Card List */}
          <div className="xl:hidden divide-y divide-slate-100">
            {filteredPharmacies.map((pharm) => (
              <div key={pharm.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{pharm.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{pharm.city}</span> · <span>{pharm.address}</span>
                    </p>
                  </div>
                  <StatusBadge status={pharm.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {pharm.isOpen24Hours && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      24 Horas
                    </span>
                  )}
                  {pharm.hasOwnDelivery && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Delivery propio
                    </span>
                  )}
                  {pharm.activeSponsorshipTier && (
                    <SponsorshipTierBadge tier={pharm.activeSponsorshipTier} />
                  )}
                </div>

                <div className="text-xs font-mono text-slate-600">
                  Tel: {pharm.phones.join(', ')}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSponsorshipTarget(pharm)}
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Patrocinios</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(pharm)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmPharmacy(pharm)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                        pharm.status === 'ACTIVE'
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {pharm.status === 'ACTIVE' ? 'Desactivar' : 'Restaurar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Drawer */}
      {isFormDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end"
        >
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingPharmacy ? 'Editar Farmacia' : 'Registrar Nueva Farmacia'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Parámetros generales y configuración de integración API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  {formError}
                </div>
              )}

              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre comercial *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Farmacia Farmaelias"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciudad de Bolivia *
                  </label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500 font-medium"
                  >
                    {BOLIVIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Dirección física exacta *
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Av. Heroínas #842 esq. 16 de Julio"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Coordinates (Lat / Long) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLatitude}
                    onChange={(e) => setFormLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLongitude}
                    onChange={(e) => setFormLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Dynamic Phones */}
              <PhoneInputList phones={formPhones} onChange={setFormPhones} />

              {/* Features (24h, Delivery) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Servicios y disponibilidad
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsOpen24Hours}
                      onChange={(e) => setFormIsOpen24Hours(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Atención continua 24 Horas
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formHasOwnDelivery}
                      onChange={(e) => setFormHasOwnDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Servicio de Delivery Propio
                    </span>
                  </label>
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Sitio Web o Catálogo Digital
                </label>
                <input
                  type="url"
                  value={formWebsiteUrl}
                  onChange={(e) => setFormWebsiteUrl(e.target.value)}
                  placeholder="https://farmaelias.com.bo"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* API Connection Details (Admin Only / Edit View requirement) */}
              <div className="p-4 border border-sky-200 bg-sky-50/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-700" />
                  <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                    Integración API de Stock & Recetas (Solo Administradores)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Configure el endpoint del ERP o sistema POS de la farmacia para consultar stock en tiempo real.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    API Base URL
                  </label>
                  <input
                    type="url"
                    value={formApiBaseUrl}
                    onChange={(e) => setFormApiBaseUrl(e.target.value)}
                    placeholder="https://api.partner.bo/v1/nexa"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Configuración JSON / Headers
                  </label>
                  <textarea
                    rows={4}
                    value={formApiConfig}
                    onChange={(e) => setFormApiConfig(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingPharmacy ? 'Guardar Cambios' : 'Registrar Farmacia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Sponsorship Drawer for this Pharmacy */}
      {sponsorshipTarget && (
        <SponsorshipDrawer
          isOpen={true}
          onClose={() => setSponsorshipTarget(null)}
          targetId={sponsorshipTarget.id}
          targetName={sponsorshipTarget.name}
          targetType="pharmacy"
          campaigns={campaigns}
          onSaveCampaign={onSaveCampaign}
          onStatusChange={onCampaignStatusChange}
        />
      )}

      {/* Confirmation Modal for Soft Delete / Restore */}
      {confirmPharmacy && (
        <ConfirmModal
          isOpen={true}
          title={
            confirmPharmacy.status === 'ACTIVE'
              ? '¿Desactivar sucursal de farmacia?'
              : '¿Restaurar sucursal de farmacia?'
          }
          message={
            confirmPharmacy.status === 'ACTIVE'
              ? `La farmacia "${confirmPharmacy.name}" (${confirmPharmacy.city}) será ocultada del directorio público de la app móvil hasta su reactivación.`
              : `La farmacia "${confirmPharmacy.name}" volverá a ser visible para los pacientes en la app móvil.`
          }
          confirmLabel={confirmPharmacy.status === 'ACTIVE' ? 'Desactivar farmacia' : 'Restaurar farmacia'}
          variant={confirmPharmacy.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggleStatus}
          onClose={() => setConfirmPharmacy(null)}
        />
      )}
    </div>
  );
}
