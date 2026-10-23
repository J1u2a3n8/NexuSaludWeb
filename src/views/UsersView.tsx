import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Power,
  Shield,
  KeyRound,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
  Lock,
} from 'lucide-react';
import { AdminUser, Role, UserStatus } from '../types';
import { RoleBadge, StatusBadge } from '../components/common/Badge';
import { EmptyState, SkeletonTable } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface UsersViewProps {
  users: AdminUser[];
  onCreateAdmin: (data: { name: string; email: string; phone: string }) => void;
  onToggleStatus: (userId: string, newStatus: UserStatus) => void;
}

export function UsersView({ users, onCreateAdmin, onToggleStatus }: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');

  // Create admin modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+591 ');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // View detail modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Confirmation modal state for activate/deactivate
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  // Loading skeleton toggle (for QA verification)
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const paginatedUsers = filteredUsers.slice(0, page * pageSize);
  const hasMore = paginatedUsers.length < filteredUsers.length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('Todos los campos requeridos deben ser completados.');
      return;
    }

    if (newPassword.length < 8) {
      setCreateError('La contraseña inicial debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setCreateError('La contraseña y su confirmación no coinciden.');
      return;
    }

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setCreateError('Ya existe un usuario con este correo electrónico.');
      return;
    }

    onCreateAdmin({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim(),
    });

    // Reset and close
    setNewName('');
    setNewEmail('');
    setNewPhone('+591 ');
    setNewPassword('');
    setNewPasswordConfirm('');
    setIsCreateModalOpen(false);
  };

  const handleConfirmToggle = () => {
    if (!confirmUser) return;
    const nextStatus: UserStatus = confirmUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onToggleStatus(confirmUser.id, nextStatus);
    setConfirmUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Usuarios del Sistema
            </h1>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredUsers.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Control de accesos y cuentas del equipo administrativo y usuarios registrados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsSimulatedLoading(true);
              setTimeout(() => setIsSimulatedLoading(false), 600);
            }}
            title="Recargar lista"
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Refrescar
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Administrador</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search by email/name */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por correo electrónico, nombre o teléfono..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:outline-hidden focus:border-sky-500 transition-colors"
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

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Rol:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'ALL' | Role)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
            >
              <option value="ALL">Todos los roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Estado:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | UserStatus)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-hidden focus:border-sky-500"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table or Loading / Empty States */}
      {isSimulatedLoading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron usuarios"
          description="Intente modificar los filtros de búsqueda por correo o cambiar el rol seleccionado."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setSearchQuery('');
            setRoleFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Fecha de Alta</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{user.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{user.phone}</td>
                    <td className="py-3 px-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {user.createdAt.split('T')[0]}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          title="Ver detalle de usuario"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmUser(user)}
                          title={user.status === 'ACTIVE' ? 'Desactivar usuario' : 'Activar usuario'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'ACTIVE'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Stacked Cards) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                    <div className="text-xs font-mono text-slate-600">{user.email}</div>
                  </div>
                  <StatusBadge status={user.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rol</span>
                    <RoleBadge role={user.role} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Teléfono</span>
                    <span className="font-mono text-slate-700">{user.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Alta: {user.createdAt.split('T')[0]}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                    >
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmUser(user)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                        user.status === 'ACTIVE'
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination / Load more */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Mostrando <strong className="font-mono text-slate-900">{paginatedUsers.length}</strong> de{' '}
              <strong className="font-mono text-slate-900">{filteredUsers.length}</strong> usuarios
            </span>
            {hasMore && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cargar más usuarios
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Nuevo Administrador
                  </h3>
                  <p className="text-xs text-slate-500">
                    Crear credenciales para acceso al back-office
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Security Notice */}
            <div className="my-4 p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">Aviso de seguridad interna:</span>
              Comparta la contraseña inicial mediante un canal seguro (gestor de contraseñas o
              comunicación cifrada). El sistema requerirá el cambio de clave en el primer inicio.
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Roberto Arce Céspedes"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin.nuevo@nexa.test"
                    required
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono Móvil
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+591 70712345"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña Inicial *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="Repita la contraseña"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                * El rol se asigna permanentemente como <strong>ADMIN</strong>. Por diseño de la
                API, los roles de administradores no son modificables desde la interfaz.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
                >
                  Registrar Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 font-bold flex items-center justify-center">
                  {selectedUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedUser.name}</h3>
                  <div className="text-xs font-mono text-slate-500">{selectedUser.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rol en la plataforma:</span>
                <RoleBadge role={selectedUser.role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado de cuenta:</span>
                <StatusBadge status={selectedUser.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Correo Electrónico:</span>
                <span className="font-mono font-medium text-slate-800">{selectedUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-mono font-medium text-slate-800">{selectedUser.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fecha de registro:</span>
                <span className="font-mono text-slate-700">{selectedUser.createdAt}</span>
              </div>
              {selectedUser.lastLoginAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Último acceso:</span>
                  <span className="font-mono text-slate-700">{selectedUser.lastLoginAt}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Toggle Status */}
      {confirmUser && (
        <ConfirmModal
          isOpen={true}
          title={
            confirmUser.status === 'ACTIVE'
              ? '¿Desactivar acceso de usuario?'
              : '¿Activar acceso de usuario?'
          }
          message={
            confirmUser.status === 'ACTIVE'
              ? `El usuario "${confirmUser.name}" (${confirmUser.email}) no podrá iniciar sesión en la plataforma hasta que sea reactivado.`
              : `Se restaurarán los privilegios de inicio de sesión para "${confirmUser.name}".`
          }
          confirmLabel={confirmUser.status === 'ACTIVE' ? 'Desactivar cuenta' : 'Reactivar cuenta'}
          variant={confirmUser.status === 'ACTIVE' ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggle}
          onClose={() => setConfirmUser(null)}
        />
      )}
    </div>
  );
}
