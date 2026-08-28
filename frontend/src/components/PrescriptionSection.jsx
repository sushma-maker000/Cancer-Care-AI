import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Pill,
} from 'lucide-react';
import { uploadPrescriptionFile, loadSamplePrescription } from '../services/api';

export default function PrescriptionSection({
  patient,
  onExtractionComplete,
  isProcessing,
  setIsProcessing,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [lastUploaded, setLastUploaded] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!patient) {
      setErrorMessage('Please select or create a patient profile first.');
      return;
    }
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const response = await uploadPrescriptionFile(patient.id, file);
      setLastUploaded(response);
      onExtractionComplete(response);
    } catch (err) {
      setErrorMessage(err.message || 'Error processing prescription file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = async () => {
    if (!patient) {
      setErrorMessage('Please select or create a patient profile first.');
      return;
    }
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const response = await loadSamplePrescription(patient.id);
      setLastUploaded(response);
      onExtractionComplete(response);
    } catch (err) {
      setErrorMessage(err.message || 'Error loading Apex sample prescription.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-slate-900">
                Prescription Ingestion & Extraction (§4)
              </h2>
              <p className="text-xs text-slate-500">
                Upload oncology prescription (PDF/Image) for Mistral OCR & structured extraction.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Sample Button */}
        <button
          id="load-sample-prescription-btn"
          type="button"
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Load Apex Oncology Sample (4 Meds)</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-sky-500 bg-sky-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-white shadow-md text-sky-600 flex items-center justify-center mx-auto mb-3">
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-800">
          {isProcessing
            ? 'Extracting Medications with Mistral AI...'
            : 'Click to upload or drag & drop prescription'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, JPG, PNG • Handled securely with human-in-the-loop review
        </p>
      </div>

      {/* Extracted Preview Accordion (if available) */}
      {lastUploaded && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                Extracted from {lastUploaded.file_name} ({lastUploaded.medications.length} Medications)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRawOcr(!showRawOcr)}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{showRawOcr ? 'Hide Raw OCR' : 'View Raw OCR'}</span>
              {showRawOcr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showRawOcr && (
            <pre className="p-3 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap">
              {lastUploaded.ocr_raw_text}
            </pre>
          )}

          {/* Mini Cards of Extracted Meds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            {lastUploaded.medications.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="truncate">{m.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      m.route === 'oral' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {m.route?.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">Dose: {m.strength || m.dose}</div>
                <div className="text-slate-500 text-[11px] truncate">{m.frequency}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
