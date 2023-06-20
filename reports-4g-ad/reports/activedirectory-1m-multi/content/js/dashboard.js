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

    var data = {"OkPercent": 98.15633572857786, "KoPercent": 1.8436642714221476};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9642821358619711, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.9873146299145579, 500, 1500, "Delete"], "isController": false}, {"data": [0.5173724379885517, 500, 1500, "Bind"], "isController": false}, {"data": [0.9869431531748344, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.986976982647581, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3313510, 61090, 1.8436642714221476, 354.65976894594587, 0, 4063, 332.0, 373.0, 390.0, 648.9900000000016, 5507.719260918997, 2096.9104282535923, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 30565, 30565, 100.0, 379.0985113692151, 40, 1391, 350.0, 497.90000000000146, 666.0, 769.0, 50.923588792645276, 26.448231320589525, 0.0], "isController": false}, {"data": ["Delete", 30547, 0, 0.0, 361.73329623203716, 51, 977, 350.0, 422.0, 461.0, 589.0, 50.89521054858929, 7.852971940114363, 0.0], "isController": false}, {"data": ["Bind", 32494, 0, 0.0, 895.3563734843339, 15, 4063, 902.0, 1108.9000000000015, 1189.0, 1467.9800000000032, 54.02313947360108, 11.289992038428352, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1578980, 0, 0.0, 352.3374330263929, 1, 929, 328.0, 369.0, 385.0, 452.0, 2625.43730130226, 1040.7506448843228, 0.0], "isController": false}, {"data": ["Search", 1579895, 0, 0.0, 352.0626687216386, 1, 929, 328.0, 369.0, 386.0, 466.0, 2626.906296348025, 980.0503317728806, 0.0], "isController": false}, {"data": ["Compare", 30525, 30525, 100.0, 356.39184275184175, 29, 904, 345.0, 415.0, 454.0, 591.9900000000016, 50.867030831836345, 21.390392328118594, 0.0], "isController": false}, {"data": ["Unbind", 30504, 0, 0.0, 0.1080841856805673, 0, 90, 0.0, 0.0, 1.0, 1.0, 50.84822046230807, 9.931293059044545, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3313510, 61090, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=posh,O=changting,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 160, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 124, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=extended,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=compound,O=penonome,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=starless,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 30565, 30565, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 124, " 68/ 00000524: UpdErr: DSID-031A11EE, problem 6005 (ENTRY_EXISTS), data 0\\n\\u0000", 71, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=trescha.guttierez,ou=condone,o=belle plaine,c=ba,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=janeta.brierton,ou=duckbill,o=changting,c=ba,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=averyl.hilser,ou=cassette,o=sojat,c=ba,dc=intern,dc=example,dc=org'\\n\\u0000", 4], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Compare", 30525, 30525, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=posh,O=changting,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 160, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=greedy,O=clervaux,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=gumball,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=extended,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=festival,O=cosala,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});