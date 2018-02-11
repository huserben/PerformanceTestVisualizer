import pandas
import matplotlib.pyplot as plt
import matplotlib.dates as dates
import os, shutil, sys

# Script that creates line charts out of csv file.
# Reads all files in a directory and creates for each a png file in the output directoy containing the line chart. 
# -----------------------
# prerequisites: pandas, matplot
# pip install pandas, matplot
# -----------------------
# inputs:
# 1: input directory (folder containing csv files)
# 2: output directory (folder that will contain the created images)

inputDirectory = "performanceValues"
outputDirectory = "performanceGraphs"

if len(sys.argv) == 3:
    print('Using custom input and output directories')
    inputDirectory = sys.argv[1]
    outputDirectory = sys.argv[2]

print('Input Directory: ', inputDirectory)
print('Output Directory: ', outputDirectory)

# remove old folder if exists
if os.path.exists(outputDirectory):
    print('Output directory already exists - removing old files...')
    shutil.rmtree(outputDirectory)

# add output folder
os.makedirs(outputDirectory)

performanceValues = os.listdir(inputDirectory)

for file in performanceValues:
    print('Create chart for file: ', file)
    df = pandas.read_csv(inputDirectory + '/' + file, delimiter=',', index_col=0, parse_dates=[0], names=['date', file])
    ax = df.plot()
    ax.set_ylabel("Test Duraion (seconds)")

    fileName = os.path.splitext(file)[0]
    saveFilePath = outputDirectory + '/' + fileName + '.png'
    print('Saved chart at: ', saveFilePath)
    plt.savefig(saveFilePath)