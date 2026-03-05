import uuid

dataset_store = {}

def create_dataset(df, name):

    dataset_id = str(uuid.uuid4())

    dataset_store[dataset_id] = {
        "name": name,
        "dataframe": df
    }

    return dataset_id


def get_dataset(dataset_id):

    return dataset_store.get(dataset_id)


def update_dataset(dataset_id, df):

    dataset_store[dataset_id]["dataframe"] = df