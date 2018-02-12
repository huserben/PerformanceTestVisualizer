node runFromTerminal.js "Personal Access Token" "" "sww3otrtvfaqi4sqcqqjceq23lxgvlyjfoftqox7272qc3vxyi2q" "https://benjsawesometfstest.visualstudio.com/DefaultCollection/Build Test" "MyTestRun" "5"
python .\creategraphs.py performanceValues performanceGraphs
python .\createhtml.py performanceGraphs "My Performance Test"