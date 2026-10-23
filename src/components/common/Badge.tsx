import React from 'react';
import { SponsorshipTier, SponsorshipStatus, Role, UserStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'emerald' | 'slate' | 'amber' | 'sky' | 'rose' | 'indigo';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'slate', size = 'sm', className = '' }: BadgeProps) {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-md uppercase tracking-wider ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: UserStatus | 'ACTIVE' | 'INACTIVE' }) {
  if (status === 'ACTIVE') {
    return <Badge variant="emerald">Activo</Badge>;
  }
  return <Badge variant="slate">Inactivo</Badge>;
}

export function RoleBadge({ role }: { role: Role }) {
  if (role === 'ADMIN') {
    return <Badge variant="sky">Administrador</Badge>;
  }
  return <Badge variant="slate">Usuario</Badge>;
}

export function SponsorshipTierBadge({ tier }: { tier?: SponsorshipTier }) {
  if (!tier) return null;
  switch (tier) {
    case 'PREMIUM':
      return <Badge variant="sky">Premium</Badge>;
    case 'FEATURED':
      return <Badge variant="amber">Destacado</Badge>;
    case 'BASIC':
      return <Badge variant="slate">Básico</Badge>;
    default:
      return null;
  }
}

export function CampaignStatusBadge({ status }: { status: SponsorshipStatus }) {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="emerald">Activo</Badge>;
    case 'PENDING':
      return <Badge variant="amber">Pendiente</Badge>;
    case 'CANCELLED':
      return <Badge variant="rose">Cancelado</Badge>;
    case 'EXPIRED':
      return <Badge variant="slate">Vencido</Badge>;
    default:
      return null;
  }
}
