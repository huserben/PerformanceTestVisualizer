# Performance Test Visualizer

Contains 3 scripts that allow to visualize the length of testruns that were ran on a TFS/VSTS instance.  
The first script will fetch the data from the server and write it into CSV files. Then out of the csv files line charts are created (one chart per csv file) and in the end all images are automatically put into a html file.  
The script that fetches the csv files is also available as Task to be included into VSTS. If customization is needed, the script can be downloaded and altered and be used from the commandline as the example is showing.  

All the files are under the folder *perfromanceTestVisualizerTask*.

## Usage
The repository contains the exampleScript.bat file that executes all scripts in order to fetch sample data from VSTS, create the line charts and put it into an html file. After the script executed there will be a *index.html* file that contains all created line chart images.

### Prerequites
In order to run all 3 scripts the machine needs to have node.js and python installed.  
To run the node script, run *npm install --only=production*.  
The scripts to create the line charts and the html file are written in python (v. 3). Install pip and install the packages *pandas*, *matplot* and *dominate* on the machine that runs those scripts.

## Creating the CSV Files
The csv files are created by doing a query to TFS/VSTS. For this a node.js script is used (runFromTerminal.js). The script will search for test runs with a specific name on the server and then extract all the test cases into a csv file. The following parameters need to be supplied to the script (in order of appearance):  
- **Authentication Method**  (Possible Values: *OAuth Token*, *Personal Access Token*, *Basic Authentication*)  
- **Username** (only needed if *Basic Authentication* was specified, otherwise use "")  
- **Password** (the respective password or Token needed for the specified authentication method)  
- **Server URL** (the URL to the TFS/VSTS Instance. This includes the collection and the Team Project the test runs are stored in)  
- **Test Run Name** (the name of the Test Run that shall be fetched)  
- **Number of Runs to Fetch** (The amount of how many Test Runs shall be used for the data. This parameter is optional - the default is 10)  

## Creating the Charts
The Charts are created using the python script *creategraphs.py*.  
It requires the *pandas* and *matplot* libraries to be installed beforehand via *pip install*.  
Use it via just executing the script as follows: *python .\creategraphs.py*.  
When not specified otherwise, the script expects the list of csv files created by the node script in a folder called *performanceValues* next to the script. It will create then for each csv file a png image with the same name in a folder called *performanceGraphs*.  
If other folders shall be used, the script can be started by supplying both the input and output directory as parameter as shown in the *exampleScript.bat*.

## Creating the HTML file
The third script is again a python script that uses a folder containing images as input and creates a html file displaying all those images.  
It requires the *dominate* library to be installed beforehand via *pip install dominate*.  
If not specified otherwise, the folder the script checks for images is *performanceGraphs* and it's document title and first heading are set to *Performance*. Both these values can be overwritten via specifying other values over the commandline as shown in the *exampleScript.bat*.  
If needed additional styles can be defined in the css file *styles.css*.