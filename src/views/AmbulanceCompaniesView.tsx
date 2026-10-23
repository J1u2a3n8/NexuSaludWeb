import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Pencil,
  Power,
  RotateCcw,
  Sparkles,
  Eye,
  X,
  MapPin,
} from 'lucide-react';
import { AmbulanceCompany, BOLIVIAN_CITIES, SponsorshipCampaign } from '../types';
import {
  StatusBadge,
  SponsorshipTierBadge,
} from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PhoneInputList } from '../components/common/PhoneInputList';
import { SponsorshipDrawer } from '../components/sponsorship/SponsorshipDrawer';

interface AmbulanceCompaniesViewProps {
  companies: AmbulanceCompany[];
  campaigns: SponsorshipCampaign[];
  onSaveCompany: (data: Partial<AmbulanceCompany> & { id?: string }) => void;
  onToggleStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  onSaveCampaign: (data: Partial<SponsorshipCampaign> & { id?: string }) => void;
  onCampaignStatusChange: (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => void;
}

export function AmbulanceCompaniesView({
  companies,
  campaigns,
  onSaveCompany,
  onToggleStatus,
  onSaveCampaign,
  onCampaignStatusChange,
}: AmbulanceCompaniesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Drawer / Form state
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AmbulanceCompany | null>(null);

  // Detail modal state
  const [viewingCompany, setViewingCompany] = useState<AmbulanceCompany | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState(BOLIVIAN_CITIES[0]);
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState<number>(-17.3912);
  const [formLongitude, setFormLongitude] = useState<number>(-66.1785);
  const [formPhones, setFormPhones] = useState<string[]>(['+591 ']);
  const [formError, setFormError] = useState<string | null>(null);

  // Sponsorship drawer target
  const [sponsorshipTarget, setSponsorshipTarget] = useState<AmbulanceCompany | null>(null);

  // Soft delete confirm modal
  const [confirmCompany, setConfirmCompany] = useState<AmbulanceCompany | null>(null);

  // Loading skeleton toggle
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      const matchSearch =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.phones.some((p) => p.includes(searchQuery));

      const matchCity = cityFilter === 'ALL' || comp.city === cityFilter;
      const matchStatus = statusFilter === 'ALL' || comp.status === statusFilter;

      return matchSearch && matchCity && matchStatus;
    });
  }, [companies, searchQuery, cityFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormName('');
    setFormCity(BOLIVIAN_CITIES[0]);
    setFormAddress('');
    setFormLatitude(-17.3912);
    setFormLongitude(-66.1785);
    setFormPhones(['+591 ']);
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleOpenEdit = (comp: AmbulanceCompany) => {
    setEditingCompany(comp);
    setFormName(comp.name);
    setFormCity(comp.city);
    setFormAddress(comp.address);
    setFormLatitude(comp.latitude);
    setFormLongitude(comp.longitude);
    setFormPhones(comp.phones && comp.phones.length > 0 ? comp.phones : ['+591 ']);
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
      setFormError('Ingrese al menos un teléfono de emergencias.');
      return;
    }

    onSaveCompany({
      id: editingCompany ? editingCompany.id : undefined,
      name: formName.trim(),
      city: formCity,
      address: formAddress.trim(),
      latitude: Number(formLatitude),
      longitude: Number(formLongitude),
      phones: cleanPhones,
      status: editingCompany ? editingCompany.status : 'ACTIVE',
    });

    setIsFormDrawerOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!confirmCompany) return;
    const nextStatus = confirmCompany.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onToggleStatus(confirmCompany.id, nextStatus);
    setConfirmCompany(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Compañías de Ambulancias
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredCompanies.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Empresas prestadoras de servicios de transporte sanitario, terapia intensiva móvil y auxilio.
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
            <span>Nueva Compañía</span>
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
            placeholder="Buscar por empresa, base de operaciones o teléfono..."
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
        <SkeletonTable rows={3} cols={6} />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No se encontraron compañías"
          description="No existen empresas registradas que coincidan con la búsqueda."
          actionLabel="Registrar Compañía"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Compañía de Emergencias</th>
                  <th className="py-3 px-4">Ciudad Base</th>
                  <th className="py-3 px-4">Dirección Base</th>
                  <th className="py-3 px-4">Líneas de Despacho</th>
                  <th className="py-3 px-4">Patrocinio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {comp.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {comp.city}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={comp.address}>
                      {comp.address}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {comp.phones.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      {comp.activeSponsorshipTier ? (
                        <SponsorshipTierBadge tier={comp.activeSponsorshipTier} />
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin patrocinio</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={comp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSponsorshipTarget(comp)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Patrocinios</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingCompany(comp)}
                          title="Ver detalle"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(comp)}
                          title="Editar compañía"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCompany(comp)}
                          title={comp.status === 'ACTIVE' ? 'Desactivar compañía' : 'Restaurar compañía'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            comp.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {comp.status === 'ACTIVE' ? (
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
            {filteredCompanies.map((comp) => (
              <div key={comp.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{comp.city}</span> · <span>{comp.address}</span>
                    </p>
                  </div>
                  <StatusBadge status={comp.status} />
                </div>

                {comp.activeSponsorshipTier && (
                  <div>
                    <SponsorshipTierBadge tier={comp.activeSponsorshipTier} />
                  </div>
                )}

                <div className="text-xs font-mono text-slate-600">
                  Despacho SOS: {comp.phones.join(', ')}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSponsorshipTarget(comp)}
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Patrocinios</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingCompany(comp)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(comp)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCompany(comp)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                        comp.status === 'ACTIVE'
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {comp.status === 'ACTIVE' ? 'Desactivar' : 'Restaurar'}
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
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingCompany ? 'Editar Compañía' : 'Nueva Compañía de Ambulancias'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Operador de ambulancias y base de operaciones SOS
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
                    Razón Social / Nombre *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Rescue Medical Ambulancias"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciudad de Operaciones *
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
                  Dirección Base de Operaciones *
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Av. Blanco Galindo Km 2.5"
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

              <PhoneInputList
                phones={formPhones}
                onChange={setFormPhones}
                label="Líneas de despacho de emergencias *"
              />

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
                  {editingCompany ? 'Guardar Cambios' : 'Registrar Compañía'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingCompany && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{viewingCompany.name}</h3>
                  <div className="text-xs text-slate-500">{viewingCompany.city}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingCompany(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado operativo:</span>
                <StatusBadge status={viewingCompany.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Patrocinio en plataforma:</span>
                <SponsorshipTierBadge tier={viewingCompany.activeSponsorshipTier} />
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Base física:</span>
                <span className="font-medium text-slate-800 text-right max-w-xs">
                  {viewingCompany.address}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Coordenadas GPS:</span>
                <span className="font-mono text-slate-700">
                  {viewingCompany.latitude}, {viewingCompany.longitude}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Líneas de emergencia SOS:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {viewingCompany.phones.join(' / ')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingCompany(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Sponsorship Drawer for this Ambulance Company */}
      {sponsorshipTarget && (
        <SponsorshipDrawer
          isOpen={true}
          onClose={() => setSponsorshipTarget(null)}
          targetId={sponsorshipTarget.id}
          targetName={sponsorshipTarget.name}
          targetType="ambulance-company"
          campaigns={campaigns}
          onSaveCampaign={onSaveCampaign}
          onStatusChange={onCampaignStatusChange}
        />
      )}

      {/* Confirmation Modal */}
      {confirmCompany && (
        <ConfirmModal
          isOpen={true}
          title={
            confirmCompany.status === 'ACTIVE'
              ? '¿Desactivar compañía de ambulancias?'
              : '¿Restaurar compañía de ambulancias?'
          }
          message={
            confirmCompany.status === 'ACTIVE'
              ? `La empresa "${confirmCompany.name}" (${confirmCompany.city}) no recibirá despachos SOS desde la app móvil.`
              : `Se restaurarán los despachos para "${confirmCompany.name}".`
          }
          confirmLabel={confirmCompany.status === 'ACTIVE' ? 'Desactivar compañía' : 'Restaurar compañía'}
          variant={confirmCompany.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggleStatus}
          onClose={() => setConfirmCompany(null)}
        />
      )}
    </div>
  );
}
