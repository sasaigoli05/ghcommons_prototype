# Global Health Data Lake MVP

This is a tiny demo showing how three mock NGO datasets in different formats can be ingested, standardized into a FHIR-like bundle, and displayed on a simple dashboard with a dummy chatbot.

## How to run

```bash
cd output/mvp_repo
python scripts/ingest_and_standardize.py   # creates dashboard/fhir_bundle.json
# then open dashboard/index.html in a browser (or host via GitHub Pages)
```
