# TestRun Performance Analyzer

This task allows to query for TestRuns with a specific name and create for each test that was run as part of the test run a csv file. Based on these CSV files trend-charts can be created. In the github repository are 2 python scripts that can be used to create images out of each csv file and create an hmtl file containing all those images.  

## Usage
After installing the extension you will find a new Task called *Testrun Performance Analyzer* available in the build tasks under the *Test* category.  

### Prerequisite
A prerequisite of the task is that the build definition has access to the OAuth Token. This can be configured in the build definition under Options:

![Token Access](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/tokenAccess.PNG)

**If this is not done, the task will fail!**

### Configuration
After you added the task, you have the following configuration section:  

![Sample Configuration](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/sampleconfiguration.PNG)

You have to specify what Testrun exactly you want to analyze.  
Additionally you can define how many runs you want to include. If there are less runs it will just take those available. Depending on what you want to do with the resulting csv files you may need more or less data-sets.

### Fail if Threshold is exceeded
Additionally to the basic configuration defined above, you can as well let the task compare the latest two test results and if they exceed a threshold defined in percent, the task will fail.  
If we have the task configured as shown above, it means that if last test took more than 0.5% longer to be executed the task will fail.

![Failed Task](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/failedTask.PNG)

## Logs
When running the task you see in the output as well what will be written into the csv file. For every test found it will add the details into the log:  
![Log Output](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/logoutput.PNG)

If a test was not run or was not successful in a specific test run, the result for that day will be set to 0. Even if configured, there will not be any threshold check for values that are 0!  
![Inconclusive Results](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/inconclusiveResults.PNG)

## CSV Files
The csv files are created into the staging directory of the build agent that runs the test. They are put under a folder names *PerformanceAnalyzer*.  For further scripts that run as part of the same build definition they would be available through this path:  
*$(Build.ArtifactStagingDirectory)/PerformanceAnalyzer*  

Otherwise they as well can be published using the *Publish Artifact* Task:  
![Publish CSV Filed](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/PublishTask.PNG) 

Then they will be available as build artifact of the build:  
![Artifacts](https://raw.githubusercontent.com/huserben/PerformanceTestVisualizer/master/images/Artifacts.PNG)

What you do with the csv files is up to you. However there are 2 python scripts in the github repository that would demonstrate how to turn the files into line charts and display them within an html file.

## Modifications
If you need changes in the behavior of the script check out the github repository. In there you will find as well a demo on how to use the script from the command line. Feel free to adjust it to your needs and use it as regular script within your build system. 