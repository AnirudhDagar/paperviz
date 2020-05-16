sudo apt-get update 
sudo apt-get install openjdk-8-jdk -y
echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt-get update
sudo apt-get install sbt
cd pdffigures2
# To just visualize what images will be extracted. In the following command, I had to replace run-main with runMain. But not sure what will work for you.
sbt "run-main org.allenai.pdffigures2.FigureExtractorVisualizationCli /path/to/pdf"
# To run on a batch of pdfs
sbt "run-main org.allenai.pdffigures2.FigureExtractorBatchCli /path/to/pdf_directory/ -s stat_file.json -m /figure/image/output/prefix -d /figure/data/output/prefix"
# Again, I had to run it as runMain instead of run-main.
