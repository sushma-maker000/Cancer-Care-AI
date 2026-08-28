// Add chat API to api.js
export async function sendChatMessage(patientId, message, chatHistory = [], language = "English") {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: patientId,
      message,
      language,
      chat_history: chatHistory,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Chat request failed');
  }
  return res.json();
}
