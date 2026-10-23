import React, { useState, useMemo } from 'react';
import {
  CarFront,
  Plus,
  Search,
  Filter,
  Pencil,
  Power,
  RotateCcw,
  Eye,
  X,
  MapPin,
  Building2,
  Truck,
  Shield,
} from 'lucide-react';
import {
  Ambulance,
  AmbulanceOwnerType,
  AmbulanceCompany,
  Clinic,
  BOLIVIAN_CITIES,
} from '../types';
import { StatusBadge, Badge } from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PhoneInputList } from '../components/common/PhoneInputList';

interface AmbulancesViewProps {
  ambulances: Ambulance[];
  companies: AmbulanceCompany[];
  clinics: Clinic[];
  onSaveAmbulance: (data: Partial<Ambulance> & { id?: string }) => void;
  onToggleStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
}

export function AmbulancesView({
  ambulances,
  companies,
  clinics,
  onSaveAmbulance,
  onToggleStatus,
}: AmbulancesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<'ALL' | AmbulanceOwnerType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Form / Drawer state
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);

  // Detail modal state
  const [viewingAmbulance, setViewingAmbulance] = useState<Ambulance | null>(null);

  // Form inputs
  const [formPlate, setFormPlate] = useState('');
  const [formOwnerType, setFormOwnerType] = useState<AmbulanceOwnerType>('COMPANY');
  const [formCompanyId, setFormCompanyId] = useState<string>('');
  const [formClinicId, setFormClinicId] = useState<string>('');
  const [formCity, setFormCity] = useState(BOLIVIAN_CITIES[0]);
  const [formPhones, setFormPhones] = useState<string[]>(['+591 ']);
  const [formVehicleModel, setFormVehicleModel] = useState('Mercedes-Benz Sprinter');
  const [formEquipmentLevel, setFormEquipmentLevel] = useState<'Básica' | 'Avanzada / UCI' | 'Rescate'>('Avanzada / UCI');
  const [formError, setFormError] = useState<string | null>(null);

  // Soft delete confirm modal
  const [confirmAmbulance, setConfirmAmbulance] = useState<Ambulance | null>(null);

  // Loading skeleton toggle
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Helper to get owner name
  const getOwnerInfo = (amb: Ambulance) => {
    if (amb.ownerType === 'COMPANY') {
      const comp = companies.find((c) => c.id === amb.ambulanceCompanyId);
      return {
        name: comp ? comp.name : 'Compañía Desconocida',
        type: 'Compañía',
      };
    } else {
      const clinic = clinics.find((c) => c.id === amb.clinicId);
      return {
        name: clinic ? clinic.name : 'Clínica Desconocida',
        type: 'Clínica / Hospital',
      };
    }
  };

  // Filtered ambulances
  const filteredAmbulances = useMemo(() => {
    return ambulances.filter((amb) => {
      const ownerInfo = getOwnerInfo(amb);
      const matchSearch =
        amb.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ownerInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amb.phones.some((p) => p.includes(searchQuery));

      const matchCity = cityFilter === 'ALL' || amb.city === cityFilter;
      const matchOwnerType = ownerTypeFilter === 'ALL' || amb.ownerType === ownerTypeFilter;
      const matchStatus = statusFilter === 'ALL' || amb.status === statusFilter;

      return matchSearch && matchCity && matchOwnerType && matchStatus;
    });
  }, [ambulances, searchQuery, cityFilter, ownerTypeFilter, statusFilter, companies, clinics]);

  const handleOpenCreate = () => {
    setEditingAmbulance(null);
    setFormPlate('');
    setFormOwnerType('COMPANY');
    setFormCompanyId(companies.length > 0 ? companies[0].id : '');
    setFormClinicId(clinics.length > 0 ? clinics[0].id : '');
    setFormCity(BOLIVIAN_CITIES[0]);
    setFormPhones(['+591 ']);
    setFormVehicleModel('Mercedes-Benz Sprinter 316 CDI');
    setFormEquipmentLevel('Avanzada / UCI');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleOpenEdit = (amb: Ambulance) => {
    setEditingAmbulance(amb);
    setFormPlate(amb.plate);
    setFormOwnerType(amb.ownerType);
    setFormCompanyId(amb.ambulanceCompanyId || (companies.length > 0 ? companies[0].id : ''));
    setFormClinicId(amb.clinicId || (clinics.length > 0 ? clinics[0].id : ''));
    setFormCity(amb.city);
    setFormPhones(amb.phones && amb.phones.length > 0 ? amb.phones : ['+591 ']);
    setFormVehicleModel(amb.vehicleModel || '');
    setFormEquipmentLevel(amb.equipmentLevel || 'Avanzada / UCI');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formPlate.trim()) {
      setFormError('La placa de circulación es requerida.');
      return;
    }

    if (formOwnerType === 'COMPANY' && !formCompanyId) {
      setFormError('Debe seleccionar una compañía de ambulancias propietaria.');
      return;
    }

    if (formOwnerType === 'CLINIC' && !formClinicId) {
      setFormError('Debe seleccionar una clínica u hospital propietario.');
      return;
    }

    const cleanPhones = formPhones.filter((p) => p.trim() && p.trim() !== '+591');
    if (cleanPhones.length === 0) {
      setFormError('Ingrese al menos un teléfono de contacto para la unidad móvil.');
      return;
    }

    onSaveAmbulance({
      id: editingAmbulance ? editingAmbulance.id : undefined,
      plate: formPlate.trim().toUpperCase(),
      ownerType: formOwnerType,
      ambulanceCompanyId: formOwnerType === 'COMPANY' ? formCompanyId : undefined,
      clinicId: formOwnerType === 'CLINIC' ? formClinicId : undefined,
      city: formCity,
      phones: cleanPhones,
      vehicleModel: formVehicleModel.trim() || undefined,
      equipmentLevel: formEquipmentLevel,
      status: editingAmbulance ? editingAmbulance.status : 'ACTIVE',
    });

    setIsFormDrawerOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!confirmAmbulance) return;
    const nextStatus = confirmAmbulance.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onToggleStatus(confirmAmbulance.id, nextStatus);
    setConfirmAmbulance(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Flota de Ambulancias
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredAmbulances.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Unidades de auxilio registradas por empresa privada o clínica asociada en Bolivia.
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
            <span>Nueva Ambulancia</span>
          </button>
        </div>
      </div>

      {/* Info notice explaining sponsorship policy */}
      <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-sky-600 shrink-0" />
        <span>
          <strong>Regla de plataforma:</strong> Las ambulancias no tienen patrocinios individuales;
          el patrocinio se contrata directamente a través de su entidad propietaria (Compañía o Clínica).
        </span>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa (ej. QRS-789), propietario o teléfono..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:outline-hidden focus:border-sky-500 font-mono"
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

        {/* Owner Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Propietario:
          </span>
          <select
            value={ownerTypeFilter}
            onChange={(e) => setOwnerTypeFilter(e.target.value as 'ALL' | AmbulanceOwnerType)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">Todos</option>
            <option value="COMPANY">Compañía de ambulancias</option>
            <option value="CLINIC">Clínica / Hospital</option>
          </select>
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
            <option value="ACTIVE">Activas</option>
            <option value="INACTIVE">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading */}
      {isSimulatedLoading ? (
        <SkeletonTable rows={4} cols={6} />
      ) : filteredAmbulances.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title="No se encontraron ambulancias"
          description="Verifique los filtros o registre una nueva unidad móvil de auxilio."
          actionLabel="Registrar Ambulancia"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Placa de Rodaje</th>
                  <th className="py-3 px-4">Entidad Propietaria</th>
                  <th className="py-3 px-4">Tipo de Propietario</th>
                  <th className="py-3 px-4">Ciudad</th>
                  <th className="py-3 px-4">Equipamiento</th>
                  <th className="py-3 px-4">Teléfonos Unidad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAmbulances.map((amb) => {
                  const owner = getOwnerInfo(amb);
                  return (
                    <tr key={amb.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-300">
                          {amb.plate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {owner.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            amb.ownerType === 'COMPANY'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {amb.ownerType === 'COMPANY' ? 'Compañía' : 'Hospital / Clínica'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {amb.city}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="text-[11px] font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {amb.equipmentLevel || 'Básica'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {amb.phones.join(', ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={amb.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingAmbulance(amb)}
                            title="Ver detalle"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(amb)}
                            title="Editar ambulancia"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmAmbulance(amb)}
                            title={amb.status === 'ACTIVE' ? 'Desactivar ambulancia' : 'Restaurar ambulancia'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              amb.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {amb.status === 'ACTIVE' ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="xl:hidden divide-y divide-slate-100">
            {filteredAmbulances.map((amb) => {
              const owner = getOwnerInfo(amb);
              return (
                <div key={amb.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-base font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {amb.plate}
                      </span>
                      <div className="text-xs font-semibold text-slate-800 mt-1.5">{owner.name}</div>
                    </div>
                    <StatusBadge status={amb.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Tipo Propietario
                      </span>
                      <span className="font-medium text-slate-700">{owner.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Ciudad
                      </span>
                      <span className="font-medium text-slate-700">{amb.city}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-600">
                    Tel: {amb.phones.join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingAmbulance(amb)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(amb)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAmbulance(amb)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                        amb.status === 'ACTIVE'
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {amb.status === 'ACTIVE' ? 'Desactivar' : 'Restaurar'}
                    </button>
                  </div>
                </div>
              );
            })}
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
                  <CarFront className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingAmbulance ? 'Editar Ambulancia' : 'Registrar Nueva Ambulancia'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Vinculación a empresa o centro médico de Bolivia
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

              {/* Plate and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Placa de rodaje * (Formato Bolivia)
                  </label>
                  <input
                    type="text"
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value.toUpperCase())}
                    placeholder="Ej. QRS-789"
                    required
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciudad de Asignación *
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

              {/* Owner Type Selector */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tipo de Propietario de la Unidad *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormOwnerType('COMPANY')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formOwnerType === 'COMPANY'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-1 text-sky-600" />
                    <div className="text-xs">Compañía Privada</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Empresa de emergencias
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormOwnerType('CLINIC')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formOwnerType === 'CLINIC'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1 text-sky-600" />
                    <div className="text-xs">Clínica / Hospital</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Flota propia de centro médico
                    </div>
                  </button>
                </div>

                {/* Conditional Owner Selection */}
                {formOwnerType === 'COMPANY' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Seleccionar Compañía de Ambulancias *
                    </label>
                    <select
                      value={formCompanyId}
                      onChange={(e) => setFormCompanyId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500"
                    >
                      <option value="">-- Seleccione compañía --</option>
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} ({comp.city})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Seleccionar Clínica u Hospital *
                    </label>
                    <select
                      value={formClinicId}
                      onChange={(e) => setFormClinicId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500"
                    >
                      <option value="">-- Seleccione clínica / hospital --</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name} ({clinic.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Vehicle Model & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Marca y Modelo del Vehículo
                  </label>
                  <input
                    type="text"
                    value={formVehicleModel}
                    onChange={(e) => setFormVehicleModel(e.target.value)}
                    placeholder="Toyota HiAce / Ford Transit"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nivel de Equipamiento
                  </label>
                  <select
                    value={formEquipmentLevel}
                    onChange={(e) =>
                      setFormEquipmentLevel(
                        e.target.value as 'Básica' | 'Avanzada / UCI' | 'Rescate'
                      )
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500 font-medium"
                  >
                    <option value="Básica">Básica (Traslado estándar)</option>
                    <option value="Avanzada / UCI">Avanzada / UCI móvil</option>
                    <option value="Rescate">Rescate / Soporte de trauma</option>
                  </select>
                </div>
              </div>

              <PhoneInputList
                phones={formPhones}
                onChange={setFormPhones}
                label="Teléfonos directos de la unidad / paramédico *"
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
                  {editingAmbulance ? 'Guardar Cambios' : 'Registrar Ambulancia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingAmbulance && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold">
                  {viewingAmbulance.plate}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Placa: {viewingAmbulance.plate}
                  </h3>
                  <div className="text-xs text-slate-500">{viewingAmbulance.city}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingAmbulance(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado de disponibilidad:</span>
                <StatusBadge status={viewingAmbulance.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Entidad Propietaria:</span>
                <span className="font-semibold text-slate-800">
                  {getOwnerInfo(viewingAmbulance).name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tipo de Entidad:</span>
                <span className="font-medium text-slate-700">
                  {getOwnerInfo(viewingAmbulance).type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vehículo / Chasis:</span>
                <span className="font-medium text-slate-800">
                  {viewingAmbulance.vehicleModel || 'No especificado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Equipamiento Médico:</span>
                <span className="font-medium text-slate-800">
                  {viewingAmbulance.equipmentLevel || 'Básica'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Líneas de contacto móvil:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {viewingAmbulance.phones.join(' / ')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingAmbulance(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAmbulance && (
        <ConfirmModal
          isOpen={true}
          title={
            confirmAmbulance.status === 'ACTIVE'
              ? '¿Dar de baja temporal a la unidad?'
              : '¿Restaurar ambulancia a servicio?'
          }
          message={
            confirmAmbulance.status === 'ACTIVE'
              ? `La ambulancia con placa "${confirmAmbulance.plate}" no será asignada a pedidos de emergencia hasta que sea reactivada.`
              : `La ambulancia "${confirmAmbulance.plate}" volverá a estar disponible para llamadas de auxilio en ${confirmAmbulance.city}.`
          }
          confirmLabel={confirmAmbulance.status === 'ACTIVE' ? 'Desactivar unidad' : 'Restaurar unidad'}
          variant={confirmAmbulance.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggleStatus}
          onClose={() => setConfirmAmbulance(null)}
        />
      )}
    </div>
  );
}
