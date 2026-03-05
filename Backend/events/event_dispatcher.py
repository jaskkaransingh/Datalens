import json
from storage.event_history import add_event


def dispatch_event(event):

    dataset_name = event.get("dataset_name")

    # store event in history
    add_event(dataset_name, event)

    # simulate sending to RAG
    print("\n EVENT DISPATCHED TO RAG \n")
    print(json.dumps(event, indent=2))