import glob
from dominate import document
from dominate.tags import *
import sys

# Script that creates an html file that displays all images of a specified folder.
# Styles could be supplied via styles.css file.
# -----------------------
# prerequisite: dominate
# pip install dominate
# -----------------------
# inputs:
# 1: input directory (folder containing images)
# 2: document title (header displayed on top)

inputDirectory = "performanceGraphs"
documentTitle = "Performance"

if len(sys.argv) == 3:
    print('Using custom input directory')
    inputDirectory = sys.argv[1]
    documentTitle = sys.argv[2]

print('Input Directory: ', inputDirectory)
print('Document Title: ', documentTitle)

photos = glob.glob(inputDirectory + '/*.png')

with document(title=documentTitle) as doc:
    h1(documentTitle)
    for path in photos:
        span(img(src=path), _class='photo')

with doc.head:
    link(rel='stylesheet', href='style.css')


with open('index.html', 'w') as f:
    f.write(doc.render())