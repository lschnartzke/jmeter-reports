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

    var data = {"OkPercent": 1.0061523805248602, "KoPercent": 98.99384761947513};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.00955028018644182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.0, 500, 1500, "Delete"], "isController": false}, {"data": [0.0016637204949568473, 500, 1500, "Bind"], "isController": false}, {"data": [6.825669768846068E-5, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.0, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 801966, 793897, 98.99384761947513, 1606.6272984141328, 0, 479749, 0.0, 120031.9, 130769.0, 130976.0, 1189.28177385486, 438.47797449599824, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 7617, 7617, 100.0, 0.5830379414467642, 0, 164, 0.0, 1.0, 1.0, 9.819999999999709, 18.50502164628369, 7.234818315312984, 0.0], "isController": false}, {"data": ["Delete", 7617, 7617, 100.0, 0.01627937508205331, 0, 30, 0.0, 0.0, 0.0, 1.0, 18.505066603177223, 3.578128112723721, 0.0], "isController": false}, {"data": ["Bind", 9617, 9346, 97.18207341166683, 131679.4160341055, 7, 479749, 130502.0, 130967.0, 131039.0, 207594.37999999998, 14.261605628121625, 4.672301999175476, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 380915, 380850, 99.98293582557788, 12.328372471548857, 0, 120206, 0.0, 0.0, 0.0, 0.0, 792.8444907907527, 310.22225055990225, 0.0], "isController": false}, {"data": ["Search", 380966, 380850, 99.96955108854858, 45.66760813300997, 0, 360010, 0.0, 0.0, 0.0, 0.0, 575.016112453606, 203.83905414661731, 0.0], "isController": false}, {"data": ["Compare", 7617, 7617, 100.0, 0.012734672443219146, 0, 38, 0.0, 0.0, 0.0, 0.0, 18.505066603177223, 6.063004545943195, 0.0], "isController": false}, {"data": ["Unbind", 7617, 0, 0.0, 0.13049757122226616, 0, 248, 0.0, 0.0, 0.0, 1.0, 18.505066603177223, 3.6142708209330516, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2437, 0.30696677276775197, 0.3038782192761289], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1, 1.25960924402032E-4, 1.2469356556262984E-4], "isController": false}, {"data": ["800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out]", 6908, 0.870138065769237, 0.861383150906647], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 784551, 98.8227692005386, 97.8284615557268], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 801966, 793897, "800/javax.naming.NamingException: Context is null", 784551, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out]", 6908, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2437, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 7617, 7617, "800/javax.naming.NamingException: Context is null", 7617, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 7617, 7617, "800/javax.naming.NamingException: Context is null", 7617, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 9617, 9346, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out]", 6908, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2437, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1, "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 380915, 380850, "800/javax.naming.NamingException: Context is null", 380850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 380966, 380850, "800/javax.naming.NamingException: Context is null", 380850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 7617, 7617, "800/javax.naming.NamingException: Context is null", 7617, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
