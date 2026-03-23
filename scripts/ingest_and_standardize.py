import json
import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA_DIR = BASE /  "data"
OUTPUT = BASE / "dashboard"/ "fhir_bundle.json"

# Load three sources
country_a = pd.read_csv(DATA_DIR / "country_a_ngo_cases.csv")

with open(DATA_DIR / "country_b_ngo_cases.json") as f:
    country_b = pd.DataFrame(json.load(f))

country_c = pd.read_excel(DATA_DIR / "country_c_ngo_cases.xlsx")

# Normalize columns to a common schema

country_a_n = country_a.rename(columns={
    "patient_id": "case_id",
    "disease": "condition",
    "treatment_date": "treatment_date",
})

country_b_n = country_b.rename(columns={
    "id": "case_id",
    "age_years": "age",
    "condition": "condition",
    "tx_date": "treatment_date",
})

country_c_n = country_c.rename(columns={
    "case_id": "case_id",
    "diagnosis": "condition",
    "date_given": "treatment_date",
})

all_cases = pd.concat([country_a_n, country_b_n, country_c_n], ignore_index=True)

# Build a very small FHIR-like Bundle (not fully compliant, just illustrative)

entries = []
for i, row in all_cases.iterrows():
    patient_id = f"Patient/{row['case_id']}"
    encounter_id = f"Encounter/{row['case_id']}"
    condition_id = f"Condition/{row['case_id']}"

    patient = {
        "resourceType": "Patient",
        "id": row["case_id"],
        "extension": [
            {
                "url": "http://example.org/fhir/StructureDefinition/patient-country",
                "valueString": row["country"],
            }
        ],
        "extension_age": row["age"],
    }

    encounter = {
        "resourceType": "Encounter",
        "id": row["case_id"],
        "subject": {"reference": patient_id},
        "period": {"start": row["treatment_date"]},
    }

    condition = {
        "resourceType": "Condition",
        "id": row["case_id"],
        "subject": {"reference": patient_id},
        "code": {"text": row["condition"]},
    }

    entries.extend([
        {"resource": patient},
        {"resource": encounter},
        {"resource": condition},
    ])

bundle = {
    "resourceType": "Bundle",
    "type": "collection",
    "entry": entries,
}

OUTPUT.write_text(json.dumps(bundle, indent=2))
print(f"Wrote {OUTPUT}")
