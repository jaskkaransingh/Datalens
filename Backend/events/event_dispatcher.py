import json
from storage.event_history import add_event
from services.rag_service import RAGService

rag_service = RAGService()

def dispatch_event(event):

    dataset_name = event.get("dataset_name")

    # store event in history
    add_event(dataset_name, event)

    # Actually send to RAG if it's a snapshot
    if event.get("document_type") == "dataset_snapshot":
        try:
            rag_service.add_snapshot(event["data"])
            print(f"\n [RAG] Snapshot embedded for {dataset_name} \n")
        except Exception as e:
            print(f"\n [RAG] Error embedding snapshot: {e} \n")
    else:
        # simulate sending to RAG for other complex events for now
        print("\n EVENT DISPATCHED TO RAG \n")
        print(json.dumps(event, indent=2))