import React from 'react';
import { User, Heart, Shield, Activity, Phone, Mail, Clock, Edit3, CheckCircle2 } from 'lucide-react';

export default function PatientProfileCard({ patient, onEdit, onSwitchPatient }) {
  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Active Patient Profile</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Please create a new profile or use the "1-Click Demo Patient" button to start the cancer medication adherence workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold font-['Outfit'] shadow-lg shadow-sky-500/30 shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold font-['Outfit']">{patient.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                Patient #{patient.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                {patient.preferred_language}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {patient.age} yrs • {patient.gender} • {patient.smoking_status} • Alcohol: {patient.alcohol_consumption}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Col 1: Cancer & Regimen */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Oncology Diagnosis</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Condition / Cancer Type:</span>
            <span className="font-semibold text-slate-800 text-sm">{patient.cancer_type || patient.condition_or_disease}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Treatment Plan:</span>
            <span className="font-medium text-slate-700">{patient.treatment_type || 'Chemotherapy Regimen'}</span>
          </div>
        </div>

        {/* Col 2: Medical History & Allergies */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Medical Context</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">History & Comorbidities:</span>
            <span className="text-slate-700 leading-relaxed">
              {patient.medical_history || 'No chronic comorbidities recorded.'}
            </span>
          </div>
        </div>

        {/* Col 3: Caregiver & Escalation Policy */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Caregiver Escalation (§8)</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="font-semibold text-slate-800">{patient.caregiver_name || 'Not assigned'}</span>
            </div>
            {patient.caregiver_phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-700">{patient.caregiver_phone}</span>
              </div>
            )}
            {patient.caregiver_email && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700 truncate max-w-[150px]">{patient.caregiver_email}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-indigo-700 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Escalation Timer:</span>
              </span>
              <span>{patient.escalation_after_minutes || 30} mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
