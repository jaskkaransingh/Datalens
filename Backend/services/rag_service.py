from rag.vectordb import VectorDB
from rag.llm import OpenRouterLLM
from rag.formatter import format_snapshot
from rag.formatter import format_cleaning_update
from rag.formatter import format_visualization_event
import uuid

class RAGService:
    def __init__(self):
        self.db = VectorDB()
        self.llm = OpenRouterLLM()

    def ask(self, question, dataset_names=None):
        results = self.db.query(
            question,
            dataset_names=dataset_names,
            n_results=4
        )

        context_docs = results["documents"][0]
        context_text = "\n\n".join(context_docs)

        return self.llm.generate(context_text, question)

    def add_snapshot(self, snapshot_json: dict):
        formatted_text = format_snapshot(snapshot_json)

        doc_id = f"snapshot_{uuid.uuid4()}"

        self.db.add_document(
            doc_id=doc_id,
            text=formatted_text,
            metadata={
                "document_type": "dataset_snapshot",
                "dataset_name": snapshot_json["dataset_name"]
            }
        )

        return {"status": "Snapshot stored"}

    def generate_auto_insights(self, snapshot_json: dict):
        formatted_text = format_snapshot(snapshot_json)

        prompt = """
You are a professional data analyst.

Based on the dataset context below, generate:

1. Top 3 critical data quality issues
2. Most important relationships
3. Overall dataset readiness for modeling
4. Recommended next cleaning step

Dataset Context:
""" + formatted_text

        return self.llm.generate(formatted_text, prompt)

    def add_snapshot(self, snapshot_json: dict):
        formatted_text = format_snapshot(snapshot_json)

        doc_id = f"snapshot_{uuid.uuid4()}"

        self.db.add_document(
            doc_id=doc_id,
            text=formatted_text,
            metadata={
                "document_type": "dataset_snapshot",
                "dataset_name": snapshot_json["dataset_name"]
            }
        )

        insights = self.generate_auto_insights(snapshot_json)

        return {
            "status": "Snapshot stored",
            "auto_insights": insights
        }

    def add_cleaning_update(self, cleaning_json: dict):
        formatted_text = format_cleaning_update(cleaning_json)

        doc_id = f"cleaning_{uuid.uuid4()}"

        # Store cleaning document
        self.db.add_document(
            doc_id=doc_id,
            text=formatted_text,
            metadata={
                "document_type": "cleaning_update",
                "dataset_name": cleaning_json["dataset_name"]
            }
        )

        # Retrieve relevant context (snapshot + cleaning)
        results = self.db.query(
            f"Analyze impact of cleaning on {cleaning_json['column_affected']}",
            n_results=4
        )

        context_docs = results["documents"][0]
        context_text = "\n\n".join(context_docs)

        prompt = """
You are a professional data analyst.

Based on the dataset snapshot and cleaning event below:

1. Was this cleaning beneficial?
2. Did it improve dataset quality?
3. Did it introduce statistical distortion?
4. Should further action be taken?

Provide a structured analytical explanation.
"""

        return self.llm.generate(context_text, prompt)

    def add_visualization_event(self, viz_json: dict):
        formatted_text = format_visualization_event(viz_json)

        import uuid
        doc_id = f"visualization_{uuid.uuid4()}"

        self.db.add_document(
            doc_id=doc_id,
            text=formatted_text,
            metadata={
                "document_type": "visualization_event",
                "dataset_name": viz_json["dataset_x"]  # store primary
            }
        )

        # Retrieve relevant context from BOTH datasets
        dataset_names = [viz_json["dataset_x"], viz_json["dataset_y"]]

        results = self.db.query(
            "Analyze this cross dataset visualization",
            dataset_names=dataset_names,
            n_results=6
        )

        context_docs = results["documents"][0]
        context_text = "\n\n".join(context_docs)

        prompt = """
You are a professional data analyst.

Based on the dataset contexts and the visualization event:

1. Explain what this correlation means.
2. Is this relationship meaningful?
3. Are there any data quality concerns affecting this?
4. Would you recommend further investigation?

Provide a structured explanation.
"""

        return self.llm.generate(context_text, prompt)

    def generate_action_insights(self, snapshot: dict):
        """
        Generates proactive insights for a given dataset operation.
        """
        operation = snapshot.get("operation", "unknown operation")
        
        prompt = f"""
You are a professional data analyst. Analyze the following dataset operation snapshot and provide a short insight.

1. Explain what action was performed.
2. How the dataset changed.
3. Whether the change improved data quality.
4. Suggested next step.

Dataset Snapshot:
{snapshot}

Keep the response short, under 80 words, and professional. The user should not have to ask a question.
"""
        return self.llm.generate(str(snapshot), prompt)