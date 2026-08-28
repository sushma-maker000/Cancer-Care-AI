"""
RAG Knowledge Base Documents (§10, §11)
========================================
Pre-curated, chunked knowledge derived from:
  - Docetaxel Product Monograph (Health Canada / NCI)
  - Cyclophosphamide Product Monograph (Health Canada / NCI)
  - Dexamethasone Product Monograph (Health Canada)
  - Aprepitant (EMEND) Product Monograph (Merck)
  - NCI Eating Hints: Before, During, and After Cancer Treatment
  - IAPEN India Oncology Nutrition Consensus Guidelines

Structured as chunks with metadata for fast, accurate retrieval.
"""

KNOWLEDGE_CHUNKS = [

    # =====================================================================
    # DOCETAXEL — Medication Knowledge Base
    # =====================================================================
    {
        "id": "docetaxel_001",
        "text": (
            "Docetaxel (Taxotere) is a chemotherapy drug belonging to the taxane class. "
            "It is used in the treatment of breast cancer, non-small cell lung cancer, prostate cancer, "
            "gastric cancer, and head and neck cancer. In breast cancer, the TC regimen uses Docetaxel "
            "75 mg/m² given as an intravenous infusion on Day 1 of each 21-day cycle for 4 planned cycles."
        ),
        "metadata": {
            "source": "Docetaxel Product Monograph",
            "drug_name": "Docetaxel",
            "knowledge_type": "medication",
            "topic": "uses",
        },
    },
    {
        "id": "docetaxel_002",
        "text": (
            "Docetaxel must be given as a 1-hour intravenous infusion in a clinic or hospital setting. "
            "Patients must receive premedication with Dexamethasone 8 mg twice daily for 3 days, "
            "starting one day before Docetaxel administration. This premedication reduces the risk "
            "of severe fluid retention and hypersensitivity reactions."
        ),
        "metadata": {
            "source": "Docetaxel Product Monograph",
            "drug_name": "Docetaxel",
            "knowledge_type": "medication",
            "topic": "administration",
        },
    },
    {
        "id": "docetaxel_003",
        "text": (
            "Common side effects of Docetaxel include: hair loss (alopecia), fatigue, nausea, vomiting, "
            "diarrhea, mouth sores (stomatitis/mucositis), skin and nail changes, fluid retention (edema), "
            "and low blood counts. Most of these are manageable and temporary."
        ),
        "metadata": {
            "source": "Docetaxel Product Monograph",
            "drug_name": "Docetaxel",
            "knowledge_type": "medication",
            "topic": "common adverse effects",
        },
    },
    {
        "id": "docetaxel_004",
        "text": (
            "Serious side effects of Docetaxel that require prompt medical attention include: "
            "febrile neutropenia (fever ≥38.1°C with low white blood cells — nadir typically Day 7-10), "
            "severe fluid retention, peripheral neuropathy (numbness and tingling in hands and feet), "
            "cystoid macular edema (changes in vision), and severe hypersensitivity reactions. "
            "Report any of these immediately to your oncology team."
        ),
        "metadata": {
            "source": "Docetaxel Product Monograph",
            "drug_name": "Docetaxel",
            "knowledge_type": "medication",
            "topic": "serious adverse effects",
        },
    },
    {
        "id": "docetaxel_005",
        "text": (
            "Hair loss (alopecia) is very common with Docetaxel, occurring in approximately 75% of patients. "
            "Hair typically begins to fall out 2-4 weeks after the first treatment. It generally grows back "
            "after treatment ends, though the texture or color may be slightly different initially. "
            "Cold cap therapy may reduce hair loss for some patients — discuss this option with your oncology team."
        ),
        "metadata": {
            "source": "Docetaxel Product Monograph",
            "drug_name": "Docetaxel",
            "knowledge_type": "medication",
            "topic": "common adverse effects",
        },
    },

    # =====================================================================
    # CYCLOPHOSPHAMIDE — Medication Knowledge Base
    # =====================================================================
    {
        "id": "cyclophosphamide_001",
        "text": (
            "Cyclophosphamide is an alkylating chemotherapy agent used in breast cancer treatment "
            "as part of the TC regimen (Docetaxel + Cyclophosphamide). The standard breast cancer dose "
            "is 600 mg/m² given as an intravenous infusion on Day 1 of each 21-day cycle."
        ),
        "metadata": {
            "source": "Cyclophosphamide Product Monograph",
            "drug_name": "Cyclophosphamide",
            "knowledge_type": "medication",
            "topic": "uses",
        },
    },
    {
        "id": "cyclophosphamide_002",
        "text": (
            "Hemorrhagic cystitis is a serious potential side effect of Cyclophosphamide caused by its "
            "metabolite acrolein irritating the bladder lining. To prevent this, patients MUST maintain "
            "strong hydration: drink 2 to 3 litres of fluids every day during treatment. Urinate frequently. "
            "Report any blood in urine (hematuria — red, pink, or tea-coloured urine) IMMEDIATELY to your "
            "oncology team or go to the emergency department."
        ),
        "metadata": {
            "source": "Cyclophosphamide Product Monograph",
            "drug_name": "Cyclophosphamide",
            "knowledge_type": "medication",
            "topic": "warnings",
        },
    },
    {
        "id": "cyclophosphamide_003",
        "text": (
            "Common side effects of Cyclophosphamide include: nausea and vomiting (managed by Aprepitant "
            "and Dexamethasone premedication), hair loss (alopecia), low blood counts (neutropenia, anemia, "
            "thrombocytopenia), mouth sores, and fatigue. Fertility impact should be discussed with your "
            "doctor before starting treatment."
        ),
        "metadata": {
            "source": "Cyclophosphamide Product Monograph",
            "drug_name": "Cyclophosphamide",
            "knowledge_type": "medication",
            "topic": "common adverse effects",
        },
    },

    # =====================================================================
    # DEXAMETHASONE — Medication Knowledge Base
    # =====================================================================
    {
        "id": "dexamethasone_001",
        "text": (
            "Dexamethasone 8 mg is prescribed as a premedication before Docetaxel chemotherapy. "
            "It is taken as one tablet in the morning and one tablet in the evening (8 mg twice daily) "
            "for 3 consecutive days, starting the day before chemotherapy (Day -1). "
            "It must be taken WITH FOOD to reduce stomach irritation. This premedication prevents "
            "severe fluid retention and reduces the risk of serious allergic reactions to Docetaxel."
        ),
        "metadata": {
            "source": "Dexamethasone Product Monograph",
            "drug_name": "Dexamethasone",
            "knowledge_type": "medication",
            "topic": "administration",
        },
    },
    {
        "id": "dexamethasone_002",
        "text": (
            "Common side effects of Dexamethasone (short-course, 3-day use as premedication) include: "
            "increased appetite, difficulty sleeping (insomnia), mild mood changes, mild fluid retention, "
            "elevated blood sugar (particularly relevant for diabetic patients), and stomach discomfort. "
            "These are generally temporary given the short 3-day course."
        ),
        "metadata": {
            "source": "Dexamethasone Product Monograph",
            "drug_name": "Dexamethasone",
            "knowledge_type": "medication",
            "topic": "common adverse effects",
        },
    },
    {
        "id": "dexamethasone_003",
        "text": (
            "Important drug interaction: When Dexamethasone is taken together with Aprepitant (EMEND), "
            "Aprepitant inhibits the CYP3A4 enzyme and increases Dexamethasone blood levels by approximately "
            "2.2-fold. For this reason, the Dexamethasone dose is already adjusted in your regimen. "
            "Do not take additional Dexamethasone without consulting your oncologist."
        ),
        "metadata": {
            "source": "Dexamethasone Product Monograph",
            "drug_name": "Dexamethasone",
            "knowledge_type": "medication",
            "topic": "food/drug considerations",
        },
    },

    # =====================================================================
    # APREPITANT (EMEND) — Medication Knowledge Base
    # =====================================================================
    {
        "id": "aprepitant_001",
        "text": (
            "Aprepitant (EMEND) 80 mg is an NK1 receptor antagonist antiemetic used to prevent "
            "chemotherapy-induced nausea and vomiting (CINV). In your TC regimen, one 80 mg capsule "
            "is taken once daily in the morning on Day 2 and Day 3 following your chemotherapy infusion. "
            "It works by blocking the neurokinin-1 pathway that triggers delayed CINV."
        ),
        "metadata": {
            "source": "Aprepitant (EMEND) Product Monograph",
            "drug_name": "Aprepitant",
            "knowledge_type": "medication",
            "topic": "uses",
        },
    },
    {
        "id": "aprepitant_002",
        "text": (
            "Common side effects of Aprepitant include: fatigue, constipation, hiccups, headache, "
            "decreased appetite, and diarrhea. These are generally mild. "
            "Serious side effects are rare but include allergic reactions — stop and seek medical care "
            "if you develop rash, difficulty breathing, or facial swelling after taking Aprepitant."
        ),
        "metadata": {
            "source": "Aprepitant (EMEND) Product Monograph",
            "drug_name": "Aprepitant",
            "knowledge_type": "medication",
            "topic": "common adverse effects",
        },
    },
    {
        "id": "aprepitant_003",
        "text": (
            "Important drug interaction for Aprepitant: It is a moderate CYP3A4 inhibitor and CYP2C9 inducer. "
            "If you are taking oral contraceptives (birth control pills), Aprepitant may reduce their "
            "effectiveness during treatment and for 28 days after your last Aprepitant dose. "
            "Use an additional barrier contraceptive method (e.g., condoms) during this period. "
            "Also report to your doctor if you take Warfarin (blood thinner), as Aprepitant may affect INR levels."
        ),
        "metadata": {
            "source": "Aprepitant (EMEND) Product Monograph",
            "drug_name": "Aprepitant",
            "knowledge_type": "medication",
            "topic": "food/drug considerations",
        },
    },

    # =====================================================================
    # NUTRITION — NCI Eating Hints + IAPEN India Guidelines
    # =====================================================================
    {
        "id": "nutrition_nausea_001",
        "text": (
            "For nausea and vomiting during chemotherapy (NCI Eating Hints): "
            "Eat small, frequent meals every 2-3 hours instead of 3 large meals. "
            "Choose bland, easy-to-digest foods such as crackers, pretzels, toast, bananas, and rice. "
            "Eat foods at room temperature (not too hot or too cold). "
            "Drink fluids between meals rather than with meals to avoid a full stomach. "
            "Ginger tea or ginger candies may help relieve mild nausea. "
            "Avoid strong-smelling, greasy, spicy, or very sweet foods."
        ),
        "metadata": {
            "source": "NCI Eating Hints: Before, During, and After Cancer Treatment",
            "knowledge_type": "nutrition",
            "topic": "nausea",
        },
    },
    {
        "id": "nutrition_nausea_002",
        "text": (
            "Aprepitant and Dexamethasone are prescribed in your regimen specifically to control "
            "chemotherapy-induced nausea and vomiting. Take Aprepitant on Day 2 and Day 3 exactly as "
            "prescribed. Take Dexamethasone with food. Beyond medicines, rest in a quiet, airy room after "
            "meals, avoid lying flat immediately after eating, and wear loose comfortable clothing."
        ),
        "metadata": {
            "source": "NCI Eating Hints + IAPEN India Guidelines",
            "knowledge_type": "nutrition",
            "topic": "nausea",
        },
    },
    {
        "id": "nutrition_taste_001",
        "text": (
            "Metallic or bitter taste changes are common with chemotherapy (NCI Eating Hints). "
            "Use plastic or bamboo utensils instead of metal cutlery to reduce metallic taste. "
            "Marinate meats or proteins in fruit juices, sweet sauces, or mild vinegar before cooking. "
            "Try tart drinks like lemonade or tamarind water to mask metallic taste. "
            "Cold or room-temperature foods often taste better than hot foods. "
            "Brush teeth before meals and rinse mouth with baking soda solution (1/4 tsp baking soda in 1 cup water)."
        ),
        "metadata": {
            "source": "NCI Eating Hints: Before, During, and After Cancer Treatment",
            "knowledge_type": "nutrition",
            "topic": "taste changes",
        },
    },
    {
        "id": "nutrition_mouth_001",
        "text": (
            "For mouth sores (stomatitis/mucositis) during chemotherapy: "
            "Rinse mouth 4-6 times daily with a baking soda-salt solution: mix 1/4 teaspoon baking soda "
            "+ 1/8 teaspoon salt in 1 cup warm water. Do NOT use commercial mouthwashes with alcohol. "
            "Eat soft, moist foods: idli, upma, khichdi, curd rice, soft paneer, scrambled eggs, "
            "mashed vegetables, soups, and smoothies. "
            "Avoid: acidic foods (citrus, tomatoes, tamarind), spicy foods, rough-textured hard foods, "
            "and alcohol or tobacco."
        ),
        "metadata": {
            "source": "NCI Eating Hints + IAPEN India Oncology Nutrition Guidelines",
            "knowledge_type": "nutrition",
            "topic": "mouth/throat problems",
        },
    },
    {
        "id": "nutrition_appetite_001",
        "text": (
            "For appetite loss and fatigue during chemotherapy (IAPEN India Guidelines + NCI): "
            "Target energy intake of 25-30 kcal/kg body weight per day. "
            "Target protein intake of 1.2-1.5 g/kg body weight per day. "
            "Indian protein-rich options: lentils (dal), chickpeas (chana), moong, paneer, curd (yogurt), "
            "eggs, fish, chicken, soy milk, and tofu. "
            "Small frequent meals are better tolerated. Add calorie-dense foods like groundnuts, "
            "coconut, ghee (in moderation), and milkshakes/smoothies between meals."
        ),
        "metadata": {
            "source": "IAPEN India Oncology Nutrition Consensus Guidelines",
            "knowledge_type": "nutrition",
            "topic": "appetite loss",
        },
    },
    {
        "id": "nutrition_hydration_001",
        "text": (
            "Hydration is extremely important during chemotherapy, especially with Cyclophosphamide. "
            "Aim to drink 2-3 litres of fluids daily: water, coconut water, diluted fruit juices, "
            "clear soups, buttermilk (chaas), nimbu pani (fresh lime water), and herbal teas. "
            "Avoid alcohol and caffeinated drinks in excess. If vomiting, use oral rehydration solutions (ORS). "
            "Adequate hydration protects the bladder from Cyclophosphamide toxicity."
        ),
        "metadata": {
            "source": "NCI Eating Hints + Cyclophosphamide Monograph",
            "knowledge_type": "nutrition",
            "topic": "hydration",
        },
    },
    {
        "id": "nutrition_safety_001",
        "text": (
            "Food safety during chemotherapy (neutropenic diet guidelines, NCI + IAPEN India): "
            "When white blood cells are low (nadir period, Day 7-14 after chemotherapy), follow strict "
            "food safety practices: Cook all meats and eggs thoroughly. Wash all fruits and vegetables "
            "under running water before cutting. Avoid raw sprouts, unpasteurized dairy, raw eggs, "
            "and food from street stalls. Refrigerate leftovers within 2 hours and reheat fully. "
            "This reduces the risk of foodborne infection during immunosuppression."
        ),
        "metadata": {
            "source": "NCI Eating Hints + IAPEN India Guidelines",
            "knowledge_type": "nutrition",
            "topic": "food safety",
        },
    },
    {
        "id": "nutrition_supplements_001",
        "text": (
            "Antioxidant supplements during chemotherapy — important caution (IAPEN India Guidelines): "
            "Avoid taking high-dose antioxidant supplements (Vitamin C, Vitamin E, Beta-Carotene, "
            "Selenium) during chemotherapy without consulting your oncologist. "
            "High-dose antioxidants may potentially reduce the effectiveness of chemotherapy. "
            "Omega-3 fatty acids (fish oil, walnuts, flaxseeds) may be beneficial and can be discussed "
            "with your oncology team. Focus on getting nutrients through whole foods."
        ),
        "metadata": {
            "source": "IAPEN India Oncology Nutrition Consensus Guidelines",
            "knowledge_type": "nutrition",
            "topic": "nutrition during cancer treatment",
        },
    },
    {
        "id": "nutrition_constipation_001",
        "text": (
            "Constipation is a common side effect of Aprepitant and some pain medications. "
            "To manage constipation: Increase fluid intake to 8-10 glasses of water daily. "
            "Eat fibre-rich foods: fruits (papaya, guava, pears), vegetables, whole grains, and legumes. "
            "Light walking or gentle activity helps bowel motility. "
            "If constipation persists more than 3 days or is accompanied by pain, contact your oncology team."
        ),
        "metadata": {
            "source": "NCI Eating Hints",
            "knowledge_type": "nutrition",
            "topic": "constipation",
        },
    },

    # =====================================================================
    # CANCER EDUCATION
    # =====================================================================
    {
        "id": "cancer_tc_regimen_001",
        "text": (
            "The TC regimen (Docetaxel + Cyclophosphamide) is a standard adjuvant chemotherapy treatment "
            "for early-stage breast cancer, including HER2-positive and hormone receptor-positive subtypes. "
            "Research has shown TC to be effective with a manageable side effect profile compared to "
            "older AC regimens. It is given every 21 days for 4 cycles, totalling approximately 3 months."
        ),
        "metadata": {
            "source": "NCI Cancer Information",
            "knowledge_type": "cancer",
            "topic": "chemotherapy",
        },
    },
    {
        "id": "cancer_neutropenia_001",
        "text": (
            "Neutropenia (low white blood cell count) is the most common serious side effect of TC "
            "chemotherapy. The lowest point (nadir) typically occurs 7-14 days after each chemotherapy dose. "
            "During this period, your immune system is at its weakest. Signs of infection to watch for: "
            "fever ≥38.1°C, chills, sore throat, cough, burning on urination, and redness/swelling around "
            "any wound or IV site. Always call your oncology team or emergency services immediately for fever "
            "during chemotherapy — do not wait to see if it gets better on its own."
        ),
        "metadata": {
            "source": "NCI Cancer Information",
            "knowledge_type": "cancer",
            "topic": "side effects",
        },
    },
]
