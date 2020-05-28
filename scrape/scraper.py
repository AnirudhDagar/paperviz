from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
import requests
from tqdm import tqdm
import urllib.request
import json
import os
import argparse


class Conference():
    """
    Scrape conference accepted papers website for data.
    """
    def __init__(self, conf_name: str, year: str, url: str, getinfo=False, getpdf=False):
        """
        Initialization

        Parameters
        ----------
        conf_name: str
            Conference Name.
        
        url: str
            URL for the conference website to be scraped for data.
        
        year: str
            Year of conferece.
        
        getinfo: bool
            Get information from the website and store in db.
        
        getpdf: bool
            Download all selected conference paper pdf's.
        """

        self.name       = conf_name
        self.url        = url
        self.year       = year
        self.getinfo    = getinfo
        self.getpdf     = getpdf

        savedir = self.conf_name + "_" + self.year
        if self.getpdf:
            if not os.path.exists(savedir):
                os.mkdir(savedir)

        r = requests.get(self.url)
        self.soup = BeautifulSoup(r.content, "html.parser")


    def akbc(self):
        pass


    def acl(self):
        pass


    def aistats(self):
        pass


    def cvpr(self):
        raw_urls=[]
        for url in self.soup.find_all('a'):
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
        save_errors = self.conf_name + self.year + '_log_errors.txt'

        for idx, link in enumerate(tqdm(paper_links)):
            try:
                get_links = requests.get(link)
                link_soup = BeautifulSoup(get_links.content, "html.parser")
            
                paper_id = self.year + str(idx)
            
                paper_title = link_soup.find(id='papertitle').text[1:]

                if self.getinfo:
                    paper_abstract = link_soup.find(id='abstract').text[1:-1]

                    paper_authors = link_soup.find(id='authors').text[1:].split(';')[0].replace(",  ", ",").split(',')

                    conf_dict[paper_id] = {
                    'conf_name': self.conf_name,
                    'year': self.year,
                    'link': link,
                    'type': 'None',
                    'title': paper_title,
                    'authors': paper_authors,
                    'abstract': paper_abstract
                    }

                if self.getpdf:
                    pdf_uri = link[:-5].replace('html', 'papers') + '.pdf'
                    download_pdf(paper_id, paper_title, pdf_uri, savedir)


            except Exception as e:
                print("Error Occured")
                with open(save_errors, 'a') as f:
                    f.write(f"Exception: {e} in paper link: {link} \n\n")


        # Dump Data Dictionary to JSON
        if self.getinfo:
            dump_json(self.conf_name, self.self.year, conf_dict)


    def emnlp(self):
        pass


    def iccv(self):
        pass


    def iclr(self):
        pass


    def icml(self):
        pass


    def kdd(self):
        pass


    def naacl(self):
        pass


    def nips(self):
        """
        Scrape https://papers.nips.cc for the particular year.
        """
        urls = []
        for url in self.soup.find_all('a'):
            urls.append(url.get('href'))

        paper_links = []
        for url in urls:
            if url.startswith('/paper'):
                paper_links.append("https://papers.nips.cc" + url)

        # Initialize Empty Dictionary
        conf_dict = {}
        save_errors = self.conf_name + self.year + '_log_errors.txt'

        for idx, link in enumerate(tqdm(paper_links)):
            try:
                get_links = requests.get(link)
                link_soup = BeautifulSoup(get_links.content, "html.parser")
                
                paper_id = link.replace("https://papers.nips.cc/paper/", "")[:4]
                
                paper_title = link_soup.find(class_='subtitle').text
                
                if self.getinfo:
                    paper_type = link_soup.find(lambda tag:tag.name=="h3" and "Conference Event Type:" in tag.text).text
                    paper_type = paper_type.replace("Conference Event Type: ", "")
                    
                    paper_abstract = link_soup.find(class_ = 'abstract').text
                    paper_abstract = link_soup.find(class_ = 'abstract').text

                    paper_authors = []
                    paper_authors_tags = link_soup.find_all(class_='author')
                    for auth in paper_authors_tags:
                        paper_authors.append(auth.text)
                    
                    conf_dict[paper_id] = {
                    'conf_name': self.conf_name,
                    'year': self.year,
                    'link': link,
                    'type': paper_type,
                    'title': paper_title,
                    'authors': paper_authors,
                    'abstract': paper_abstract
                    }
                
                if self.getpdf:
                    pdf_uri = link + '.pdf'
                    download_pdf(paper_id, paper_title, pdf_uri, savedir)

            except Exception as e:
                print("Error Occured")
                with open(save_errors, 'a') as f:
                    f.write(f"Exception: {e} in paper link: {link} \n\n")


        # Dump Data Dictionary to JSON
        if self.getinfo:
            dump_json(self.conf_name, self.year, conf_dict)


    def wacv(self):
        pass


