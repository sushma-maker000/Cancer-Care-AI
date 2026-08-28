# CancerCare AI — Antigravity Build Specification

## 0. Project purpose

Build a 36-hour hackathon MVP called **CancerCare AI**.

The product is a **cancer-focused medication adherence and patient-support assistant**.

The app is NOT an autonomous doctor and must not diagnose cancer, change prescriptions, or independently instruct a patient to stop/start medication.

The core loop is:

Patient profile → prescription upload → medication extraction → patient confirmation → schedule → reminders → patient response → adherence tracking → symptom support → safety escalation → caregiver notification.

---

# 1. MVP in one horizontal flow

```text
PATIENT
  →
PROFILE + LANGUAGE
  →
PRESCRIPTION (IMAGE/PDF)
  →
OCR / DOCUMENT EXTRACTION
  →
MEDICATION JSON
  →
PATIENT CONFIRMS
  →
MEDICATION SCHEDULE
  →
REMINDER / ALARM
  →
[TAKEN] [SNOOZE] [MISSED] [BUSY] [NEED HELP]
  →
ADHERENCE ENGINE
  →
IF MISSED → ASK REASON → EMPATHETIC SUPPORT
  →
IF NO RESPONSE → CAREGIVER ESCALATION
  →
IF SYMPTOM → SAFETY RULES + MEDICATION KNOWLEDGE RAG
  →
IF GENERAL QUESTION → CANCER / MEDICATION / NUTRITION RAG
  →
CHATBOT RESPONSE + SOURCES
```

---

# 2. Main features

## P0 — Must work

1. Patient profile
2. Preferred language selection
3. Patient name
4. Age
5. Gender
6. Smoking status
7. Alcohol consumption
8. Medical history
9. Disease/condition
10. Caregiver contact information
11. Prescription upload as image
12. Prescription upload as PDF
13. Prescription OCR
14. Medication extraction
15. Medication confirmation/editing
16. Medication name, dose, frequency, route, duration and timing
17. Medication schedule
18. Reminder/alarm UI
19. Action buttons instead of requiring typing
20. Taken / Missed / Snooze / Busy / Need Help actions
21. Missed-dose reason collection
22. Empathetic adherence coaching
23. Adherence calculation
24. No-response escalation to caregiver
25. Symptom/side-effect chat
26. Medication-specific knowledge retrieval
27. Cancer-support knowledge retrieval
28. Basic caregiver notification
29. Inventory tracking
30. Low-inventory reminder
31. AI chatbot
32. Text chat

## P1 — Add after P0 is stable

33. Native-language voice input
34. Tamil as first demonstration language
35. Oncology nutrition RAG
36. Emotional-support conversations
37. Chemotherapy appointment/treatment reminder
38. Caregiver email/notification
39. Adherence dashboard/chart

## P2 — Only if time remains

40. Voice response/TTS
41. FHIR/ABDM
42. Advanced personalization
43. Multiple caregivers
44. Advanced analytics

---

# 3. Patient profile

Create a patient onboarding form.

Fields:

```text
patient_id
name
age
gender
preferred_language
smoking_status
alcohol_consumption
medical_history
condition_or_disease
cancer_type
treatment_type
caregiver_name
caregiver_email
caregiver_phone
notification_preference
created_at
updated_at
```

Use synthetic patient data for the hackathon.

Do not require real patient data.

---

# 4. Prescription ingestion

Support:

```text
.jpg
.jpeg
.png
.pdf
```

Flow:

```text
Upload
  →
Validate file
  →
Mistral OCR
  →
OCR markdown/text
  →
Mistral structured extraction
  →
Medication JSON
  →
Patient confirmation
  →
Database
```

Use Mistral OCR for both PDF and image ingestion.

Use Mistral structured JSON output for extraction.

Example target JSON:

```json
{
  "medications": [
    {
      "name": "example medicine",
      "strength": "500 mg",
      "dose": "1 tablet",
      "route": "oral",
      "frequency": "twice daily",
      "times": ["08:00", "20:00"],
      "duration_days": 30,
      "instructions": "as written on prescription",
      "confidence": 0.91
    }
  ]
}
```

Never activate a medication automatically.

Require:

```text
OCR result
→ patient reviews
→ patient confirms
→ schedule becomes active
```

If confidence is low, flag the field for manual confirmation.

---

# 5. Medication schedule

Store:

```text
medication_id
patient_id
name
strength
dose
route
frequency
scheduled_times
start_date
end_date
instructions
source_prescription_id
```

