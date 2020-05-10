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
    help="URL for the conference website to be parsed.")

parser.add_argument('--getpdf',     action='store_true',    default=False,      help="Download all papers in pdf format")
parser.add_argument('--conf_name',                          default="NeurIPS",  help="Save directory for downloading the papers")

args = parser.parse_args()
#############################

year = args.url[-4:]

savedir = args.conf_name + "_" + year
if args.getpdf:
    if not os.path.exists(savedir):
        os.mkdir(savedir)

r = requests.get(args.url)
soup_nips = BeautifulSoup(r.content, "html.parser")

urls = []
for url in soup_nips.find_all('a'):
    urls.append(url.get('href'))

paper_links = []
for url in urls:
    if url.startswith('/paper'):
        paper_links.append("https://papers.nips.cc" + url)

# Initialize Empty Dictionary
conf_dict = {}
error_dict = {}
errors = False

for idx, link in enumerate(tqdm(paper_links)):
    try:
        get_links = requests.get(link)
        link_soup = BeautifulSoup(get_links.content, "html.parser")
        
        paper_id = link.replace("https://papers.nips.cc/paper/", "")[:4]
        
        paper_title = link_soup.find(class_='subtitle').text
        
        paper_type = link_soup.find(lambda tag:tag.name=="h3" and "Conference Event Type:" in tag.text).text
        paper_type = paper_type.replace("Conference Event Type: ", "")
        
        paper_abstract = link_soup.find(class_ = 'abstract').text
        paper_abstract = link_soup.find(class_ = 'abstract').text

        paper_authors = []
        paper_authors_tags = link_soup.find_all(class_='author')
        for auth in paper_authors_tags:
            paper_authors.append(auth.text)
        
        conf_dict[paper_id] = {
        'conf_name': args.conf_name,
        'year': year,
        'link': link,
        'type': paper_type,
        'title': paper_title,
        'authors': paper_authors,
        'abstract': paper_abstract
        }
        
        if args.getpdf:
            print('Downloading paper {} {}'.format(paper_id, paper_title))
            url = link + '.pdf'
            savefile = savedir + "/" + paper_id + "_" + paper_title + ".pdf"
            if not os.path.exists(savefile):
                urllib.request.urlretrieve(url, savefile)

    except Exception as e:
        errors = True
        print("Error Occured")
        error_dict[link] = e
        with open('log_errors.txt', 'a') as f:
            f.write("Exception: {} in paper link: {}\n\n".format(e, link))


# Dump Data Dictionary to JSON
json_dump = args.conf_name + "_" + year + ".json"
with open(json_dump, 'w') as file:
    json.dump(conf_dict, file)

# Dump Error Dictionary to JSON
if errors:
    with open ("error_dict.json", "w") as f:
        json.dump(error_dict, f)