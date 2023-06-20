/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.15539760297798, "KoPercent": 1.8446023970220122};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9727869863652339, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.9931089195159133, 500, 1500, "Delete"], "isController": false}, {"data": [0.5008349201699136, 500, 1500, "Bind"], "isController": false}, {"data": [0.996014928814792, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.9959814503483325, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3485575, 64295, 1.8446023970220122, 340.96087790396695, 0, 9306, 327.0, 399.0, 424.0, 464.0, 5800.388070977716, 2211.51262142039, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 32154, 32154, 100.0, 377.09289668470245, 24, 1055, 342.0, 600.0, 665.0, 726.0, 53.652415643531974, 27.93662232532596, 0.0], "isController": false}, {"data": ["Delete", 32143, 0, 0.0, 352.17982142301304, 42, 923, 341.0, 390.0, 418.0, 574.0, 53.65339867731845, 8.27855174903937, 0.0], "isController": false}, {"data": ["Bind", 34135, 0, 0.0, 916.4410722132648, 6, 9306, 908.0, 1042.0, 1122.0, 1869.9900000000016, 56.80513351328143, 11.871385324064676, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1660949, 0, 0.0, 337.9381335609745, 0, 943, 328.0, 369.0, 406.0, 458.0, 2764.378203847946, 1098.842777338289, 0.0], "isController": false}, {"data": ["Search", 1661918, 0, 0.0, 337.7582251350666, 1, 943, 328.0, 371.0, 410.0, 461.0, 2765.967928500695, 1031.8898833361766, 0.0], "isController": false}, {"data": ["Compare", 32141, 32141, 100.0, 345.00214679070297, 20, 893, 335.0, 378.0, 403.0, 482.0, 53.63421402622889, 22.69073474157006, 0.0], "isController": false}, {"data": ["Unbind", 32135, 0, 0.0, 0.11333437062393027, 0, 214, 0.0, 0.0, 1.0, 1.0, 53.65634559128007, 10.479754998296889, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3485575, 64295, " 68/ 00000524: UpdErr: DSID-031A11EE, problem 6005 (ENTRY_EXISTS), data 0\\n\\u0000", 459, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 155, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=luckless,O=callemondah,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=styling,O=callemondah,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=avalanche,O=birdsville,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 32154, 32154, " 68/ 00000524: UpdErr: DSID-031A11EE, problem 6005 (ENTRY_EXISTS), data 0\\n\\u0000", 459, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 155, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=zonda.mastalski,ou=erased,o=birdsville,c=cn,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=laverne.fuhrmann,ou=affair,o=callemondah,c=cn,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=cherice.meduna,ou=apricot,o=birdsville,c=cn,dc=intern,dc=example,dc=org'\\n\\u0000", 4], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Compare", 32141, 32141, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=evaluator,O=burgaw,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=setup,O=henryville,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=either,O=birdsville,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=variety,O=burgaw,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=luckless,O=callemondah,C=cn,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});