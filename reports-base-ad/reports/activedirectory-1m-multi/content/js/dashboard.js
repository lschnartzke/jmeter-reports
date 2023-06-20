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

    var data = {"OkPercent": 98.10898505290265, "KoPercent": 1.891014947097352};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.691071376588479, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.6776156916859691, 500, 1500, "Delete"], "isController": false}, {"data": [0.09150532321099682, 500, 1500, "Bind"], "isController": false}, {"data": [0.7073512540391118, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.7080508717232341, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2232875, 42224, 1.891014947097352, 533.2051467279301, 0, 131184, 562.0, 620.0, 638.0, 1670.5200000000768, 3668.859123039359, 1395.8217828908507, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 20310, 20310, 100.0, 540.8889709502639, 0, 1381, 513.0, 587.0, 721.8500000000022, 1106.9900000000016, 34.31096785310648, 17.772226899646757, 0.0], "isController": false}, {"data": ["Delete", 20291, 16, 0.07885269331230595, 519.9280962002867, 0, 1134, 514.0, 576.0, 598.0, 653.0, 34.304543056926846, 5.294140434804293, 0.0], "isController": false}, {"data": ["Bind", 22261, 16, 0.07187457885988949, 3338.685009658149, 9, 131184, 1805.0, 4822.0, 8846.0, 32812.94000000001, 36.57727053148034, 7.6471813167718805, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1064281, 800, 0.07516811819434904, 509.33373141116095, 0, 1133, 550.0, 592.0, 617.0, 642.0, 1770.5203023729355, 701.0283730532955, 0.0], "isController": false}, {"data": ["Search", 1065189, 800, 0.07510404256897132, 509.0253053683317, 0, 1132, 550.0, 592.0, 618.0, 642.0, 1772.0102009751813, 661.0022275903357, 0.0], "isController": false}, {"data": ["Compare", 20282, 20282, 100.0, 514.683956217332, 0, 1044, 509.0, 568.0, 589.0, 640.9900000000016, 34.308642455634065, 14.377607809732678, 0.0], "isController": false}, {"data": ["Unbind", 20261, 0, 0.0, 0.07255318098810555, 0, 199, 0.0, 0.0, 1.0, 1.0, 34.334043930494786, 6.705867955174763, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2232875, 42224, "800/javax.naming.NamingException: Context is null", 1648, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=posh,O=changting,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 160, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 86, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=extended,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=compound,O=penonome,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 20310, 20310, " 80/ 00000523: SysErr: DSID-031A1256, problem 22 (Invalid argument), data 0\\n\\u0000", 86, " 68/ 00000524: UpdErr: DSID-031A11EE, problem 6005 (ENTRY_EXISTS), data 0\\n\\u0000", 50, "800/javax.naming.NamingException: Context is null", 16, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=melita.lykins,ou=twice,o=cosala,c=ba,dc=intern,dc=example,dc=org'\\n\\u0000", 4, " 64/ 00002073: NameErr: DSID-03050F51, problem 2005 (NAMING_VIOLATION), data 0, best match of:\\n\\t'uid=odette.kulis,ou=marry,o=penonome,c=ba,dc=intern,dc=example,dc=org'\\n\\u0000", 4], "isController": false}, {"data": ["Delete", 20291, 16, "800/javax.naming.NamingException: Context is null", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 22261, 16, "800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out]", 14, "800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1064281, 800, "800/javax.naming.NamingException: Context is null", 800, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1065189, 800, "800/javax.naming.NamingException: Context is null", 800, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 20282, 20282, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=posh,O=changting,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 160, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=gumball,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=extended,O=sojat,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=festival,O=cosala,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80, " 32/ 0000208D: NameErr: DSID-0310028B, problem 2001 (NO_OBJECT), data 0, best match of:\\n\\t'OU=pushy,O=cosala,C=ba,DC=intern,DC=example,DC=org'\\n\\u0000", 80], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});