Generate dose events.

Example:

```text
Medicine A
08:00 → scheduled
20:00 → scheduled
```

The scheduler creates dose events.

---

# 6. Reminder UX

The reminder should be conversational but primarily button-driven.

Example:

```text
🔔 Time for your medicine

Medicine: Example Drug
Dose: 1 tablet
Time: 8:00 AM

[ I took it just now ]
[ Remind me in 15 min ]
[ I'm busy ]
[ I missed it ]
[ I need help ]
```

If the patient selects "I'm busy":

```text
No problem. What would help?

[ 15 minutes ]
[ 30 minutes ]
[ 1 hour ]
[ Choose a time ]
```

If patient selects "I missed it":

```text
That's okay. What happened?

[ I was busy ]
[ I forgot ]
[ I felt unwell ]
[ I didn't have the medicine ]
[ Something else ]
```

Do NOT make the patient type unless they choose "Something else."

---

# 7. Empathetic adherence logic

Use deterministic event logic first.

Example:

```text
MISSED DOSE
   →
ASK REASON
   →
BUSY
   →
supportive suggestion
```

Example response:

> "It happens. If you're often busy at this time, we can remind you a little earlier. Keeping the medicine near something you use regularly, such as your phone or keys, may also make it easier to remember."

For:

```text
FORGOT
```

suggest:

- earlier reminder
- repeat reminder
- medication routine
- visible reminder location

For:

```text
DID NOT HAVE MEDICINE
```

trigger inventory/refill pathway.

For:

```text
FELT UNWELL
```

route to symptom/safety workflow.

Do not tell the patient to double the next dose.

Do not invent missed-dose instructions. If the prescription/official medication information does not answer the question, tell the patient to contact their healthcare professional.

---

# 8. No-response escalation

Example MVP rule:

```text
Reminder
  →
wait 15 minutes
  →
follow-up reminder
  →
wait configured threshold
  →
no response
  →
caregiver notification
```

Make the threshold configurable.

Database field:

```text
escalation_after_minutes
```

Caregiver message should contain minimal information:

```text
"Medication reminder:
A scheduled medication dose has not been confirmed by the patient."
```

Do not expose unnecessary medical details.

---

# 9. Symptom/side-effect workflow

Patient can type:

> "I feel dizzy after taking my medicine."

Flow:

```text
Patient symptom
  →
LLM extracts symptom + medication context
  →
Safety rules
  →
Retrieve relevant medication information
  →
Generate patient-friendly response
```

The system must distinguish:

```text
LOW CONCERN
→ general information + monitoring guidance

CONCERNING
→ advise contacting healthcare team

RED FLAG
→ urgent/emergency care recommendation according to configured safety policy
```

The LLM must NOT be the sole decision-maker for emergency escalation.

Use deterministic safety rules for known red-flag patterns.

The LLM can:
- understand the patient's wording
- identify relevant medication
- retrieve information
- explain information clearly

The rules/policy layer decides the escalation category.

---

# 10. Medical knowledge / RAG

There is no need to train a cancer model.

Create a trusted medical knowledge base.

Use three logical collections:

```text
MEDICATION_KB
CANCER_KB
NUTRITION_KB
```

## Medication KB

Use trusted public sources such as:

- DailyMed
- MedlinePlus
- RxNorm/RxNav
- NCI cancer drug information where applicable

Store metadata:

```text
source
title
url
drug_name
topic
document_date
chunk_id
```

Topics:

```text
uses
dosage information
administration
warnings
common adverse effects
serious adverse effects
food/drug considerations
patient information
```

## Cancer KB

Use National Cancer Institute public resources.

Topics:

```text
cancer types
treatment
chemotherapy
immunotherapy
radiation
side effects
supportive care
questions for healthcare team
```

## Nutrition KB

Use NCI cancer nutrition resources and other appropriately licensed/public health nutrition sources.

Topics:

```text
nutrition during cancer treatment
appetite loss
nausea
vomiting
diarrhea
constipation
mouth/throat problems
taste changes
food safety
malnutrition
hydration
```

The nutrition assistant is educational/supportive.

It must not claim that a food or diet can cure cancer.

---

# 11. RAG flow

```text
Trusted documents
      →
clean text
      →
chunk
      →
embeddings
      →
vector store
      →
retrieve top-k chunks
      →
LLM
      →
answer with source references
```

Use metadata filtering.

