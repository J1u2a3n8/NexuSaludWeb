import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  CheckCircle2,
  Ban,
  Calendar,
  X,
  AlertCircle,
  ArrowRight,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  SponsorshipCampaign,
  SponsorshipTier,
  SponsorshipStatus,
  DirectoryType,
  Pharmacy,
  Clinic,
  Doctor,
  AmbulanceCompany,
} from '../types';
import {
  CampaignStatusBadge,
  SponsorshipTierBadge,
  Badge,
} from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface SponsorshipsViewProps {
  campaigns: SponsorshipCampaign[];
  pharmacies: Pharmacy[];
  clinics: Clinic[];
  doctors: Doctor[];
  ambulanceCompanies: AmbulanceCompany[];
  onSaveCampaign: (data: Partial<SponsorshipCampaign> & { id?: string }) => void;
  onStatusChange: (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => void;
}

export function SponsorshipsView({
  campaigns,
  pharmacies,
  clinics,
  doctors,
  ambulanceCompanies,
  onSaveCampaign,
  onStatusChange,
}: SponsorshipsViewProps) {
  const [searchEntity, setSearchEntity] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | DirectoryType>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | SponsorshipTier>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SponsorshipStatus>('ALL');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SponsorshipCampaign | null>(null);

  // Detail view modal
  const [viewingCampaign, setViewingCampaign] = useState<SponsorshipCampaign | null>(null);

  // Form inputs
  const [formTargetType, setFormTargetType] = useState<DirectoryType>('pharmacy');
  const [formTargetId, setFormTargetId] = useState<string>('');
  const [formTier, setFormTier] = useState<SponsorshipTier>('FEATURED');
  const [formPriority, setFormPriority] = useState<number>(8);
  const [formAmountBob, setFormAmountBob] = useState<number>(3000);
  const [formStartsAt, setFormStartsAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formEndsAt, setFormEndsAt] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Cancel campaign confirmation modal
  const [cancelTargetCampaign, setCancelTargetCampaign] = useState<SponsorshipCampaign | null>(null);

  // Loading skeleton toggle
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Directory type labels
  const directoryLabels: Record<DirectoryType, string> = {
    pharmacy: 'Farmacia',
    clinic: 'Clínica / Hospital',
    doctor: 'Doctor',
    'ambulance-company': 'Compañía de ambulancias',
  };

  // Get eligible targets based on formTargetType
  const availableTargets = useMemo(() => {
    switch (formTargetType) {
      case 'pharmacy':
        return pharmacies.map((p) => ({ id: p.id, name: p.name, city: p.city }));
      case 'clinic':
        return clinics.map((c) => ({ id: c.id, name: c.name, city: c.city }));
      case 'doctor':
        return doctors.map((d) => ({
          id: d.id,
          name: `Dr(a). ${d.firstName} ${d.lastName}`,
          city: d.city,
        }));
      case 'ambulance-company':
        return ambulanceCompanies.map((a) => ({ id: a.id, name: a.name, city: a.city }));
      default:
        return [];
    }
  }, [formTargetType, pharmacies, clinics, doctors, ambulanceCompanies]);

  // Aggregate revenue stats
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
  const totalActiveRevenueBob = activeCampaigns.reduce((sum, c) => sum + c.amountBob, 0);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        c.targetName.toLowerCase().includes(searchEntity.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(searchEntity.toLowerCase()));

      const matchType = typeFilter === 'ALL' || c.targetType === typeFilter;
      const matchTier = tierFilter === 'ALL' || c.tier === tierFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchSearch && matchType && matchTier && matchStatus;
    });
  }, [campaigns, searchEntity, typeFilter, tierFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormTargetType('pharmacy');
    setFormTargetId(pharmacies.length > 0 ? pharmacies[0].id : '');
    setFormTier('FEATURED');
    setFormPriority(8);
    setFormAmountBob(3000);
    setFormStartsAt(new Date().toISOString().split('T')[0]);
    setFormEndsAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (camp: SponsorshipCampaign) => {
    setEditingCampaign(camp);
    setFormTargetType(camp.targetType);
    setFormTargetId(camp.targetId);
    setFormTier(camp.tier);
    setFormPriority(camp.priority);
    setFormAmountBob(camp.amountBob);
    setFormStartsAt(camp.startsAt);
    setFormEndsAt(camp.endsAt);
    setFormNotes(camp.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (new Date(formEndsAt) <= new Date(formStartsAt)) {
      setFormError('La fecha de fin debe ser estrictamente posterior a la fecha de inicio.');
      return;
    }

    if (formAmountBob <= 0) {
      setFormError('El monto de la campaña debe ser mayor a 0 BOB.');
      return;
    }

    // Resolve target name
    const foundTarget = availableTargets.find((t) => t.id === formTargetId);
    const targetName = foundTarget ? foundTarget.name : editingCampaign ? editingCampaign.targetName : 'Entidad';

    onSaveCampaign({
      id: editingCampaign ? editingCampaign.id : undefined,
      targetId: formTargetId,
      targetName,
      targetType: formTargetType,
      tier: formTier,
      priority: Number(formPriority),
      amountBob: Number(formAmountBob),
      startsAt: formStartsAt,
      endsAt: formEndsAt,
      notes: formNotes.trim() || undefined,
      status: editingCampaign ? editingCampaign.status : 'ACTIVE',
    });

    setIsModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!cancelTargetCampaign) return;
    onStatusChange(cancelTargetCampaign.id, 'CANCELLED');
    setCancelTargetCampaign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Campañas de Patrocinio Globales
            </h1>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {filteredCampaigns.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Vista unificada de acuerdos comerciales y posicionamiento destacado en la app móvil.
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
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Revenue & Tier Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Activo Facturado
          </span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
            Bs. {totalActiveRevenueBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {activeCampaigns.length} campañas activas en producción
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Distribución por Nivel
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
              {campaigns.filter((c) => c.tier === 'PREMIUM').length} Premium
            </span>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              {campaigns.filter((c) => c.tier === 'FEATURED').length} Destacadas
            </span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {campaigns.filter((c) => c.tier === 'BASIC').length} Básicas
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Política de Auditoría
          </span>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Por trazabilidad contable, las campañas <strong>nunca se eliminan</strong>; únicamente
            pueden ser activadas, modificadas o canceladas.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchEntity}
            onChange={(e) => setSearchEntity(e.target.value)}
            placeholder="Buscar por entidad o notas de campaña..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:outline-hidden focus:border-sky-500"
          />
          {searchEntity && (
            <button
              onClick={() => setSearchEntity('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Directory Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Directorio:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | DirectoryType)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">Todos los directorios</option>
            <option value="pharmacy">Farmacia</option>
            <option value="clinic">Clínica / Hospital</option>
            <option value="doctor">Doctor</option>
            <option value="ambulance-company">Compañía de ambulancias</option>
          </select>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Nivel:
          </span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'ALL' | SponsorshipTier)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">Todos</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="FEATURED">DESTACADO</option>
            <option value="BASIC">BÁSICO</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Estado:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | SponsorshipStatus)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">ACTIVE (Activo)</option>
            <option value="PENDING">PENDING (Pendiente)</option>
            <option value="CANCELLED">CANCELLED (Cancelado)</option>
            <option value="EXPIRED">EXPIRED (Vencido)</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading */}
      {isSimulatedLoading ? (
        <SkeletonTable rows={5} cols={8} />
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No se encontraron campañas"
          description="Ajuste los filtros o active una nueva campaña de patrocinio."
          actionLabel="Crear Campaña"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Entidad Patrocinada</th>
                  <th className="py-3 px-4">Directorio</th>
                  <th className="py-3 px-4">Nivel (Tier)</th>
                  <th className="py-3 px-4">Prioridad</th>
                  <th className="py-3 px-4">Inversión (BOB)</th>
                  <th className="py-3 px-4">Vigencia (Inicio → Fin)</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{camp.targetName}</div>
                      {camp.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs" title={camp.notes}>
                          {camp.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {directoryLabels[camp.targetType]}
                    </td>
                    <td className="py-3.5 px-4">
                      <SponsorshipTierBadge tier={camp.tier} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      #{camp.priority}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      Bs. {camp.amountBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      <span className="text-slate-800">{camp.startsAt}</span>
                      <span className="text-slate-300 mx-1">→</span>
                      <span className="text-slate-800">{camp.endsAt}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <CampaignStatusBadge status={camp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingCampaign(camp)}
                          title="Ver detalle de campaña"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(camp)}
                          title="Editar campaña"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {camp.status !== 'ACTIVE' && camp.status !== 'EXPIRED' && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(camp.id, 'ACTIVE')}
                            title="Activar campaña"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {camp.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => setCancelTargetCampaign(camp)}
                            title="Cancelar campaña"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="xl:hidden divide-y divide-slate-100">
            {filteredCampaigns.map((camp) => (
              <div key={camp.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{camp.targetName}</h3>
                    <div className="text-xs text-slate-500">{directoryLabels[camp.targetType]}</div>
                  </div>
                  <CampaignStatusBadge status={camp.status} />
                </div>

                <div className="flex items-center gap-2">
                  <SponsorshipTierBadge tier={camp.tier} />
                  <span className="text-xs font-mono text-slate-500">Prio: {camp.priority}</span>
                  <span className="text-slate-300">·</span>
                  <div className="font-mono text-xs font-bold text-slate-900">
                    Bs. {camp.amountBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{camp.startsAt} al {camp.endsAt}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingCampaign(camp)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Ver detalle
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(camp)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Editar
                    </button>

                    {camp.status !== 'ACTIVE' && camp.status !== 'EXPIRED' && (
                      <button
                        type="button"
                        onClick={() => onStatusChange(camp.id, 'ACTIVE')}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
                      >
                        Activar
                      </button>
                    )}

                    {camp.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => setCancelTargetCampaign(camp)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit Campaign Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingCampaign ? 'Modificar Campaña' : 'Nueva Campaña de Patrocinio'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Posicionamiento destacado en app móvil Nexa Salud
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 my-4">
              {/* Directory Type & Target Selector */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Directorio Médico *
                  </label>
                  <select
                    value={formTargetType}
                    disabled={!!editingCampaign}
                    onChange={(e) => {
                      const newType = e.target.value as DirectoryType;
                      setFormTargetType(newType);
                      // Reset target ID to first item in new type
                      if (newType === 'pharmacy') setFormTargetId(pharmacies[0]?.id || '');
                      if (newType === 'clinic') setFormTargetId(clinics[0]?.id || '');
                      if (newType === 'doctor') setFormTargetId(doctors[0]?.id || '');
                      if (newType === 'ambulance-company') setFormTargetId(ambulanceCompanies[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500 font-semibold"
                  >
                    <option value="pharmacy">Farmacia</option>
                    <option value="clinic">Clínica / Hospital</option>
                    <option value="doctor">Doctor Especialista</option>
                    <option value="ambulance-company">Compañía de Ambulancias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Entidad a Destacar *
                  </label>
                  <select
                    value={formTargetId}
                    disabled={!!editingCampaign}
                    onChange={(e) => setFormTargetId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-sky-500 font-semibold"
                  >
                    {availableTargets.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tier selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nivel de Patrocinio (Tier)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BASIC', 'FEATURED', 'PREMIUM'] as SponsorshipTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormTier(t)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        formTier === t
                          ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'PREMIUM' ? 'PREMIUM' : t === 'FEATURED' ? 'DESTACADO' : 'BÁSICO'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Prioridad (1 - 10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formPriority}
                    onChange={(e) => setFormPriority(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Monto (BOB / Bs.)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={formAmountBob}
                    onChange={(e) => setFormAmountBob(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notas del Acuerdo
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles sobre el contrato, comprobante bancario o condiciones especiales..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingCampaign ? 'Guardar Cambios' : 'Activar Campaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingCampaign && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {viewingCampaign.targetName}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {directoryLabels[viewingCampaign.targetType]}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingCampaign(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nivel de visibilidad:</span>
                <SponsorshipTierBadge tier={viewingCampaign.tier} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado de campaña:</span>
                <CampaignStatusBadge status={viewingCampaign.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Prioridad algorítmica:</span>
                <span className="font-mono font-bold text-slate-800">
                  Nivel #{viewingCampaign.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Inversión mensual pactada:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Bs. {viewingCampaign.amountBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vigencia:</span>
                <span className="font-mono text-slate-800">
                  {viewingCampaign.startsAt} hasta {viewingCampaign.endsAt}
                </span>
              </div>
              {viewingCampaign.notes && (
                <div>
                  <span className="text-slate-500 block mb-1">Observaciones:</span>
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                    {viewingCampaign.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingCampaign(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancel */}
      {cancelTargetCampaign && (
        <ConfirmModal
          isOpen={true}
          title="¿Cancelar campaña de patrocinio?"
          message={`La campaña de "${cancelTargetCampaign.targetName}" pasará a estado CANCELADO y dejará de recibir prioridad en los resultados de búsqueda de la app.`}
          confirmLabel="Cancelar Campaña"
          variant="danger"
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTargetCampaign(null)}
        />
      )}
    </div>
  );
}
