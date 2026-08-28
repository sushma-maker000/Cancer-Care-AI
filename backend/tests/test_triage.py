import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.safety.triage_rules import triage_symptom

tests = [
    ("I noticed blood in my urine", "red_flag"),
    ("I have high fever and chills", "red_flag"),
    ("tingling and numbness in my fingers", "concerning"),
    ("I feel a bit nauseous after my medicine", "low_concern"),
    ("what can I eat during chemo", "low_concern"),
    ("severe chest pain and difficulty breathing", "red_flag"),
    ("blurred vision since yesterday", "concerning"),
    ("My lips are swelling", "red_flag"),
]

all_pass = True
for symptom, expected in tests:
    level, ctx, msg = triage_symptom(symptom)
    status = "PASS" if level == expected else f"FAIL (got {level})"
    if level != expected:
        all_pass = False
    print(f"[{status}] \"{symptom[:45]}\" -> {level}")

print()
print("All safety triage tests passed!" if all_pass else "Some tests FAILED!")