Example:

```text
question = "What are common side effects of my medicine?"

filter:
knowledge_type = medication
drug_name = identified medication
```

For:

```text
"What can I eat if treatment is making me nauseous?"
```

filter:

```text
knowledge_type = nutrition
topic = nausea
```

---

# 12. Chatbot

The chatbot supports:

```text
Medication questions
Symptom questions
Cancer education
Nutrition questions
Adherence support
Emotional support
General navigation
```

Intent routing:

```text
USER
 →
INTENT ROUTER
 →
MEDICATION RAG
CANCER RAG
NUTRITION RAG
ADHERENCE
SYMPTOM SAFETY
EMOTIONAL SUPPORT
GENERAL APP HELP
```

---

# 13. Native-language voice

First target language:

```text
Tamil
```

Flow:

```text
Patient speaks Tamil
      →
Whisper/faster-whisper
      →
Tamil text
      →
intent + RAG
      →
Tamil response
```

Use local/open-source Whisper/faster-whisper for Tamil voice rather than depending on a paid speech API.

Text translation/normalization can be added later if required.

Do not make voice a blocker for the P0 MVP.

---

# 14. Emotional support

The assistant should:

- acknowledge distress
- respond empathetically
- encourage support from trusted people
- suggest discussing treatment concerns with the healthcare team
- identify severe mental-health safety signals according to a defined escalation policy

Do not claim to be a therapist.

Do not make clinical mental-health diagnoses.

---

# 15. Chemotherapy reminder

For the MVP, interpret chemotherapy reminders as:

```text
Treatment appointment / chemotherapy session reminder
```

Store:

```text
treatment_id
patient_id
treatment_type
scheduled_date
scheduled_time
location
notes
```

Example:

```text
"Your chemotherapy appointment is tomorrow at 10:00 AM."
```

Do not attempt to calculate chemotherapy dosing.

---

# 16. Inventory

Store:

```text
inventory_id
patient_id
medication_id
initial_quantity
current_quantity
units_per_dose
refill_threshold
```

When a dose is confirmed:

```text
current_quantity
=
current_quantity - units_per_dose
```

Calculate estimated days remaining:

```text
days_remaining =
current_quantity / average_daily_units
```

If:

```text
days_remaining <= refill_threshold_days
```

show:

```text
"Your medication may run out in approximately X days."
```

Do not automatically order medicine.

---

# 17. Database architecture

Use PostgreSQL for application data.

Preferred:

```text
Neon PostgreSQL
```

Use local PostgreSQL if Neon setup becomes a blocker.

Core tables:

```text
patients
caregivers
prescriptions
medications
dose_events
adherence_events
inventory
symptom_reports
treatment_appointments
notifications
chat_sessions
```

RAG can use:

```text
ChromaDB
```

for the 36-hour MVP if that is already compatible with the Seedweek workflow.

Alternative:

```text
PostgreSQL + pgvector
```

Do not spend hackathon time migrating a working ChromaDB pipeline to pgvector.

---

# 18. Technology stack

## Frontend

```text
React
Vite
Tailwind CSS
```

## Backend

Preferred:

```text
Python
FastAPI
Pydantic
```

## Database

```text
PostgreSQL / Neon
```

## LLM

Use the user's existing:

```text
Mistral API
```

Keep the model name configurable:

```text
MISTRAL_MODEL
```

Do not hardcode an expensive model.

Use structured JSON output for medication extraction.

## Prescription OCR

Primary:

```text
Mistral OCR API
```

Fallback:

```text
Tesseract
```

## PDF

```text
PyMuPDF
```

## Voice

```text
faster-whisper
```

## RAG

```text
LangChain
sentence-transformers
ChromaDB
```

## Scheduler

```text
APScheduler
```

or a lightweight backend scheduler.

## Notifications

P0:

```text
browser/in-app notifications
```

Optional:

```text
Telegram Bot
```

Avoid Twilio/SMS unless free credits are explicitly available.

## Deployment

```text
Vercel for frontend
Free-tier backend where practical
```

Local demo is acceptable as backup.

---

# 19. What is deterministic vs AI?

## Deterministic code

These MUST NOT depend on the LLM:

```text
patient database
medication database
schedule calculation
reminder timing
snooze timing
dose event status
adherence percentage
inventory calculation
days remaining
caregiver escalation timer
safety red-flag policy
```

## AI / LLM

Use AI for:

