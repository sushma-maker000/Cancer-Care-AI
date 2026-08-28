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
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  
  // Regimen & Adherence State
  const [medications, setMedications] = useState([]);
  const [doseEvents, setDoseEvents] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
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
      // Do not auto-select any patient — user must create or select one explicitly
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


  const handleSavePatient = async (formData) => {
    const created = await createPatient(formData);
    
    setActivePatient(created);
    setActiveLanguage(created.preferred_language || 'English');
    showToast(`Created profile for ${created.name}`);
    
    fetchPatients()
      .then((list) => setPatients(list))
      .catch((err) => console.error('Failed to fetch patient list:', err));
      
    refreshPatientData(created.id)
      .catch((err) => console.error('Failed to refresh patient dashboard data:', err));
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
        apiHealthy={apiHealthy}
      />

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{statusMessage}</span>
        </div>
      )}

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
                  ? 'உங்கள் மருந்து வழிகாட்டிகள் மற்றும் NCI ஊட்டச்சத்து குறிப்புகள் ஆ஧ாரமாக பதிலளிக்கும் AI உதவி.'
                  : 'Grounded RAG chatbot with deterministic safety triage — sources cited from your drug monographs and NCI nutrition guidelines.'}
              </p>
            </div>
            <AIChatbot patient={activePatient} activeLanguage={activeLanguage} />
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
