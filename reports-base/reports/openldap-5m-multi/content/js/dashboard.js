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

    var data = {"OkPercent": 91.28751984757066, "KoPercent": 8.712480152429343};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9043847253096221, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3284656931386277, 500, 1500, "Add"], "isController": false}, {"data": [0.9170361726954492, 500, 1500, "Delete"], "isController": false}, {"data": [0.09063010774208613, 500, 1500, "Bind"], "isController": false}, {"data": [0.9262396917425907, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.9262426326326193, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3149000, 274356, 8.712480152429343, 138.93597110193272, 0, 18001, 3.0, 25.0, 43.0, 83.9900000000016, 8442.676132616236, 3070.1849268261744, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 29994, 20010, 66.71334266853371, 165.7121090884822, 0, 1223, 157.0, 353.0, 420.0, 582.0, 80.54069729973577, 28.367193835457346, 0.0], "isController": false}, {"data": ["Delete", 29995, 2200, 7.334555759293216, 163.0583097182856, 0, 1148, 154.0, 346.0, 418.0, 582.9900000000016, 80.55549587487108, 12.660257674525718, 0.0], "isController": false}, {"data": ["Bind", 29979, 2198, 7.331798925914807, 8653.659595049849, 0, 18001, 9437.0, 15240.0, 16120.400000000009, 17305.99, 80.38148965435879, 17.988234694530767, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1499526, 109978, 7.334184268895638, 55.66329493453283, 0, 1838, 9.0, 41.0, 56.0, 85.0, 4021.427575331739, 1556.2416759468092, 0.0], "isController": false}, {"data": ["Search", 1499518, 109976, 7.334090020926724, 54.78581984344499, 0, 1710, 9.0, 41.0, 56.0, 84.0, 4020.856181372089, 1416.706350469921, 0.0], "isController": false}, {"data": ["Compare", 29994, 29994, 100.0, 86.46212575848512, 0, 1088, 76.0, 214.0, 251.0, 370.0, 80.55800262134461, 23.24206579951011, 0.0], "isController": false}, {"data": ["Unbind", 29994, 0, 0.0, 0.1928052277122093, 0, 418, 0.0, 0.0, 1.0, 1.0, 80.55821898492455, 15.734027145493075, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 27794, 10.13063319191124, 0.882629406160686], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 680, 0.24785315429587834, 0.021594156875198476], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1518, 0.5532957179722696, 0.04820577961257542], "isController": false}, {"data": [" 68/ Entry Already Exists", 17810, 6.491565702955285, 0.5655763734518895], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 226554, 82.57665223286533, 7.194474436328993], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3149000, 274356, "800/javax.naming.NamingException: Context is null", 226554, " 32/ No Such Object", 27794, " 68/ Entry Already Exists", 17810, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1518, "800/javax.naming.NamingException: LDAP connection has been closed", 680], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 29994, 20010, " 68/ Entry Already Exists", 17810, "800/javax.naming.NamingException: Context is null", 2200, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 29995, 2200, "800/javax.naming.NamingException: Context is null", 2200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 29979, 2198, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1518, "800/javax.naming.NamingException: LDAP connection has been closed", 680, "", "", "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1499526, 109978, "800/javax.naming.NamingException: Context is null", 109978, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1499518, 109976, "800/javax.naming.NamingException: Context is null", 109976, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 29994, 29994, " 32/ No Such Object", 27794, "800/javax.naming.NamingException: Context is null", 2200, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
