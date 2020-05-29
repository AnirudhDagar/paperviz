import json
with open("/Users/gollum/Desktop/Work/iclr.github.io/sitedata/papers.json") as f:
    papers = json.load(f)

keywords = []
for k, v in papers.items():
    x = v["content"]["keywords"]
    for keyword in x:
        keywords.append(keyword)
        
print(len(keywords))
keywords = list(set(keywords))
print(len(keywords))

with open("keywords.txt", "w") as f:
    for word in sorted(keywords):
        f.write(word+"\n")