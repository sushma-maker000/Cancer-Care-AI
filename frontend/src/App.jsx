import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PatientProfileCard from './components/PatientProfileCard';
import PatientOnboardingModal from './components/PatientOnboardingModal';
import PrescriptionSection from './components/PrescriptionSection';
import MedicationConfirmationModal from './components/MedicationConfirmationModal';
import MedicationScheduleView from './components/MedicationScheduleView';
import AIChatbot from './components/AIChatbot';

import {
  fetchHealth,
  fetchPatients,
  createPatient,
  updatePatient,
  seedSyntheticPatient,
  confirmPrescription,
  fetchPatientMedications,
  fetchPatientDoseEvents,
  recordDoseAction,
  fetchAdherence,
  fetchInventory,
  fetchAppointments,
} from './services/api';
import {
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Home,
  UploadCloud,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export default function App() {
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  
  // Mobile View Toggle & Navigation State
  const [isMobileView, setIsMobileView] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule'); // default to schedule page

  // Regimen & Adherence State
  const [medications, setMedications] = useState([]);
  const [doseEvents, setDoseEvents] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [isProcessingRx, setIsProcessingRx] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

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
        const p = patientList[0];
        setActivePatient(p);
        setActiveLanguage(p.preferred_language || 'English');
        await refreshPatientData(p.id);
      } else {
        const demo = await seedSyntheticPatient('English');
        setPatients([demo]);
        setActivePatient(demo);
        await refreshPatientData(demo.id);
      }
    } catch (err) {
      console.error('API Error:', err);
      setApiHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshPatientData = async (patientId) => {
    try {
      const [meds, events, adh, inv, appts] = await Promise.all([
        fetchPatientMedications(patientId),
        fetchPatientDoseEvents(patientId),
        fetchAdherence(patientId),
        fetchInventory(patientId),
        fetchAppointments(patientId),
      ]);
      setMedications(meds);
      setDoseEvents(events);
      setAdherence(adh);
      setInventory(inv);
      setAppointments(appts);
    } catch (err) {
      console.error('Error refreshing patient regimen data:', err);
    }
  };

  const handleLanguageChange = async (lang) => {
    setActiveLanguage(lang);
    if (activePatient) {
      try {
        const updated = await updatePatient(activePatient.id, { preferred_language: lang });
        setActivePatient(updated);
        showToast(`Language switched to ${lang === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}`);
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
      await refreshPatientData(demo.id);
      showToast('Loaded Sarah Jenkins synthetic demo profile!');
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
    await refreshPatientData(created.id);
    showToast(`Created profile for ${created.name}`);
  };

  const handleExtractionComplete = (rxResponse) => {
    setPrescriptionData(rxResponse);
    setIsConfirmationOpen(true);
  };

  const handleConfirmPrescription = async (prescriptionId, confirmedMeds, startDate) => {
    const result = await confirmPrescription(prescriptionId, confirmedMeds, startDate);
    await refreshPatientData(activePatient.id);
    showToast('Prescription confirmed! 21-Day chemotherapy cycle activated.');
  };

  const handleDoseAction = async (eventId, actionData) => {
    try {
      await recordDoseAction(eventId, actionData);
      await refreshPatientData(activePatient.id);
      if (actionData.action === 'taken') {
        showToast('Dose confirmed! Inventory updated & adherence recorded.');
      } else if (actionData.action === 'missed') {
        showToast('Missed dose logged. Supportive coaching advice provided.');
      } else if (actionData.action === 'snooze' || actionData.action === 'busy') {
        showToast(`Reminder snoozed for ${actionData.snooze_minutes || 15} minutes.`);
      }
    } catch (err) {
      console.error('Error executing dose action:', err);
    }
  };

  const showToast = (msg) => {
    setStatusMessage(msg);
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
        isMobileView={isMobileView}
        onToggleLayoutView={() => setIsMobileView(!isMobileView)}
      />

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {isMobileView ? (
        /* ================= MOBILE VIEW CONTAINER ================= */
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[780px] relative">
            
            {/* Active Tab Screen Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
              
              {/* Profile Tab Screen */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold font-['Outfit']">
                      {activeLanguage === 'Tamil' ? 'நோயாளி சுயவிவரம்' : 'Patient Profile'}
                    </h1>
                    {patients.length > 1 && (
                      <select
                        value={activePatient?.id || ''}
                        onChange={(e) => {
                          const selected = patients.find((p) => p.id === Number(e.target.value));
                          if (selected) {
                            setActivePatient(selected);
                            refreshPatientData(selected.id);
                          }
                        }}
                        className="text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300 font-semibold"
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <PatientProfileCard
                    patient={activePatient}
                    activeLanguage={activeLanguage}
                    onEdit={() => setIsOnboardingOpen(true)}
                  />
                </div>
              )}

              {/* Upload Tab Screen */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold font-['Outfit']">
                    {activeLanguage === 'Tamil' ? 'மருந்து சீட்டுப் பதிவேற்றம்' : 'Upload Prescription'}
                  </h1>
                  <PrescriptionSection
                    patient={activePatient}
                    activeLanguage={activeLanguage}
                    onExtractionComplete={handleExtractionComplete}
                    isProcessing={isProcessingRx}
                    setIsProcessing={setIsProcessingRx}
                  />
                </div>
              )}

              {/* Schedule Tab Screen */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold font-['Outfit']">
                    {activeLanguage === 'Tamil' ? 'சிகிச்சை அட்டவணை' : 'Care Schedule'}
                  </h1>
                  <MedicationScheduleView
                    medications={medications}
                    doseEvents={doseEvents}
                    adherence={adherence}
                    inventory={inventory}
                    appointments={appointments}
                    onDoseAction={handleDoseAction}
                    activeLanguage={activeLanguage}
                  />
                </div>
              )}

              {/* Chat Tab Screen */}
              {activeTab === 'chat' && (
                <div className="space-y-4 flex flex-col h-full">
                  <AIChatbot patient={activePatient} activeLanguage={activeLanguage} />
                </div>
              )}

            </div>

            {/* Bottom Nav Bar */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'profile' ? 'text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px]">{activeLanguage === 'Tamil' ? 'சுயவிவரம்' : 'Profile'}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'upload' ? 'text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <UploadCloud className="w-5 h-5" />
                <span className="text-[10px]">{activeLanguage === 'Tamil' ? 'பதிவேற்று' : 'Upload'}</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'schedule' ? 'text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[10px]">{activeLanguage === 'Tamil' ? 'அட்டவணை' : 'Schedule'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === 'chat' ? 'text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-[10px]">{activeLanguage === 'Tamil' ? 'உரையாடு' : 'AI Chat'}</span>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* ================= DESKTOP VIEW CONTAINER ================= */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Patient Profile Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">
                  {activeLanguage === 'Tamil'
                    ? 'நோயாளி சுயவிவரம் & புற்றுநோய் சிகிச்சை'
                    : 'Patient Profile & Oncology Care'}
                </h1>
                <p className="text-xs text-slate-500">
                  {activeLanguage === 'Tamil'
                    ? 'மருத்துவ நோயறிதல், TC சிகிச்சை திட்ட அட்டவணை, மற்றும் பராமரிப்பாளர் அமைப்புகள்.'
                    : 'Clinical diagnosis, TC regimen schedule, and caregiver safety configuration.'}
                </p>
              </div>
              {patients.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {activeLanguage === 'Tamil' ? 'நோயாளியை மாற்று:' : 'Switch Patient:'}
                  </span>
                  <select
                    value={activePatient?.id || ''}
                    onChange={(e) => {
                      const selected = patients.find((p) => p.id === Number(e.target.value));
                      if (selected) {
                        setActivePatient(selected);
                        refreshPatientData(selected.id);
                      }
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
              activeLanguage={activeLanguage}
              onEdit={() => setIsOnboardingOpen(true)}
            />
          </section>

          {/* Prescription Ingestion & OCR Section */}
          <section>
            <PrescriptionSection
              patient={activePatient}
              activeLanguage={activeLanguage}
              onExtractionComplete={handleExtractionComplete}
              isProcessing={isProcessingRx}
              setIsProcessing={setIsProcessingRx}
            />
          </section>

          {/* Medication Schedule & Adherence Section */}
          <section>
            <MedicationScheduleView
              medications={medications}
              doseEvents={doseEvents}
              adherence={adherence}
              inventory={inventory}
              appointments={appointments}
              onDoseAction={handleDoseAction}
              activeLanguage={activeLanguage}
            />
          </section>

          {/* AI Chatbot Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold font-['Outfit'] text-slate-900">
                {activeLanguage === 'Tamil'
                  ? 'செயற்கை நுண்ணறிவு பக்கவிளைவு & ஊட்டச்சத்து உதவி'
                  : 'AI Symptom & Education Assistant'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeLanguage === 'Tamil'
                  ? 'உங்கள் மருந்து வழிகாட்டிகள் மற்றும் NCI ஊட்டச்சத்து குறிப்புகள் ఆధారமாக பதிலளிக்கும்AI உதவி.'
                  : 'Grounded RAG chatbot with deterministic safety triage — sources cited from your drug monographs and NCI nutrition guidelines.'}
              </p>
            </div>
            <AIChatbot patient={activePatient} activeLanguage={activeLanguage} />
          </section>
        </main>
      )}

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

      {/* Mandatory Patient Confirmation Modal */}
      <MedicationConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        prescriptionData={prescriptionData}
        onConfirm={handleConfirmPrescription}
      />
    </div>
  );
}
