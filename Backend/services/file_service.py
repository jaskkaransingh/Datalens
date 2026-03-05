import pandas as pd

current_df = None
dataset_name = None

def load_csv(file, filename):

    global current_df
    global dataset_name

    df = pd.read_csv(file)

    current_df = df
    dataset_name = filename

    return df


def get_current_df():
    return current_df


def get_dataset_name():
    return dataset_name