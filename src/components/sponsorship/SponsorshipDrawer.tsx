import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Ban,
  Pencil,
  ArrowRight,
} from 'lucide-react';
import {
  SponsorshipCampaign,
  SponsorshipTier,
  DirectoryType,
} from '../../types';
import {
  CampaignStatusBadge,
  SponsorshipTierBadge,
} from '../common/Badge';

interface SponsorshipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetType: DirectoryType;
  campaigns: SponsorshipCampaign[];
  onSaveCampaign: (campaign: Partial<SponsorshipCampaign> & { id?: string }) => void;
  onStatusChange: (campaignId: string, status: 'ACTIVE' | 'CANCELLED') => void;
}

export function SponsorshipDrawer({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetType,
  campaigns,
  onSaveCampaign,
  onStatusChange,
}: SponsorshipDrawerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // Form state
  const [tier, setTier] = useState<SponsorshipTier>('FEATURED');
  const [priority, setPriority] = useState<number>(7);
  const [amountBob, setAmountBob] = useState<number>(2500);
  const [startsAt, setStartsAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endsAt, setEndsAt] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetTypeLabels: Record<DirectoryType, string> = {
    pharmacy: 'Farmacia',
    clinic: 'Clínica / Hospital',
    doctor: 'Doctor / Profesional',
    'ambulance-company': 'Compañía de ambulancias',
  };

  const entityCampaigns = campaigns.filter((c) => c.targetId === targetId);
  const activeCampaign = entityCampaigns.find((c) => c.status === 'ACTIVE');

  const handleStartCreate = () => {
    setEditingCampaignId(null);
    setTier('FEATURED');
    setPriority(7);
    setAmountBob(2500);
    setStartsAt(new Date().toISOString().split('T')[0]);
    setEndsAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setNotes('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleStartEdit = (camp: SponsorshipCampaign) => {
    setEditingCampaignId(camp.id);
    setTier(camp.tier);
    setPriority(camp.priority);
    setAmountBob(camp.amountBob);
    setStartsAt(camp.startsAt);
    setEndsAt(camp.endsAt);
    setNotes(camp.notes || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }
    if (amountBob <= 0) {
      setFormError('El monto debe ser mayor a 0 BOB.');
      return;
    }

    onSaveCampaign({
      id: editingCampaignId || undefined,
      targetId,
      targetName,
      targetType,
      tier,
      priority,
      amountBob,
      startsAt,
      endsAt,
      notes,
      status: 'ACTIVE',
    });

    setIsFormOpen(false);
    setEditingCampaignId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                Patrocinios & Visibilidad
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{targetTypeLabels[targetType]}</span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-900">{targetName}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar panel de patrocinios"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active summary card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900">Estado del patrocinio</span>
              </div>
              {activeCampaign ? (
                <div className="flex items-center gap-2">
                  <SponsorshipTierBadge tier={activeCampaign.tier} />
                  <CampaignStatusBadge status="ACTIVE" />
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-medium">Sin campaña activa</span>
              )}
            </div>

            {activeCampaign && (
              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500">Inversión contratada:</span>
                  <div className="font-mono font-semibold text-slate-900">
                    Bs. {activeCampaign.amountBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Vigencia:</span>
                  <div className="font-mono text-slate-900">
                    {activeCampaign.startsAt} al {activeCampaign.endsAt}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form toggle / Form */}
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-sky-200 bg-sky-50/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {editingCampaignId ? 'Modificar Campaña' : 'Crear Nueva Campaña'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tier selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nivel de patrocinio (Tier)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BASIC', 'FEATURED', 'PREMIUM'] as SponsorshipTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        tier === t
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridad (1 a 10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto (BOB / Bs.)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-slate-400">
                      Bs.
                    </span>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={amountBob}
                      onChange={(e) => setAmountBob(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-sky-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de campaña (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles sobre el acuerdo, posición en la app móvil o condiciones especiales..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingCampaignId ? 'Guardar Cambios' : 'Activar Campaña'}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={handleStartCreate}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-sky-300 text-sky-700 bg-sky-50/50 hover:bg-sky-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva campaña de patrocinio</span>
            </button>
          )}

          {/* Campaign history table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Historial de campañas ({entityCampaigns.length})
              </h3>
            </div>

            {entityCampaigns.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="text-xs text-slate-500">No hay campañas registradas para esta entidad.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entityCampaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SponsorshipTierBadge tier={camp.tier} />
                        <CampaignStatusBadge status={camp.status} />
                        <span className="text-[11px] font-mono text-slate-400">
                          Prio: {camp.priority}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-900">
                        Bs. {camp.amountBob.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-mono">{camp.startsAt}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="font-mono">{camp.endsAt}</span>
                    </div>

                    {camp.notes && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                        {camp.notes}
                      </p>
                    )}

                    {/* Actions on this campaign */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(camp)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {camp.status !== 'ACTIVE' && camp.status !== 'EXPIRED' && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(camp.id, 'ACTIVE')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Activar</span>
                          </button>
                        )}
                        {camp.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(camp.id, 'CANCELLED')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Los cambios se reflejan inmediatamente en la aplicación móvil de Nexa Salud.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
