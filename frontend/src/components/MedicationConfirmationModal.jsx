import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Pill,
  Syringe,
  Check,
  X,
  Edit2,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function MedicationConfirmationModal({
  isOpen,
  onClose,
  prescriptionData,
  onConfirm,
}) {
  const [medications, setMedications] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prescriptionData && prescriptionData.medications) {
      setMedications(JSON.parse(JSON.stringify(prescriptionData.medications)));
    }
  }, [prescriptionData]);

  if (!isOpen || !prescriptionData) return null;

  const handleMedChange = (index, field, value) => {
    setMedications((prev) => {
      const updated = [...prev];
      if (field === 'scheduled_times') {
        updated[index][field] = value.split(',').map((t) => t.trim());
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(prescriptionData.prescription_id, medications, startDate);
      onClose();
    } catch (err) {
      alert(err.message || 'Error confirming prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-teal-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Outfit']">Mandatory Patient Confirmation</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                  Human-In-The-Loop (§4)
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                Review extracted medications, strengths, routes & schedules before activating reminders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Safety Check:</strong> AI extracts text for your review, but never activates medications automatically. Please check that dosages match your doctor's instructions before clicking confirm.
          </span>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleConfirmSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Regimen summary & Start date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Prescription Source & Regimen
              </span>
              <span className="text-sm font-bold text-slate-900">
                {prescriptionData.extracted_json?.regimen_name || 'TC Chemotherapy Regimen'}
              </span>
              <span className="text-xs text-slate-500 block">
                Source: {prescriptionData.file_name}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Treatment Cycle Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Extracted Medication Review Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Extracted Medications ({medications.length})
            </h3>

            {medications.map((med, idx) => {
              const isOral = (med.route || '').toLowerCase() === 'oral';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isOral
                      ? 'border-sky-200 bg-sky-50/30'
                      : 'border-purple-200 bg-purple-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isOral ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isOral ? <Pill className="w-4 h-4" /> : <Syringe className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{med.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOral ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {isOral ? 'ORAL ADHERENCE MED' : 'IV CHEMOTHERAPY INFUSION'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500">Extraction Confidence:</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {Math.round((med.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Editable Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Dose / Strength</label>
                      <input
                        type="text"
                        value={med.strength || med.dose}
                        onChange={(e) => handleMedChange(idx, 'strength', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Route</label>
                      <select
                        value={med.route}
                        onChange={(e) => handleMedChange(idx, 'route', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="oral">Oral (PO)</option>
                        <option value="intravenous">Intravenous (IV)</option>
                        <option value="subcutaneous">Subcutaneous</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Scheduled Times (HH:MM)</label>
                      <input
                        type="text"
                        value={med.scheduled_times?.join(', ') || ''}
                        onChange={(e) => handleMedChange(idx, 'scheduled_times', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-4">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Instructions & Food Guidance</label>
                      <textarea
                        rows={2}
                        value={med.instructions || ''}
                        onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-normal text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Activating will generate cycle dose alarms, chemo appointment, and inventory counts.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-and-activate-schedule-btn"
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'Activating...' : 'Confirm & Activate Schedule'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
