import React from 'react';
import { Plus, Trash2, Phone } from 'lucide-react';

interface PhoneInputListProps {
  phones: string[];
  onChange: (phones: string[]) => void;
  label?: string;
  error?: string;
}

export function PhoneInputList({
  phones,
  onChange,
  label = 'Teléfonos de contacto',
  error,
}: PhoneInputListProps) {
  const handlePhoneChange = (index: number, value: string) => {
    const updated = [...phones];
    updated[index] = value;
    onChange(updated);
  };

  const handleAddPhone = () => {
    onChange([...phones, '+591 ']);
  };

  const handleRemovePhone = (index: number) => {
    if (phones.length <= 1) {
      onChange(['+591 ']);
      return;
    }
    onChange(phones.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={handleAddPhone}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar teléfono</span>
        </button>
      </div>

      <div className="space-y-2">
        {phones.map((phone, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(idx, e.target.value)}
                placeholder="+591 70712345"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemovePhone(idx)}
              aria-label={`Eliminar teléfono ${idx + 1}`}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      <p className="text-[11px] text-slate-500">
        Formato sugerido para Bolivia: <span className="font-mono text-slate-700">+591 70712345</span> o <span className="font-mono text-slate-700">+591 4 4251234</span>
      </p>
    </div>
  );
}
