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

    var data = {"OkPercent": 78.57679817369217, "KoPercent": 21.423201826307835};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7801244332979647, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.49249706916764363, 500, 1500, "Bind"], "isController": false}, {"data": [0.7814634576974432, 500, 1500, "Search"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3110100, 666283, 21.423201826307835, 22.948218385259818, 0, 9871, 1.0, 7.0, 10.0, 325.0, 16930.966340579118, 5848.5891605661345, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Bind", 59710, 13062, 21.875732708089096, 804.7137497906521, 0, 9871, 787.0, 2266.0, 2565.9500000000007, 3461.9900000000016, 325.07444972533904, 78.07503438365971, 0.0], "isController": false}, {"data": ["Search", 2990493, 653221, 21.843254607183496, 7.786459289488551, 0, 4046, 1.0, 7.0, 9.0, 15.0, 16283.83102456874, 5708.231810140867, 0.0], "isController": false}, {"data": ["Unbind", 59897, 0, 0.0, 0.6084444963854656, 0, 479, 0.0, 1.0, 1.0, 3.0, 326.2630389193017, 63.72324978892611, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 3531, 0.5299549890962248, 0.11353332690267194], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 8729, 1.3101039648317607, 0.2806662165203691], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.140:389 [Root exception is java.io.IOException: connection closed]", 728, 0.10926288078789344, 0.023407607472428538], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 653221, 98.03957177355568, 21.00321533069676], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.140:389 [Root exception is java.net.SocketException: Socket closed]", 73, 0.010956305353731072, 0.0023471914086363784], "isController": false}, {"data": ["800/javax.naming.CommunicationException [Root exception is java.io.IOException: connection closed]", 1, 1.5008637470864482E-4, 3.215330696762162E-5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3110100, 666283, "800/javax.naming.NamingException: Context is null", 653221, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 8729, "800/javax.naming.NamingException: LDAP connection has been closed", 3531, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.140:389 [Root exception is java.io.IOException: connection closed]", 728, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.140:389 [Root exception is java.net.SocketException: Socket closed]", 73], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Bind", 59710, 13062, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 8729, "800/javax.naming.NamingException: LDAP connection has been closed", 3531, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.140:389 [Root exception is java.io.IOException: connection closed]", 728, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.140:389 [Root exception is java.net.SocketException: Socket closed]", 73, "800/javax.naming.CommunicationException [Root exception is java.io.IOException: connection closed]", 1], "isController": false}, {"data": ["Search", 2990493, 653221, "800/javax.naming.NamingException: Context is null", 653221, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
