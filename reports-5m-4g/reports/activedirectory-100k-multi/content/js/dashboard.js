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

    var data = {"OkPercent": 98.07826998977534, "KoPercent": 1.9217300102246695};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8259932249109078, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.8414290191162644, 500, 1500, "Delete"], "isController": false}, {"data": [0.24704981092710915, 500, 1500, "Bind"], "isController": false}, {"data": [0.8461040292723996, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.8461924570534776, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3111103, 59787, 1.9217300102246695, 383.6630153356987, 0, 130781, 538.0, 610.0, 625.0, 1766.9100000000144, 5048.295546742651, 1931.0145181611326, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 28744, 28744, 100.0, 414.6557542443609, 0, 1589, 500.0, 647.0, 724.0, 1248.0, 47.86478497980933, 25.088176426356107, 0.0], "isController": false}, {"data": ["Delete", 28719, 23, 0.0800863539816846, 368.9068909084568, 0, 1053, 335.0, 625.0, 652.0, 716.0, 47.844905139841266, 7.383816114940059, 0.0], "isController": false}, {"data": ["Bind", 30676, 24, 0.07823705828660843, 2574.117518581284, 12, 130781, 1876.0, 4854.9000000000015, 8750.900000000001, 18046.780000000035, 49.777045051828104, 10.407367474966248, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1482352, 1150, 0.07757941433613609, 364.75017607153643, 0, 1111, 580.0, 612.0, 621.0, 636.0, 2451.7085111309584, 979.3502853548509, 0.0], "isController": false}, {"data": ["Search", 1483240, 1150, 0.07753296836654891, 364.64996224483167, 0, 1111, 580.0, 613.0, 623.0, 648.0, 2453.116342917628, 916.5401505143599, 0.0], "isController": false}, {"data": ["Compare", 28696, 28696, 100.0, 368.8338095901882, 0, 914, 336.5, 626.0, 650.0, 713.0, 47.82834065858972, 20.33853736964127, 0.0], "isController": false}, {"data": ["Unbind", 28676, 0, 0.0, 0.08400753243130057, 0, 15, 0.0, 0.0, 1.0, 1.0, 47.812139441513665, 9.338308484670637, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3111103, 59787, "800/javax.naming.NamingException: Context is null", 2369, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 154, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=reclusive,O=north hoosick,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=gaming,O=bloomington springs,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=finalist,O=north hoosick,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 28744, 28744, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 154, "800/javax.naming.NamingException: Context is null", 23, " 68/ 00000524: UpdErr: DSID-031A11EE, problem 6005 (ENTRY_EXISTS), data 0\\n\\u0000", 21, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=arlana.lozey,ou=overdrive,o=rocklea,c=mg,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=audra.ventry,ou=nylon,o=north hoosick,c=mg,dc=intern,dc=example,dc=org'\\n\\u0000", 4], "isController": false}, {"data": ["Delete", 28719, 23, "800/javax.naming.NamingException: Context is null", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 30676, 24, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 17, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1482352, 1150, "800/javax.naming.NamingException: Context is null", 1150, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1483240, 1150, "800/javax.naming.NamingException: Context is null", 1150, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 28696, 28696, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=dictate,O=north hoosick,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=accent,O=sinclairville,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=grooving,O=rocklea,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=divinely,O=ohio,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=crux,O=sinclairville,C=mg,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});