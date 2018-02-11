import pandas
import matplotlib.pyplot as plt
import matplotlib.dates as dates
import os, shutil

inputDirectory = "performanceValues"
outputDirectory = "performanceGraphs"

# remove old folder if exists
if os.path.exists(outputDirectory):
    shutil.rmtree(outputDirectory)

# add output folder
os.makedirs(outputDirectory)

performanceValues = os.listdir(inputDirectory)

for file in performanceValues:
    df = pandas.read_csv(inputDirectory + '/' + file, delimiter=',', index_col=0, parse_dates=[0], names=['date', file])
    ax = df.plot()
    ax.set_ylabel("Test Duraion (s)")
    xax = plt.gca().get_xaxis()
    #xax.set_major_formatter(dates.DateFormatter('%YYY:%M:%d'))
    plt.savefig(outputDirectory + '/' + file + '.png')