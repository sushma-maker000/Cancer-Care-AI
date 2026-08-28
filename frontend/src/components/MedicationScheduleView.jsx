import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Pill,
  Syringe,
  Package,
  Calendar,
  Sparkles,
  TrendingUp,
  HelpCircle,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { triggerDemoEscalation } from '../services/api';


export default function MedicationScheduleView({
  medications,
  doseEvents,
  adherence,
  inventory,
  appointments,
  onDoseAction,
  activeLanguage,
}) {
  const [selectedEventForReason, setSelectedEventForReason] = useState(null);
  const [selectedEventForBusy, setSelectedEventForBusy] = useState(null);
  const [escalationStatus, setEscalationStatus] = useState(null);

  const handleTestEscalation = async (eventId) => {
    try {
      setEscalationStatus({ loading: true, message: 'Sending Telegram caregiver alert...' });
      const res = await triggerDemoEscalation(eventId);
      setEscalationStatus({
        success: true,
        message: `Alert sent! ${res.message}`,
      });
      setTimeout(() => setEscalationStatus(null), 8000);
    } catch (err) {
      setEscalationStatus({
        error: true,
        message: `Notification triggered (In-App). ${err.message}`,
      });
      setTimeout(() => setEscalationStatus(null), 8000);
    }
  };


  // Find the first scheduled or snoozed event to display as the active alarm
  const activeAlarmEvent = doseEvents.find(
    (e) => e.status === 'scheduled' || e.status === 'snoozed' || e.status === 'busy'
  );

  const handleActionClick = (eventId, action) => {
    if (action === 'missed') {
      setSelectedEventForReason(eventId);
    } else if (action === 'busy') {
      setSelectedEventForBusy(eventId);
    } else {
      onDoseAction(eventId, { action });
    }
  };

  const handleReasonSelect = (eventId, reason) => {
    onDoseAction(eventId, { action: 'missed', missed_reason: reason });
    setSelectedEventForReason(null);
  };

  const handleBusySnoozeSelect = (eventId, minutes) => {
    onDoseAction(eventId, { action: 'busy', snooze_minutes: minutes });
    setSelectedEventForBusy(null);
  };

  if (!medications || medications.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center shadow-xs">
        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Active Medication Schedule</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Upload and confirm a prescription above to activate the 21-day chemotherapy medication cycle and daily alarms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Active Dose Reminder Alarm (§6) + Adherence Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Dose Alarm Card (2 Cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Bell className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  {activeLanguage === 'Tamil' ? 'மருந்து நேரம் (Medication Reminder)' : 'Active Dose Reminder'}
                </span>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15">
                {activeLanguage === 'Tamil' ? 'நோயாளி செயல் பொத்தான்கள்' : 'Action Buttons Active (§6)'}
              </span>
            </div>

            {activeAlarmEvent ? (
              <div className="space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-['Outfit']">{activeAlarmEvent.medication_name}</h3>
                    <p className="text-xs text-sky-200 mt-0.5">
                      Dose: {activeAlarmEvent.dose} • Route: {activeAlarmEvent.route?.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono">
                      {new Date(activeAlarmEvent.scheduled_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-[11px] text-slate-300 block">Scheduled Time</span>
                  </div>
                </div>

                {activeAlarmEvent.instructions && (
                  <p className="text-xs text-slate-200 bg-white/5 p-2 rounded-lg border border-white/10">
                    💡 <strong>Instructions:</strong> {activeAlarmEvent.instructions}
                  </p>
                )}

                {/* If Reason Selector is open */}
                {selectedEventForReason === activeAlarmEvent.id ? (
                  <div className="p-3 bg-slate-900/90 rounded-xl space-y-2 border border-rose-500/30 animate-in fade-in">
                    <p className="text-xs text-slate-200 font-semibold">That's okay. What happened?</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleReasonSelect(activeAlarmEvent.id, 'busy')}
                        className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg text-left"
                      >
                        I was busy
                      </button>
                      <button
                        onClick={() => handleReasonSelect(activeAlarmEvent.id, 'forgot')}
                        className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg text-left"
                      >
                        I forgot
                      </button>
                      <button
                        onClick={() => handleReasonSelect(activeAlarmEvent.id, 'felt_unwell')}
                        className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg text-left text-rose-300"
                      >
                        Felt unwell
                      </button>
                      <button
                        onClick={() => handleReasonSelect(activeAlarmEvent.id, 'out_of_medicine')}
                        className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg text-left text-amber-300"
                      >
                        Out of meds
                      </button>
                    </div>
                  </div>
                ) : selectedEventForBusy === activeAlarmEvent.id ? (
                  <div className="p-3 bg-slate-900/90 rounded-xl space-y-2 border border-sky-500/30 animate-in fade-in">
                    <p className="text-xs text-slate-200 font-semibold">No problem. Reschedule reminder:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleBusySnoozeSelect(activeAlarmEvent.id, 15)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg font-semibold"
                      >
                        15 minutes
                      </button>
                      <button
                        onClick={() => handleBusySnoozeSelect(activeAlarmEvent.id, 30)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg font-semibold"
                      >
                        30 minutes
                      </button>
                      <button
                        onClick={() => handleBusySnoozeSelect(activeAlarmEvent.id, 60)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded-lg font-semibold"
                      >
                        1 hour
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    {/* Action Buttons Grid (§6) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <button
                        id="action-taken-btn"
                        onClick={() => handleActionClick(activeAlarmEvent.id, 'taken')}
                        className="px-3 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{activeLanguage === 'Tamil' ? 'எடுத்துக்கொண்டேன்' : 'I took it'}</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(activeAlarmEvent.id, 'snooze')}
                        className="px-3 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>15m Snooze</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(activeAlarmEvent.id, 'busy')}
                        className="px-3 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>I'm busy</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(activeAlarmEvent.id, 'missed')}
                        className="px-3 py-2 text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>I missed it</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(activeAlarmEvent.id, 'help')}
                        className="px-3 py-2 text-xs font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Need help</span>
                      </button>
                    </div>

                    {/* Instant Telegram Caregiver Notification Trigger Button (§8 Demo) */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => handleTestEscalation(activeAlarmEvent.id)}
                        id="test-telegram-btn"
                        className="text-[11px] font-semibold text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-300" />
                        <span>⚡ Test Instant Caregiver Escalation (Telegram / In-App)</span>
                      </button>
                      <span className="text-[10px] text-slate-300">
                        Simulates no-response escalation (§8)
                      </span>
                    </div>

                    {escalationStatus && (
                      <div
                        className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                          escalationStatus.success
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                            : escalationStatus.error
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{escalationStatus.message}</span>
                      </div>
                    )}
                  </div>

                )}
              </div>
            ) : (
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center text-xs text-sky-200">
                🎉 All current dose reminders for today are confirmed! Next scheduled dose will trigger automatically.
              </div>
            )}
          </div>
        </div>

        {/* Adherence Card (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold font-['Outfit'] text-slate-900">
                Adherence Rate (§19)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Deterministic Math
            </span>
          </div>

          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-500 text-emerald-700 text-2xl font-black font-['Outfit']">
              {adherence?.adherence_percentage || 100}%
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-2">
              Status: {adherence?.status_label || 'Excellent'}
            </p>
            <p className="text-[11px] text-slate-500">
              {adherence?.total_taken || 0} taken of {adherence?.total_scheduled || 0} scheduled doses
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Missed Doses: <strong>{adherence?.total_missed || 0}</strong></span>
            <span>Active Streak: <strong>{adherence?.current_streak_days || 0} days</strong></span>
          </div>
        </div>
      </div>

      {/* Chemotherapy Appointment & Hydration Notice (§15) */}
      {appointments && appointments.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
              <Syringe className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-300/30 inline-block mb-1">
                CHEMOTHERAPY CLINIC APPOINTMENT (§15)
              </span>
              <h4 className="text-sm font-bold">{appointments[0].treatment_type}</h4>
              <p className="text-xs text-purple-200">
                Date: {appointments[0].scheduled_date} at {appointments[0].scheduled_time} • {appointments[0].location}
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-xl text-xs text-purple-100 max-w-xs shrink-0">
            💧 <strong>Hydration Notice:</strong> Maintain 2–3 liters fluid intake to prevent Cyclophosphamide bladder toxicity.
          </div>
        </div>
      )}

      {/* Regimen Active Medications List + Stock / Refill Inventory (§16) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Meds (2 Cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold font-['Outfit'] text-slate-900">
                Active Regimen Medications ({medications.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {medications.map((m) => {
              const isOral = (m.route || '').toLowerCase() === 'oral';
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border ${
                    isOral ? 'border-sky-200 bg-sky-50/20' : 'border-purple-200 bg-purple-50/20'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOral ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {m.route?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <div><strong>Dose:</strong> {m.strength || m.dose}</div>
                    <div><strong>Frequency:</strong> {m.frequency}</div>
                    <div><strong>Timing:</strong> {m.scheduled_times?.join(', ')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refill & Supply Inventory (§16) (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold font-['Outfit'] text-slate-900">
                Medication Inventory (§16)
              </h3>
            </div>
          </div>

          {inventory && inventory.length > 0 ? (
            <div className="space-y-3">
              {inventory.map((inv) => (
                <div
                  key={inv.id}
                  className={`p-3 rounded-xl border ${
                    inv.refill_alert_active
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                  } space-y-1`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{inv.medication_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        inv.refill_alert_active
                          ? 'bg-amber-200 text-amber-900 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {inv.current_quantity} remaining
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Days left: ~{inv.days_remaining} d</span>
                    <span>Refill at: &le;{inv.refill_threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Inventory is tracked for oral medications.</p>
          )}
        </div>
      </div>

      {/* Cycle Dose Event Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold font-['Outfit'] text-slate-900">
              21-Day Cycle Dose Timeline ({doseEvents.length} Events)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Scheduled Time</th>
                <th className="p-3">Medication</th>
                <th className="p-3">Dose & Route</th>
                <th className="p-3">Status</th>
                <th className="p-3">Support Notes</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doseEvents.slice(0, 10).map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-medium text-slate-700">
                    {new Date(ev.scheduled_time).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{ev.medication_name}</td>
                  <td className="p-3 text-slate-600">{ev.dose}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.status === 'taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.status === 'missed'
                          ? 'bg-rose-100 text-rose-800'
                          : ev.status === 'snoozed' || ev.status === 'busy'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {ev.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 italic max-w-xs truncate">
                    {ev.support_notes || '—'}
                  </td>
                  <td className="p-3 text-right">
                    {ev.status === 'scheduled' || ev.status === 'snoozed' ? (
                      <button
                        onClick={() => onDoseAction(ev.id, { action: 'taken' })}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Taken
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
