import sys
import os
import json
import argparse
import csv
import numpy
import sklearn.manifold
import torch
import transformers
from tqdm import tqdm

######### Arguments #########
parser = argparse.ArgumentParser(description="PaperViz Embedding Creator")

parser.add_argument('--data', default="../scrape/data/ICLR/ICLR_2020.json", help="File Path for the conference json data")

args = parser.parse_args()
#############################

data_file = args.data
conf_name = data_file.split("/")[-1].replace(".json", "")
print("Conference to be processed: ", conf_name)


# Read & Load data
with open(data_file, "rb") as f:
    papers = json.load(f)


# Extract abstracts
abstracts = []
abstract_keys = list(papers.keys())
for k, v in papers.items():
    abstracts.append(v["content"]["abstract"])

save_file_emb = conf_name + "_embeddings.torch"


if not os.path.exists(save_file_emb):
    print("Initializing tokenizer and model")
    # Use Pretrained deepset sentencebert tokenizer & model
    tokenizer = transformers.AutoTokenizer.from_pretrained("deepset/sentence_bert")

    model = transformers.AutoModel.from_pretrained("deepset/sentence_bert")
    model.eval()

    emb = torch.zeros(len(abstracts), 768)
    with torch.no_grad():
        for i, abstract in enumerate(tqdm(abstracts)):
            input_ids = torch.tensor([tokenizer.encode(abstract)][:512])
            all_hidden_states, _ = model(input_ids)[-2:]
            emb[i] = all_hidden_states.mean(0).mean(0)

    torch.save(emb, save_file_emb)

else:
    emb = torch.load(save_file_emb)


print("Generating 2D Embeddings...")
emb2d = sklearn.manifold.TSNE(n_components=2).fit_transform(emb.numpy())

keys_emb2d = []
for i, key in enumerate(papers.keys()):
    keys_emb2d.append({"id": key, "pos" : emb2d[i].tolist()})


print("Saving 2D TSNE Embeddings with Unique Paper Identification Keys...")
save_file_keys_emb2d = conf_name + "_Keys_2D_Embeddings.json" 
with open(save_file_keys_emb2d, 'w') as outfile:
    json.dump(keys_emb2d, outfile)