```text
prescription text interpretation
structured medication extraction
intent classification
natural-language understanding
RAG answer generation
empathetic wording
symptom text extraction
native-language conversation
```

## RAG

Use RAG for:

```text
medication information
side-effect information
cancer education
nutrition education
supportive-care information
```

---

# 20. Backend API design

Create these endpoints.

## Patient

```text
POST   /api/patients
GET    /api/patients/{patient_id}
PUT    /api/patients/{patient_id}
```

## Prescription

```text
POST   /api/prescriptions/upload
GET    /api/prescriptions/{prescription_id}
POST   /api/prescriptions/{prescription_id}/confirm
```

## Medication

```text
GET    /api/patients/{patient_id}/medications
POST   /api/patients/{patient_id}/medications
PUT    /api/medications/{medication_id}
DELETE /api/medications/{medication_id}
```

## Dose events

```text
GET  /api/patients/{patient_id}/dose-events
POST /api/dose-events/{event_id}/taken
POST /api/dose-events/{event_id}/missed
POST /api/dose-events/{event_id}/snooze
POST /api/dose-events/{event_id}/busy
POST /api/dose-events/{event_id}/help
```

## Symptoms

```text
POST /api/symptoms/analyze
```

## Chat

```text
POST /api/chat
```

## Voice

```text
POST /api/voice/transcribe
```

## Inventory

```text
GET /api/patients/{patient_id}/inventory
PUT /api/inventory/{inventory_id}
```

## Caregiver

```text
POST /api/caregiver/notify
```

---

# 21. Suggested backend project structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── patients.py
│   │   ├── prescriptions.py
│   │   ├── medications.py
│   │   ├── dose_events.py
│   │   ├── symptoms.py
│   │   ├── chat.py
│   │   ├── voice.py
│   │   ├── inventory.py
│   │   └── caregiver.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── mistral_service.py
│   │   ├── ocr_service.py
│   │   ├── rag_service.py
│   │   ├── medication_service.py
│   │   ├── adherence_service.py
│   │   ├── reminder_service.py
│   │   ├── symptom_service.py
│   │   ├── inventory_service.py
│   │   └── notification_service.py
│   │
│   ├── safety/
│   │   └── triage_rules.py
│   │
│   ├── rag/
│   │   ├── ingest.py
│   │   ├── retriever.py
│   │   └── prompts.py
│   │
│   └── db/
│       ├── database.py
│       └── seed.py
│
├── tests/
├── requirements.txt
└── .env.example
```

---

# 22. Environment variables

Create:

```text
MISTRAL_API_KEY=
MISTRAL_MODEL=
DATABASE_URL=
TELEGRAM_BOT_TOKEN=
CAREGIVER_NOTIFICATION_ENABLED=false
```

Never commit `.env`.

Only commit:

```text
.env.example
```

---

# 23. Git workflow

After each stable feature:

```bash
git status
git add .
git commit -m "feat: ..."
git push
```

Recommended commits:

```text
chore: initialize project
feat: add patient profile
feat: add database models
feat: add prescription upload
feat: add prescription OCR
feat: add medication extraction
feat: add medication confirmation
feat: add reminder engine
feat: add dose action buttons
feat: add adherence tracking
feat: add symptom safety workflow
feat: add medication RAG
feat: add nutrition RAG
feat: add caregiver escalation
feat: add voice input
feat: add inventory tracking
feat: polish demo
```

---

# 24. 36-hour milestone plan

## Milestone 1 — Hours 0–3
Project setup

```text
Conda
Git
GitHub
FastAPI
React
environment
folder structure
```

Deliverable:

```text
Application runs locally.
```

## Milestone 2 — Hours 3–6
Patient profile + database

Deliverable:

```text
Create patient
Save patient
View patient dashboard
```

## Milestone 3 — Hours 6–10
Prescription ingestion

Deliverable:

```text
Upload image/PDF
→ OCR
→ extracted medication JSON
→ confirmation screen
```

## Milestone 4 — Hours 10–14
Medication schedule

Deliverable:

```text
Medication
→ dose
→ time
→ duration
→ dose events
```

## Milestone 5 — Hours 14–18
Reminder/adherence

Deliverable:

```text
Reminder
→ Taken / Snooze / Missed / Busy / Help
→ adherence %
```

## Milestone 6 — Hours 18–22
RAG

Deliverable:

```text
Medication RAG
Cancer RAG
Basic nutrition RAG
```

## Milestone 7 — Hours 22–25
Symptom safety

Deliverable:

```text
Symptom
→ medication context
→ safety rules
→ RAG
→ appropriate response/escalation
```

## Milestone 8 — Hours 25–28
Caregiver escalation

Deliverable:

```text
No response
→ caregiver notification
```

## Milestone 9 — Hours 28–31
Voice + emotional support

Deliverable:

```text
Tamil voice
→ text
→ chatbot
```

## Milestone 10 — Hours 31–34
Inventory + chemotherapy reminder + nutrition

Deliverable:

```text
Medication remaining
Chemotherapy appointment
Nutrition support
```

## Milestone 11 — Hours 34–36
Demo + testing

Do NOT add new features.

Test the complete patient journey.

---

# 25. The demo story

Use one synthetic patient.

```text
PATIENT CREATES PROFILE
        ↓
