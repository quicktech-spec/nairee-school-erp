import React from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Check, 
  ExternalLink, 
  Globe, 
  Layers, 
  Sparkles,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useTenant } from '../context/TenantContext.jsx';

export default function TenantSwitchModal({ isOpen, onClose, onOpenOnboarding }) {
  const { tenant, tenantsList, switchTenant } = useTenant();

  if (!isOpen) return null;

  const handleSelectTenant = (tenantId) => {
    switchTenant(tenantId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Multi-Tenant School Switcher</h3>
              <p className="text-xs text-slate-300">Select any onboarded school to instantly preview white-label branding & isolated data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tenant Cards List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {tenantsList.map((t) => {
            const isCurrent = tenant?.tenant_id === t.tenant_id;
            return (
              <div
                key={t.tenant_id}
                onClick={() => handleSelectTenant(t.tenant_id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img 
                    src={t.logo_url} 
                    alt={t.school_name} 
                    className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0 shadow-xs"
                    onError={(e) => { e.target.src = '/nairee-logo.png'; }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{t.school_name}</h4>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white shadow-xs"
                        style={{ backgroundColor: t.primary_color }}
                      >
                        {t.school_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-mono text-indigo-700 font-semibold truncate max-w-[200px]">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        {t.custom_domain || `${t.subdomain || t.tenant_id}.naireeschool.com`}
                      </span>
                      <span>&bull;</span>
                      <span>{t.plan_tier} Plan</span>
                      <span>&bull;</span>
                      <span className="text-emerald-600 font-semibold">{t.enabled_features?.length || 10} Modules</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.primary_color }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.secondary_color }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.accent_color }}></span>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                  }`}>
                    {isCurrent && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Add new tenant */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Showing {tenantsList.length} White-Label Instances
          </span>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenOnboarding();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Onboard New School</span>
          </button>
        </div>

      </div>
    </div>
  );
}
