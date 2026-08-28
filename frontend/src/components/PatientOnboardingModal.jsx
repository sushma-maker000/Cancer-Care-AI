import React, { useState } from 'react';
import { X, User, Heart, Phone, ShieldCheck, Clock, Check, Sparkles } from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  age: 50,
  gender: 'Female',
  preferred_language: 'English',
  smoking_status: 'Non-smoker',
  alcohol_consumption: 'None',
  medical_history: '',
  condition_or_disease: 'Invasive Ductal Carcinoma',
  cancer_type: 'Stage IIA HER2+ Breast Cancer',
  treatment_type: 'Adjuvant Chemotherapy (AC-T)',
  caregiver_name: '',
  caregiver_email: '',
  caregiver_phone: '',
  notification_preference: 'In-App',
  escalation_after_minutes: 30,
};

export default function PatientOnboardingModal({ isOpen, onClose, onSave, defaultLanguage = 'English' }) {
  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
    preferred_language: defaultLanguage,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleFillSample = () => {
    setFormData({
      name: 'Sarah Jenkins',
      age: 52,
      gender: 'Female',
      preferred_language: defaultLanguage,
      smoking_status: 'Non-smoker',
      alcohol_consumption: 'None',
      medical_history: 'Hypertension (managed on Amlodipine 5mg), no known drug allergies.',
      condition_or_disease: 'Invasive Ductal Carcinoma',
      cancer_type: 'Stage IIA HER2-Positive Breast Cancer',
      treatment_type: 'AC-T Chemotherapy Regimen + Trastuzumab',
      caregiver_name: 'Mark Jenkins (Spouse)',
      caregiver_email: 'mark.jenkins@example.com',
      caregiver_phone: '+91 98765 43210',
      notification_preference: 'In-App + Caregiver Alert',
      escalation_after_minutes: 30,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Patient name is required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save patient profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Outfit']">Patient Onboarding</h2>
              <p className="text-xs text-sky-100">Setup cancer profile, treatment regimen & safety escalation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSample}
              className="text-xs flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Pre-fill sample synthetic cancer patient"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-sky-500" />
              1. Patient Demographics & Language
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Language</label>
                <select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="English">English</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Smoking Status</label>
                <select
                  name="smoking_status"
                  value={formData.smoking_status}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Former smoker">Former smoker</option>
                  <option value="Current smoker">Current smoker</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical & Cancer Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              2. Cancer Diagnosis & Treatment Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cancer Type / Stage</label>
                <input
                  type="text"
                  name="cancer_type"
                  value={formData.cancer_type}
                  onChange={handleChange}
                  placeholder="e.g. Stage IIA HER2+ Breast Cancer"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Treatment Regimen</label>
                <input
                  type="text"
                  name="treatment_type"
                  value={formData.treatment_type}
                  onChange={handleChange}
                  placeholder="e.g. Adjuvant Chemotherapy"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Medical History & Allergies</label>
                <textarea
                  name="medical_history"
                  rows={2}
                  value={formData.medical_history}
                  onChange={handleChange}
                  placeholder="e.g. Hypertension (controlled), Penicillin allergy, etc."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Caregiver & Escalation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              3. Caregiver & Safety Escalation (§8)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Caregiver Name</label>
                <input
                  type="text"
                  name="caregiver_name"
                  value={formData.caregiver_name}
                  onChange={handleChange}
                  placeholder="e.g. Mark Jenkins (Spouse)"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Caregiver Email</label>
                <input
                  type="email"
                  name="caregiver_email"
                  value={formData.caregiver_email}
                  onChange={handleChange}
                  placeholder="caregiver@example.com"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Caregiver Phone</label>
                <input
                  type="tel"
                  name="caregiver_phone"
                  value={formData.caregiver_phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              <div className="md:col-span-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs text-slate-700">
                    <strong>Missed-Dose Escalation Timer:</strong> Notify caregiver if no patient response within:
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    name="escalation_after_minutes"
                    min="5"
                    max="240"
                    step="5"
                    value={formData.escalation_after_minutes}
                    onChange={handleChange}
                    className="w-20 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-center font-semibold text-indigo-700"
                  />
                  <span className="text-xs text-slate-500">minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Patient Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