def dump_json(conf_name, year, conf_dict):
    """
    Save scraped data dictionary into a json file.

    Parameters
    ----------

    conf_name: str
        Name of the conference

    year: str
        Year of the conference

    conf_dict: dict
        Dictionary containing the scraped data to be saved.
    """
    json_dump = conf_name + "_" + year + ".json"
    with open(json_dump, 'w') as file:
        json.dump(conf_dict, file)    


def download_pdf(paper_id, paper_title, pdf_uri, savedir):
    """
    Download PDFs from specified links.

    Parameters
    ----------
    paper_id: str
        Unique identifier of a paper.

    paper_title: str
        Title of a paper.

    pdf_uri: str
        URI for downloading the pdf

    """
    print(f"Downloading paper with id:{paper_id}, title:{paper_title}")
    savefile = savedir + "/" + paper_id + "_" + paper_title + ".pdf"

    if not os.path.exists(savefile):
        urllib.request.urlretrieve(url, savefile)
    else:
        print("Paper already present in directory!")


def create_dict():
    pass



def main():
    """The main function."""
    ######### Arguments #########
    parser = argparse.ArgumentParser(description="PaperViz Scrapper")

    parser.add_argument('--url',
    default="https://papers.nips.cc/book/advances-in-neural-information-processing-systems-32-2019",
    help="URL for the conference website to be parsed.")

    parser.add_argument('--getinfo',    action='store_true',    default=False,      help="Get paper info and store in dictionary and dump as json")
    parser.add_argument('--getpdf',     action='store_true',    default=False,      help="Download all papers in pdf format")
    parser.add_argument('--log',        action='store_true',    default=False,      help="Save log.")
    parser.add_argument('--conf_name',                          default="NeurIPS",  help="Save directory for downloading the papers")
    parser.add_argument('--year',                               default="2019",     help="Year of conference.")

    args = parser.parse_args()
    #############################

    #TODO: Add logger

    conf_list = ["AKBC", "ACL", "AISTATS", "CVPR", "EMNLP", "ICCV", "ICLR", "ICML", "KDD", "NAACL", "NeurIPS", "WACV"]
    url_list  = ["http://openaccess.thecvf.com/CVPR2019.py",
                 "https://papers.nips.cc/book/advances-in-neural-information-processing-systems-32-2019"]

    conf_parser = Conference(args.conf_name, args.year, args.url, args.getinfo, args.getpdf)
    
    if conf_parser.conf_name == "AKBC":
        conf_parser.akbc()
    else if conf_parser.conf_name == "ACL":
        conf_parser.acl()
    else if conf_parser.conf_name == "AISTATS":
        conf_parser.aistats()
    else if conf_parser.conf_name == "CVPR":
        conf_parser.cvpr()
    else if conf_parser.conf_name == "EMNLP":
        conf_parser.emnlp()
    else if conf_parser.conf_name == "ICCV":
        conf_parser.iccv()
    else if conf_parser.conf_name == "ICLR":
        conf_parser.iclr()
    else if conf_parser.conf_name == "ICML":
        conf_parser.icml()
    else if conf_parser.conf_name == "KDD":
        conf_parser.kdd()
    else if conf_parser.conf_name == "NAACL":
        conf_parser.naacl()
    else if conf_parser.conf_name == "NeurIPS":
        conf_parser.nips()
    else if conf_parser.conf_name == "WACV":
        conf_parser.wacv()
    else:
        print("Please speciy a valid conference name from this list:", conf_list)

if __name__ == '__main__':
    main()
