event_history_store = {}


def add_event(dataset_name, event):

    if dataset_name not in event_history_store:
        event_history_store[dataset_name] = []

    event_history_store[dataset_name].append(event)


def get_dataset_history(dataset_name):

    return event_history_store.get(dataset_name, [])