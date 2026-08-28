import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  X,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  Leaf,
  Heart,
  Stethoscope,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { sendChatMessage } from '../services/chat_api';

// Suggested quick questions for the demo (§25)
const QUICK_QUESTIONS = [
  { text: 'I feel dizzy after taking my medicine', icon: '💊', topic: 'symptom' },
  { text: 'What can I eat when I feel nauseous?', icon: '🥗', topic: 'nutrition' },
  { text: 'I noticed blood in my urine', icon: '🚨', topic: 'urgent' },
  { text: 'What are the side effects of Docetaxel?', icon: '📖', topic: 'medication' },
  { text: 'How does chemotherapy affect my immune system?', icon: '🧬', topic: 'cancer' },
  { text: 'Mouth sores are making it hard to eat', icon: '😣', topic: 'nutrition' },
];

const INTENT_ICONS = {
  symptom_safety: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
  medication_info: <BookOpen className="w-3.5 h-3.5 text-sky-600" />,
  nutrition: <Leaf className="w-3.5 h-3.5 text-emerald-600" />,
  cancer_education: <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />,
  emotional: <Heart className="w-3.5 h-3.5 text-rose-600" />,
  general: <MessageCircle className="w-3.5 h-3.5 text-slate-500" />,
};

const TRIAGE_STYLES = {
  red_flag: 'bg-rose-50 border-rose-300',
  concerning: 'bg-amber-50 border-amber-300',
  low_concern: 'bg-white border-slate-200',
};

export default function AIChatbot({ patient, activeLanguage }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        activeLanguage === 'Tamil'
          ? 'வணக்கம்! நான் CancerCare AI. உங்கள் மருந்துகள், பக்கவிளைவுகள் மற்றும் ஊட்டச்சத்து குறித்த கேள்விகளுக்கு நான் உதவ முடியும். என்ன கேள்வி கேட்கலாம்?'
          : 'Hello! I\'m CancerCare AI. I can help with questions about your medications (Dexamethasone, Aprepitant, Docetaxel, Cyclophosphamide), side effects, nutrition during chemotherapy, and general cancer education. What\'s on your mind?',
      triage_level: 'low_concern',
      intent: 'general',
      sources: [],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const messageToSend = text || inputValue.trim();
    if (!messageToSend || !patient || isLoading) return;

    setInputValue('');
    const userMsg = { role: 'user', content: messageToSend };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(
        patient.id,
        messageToSend,
        history,
        activeLanguage
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          triage_level: response.triage_level,
          intent: response.intent,
          sources: response.sources || [],
          is_emergency: response.is_emergency,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I\'m having trouble connecting right now. Please try again in a moment, or contact your oncology team directly.',
          triage_level: 'low_concern',
          intent: 'general',
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (idx) => {
    setShowSources((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px]">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-['Outfit']">CancerCare AI Chatbot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                RAG Grounded (§12)
              </span>
            </div>
            <p className="text-xs text-sky-200">
              Medication • Symptoms • Nutrition • Cancer Education
            </p>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 border border-slate-700 rounded-lg px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Safety Triage Active</span>
        </div>
      </div>

      {/* Medical Safety Notice */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-[11px] text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>For urgent emergencies, call 108 or your oncology team directly — do not wait for the chatbot.</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : msg.triage_level === 'red_flag'
                  ? 'bg-rose-600 text-white'
                  : 'bg-gradient-to-tr from-indigo-500 to-sky-500 text-white'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : msg.triage_level === 'red_flag' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none border-sky-700'
                    : `${TRIAGE_STYLES[msg.triage_level] || 'bg-white border-slate-200'} text-slate-800 rounded-tl-none shadow-xs`
                }`}
              >
                {/* Emergency Banner */}
                {msg.is_emergency && (
                  <div className="mb-2 flex items-center gap-1.5 text-rose-700 font-bold text-[11px] bg-rose-100 px-2 py-1 rounded-lg">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    URGENT — Immediate medical attention required
                  </div>
                )}
                {/* Concerning Banner */}
                {msg.triage_level === 'concerning' && !msg.is_emergency && (
                  <div className="mb-2 flex items-center gap-1.5 text-amber-700 font-semibold text-[11px] bg-amber-100 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Please contact your oncology team today
                  </div>
                )}

                {/* Message content with line breaks */}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Intent + Sources footer */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    {INTENT_ICONS[msg.intent] || INTENT_ICONS.general}
                    <span className="capitalize">{msg.intent?.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => toggleSources(idx)}
                    className="flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{showSources[idx] ? 'Hide' : 'View'} {msg.sources.length} Source{msg.sources.length > 1 ? 's' : ''}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showSources[idx] ? 'rotate-180' : ''}`} />
                  </button>

                  {showSources[idx] && (
                    <div className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sources & References</p>
                      {msg.sources.map((src, sidx) => (
                        <div key={sidx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="w-4 h-4 rounded bg-sky-100 text-sky-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                            {sidx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800">{src.source}</span>
                            {src.drug_name && <span className="text-slate-500"> • {src.drug_name}</span>}
                            {src.topic && <span className="text-slate-500"> • {src.topic}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs">
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Questions</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <span>{q.icon}</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-input-box"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || !patient}
            placeholder={
              !patient
                ? 'Please load a patient profile first...'
                : activeLanguage === 'Tamil'
                ? 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...'
                : 'Ask about medications, side effects, nutrition...'
            }
            className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || !patient}
            id="chat-send-btn"
            className="w-10 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
