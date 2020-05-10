from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
import requests
from tqdm import tqdm
import urllib.request
import json
import os
import argparse

######### Arguments #########
parser = argparse.ArgumentParser(description="PaperViz Scrapper")
parser.add_argument('--url',
    default="https://papers.nips.cc/book/advances-in-neural-information-processing-systems-32-2019",
    help="URL for the Neurips conference website to be parsed.")

parser.add_argument('--year',
    default="2019",
    help="Year of Neurips Conference")

args = parser.parse_args()

#############################

conf_url = args.url

r = requests.get(conf_url)
soup_nips19 = BeautifulSoup(r.content, "html.parser")

urls = []
for url in soup_nips19.find_all('a'):
    urls.append(url.get('href'))

paper_links = []
for url in urls:
    if url.startswith('/paper'):
        paper_links.append("https://papers.nips.cc"+url)

# Initialize Empty Dictionary
conf_dict = {}

for idx, link in enumerate(tqdm(paper_links)):
    try:
        get_links = requests.get(link)
        link_soup = BeautifulSoup(get_links.content, "html.parser")
        
        paper_title = link_soup.find(class_='subtitle').text
        paper_abstract = link_soup.find(class_ = 'abstract').text
        
        paper_authors = []
        paper_authors_tags = link_soup.find_all(class_='author')
        for auth in paper_authors_tags:
            paper_authors.append(auth.text)
        
        paper_key = 'key_'+str(idx)
        conf_dict[paper_key] = {'title': paper_title, 'authors': paper_authors, 'link': link, 'abstract': paper_abstract}
        
        print('Downloading paper {} {}'.format(paper_key, paper_title))
        url = link + '.pdf'
        savepath = "nips19_pdfs/" + paper_key + "_" + paper_title + ".pdf"
        if not os.path.exists(savepath):
            urllib.request.urlretrieve(url, savepath)
    except Exception as e:
        print("Error Occured")
        with open('log_errors.txt', 'w+') as f:
            f.write("Exception: {} in paper link: {}".format(e, link))


# Dump Dictionary to JSON
json_dump = "data_nips" + args.year + ".json"
with open(json_dump, 'w') as file:
    json.dump(conf_dict, file)