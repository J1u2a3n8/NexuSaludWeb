import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Pencil,
  Power,
  RotateCcw,
  Sparkles,
  Eye,
  Clock,
  ShieldAlert,
  X,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Clinic, BOLIVIAN_CITIES, SponsorshipCampaign } from '../types';
import {
  StatusBadge,
  SponsorshipTierBadge,
} from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PhoneInputList } from '../components/common/PhoneInputList';
import { SponsorshipDrawer } from '../components/sponsorship/SponsorshipDrawer';

interface ClinicsViewProps {
  clinics: Clinic[];
  campaigns: SponsorshipCampaign[];
  onSaveClinic: (data: Partial<Clinic> & { id?: string }) => void;
  onToggleStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  onSaveCampaign: (data: Partial<SponsorshipCampaign> & { id?: string }) => void;
  onCampaignStatusChange: (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => void;
}

export function ClinicsView({
  clinics,
  campaigns,
  onSaveClinic,
  onToggleStatus,
  onSaveCampaign,
  onCampaignStatusChange,
}: ClinicsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Form / Drawer state
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  // Detail modal
  const [viewingClinic, setViewingClinic] = useState<Clinic | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState(BOLIVIAN_CITIES[0]);
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState<number>(-17.3824);
  const [formLongitude, setFormLongitude] = useState<number>(-66.1465);
  const [formPhones, setFormPhones] = useState<string[]>(['+591 ']);
  const [formIsOpen24Hours, setFormIsOpen24Hours] = useState(false);
  const [formEmergencyAvailable, setFormEmergencyAvailable] = useState(true);
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sponsorship drawer target
  const [sponsorshipTarget, setSponsorshipTarget] = useState<Clinic | null>(null);

  // Soft delete confirm modal
  const [confirmClinic, setConfirmClinic] = useState<Clinic | null>(null);

  // Loading skeleton toggle
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Filtered list
  const filteredClinics = useMemo(() => {
    return clinics.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phones.some((phone) => phone.includes(searchQuery));

      const matchCity = cityFilter === 'ALL' || c.city === cityFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchSearch && matchCity && matchStatus;
    });
  }, [clinics, searchQuery, cityFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingClinic(null);
    setFormName('');
    setFormCity(BOLIVIAN_CITIES[0]);
    setFormAddress('');
    setFormLatitude(-17.3824);
    setFormLongitude(-66.1465);
    setFormPhones(['+591 ']);
    setFormIsOpen24Hours(false);
    setFormEmergencyAvailable(true);
    setFormWebsiteUrl('');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleOpenEdit = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormName(clinic.name);
    setFormCity(clinic.city);
    setFormAddress(clinic.address);
    setFormLatitude(clinic.latitude);
    setFormLongitude(clinic.longitude);
    setFormPhones(clinic.phones && clinic.phones.length > 0 ? clinic.phones : ['+591 ']);
    setFormIsOpen24Hours(clinic.isOpen24Hours);
    setFormEmergencyAvailable(clinic.emergencyAvailable ?? true);
    setFormWebsiteUrl(clinic.websiteUrl || '');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formAddress.trim()) {
      setFormError('El nombre y la dirección son obligatorios.');
      return;
    }

    const cleanPhones = formPhones.filter((p) => p.trim() && p.trim() !== '+591');
    if (cleanPhones.length === 0) {
      setFormError('Ingrese al menos un teléfono de contacto.');
      return;
    }

    onSaveClinic({
      id: editingClinic ? editingClinic.id : undefined,
      name: formName.trim(),
      city: formCity,
      address: formAddress.trim(),
      latitude: Number(formLatitude),
      longitude: Number(formLongitude),
      phones: cleanPhones,
      isOpen24Hours: formIsOpen24Hours,
      emergencyAvailable: formEmergencyAvailable,
      websiteUrl: formWebsiteUrl.trim() || undefined,
      status: editingClinic ? editingClinic.status : 'ACTIVE',
    });

    setIsFormDrawerOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!confirmClinic) return;
    const nextStatus = confirmClinic.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onToggleStatus(confirmClinic.id, nextStatus);
    setConfirmClinic(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Clínicas y Hospitales
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredClinics.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Centros médicos, hospitales de tercer nivel y clínicas de especialidad en Bolivia.
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
            <span>Nueva Clínica / Hospital</span>
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

      {/* Main Table or Loading */}
      {isSimulatedLoading ? (
        <SkeletonTable rows={4} cols={7} />
      ) : filteredClinics.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No se encontraron clínicas"
          description="No hay clínicas u hospitales que coincidan con la búsqueda."
          actionLabel="Registrar Centro Médico"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Centro Médico</th>
                  <th className="py-3 px-4">Ciudad</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4">Teléfonos</th>
                  <th className="py-3 px-4">Guardia / Emergencia</th>
                  <th className="py-3 px-4">Patrocinio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {clinic.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {clinic.city}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={clinic.address}>
                      {clinic.address}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {clinic.phones.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {clinic.isOpen24Hours ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            24 Horas
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Diurno</span>
                        )}
                        {clinic.emergencyAvailable && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Urgencias
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {clinic.activeSponsorshipTier ? (
                        <SponsorshipTierBadge tier={clinic.activeSponsorshipTier} />
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin patrocinio</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={clinic.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSponsorshipTarget(clinic)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Patrocinios</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingClinic(clinic)}
                          title="Ver detalle de centro médico"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(clinic)}
                          title="Editar clínica"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClinic(clinic)}
                          title={clinic.status === 'ACTIVE' ? 'Desactivar clínica' : 'Restaurar clínica'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            clinic.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {clinic.status === 'ACTIVE' ? (
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

          {/* Mobile Cards */}
          <div className="xl:hidden divide-y divide-slate-100">
            {filteredClinics.map((clinic) => (
              <div key={clinic.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{clinic.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{clinic.city}</span> · <span>{clinic.address}</span>
                    </p>
                  </div>
                  <StatusBadge status={clinic.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {clinic.isOpen24Hours && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      24 Horas
                    </span>
                  )}
                  {clinic.emergencyAvailable && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Urgencias
                    </span>
                  )}
                  {clinic.activeSponsorshipTier && (
                    <SponsorshipTierBadge tier={clinic.activeSponsorshipTier} />
                  )}
                </div>

                <div className="text-xs font-mono text-slate-600">
                  Tel: {clinic.phones.join(', ')}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSponsorshipTarget(clinic)}
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Patrocinios</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingClinic(clinic)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(clinic)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClinic(clinic)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                        clinic.status === 'ACTIVE'
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {clinic.status === 'ACTIVE' ? 'Desactivar' : 'Restaurar'}
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
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingClinic ? 'Editar Centro Médico' : 'Nueva Clínica u Hospital'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Datos institucionales y teléfonos de emergencias
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

            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre de la clínica / hospital *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Clínica del Sur"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciudad *
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Dirección completa *
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Av. Aniceto Arce #0440, Zona Muyurina"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

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

              <PhoneInputList phones={formPhones} onChange={setFormPhones} />

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Disponibilidad de Guardia y Urgencias
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
                      checked={formEmergencyAvailable}
                      onChange={(e) => setFormEmergencyAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Servicio de Urgencias Médicas
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Sitio Web Oficial
                </label>
                <input
                  type="url"
                  value={formWebsiteUrl}
                  onChange={(e) => setFormWebsiteUrl(e.target.value)}
                  placeholder="https://hospitalviedma.gob.bo"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

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
                  {editingClinic ? 'Guardar Cambios' : 'Registrar Centro Médico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingClinic && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{viewingClinic.name}</h3>
                  <div className="text-xs text-slate-500">{viewingClinic.city}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingClinic(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado en Nexa Salud:</span>
                <StatusBadge status={viewingClinic.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Patrocinio comercial:</span>
                <SponsorshipTierBadge tier={viewingClinic.activeSponsorshipTier} />
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Dirección:</span>
                <span className="font-medium text-slate-800 text-right max-w-xs">
                  {viewingClinic.address}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Coordenadas GPS:</span>
                <span className="font-mono text-slate-700">
                  {viewingClinic.latitude}, {viewingClinic.longitude}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Teléfonos:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {viewingClinic.phones.join(' / ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Horario de guardia:</span>
                <span className="font-semibold text-slate-800">
                  {viewingClinic.isOpen24Hours ? '24 Horas continuo' : 'Diurno habitual'}
                </span>
              </div>
              {viewingClinic.websiteUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Web institucional:</span>
                  <a
                    href={viewingClinic.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sky-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{viewingClinic.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingClinic(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Sponsorship Drawer for this Clinic */}
      {sponsorshipTarget && (
        <SponsorshipDrawer
          isOpen={true}
          onClose={() => setSponsorshipTarget(null)}
          targetId={sponsorshipTarget.id}
          targetName={sponsorshipTarget.name}
          targetType="clinic"
          campaigns={campaigns}
          onSaveCampaign={onSaveCampaign}
          onStatusChange={onCampaignStatusChange}
        />
      )}

      {/* Confirmation Modal */}
      {confirmClinic && (
        <ConfirmModal
          isOpen={true}
          title={
            confirmClinic.status === 'ACTIVE'
              ? '¿Desactivar centro médico?'
              : '¿Restaurar centro médico?'
          }
          message={
            confirmClinic.status === 'ACTIVE'
              ? `El centro "${confirmClinic.name}" (${confirmClinic.city}) será dado de baja temporalmente en la aplicación móvil.`
              : `Se restaurará la visibilidad de "${confirmClinic.name}" en la red de clínicas de Nexa Salud.`
          }
          confirmLabel={confirmClinic.status === 'ACTIVE' ? 'Desactivar centro' : 'Restaurar centro'}
          variant={confirmClinic.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggleStatus}
          onClose={() => setConfirmClinic(null)}
        />
      )}
    </div>
  );
}
