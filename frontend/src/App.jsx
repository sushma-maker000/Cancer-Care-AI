import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PatientProfileCard from './components/PatientProfileCard';
import PatientOnboardingModal from './components/PatientOnboardingModal';
import {
  fetchHealth,
  fetchPatients,
  createPatient,
  updatePatient,
  seedSyntheticPatient,
} from './services/api';
import {
  CheckCircle2,
  FileText,
  Clock,
  ShieldAlert,
  BookOpen,
  Volume2,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      setLoading(true);
      await fetchHealth();
      setApiHealthy(true);

      const patientList = await fetchPatients();
      setPatients(patientList);
      if (patientList.length > 0) {
        setActivePatient(patientList[0]);
        setActiveLanguage(patientList[0].preferred_language || 'English');
      } else {
        // Automatically seed synthetic demo patient for instant out-of-the-box readiness
        const demo = await seedSyntheticPatient('English');
        setPatients([demo]);
        setActivePatient(demo);
      }
    } catch (err) {
      console.error('API Error:', err);
      setApiHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    setActiveLanguage(lang);
    if (activePatient) {
      try {
        const updated = await updatePatient(activePatient.id, { preferred_language: lang });
        setActivePatient(updated);
        setStatusMessage(`Language switched to ${lang === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}`);
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err) {
        console.error('Failed to update language:', err);
      }
    }
  };

  const handleQuickLoadDemo = async () => {
    try {
      setLoadingDemo(true);
      const demo = await seedSyntheticPatient(activeLanguage);
      const list = await fetchPatients();
      setPatients(list);
      setActivePatient(demo);
      setStatusMessage('Loaded Sarah Jenkins synthetic demo profile!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error('Demo loading failed:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleSavePatient = async (formData) => {
    const created = await createPatient(formData);
    const list = await fetchPatients();
    setPatients(list);
    setActivePatient(created);
    setActiveLanguage(created.preferred_language || 'English');
    setStatusMessage(`Created profile for ${created.name}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header with safety notice */}
      <Header
        activeLanguage={activeLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onQuickLoadDemo={handleQuickLoadDemo}
        loadingDemo={loadingDemo}
        apiHealthy={apiHealthy}
      />

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Patient Profile Section (Milestone 1 Deliverable) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">
                Patient Profile & Clinical Setup
              </h1>
              <p className="text-xs text-slate-500">
                Foundational clinical profile, cancer regimen context, and caregiver safety configuration (§3, §8).
              </p>
            </div>
            {patients.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Switch Patient:</span>
                <select
                  value={activePatient?.id || ''}
                  onChange={(e) => {
                    const selected = patients.find((p) => p.id === Number(e.target.value));
                    if (selected) setActivePatient(selected);
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <PatientProfileCard
            patient={activePatient}
            onEdit={() => setIsOnboardingOpen(true)}
          />
        </section>

        {/* Milestone Roadmap & Architecture Overview */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold font-['Outfit'] text-slate-800">
                36-Hour Hackathon Implementation Pipeline
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Milestone 1 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Milestone 1</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Patient & DB Setup</h3>
              <p className="text-xs text-slate-600">
                FastAPI, SQLite schema, patient onboarding & synthetic profiles.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-emerald-700">Status: Complete ✅</div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 opacity-90">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Milestone 3</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Prescription OCR</h3>
              <p className="text-xs text-slate-600">
                Mistral OCR / structured extraction + mandatory patient confirmation.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-sky-600">Next Up ⏳</div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 opacity-75">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Milestone 4 & 5</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Schedule & Adherence</h3>
              <p className="text-xs text-slate-600">
                Action-driven reminders (`Taken`, `Snooze`, `Missed`) + Adherence engine.
              </p>
              <div className="pt-2 text-[11px] font-medium text-slate-400">Scheduled</div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 opacity-75">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Milestone 6–9</span>
                <ShieldAlert className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Safety, RAG & Voice</h3>
              <p className="text-xs text-slate-600">
                DailyMed / NCI Knowledge RAG, Red-flag triage & Tamil voice support.
              </p>
              <div className="pt-2 text-[11px] font-medium text-slate-400">Scheduled</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        CancerCare AI — Hackathon Prototype • Strictly Non-Autonomous Medical Adherence Assistant
      </footer>

      {/* Onboarding / Edit Modal */}
      <PatientOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={handleSavePatient}
        defaultLanguage={activeLanguage}
      />
    </div>
  );
}
