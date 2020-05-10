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
    default="http://openaccess.thecvf.com/CVPR2019.py",
    help="URL for the conference website to be parsed.")

parser.add_argument('--getpdf',     action='store_true',    default=False,      help="Download all papers in pdf format.")
parser.add_argument('--conf_name',                          default="CVPR",     help="Name of the conference.")

args = parser.parse_args()
#############################

year = args.url[:-3][-4:]

savedir = args.conf_name + "_" + year
if args.getpdf:
    if not os.path.exists(savedir):
        os.mkdir(savedir)

r = requests.get(args.url)
soup_cvf = BeautifulSoup(r.content, "html.parser")

raw_urls=[]
for url in soup_cvf.find_all('a'):
    raw_urls.append(url.get('href'))

paper_links=[]
for link in raw_urls:
    try:
        if link.endswith('_paper.html'):
            paper_links.append("http://openaccess.thecvf.com/"+link)
    except:
        pass


# Initialize Empty Dictionary
conf_dict = {}
error_dict = {}
errors = False

for idx, link in enumerate(tqdm(paper_links)):
    try:
        get_links = requests.get(link)
        link_soup = BeautifulSoup(get_links.content, "html.parser")
    
        paper_id = year + str(idx)
    
        paper_title = link_soup.find(id='papertitle').text[1:]

        paper_abstract = link_soup.find(id='abstract').text[1:-1]

        paper_authors = link_soup.find(id='authors').text[1:].split(';')[0].replace(",  ", ",").split(',')

        conf_dict[paper_id] = {
        'conf_name': args.conf_name,
        'year': year,
        'link': link,
        'type': 'None',
        'title': paper_title,
        'authors': paper_authors,
        'abstract': paper_abstract
        }

        if args.getpdf:
            print('Downloading paper {} {}'.format(paper_id, paper_title))
            url = link[:-5].replace('html', 'papers') + '.pdf'
            savefile = savedir + "/" + paper_id + "_" + paper_title + ".pdf"
            if not os.path.exists(savefile):
                urllib.request.urlretrieve(url, savefile)


    except Exception as e:
        errors = True
        print("Error Occured")
        save_errors = args.conf_name + year + '_log_errors.txt'
        with open(save_errors, 'a') as f:
            f.write("Exception: {} in paper link: {}\n\n".format(e, link))


# Dump Data Dictionary to JSON
json_dump = args.conf_name + "_" + year + ".json"
with open(json_dump, 'w') as file:
    json.dump(conf_dict, file)