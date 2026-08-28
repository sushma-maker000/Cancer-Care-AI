import React from 'react';
import { Shield, AlertTriangle, Globe, Sparkles, UserPlus, HeartHandshake, Monitor, Smartphone } from 'lucide-react';

export default function Header({
  activeLanguage,
  onLanguageChange,
  onOpenOnboarding,
  onQuickLoadDemo,
  loadingDemo,
  apiHealthy,
  isMobileView,
  onToggleLayoutView,
}) {
  const isTamil = activeLanguage === 'Tamil';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Medical Safety Disclaimer Banner (§28) */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-5xl mx-auto text-center md:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{isTamil ? 'மருத்துவ அறிவிப்பு:' : 'Medical Notice:'}</strong>{' '}
            {isTamil
              ? 'CancerCare AI மருந்து கண்காணிப்பு மற்றும் கல்வி ஆதரவை வழங்குகிறது. இது நோயைக் கண்டறிவதோ அல்லது உங்கள் மருத்துவரின் சிகிச்சையை மாற்றுவதோ இல்லை. அவசரநிலைகளில் உடனடியாக உங்கள் மருத்துவரை தொடர்பு கொள்ளவும்.'
              : 'CancerCare AI provides adherence tracking & educational support. It does not diagnose, prescribe, or replace professional oncology care. In emergencies, call your doctor immediately.'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-['Outfit'] bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 bg-clip-text text-transparent">
                CancerCare AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isTamil ? 'பாதுகாப்பு விதிகளுடன்' : 'Guardrails Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              {isTamil
                ? 'புற்றுநோய் மருந்து கண்காணிப்பு & நோயாளி ஆதரவு அமைப்பு'
                : 'Intelligent Cancer Medication Adherence & Patient Support'}
            </p>
          </div>
        </div>

        {/* Actions & Language Selector */}
        <div className="flex items-center gap-2.5">
          {/* Language Switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => onLanguageChange('English')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLanguage === 'English'
                  ? 'bg-white text-sky-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('Tamil')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeLanguage === 'Tamil'
                  ? 'bg-white text-sky-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>

          {/* Quick Demo Loader */}
          <button
            id="quick-demo-patient-btn"
            onClick={onQuickLoadDemo}
            disabled={loadingDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
            title="Load Sarah Jenkins (Breast Cancer Demo Patient)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">
              {isTamil ? 'மாதிரி நோயாளி' : '1-Click Demo Patient'}
            </span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Layout Switcher Button */}
          <button
            onClick={onToggleLayoutView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title={isMobileView ? "Switch to Wide Desktop view" : "Switch to Mobile view"}
          >
            {isMobileView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-slate-600" />
                <span>{isTamil ? 'வலைக் காட்சி' : 'Desktop View'}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                <span>{isTamil ? 'கைப்பேசி காட்சி' : 'Mobile View'}</span>
              </>
            )}
          </button>

          {/* Onboarding Button */}
          <button
            id="new-patient-btn"
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isTamil ? 'புதிய நோயாளி' : 'New Patient'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
