SET INPUT_testRunName=MyTestRun
SET INPUT_numberOfItemsToFetch=5
SET INPUT_failIfThresholdExceeded=true
SET INPUT_threshold=0.5

SET SYSTEM_ACCESSTOKEN=sww3otrtvfaqi4sqcqqjceq23lxgvlyjfoftqox7272qc3vxyi2q
SET SYSTEM_TEAMFOUNDATIONCOLLECTIONURI=https://benjsawesometfstest.visualstudio.com/DefaultCollection/
SET SYSTEM_TEAMPROJECT=Build Test
SET BUILD_ARTIFACTSTAGINGDIRECTORY=D:\Projects\git\PerformanceTestVisualizer\TaskOutput

node index.js

python .\creategraphs.py "TaskOutput/PerformanceAnalyzer" "TaskPerformanceGraphs"
python .\createhtml.py "TaskPerformanceGraphs" "My Performance Test"