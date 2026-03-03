from rag.vectordb import VectorDB

db = VectorDB()

sample_text = """
Dataset has 1025 rows.
Chol column has 18 percent missing values.
Strong positive correlation between age and chol (0.62).
"""

db.add_document(
    doc_id="snapshot_001",
    text=sample_text,
    metadata={"document_type": "dataset_snapshot"}
)

results = db.query("Which column has missing values?")

print(results["documents"])