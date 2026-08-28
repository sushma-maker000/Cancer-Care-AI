import React from 'react';
import { User, Heart, Shield, Activity, Phone, Mail, Clock, Edit3, CheckCircle2 } from 'lucide-react';

export default function PatientProfileCard({ patient, onEdit, onSwitchPatient, activeLanguage }) {
  const isTamil = activeLanguage === 'Tamil';

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          {isTamil ? 'நோயாளி சுயவிவரம் இல்லை' : 'No Active Patient Profile'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          {isTamil
            ? 'தயவுசெய்து புதிய சுயவிவரத்தை உருவாக்கவும்.'
            : 'Please create a new patient profile using the "New Patient" button to start the cancer medication adherence workflow.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold font-['Outfit'] shadow-lg shadow-sky-500/30 shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold font-['Outfit']">{patient.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                {isTamil ? `நோயாளி #${patient.id}` : `Patient #${patient.id}`}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                {patient.preferred_language || (isTamil ? 'தமிழ்' : 'English')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>{patient.age} {isTamil ? 'வயது' : 'yrs'}</span>
              {patient.gender && <><span>•</span><span>{patient.gender}</span></>}
              {patient.patient_phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-sky-200">
                    <Phone className="w-3 h-3 text-sky-300" />
                    {patient.patient_phone}
                  </span>
                </>
              )}
              {patient.smoking_status && <><span>•</span><span>{patient.smoking_status}</span></>}
              {patient.alcohol_consumption && <><span>•</span><span>{isTamil ? 'மதுப்பழக்கம்:' : 'Alcohol:'} {patient.alcohol_consumption}</span></>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isTamil ? 'சுயவிவரத்தை திருத்து' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Col 1: Cancer & Regimen */}
        <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{isTamil ? 'புற்றுநோய் கண்டறிதல்' : 'Oncology Diagnosis'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">{isTamil ? 'புற்றுநோய் வகை:' : 'Condition / Cancer Type:'}</span>
            <span className="font-semibold text-slate-800 text-sm">{patient.cancer_type || patient.condition_or_disease}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">{isTamil ? 'சிகிச்சை திட்டம்:' : 'Treatment Plan:'}</span>
            <span className="font-medium text-slate-700">{patient.treatment_type || 'Chemotherapy Regimen'}</span>
          </div>
        </div>

        {/* Col 2: Medical History & Allergies */}
        <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>{isTamil ? 'மருத்துவ விவரங்கள்' : 'Medical Context'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">{isTamil ? 'நோய் வரலாறு:' : 'History & Comorbidities:'}</span>
            <span className="text-slate-700 leading-relaxed">
              {patient.medical_history || (isTamil ? 'மற்ற நோய்கள் இல்லை' : 'No chronic comorbidities recorded.')}
            </span>
          </div>
        </div>

        {/* Col 3: Caregiver & Escalation Policy */}
        <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{isTamil ? 'பராமரிப்பாளர் எச்சரிக்கை' : 'Caregiver Escalation'}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 shrink-0">{isTamil ? 'பெயர்:' : 'Contact:'}</span>
              <span className="font-semibold text-slate-800 text-right break-words">{patient.caregiver_name || (isTamil ? 'குறிப்பிடப்படவில்லை' : 'Not assigned')}</span>
            </div>
            {patient.caregiver_phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isTamil ? 'போன்:' : 'Phone:'}</span>
                <span className="text-slate-700">{patient.caregiver_phone}</span>
              </div>
            )}
            {patient.caregiver_email && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isTamil ? 'மின்னஞ்சல்:' : 'Email:'}</span>
                <span className="text-slate-700 truncate max-w-[150px]">{patient.caregiver_email}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-indigo-700 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{isTamil ? 'எச்சரிக்கை நேரம்:' : 'Escalation Timer:'}</span>
              </span>
              <span>{patient.escalation_after_minutes || 30} {isTamil ? 'நிமிடங்கள்' : 'mins'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

