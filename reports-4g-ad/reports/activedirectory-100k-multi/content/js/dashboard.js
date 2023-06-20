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

    var data = {"OkPercent": 98.1551579544093, "KoPercent": 1.844842045590689};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9667381121445624, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.9896397680828819, 500, 1500, "Delete"], "isController": false}, {"data": [0.49037229127544785, 500, 1500, "Bind"], "isController": false}, {"data": [0.9897691677479966, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.9898347538467855, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3422190, 63134, 1.844842045590689, 349.0249971509466, 0, 65156, 109.0, 164.0, 170.0, 219.0, 5612.3924979828, 2143.854919657412, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 31579, 31579, 100.0, 392.3674277209541, 1, 11210, 335.0, 448.0, 653.0, 727.0, 53.28287216936323, 27.947242217172544, 0.0], "isController": false}, {"data": ["Delete", 31563, 0, 0.0, 350.1741596172743, 12, 2918, 336.0, 382.0, 409.0, 506.9900000000016, 53.28770430498739, 8.222126250183603, 0.0], "isController": false}, {"data": ["Bind", 33549, 0, 0.0, 1105.509225312228, 13, 65156, 939.0, 1062.0, 1129.9500000000007, 1329.9900000000016, 55.024339360222534, 11.499227170984005, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1630708, 0, 0.0, 344.3805009848366, 1, 28717, 157.0, 204.0, 220.0, 241.0, 2675.155641225444, 1067.1272056863388, 0.0], "isController": false}, {"data": ["Search", 1631687, 0, 0.0, 344.0585320591525, 1, 28718, 157.0, 204.0, 220.0, 236.0, 2676.6870300135174, 998.5350633343696, 0.0], "isController": false}, {"data": ["Compare", 31555, 31555, 100.0, 345.8718428141319, 2, 7433, 332.0, 376.0, 401.0, 491.0, 53.31155030089644, 22.687585239559855, 0.0], "isController": false}, {"data": ["Unbind", 31549, 0, 0.0, 0.1315414117721643, 0, 170, 0.0, 0.0, 1.0, 1.0, 53.33854055717295, 10.417683702572843, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3422190, 63134, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 172, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=reclusive,O=north hoosick,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=gaming,O=bloomington springs,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=finalist,O=north hoosick,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=gaming,O=lyons,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 31579, 31579, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 172, " 68/ 00000524: UpdErr: DSID-031A11EE, problem 6005 (ENTRY_EXISTS), data 0\\n\\u0000", 21, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=arlana.lozey,ou=overdrive,o=rocklea,c=mg,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=audra.ventry,ou=nylon,o=north hoosick,c=mg,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=carine.chrispin,ou=angelic,o=blytheville,c=mg,dc=intern,dc=example,dc=org'\\n\\u0000", 4], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Compare", 31555, 31555, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=dictate,O=north hoosick,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=grooving,O=rocklea,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=divinely,O=ohio,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=crux,O=sinclairville,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=magazine,O=rocklea,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});