SELECTS TAMIL
        ↓
UPLOADS PRESCRIPTION
        ↓
AI READS PRESCRIPTION
        ↓
PATIENT CONFIRMS MEDICATION
        ↓
APP CREATES SCHEDULE
        ↓
8:00 AM REMINDER
        ↓
"I'M BUSY"
        ↓
15-MINUTE SNOOZE
        ↓
"TAKEN"
        ↓
ADHERENCE UPDATED
        ↓
LATER PATIENT REPORTS SYMPTOM
        ↓
AI IDENTIFIES MEDICATION CONTEXT
        ↓
SAFETY RULE + MEDICATION RAG
        ↓
IF CONCERNING → CONTACT CARE TEAM
        ↓
IF DOSE UNCONFIRMED → CAREGIVER ALERT
        ↓
MEDICATION RUNNING LOW
        ↓
REFILL REMINDER
        ↓
PATIENT ASKS NUTRITION QUESTION IN TAMIL
        ↓
NUTRITION RAG
        ↓
PERSONALIZED, SOURCE-GROUNDED RESPONSE
```

---

# 26. Antigravity rules

Before writing code:

1. Inspect the current workspace.
2. Inspect the Seedweek_Day1 reference structure if available.
3. Do not overwrite existing working code without explaining the change.
4. Preserve working RAG/adherence/notification components where possible.
5. Build one feature at a time.
6. Run tests after each major feature.
7. Do not install unnecessary dependencies.
8. Do not download large models unless required.
9. Prefer free/open-source/local components.
10. Use the existing Mistral API key for Mistral services.
11. Never expose the API key.
12. Never commit `.env`.
13. Use synthetic healthcare data only.
14. Do not upload real patient prescriptions to third-party services during development.
15. Do not make autonomous clinical decisions.
16. Keep medical safety rules separate from LLM prompts.
17. Do not add FHIR/ABDM unless the P0 features are already working.
18. Do not add advanced UI animations before core functionality works.
19. Commit and push after every stable milestone.
20. If a dependency or API is unavailable, stop and report the issue rather than silently replacing the architecture.

---

# 27. FIRST TASK FOR ANTIGRAVITY

Do NOT build the whole application immediately.

Start with:

```text
1. Inspect workspace
2. Inspect existing Seedweek_Day1 code/reference
3. Check Conda environment
4. Check Python
5. Check Git
6. Check GitHub remote
7. Create project structure
8. Create FastAPI skeleton
9. Create database configuration
10. Create patient profile schema
11. Create patient profile API
12. Create minimal React page for patient profile
13. Test backend
14. Test frontend
15. Stop
16. Report exactly what was changed
```

After that, wait for human approval before implementing prescription OCR.

---

# 28. Critical safety rule

This is a hackathon prototype.

The system must display a clear statement such as:

> "CancerCare AI provides medication-adherence support and general educational information. It does not replace your doctor or healthcare team. Do not change or stop medication based only on this assistant."

For urgent symptoms:

```text
Do not wait for the chatbot.
Contact your healthcare team or emergency services as appropriate.
```

Prescription extraction must always require confirmation.

---

# 29. Success criteria

The MVP is successful if a judge can watch this sequence without developer intervention:

```text
Create patient
→ upload prescription
→ see extracted medicine
→ confirm medicine
→ see schedule
→ receive reminder
→ click "I'm busy"
→ click "Taken"
→ see adherence update
→ simulate missed/no-response dose
→ see caregiver escalation
→ type a symptom
→ see safety-aware response
→ ask a cancer/nutrition question
→ receive RAG-grounded response with source
→ see inventory running low
```

This is the core definition of DONE.
