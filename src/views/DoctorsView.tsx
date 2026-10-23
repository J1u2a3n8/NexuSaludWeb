import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
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
  Building2,
  Award,
} from 'lucide-react';
import {
  Doctor,
  Specialty,
  Clinic,
  BOLIVIAN_CITIES,
  SponsorshipCampaign,
} from '../types';
import {
  StatusBadge,
  SponsorshipTierBadge,
} from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PhoneInputList } from '../components/common/PhoneInputList';
import { SponsorshipDrawer } from '../components/sponsorship/SponsorshipDrawer';

interface DoctorsViewProps {
  doctors: Doctor[];
  specialties: Specialty[];
  clinics: Clinic[];
  campaigns: SponsorshipCampaign[];
  onSaveDoctor: (data: Partial<Doctor> & { id?: string }) => void;
  onToggleStatus: (id: string, newStatus: 'ACTIVE' | 'INACTIVE') => void;
  onSaveCampaign: (data: Partial<SponsorshipCampaign> & { id?: string }) => void;
  onCampaignStatusChange: (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => void;
}

export function DoctorsView({
  doctors,
  specialties,
  clinics,
  campaigns,
  onSaveDoctor,
  onToggleStatus,
  onSaveCampaign,
  onCampaignStatusChange,
}: DoctorsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Drawer / Form state
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Detail modal state
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  // Form inputs
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formCity, setFormCity] = useState(BOLIVIAN_CITIES[0]);
  const [formPhones, setFormPhones] = useState<string[]>(['+591 ']);
  const [formSpecialtyIds, setFormSpecialtyIds] = useState<string[]>([]);
  const [formClinicIds, setFormClinicIds] = useState<string[]>([]);
  const [formLicenseNumber, setFormLicenseNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sponsorship drawer target
  const [sponsorshipTarget, setSponsorshipTarget] = useState<Doctor | null>(null);

  // Soft delete confirm modal
  const [confirmDoctor, setConfirmDoctor] = useState<Doctor | null>(null);

  // Loading skeleton toggle
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Helpers to lookup names
  const getSpecialtyName = (id: string) => specialties.find((s) => s.id === id)?.name || id;
  const getClinicName = (id: string) => clinics.find((c) => c.id === id)?.name || id;

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        doc.phones.some((p) => p.includes(searchQuery)) ||
        (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCity = cityFilter === 'ALL' || doc.city === cityFilter;
      const matchSpecialty =
        specialtyFilter === 'ALL' || doc.specialtyIds.includes(specialtyFilter);
      const matchStatus = statusFilter === 'ALL' || doc.status === statusFilter;

      return matchSearch && matchCity && matchSpecialty && matchStatus;
    });
  }, [doctors, searchQuery, cityFilter, specialtyFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFormFirstName('');
    setFormLastName('');
    setFormCity(BOLIVIAN_CITIES[0]);
    setFormPhones(['+591 ']);
    setFormSpecialtyIds(specialties.length > 0 ? [specialties[0].id] : []);
    setFormClinicIds(clinics.length > 0 ? [clinics[0].id] : []);
    setFormLicenseNumber('MS-CBBA-');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormFirstName(doc.firstName);
    setFormLastName(doc.lastName);
    setFormCity(doc.city);
    setFormPhones(doc.phones && doc.phones.length > 0 ? doc.phones : ['+591 ']);
    setFormSpecialtyIds(doc.specialtyIds);
    setFormClinicIds(doc.clinicIds);
    setFormLicenseNumber(doc.licenseNumber || '');
    setFormError(null);
    setIsFormDrawerOpen(true);
  };

  const handleToggleSpecialty = (specId: string) => {
    setFormSpecialtyIds((prev) =>
      prev.includes(specId) ? prev.filter((id) => id !== specId) : [...prev, specId]
    );
  };

  const handleToggleClinic = (clinicId: string) => {
    setFormClinicIds((prev) =>
      prev.includes(clinicId) ? prev.filter((id) => id !== clinicId) : [...prev, clinicId]
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formFirstName.trim() || !formLastName.trim()) {
      setFormError('Los nombres y apellidos son requeridos.');
      return;
    }

    if (formSpecialtyIds.length === 0) {
      setFormError('Seleccione al menos una especialidad médica.');
      return;
    }

    const cleanPhones = formPhones.filter((p) => p.trim() && p.trim() !== '+591');
    if (cleanPhones.length === 0) {
      setFormError('Ingrese al menos un teléfono de contacto.');
      return;
    }

    onSaveDoctor({
      id: editingDoctor ? editingDoctor.id : undefined,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      city: formCity,
      phones: cleanPhones,
      specialtyIds: formSpecialtyIds,
      clinicIds: formClinicIds,
      licenseNumber: formLicenseNumber.trim() || undefined,
      status: editingDoctor ? editingDoctor.status : 'ACTIVE',
    });

    setIsFormDrawerOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!confirmDoctor) return;
    const nextStatus = confirmDoctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onToggleStatus(confirmDoctor.id, nextStatus);
    setConfirmDoctor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Doctores y Especialistas
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredDoctors.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Médicos colegiados, especialidades asociadas, asignación a centros de salud y patrocinios.
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
            <span>Nuevo Doctor</span>
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
            placeholder="Buscar por nombre, matrícula o teléfono..."
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

        {/* Specialty Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Especialidad:
          </span>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500 max-w-[160px]"
          >
            <option value="ALL">Todas</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
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
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading */}
      {isSimulatedLoading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No se encontraron doctores"
          description="Ajuste los criterios de especialidad o registre un nuevo profesional."
          actionLabel="Registrar Doctor"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Doctor / Profesional</th>
                  <th className="py-3 px-4">Ciudad</th>
                  <th className="py-3 px-4">Especialidades</th>
                  <th className="py-3 px-4">Clínicas / Hospitales</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Patrocinio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => {
                  const fullName = `Dr(a). ${doc.firstName} ${doc.lastName}`;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{fullName}</div>
                        {doc.licenseNumber && (
                          <div className="text-[11px] font-mono text-slate-400">
                            Matrícula: {doc.licenseNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {doc.city}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {doc.specialtyIds.map((sid) => (
                            <span
                              key={sid}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-100"
                            >
                              {getSpecialtyName(sid)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 max-w-xs truncate">
                          {doc.clinicIds.map((cid) => getClinicName(cid)).join(', ') || 'Consultorio privado'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {doc.phones.join(', ')}
                      </td>
                      <td className="py-3.5 px-4">
                        {doc.activeSponsorshipTier ? (
                          <SponsorshipTierBadge tier={doc.activeSponsorshipTier} />
                        ) : (
                          <span className="text-[11px] text-slate-400">Estándar</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSponsorshipTarget({
                                ...doc,
                                firstName: fullName,
                                lastName: '',
                              })
                            }
                            className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Patrocinios</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingDoctor(doc)}
                            title="Ver detalles"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(doc)}
                            title="Editar doctor"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDoctor(doc)}
                            title={doc.status === 'ACTIVE' ? 'Desactivar doctor' : 'Restaurar doctor'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              doc.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {doc.status === 'ACTIVE' ? (
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
            {filteredDoctors.map((doc) => {
              const fullName = `Dr(a). ${doc.firstName} ${doc.lastName}`;
              return (
                <div key={doc.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{fullName}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{doc.city}</span>
                        {doc.licenseNumber && <span>· Matrícula: {doc.licenseNumber}</span>}
                      </div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {doc.specialtyIds.map((sid) => (
                      <span
                        key={sid}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-100"
                      >
                        {getSpecialtyName(sid)}
                      </span>
                    ))}
                    {doc.activeSponsorshipTier && (
                      <SponsorshipTierBadge tier={doc.activeSponsorshipTier} />
                    )}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Clínicas: </span>
                    {doc.clinicIds.map((cid) => getClinicName(cid)).join(', ') || 'Particular'}
                  </div>

                  <div className="text-xs font-mono text-slate-600">
                    Tel: {doc.phones.join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSponsorshipTarget({
                          ...doc,
                          firstName: fullName,
                          lastName: '',
                        })
                      }
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Patrocinios</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(doc)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDoctor(doc)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                          doc.status === 'ACTIVE'
                            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {doc.status === 'ACTIVE' ? 'Desactivar' : 'Restaurar'}
                      </button>
                    </div>
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
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingDoctor ? 'Editar Doctor' : 'Nuevo Doctor Especialista'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Especialidades médicas y asignación hospitalaria
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

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Ej. Ana Lucía"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Ej. Vargas Soto"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* City & License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ciudad de atención *
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Matrícula Profesional (MS / Sedes)
                  </label>
                  <input
                    type="text"
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    placeholder="MS-CBBA-4821"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Specialties Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Especialidades Médicas * (Seleccione una o más)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  {specialties.map((spec) => {
                    const isChecked = formSpecialtyIds.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSpecialty(spec.id)}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                        />
                        <span>{spec.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Clinics Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Clínicas y Hospitales Vinculados (Opcional)
                </label>
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  {clinics.map((clinic) => {
                    const isChecked = formClinicIds.includes(clinic.id);
                    return (
                      <label
                        key={clinic.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleClinic(clinic.id)}
                            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                          />
                          <span>{clinic.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{clinic.city}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <PhoneInputList phones={formPhones} onChange={setFormPhones} />

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
                  {editingDoctor ? 'Guardar Cambios' : 'Registrar Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingDoctor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Dr(a). {viewingDoctor.firstName} {viewingDoctor.lastName}
                  </h3>
                  <div className="text-xs text-slate-500">{viewingDoctor.city}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado en directorio:</span>
                <StatusBadge status={viewingDoctor.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Patrocinio activo:</span>
                <SponsorshipTierBadge tier={viewingDoctor.activeSponsorshipTier} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Matrícula médica:</span>
                <span className="font-mono font-medium text-slate-800">
                  {viewingDoctor.licenseNumber || 'En trámite de registro'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Especialidades clínicas:</span>
                <div className="flex flex-wrap gap-1">
                  {viewingDoctor.specialtyIds.map((sid) => (
                    <span
                      key={sid}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-100"
                    >
                      {getSpecialtyName(sid)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Hospitales y clínicas asociados:</span>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 text-xs">
                  {viewingDoctor.clinicIds.length > 0
                    ? viewingDoctor.clinicIds.map((cid) => getClinicName(cid)).join(', ')
                    : 'Consultorio particular independiente'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Teléfonos de contacto:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {viewingDoctor.phones.join(' / ')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Sponsorship Drawer for this Doctor */}
      {sponsorshipTarget && (
        <SponsorshipDrawer
          isOpen={true}
          onClose={() => setSponsorshipTarget(null)}
          targetId={sponsorshipTarget.id}
          targetName={`${sponsorshipTarget.firstName} ${sponsorshipTarget.lastName}`.trim()}
          targetType="doctor"
          campaigns={campaigns}
          onSaveCampaign={onSaveCampaign}
          onStatusChange={onCampaignStatusChange}
        />
      )}

      {/* Confirmation Modal */}
      {confirmDoctor && (
        <ConfirmModal
          isOpen={true}
          title={
            confirmDoctor.status === 'ACTIVE'
              ? '¿Desactivar doctor del directorio?'
              : '¿Restaurar doctor al directorio?'
          }
          message={
            confirmDoctor.status === 'ACTIVE'
              ? `El perfil de Dr(a). ${confirmDoctor.firstName} ${confirmDoctor.lastName} no aparecerá en las búsquedas médicas de los pacientes.`
              : `Se restaurará la presencia de Dr(a). ${confirmDoctor.firstName} ${confirmDoctor.lastName} en la app móvil.`
          }
          confirmLabel={confirmDoctor.status === 'ACTIVE' ? 'Desactivar perfil' : 'Restaurar perfil'}
          variant={confirmDoctor.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggleStatus}
          onClose={() => setConfirmDoctor(null)}
        />
      )}
    </div>
  );
}
