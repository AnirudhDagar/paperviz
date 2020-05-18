import sys
import json
import pickle
import torch
import transformers
import argparse


######### Arguments #########
parser = argparse.ArgumentParser(description="PaperViz Embedding Creator")

parser.add_argument('--data', default="../scrape/data/ICLR/ICLR_2020.json", help="File Path for the conference json data")

args = parser.parse_args()
#############################

with open("../scrape/data/ICLR/ICLR_2020.json", "rb") as f:
    papers = json.load(f)

# Load the model
abstracts = []
abstract_keys = list(papers.keys())
for k, v in papers.items():
    abstracts.append(v["content"]["abstract"])

print("Initializing tokenizer and model")
# Use Pretrained deepset sentencebert tokenizer & model
tokenizer = transformers.AutoTokenizer.from_pretrained("deepset/sentence_bert")

model = transformers.AutoModel.from_pretrained("deepset/sentence_bert")
model.eval()


all_abstracts = torch.zeros(len(abstracts), 768)
with torch.no_grad():
    for i, abstract in enumerate(abstracts):
        input_ids = torch.tensor([tokenizer.encode(abstract)][:512])
        all_hidden_states, _ = model(input_ids)[-2:]
        all_abstracts[i] = all_hidden_states.mean(0).mean(0)
        print(i)

torch.save(all_abstracts, "embeddings.torch")
