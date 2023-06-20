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

    var data = {"OkPercent": 76.48161904761905, "KoPercent": 23.51838095238095};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.757792380952381, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3093666666666667, 500, 1500, "Add"], "isController": false}, {"data": [0.77295, 500, 1500, "Delete"], "isController": false}, {"data": [0.07131666666666667, 500, 1500, "Bind"], "isController": false}, {"data": [0.7741206666666667, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.774172, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [0.9999333333333333, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3150000, 740829, 23.51838095238095, 102.40513777777544, 0, 13444, 1.0, 23.0, 30.0, 65.9900000000016, 10758.490669143965, 3896.842250908922, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 30000, 20697, 68.99, 126.28339999999882, 0, 1767, 112.0, 249.90000000000146, 283.0, 357.0, 103.11050008592541, 36.62594719346108, 0.0], "isController": false}, {"data": ["Delete", 30000, 6766, 22.553333333333335, 123.95553333333386, 0, 1872, 108.0, 250.0, 285.0, 364.9900000000016, 103.13034988690038, 16.821258344964146, 0.0], "isController": false}, {"data": ["Bind", 30000, 6766, 22.553333333333335, 5519.508199999998, 0, 13444, 4894.0, 9418.900000000001, 10315.850000000002, 12349.960000000006, 102.4723153961238, 24.59173455101755, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 338300, 22.553333333333335, 49.57317266666616, 0, 2216, 9.0, 66.90000000000146, 86.0, 119.0, 5126.189703193616, 1972.1506361548022, 0.0], "isController": false}, {"data": ["Search", 1500000, 338300, 22.553333333333335, 48.762550666666016, 0, 2220, 10.0, 66.0, 86.0, 119.0, 5125.664200652668, 1799.1511986846265, 0.0], "isController": false}, {"data": ["Compare", 30000, 30000, 100.0, 65.66683333333297, 0, 1378, 49.0, 136.0, 161.0, 210.9900000000016, 103.13708637730984, 30.124117022990976, 0.0], "isController": false}, {"data": ["Unbind", 30000, 0, 0.0, 0.33933333333333116, 0, 672, 0.0, 0.0, 1.0, 1.0, 103.14488762364493, 20.14548586399315, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 23234, 3.136216319825493, 0.7375873015873016], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 2222, 0.2999342628325835, 0.07053968253968254], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 4526, 0.610937206831806, 0.1436825396825397], "isController": false}, {"data": [" 68/ Entry Already Exists", 13931, 1.880460943078632, 0.44225396825396823], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.io.IOException: connection closed]", 12, 0.0016198069999959505, 3.8095238095238096E-4], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.net.SocketException: Socket closed]", 6, 8.099034999979753E-4, 1.9047619047619048E-4], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 696898, 94.0700215569315, 22.12374603174603], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3150000, 740829, "800/javax.naming.NamingException: Context is null", 696898, " 32/ No Such Object", 23234, " 68/ Entry Already Exists", 13931, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 4526, "800/javax.naming.NamingException: LDAP connection has been closed", 2222], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 30000, 20697, " 68/ Entry Already Exists", 13931, "800/javax.naming.NamingException: Context is null", 6766, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 30000, 6766, "800/javax.naming.NamingException: Context is null", 6766, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 30000, 6766, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 4526, "800/javax.naming.NamingException: LDAP connection has been closed", 2222, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.io.IOException: connection closed]", 12, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.net.SocketException: Socket closed]", 6, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 338300, "800/javax.naming.NamingException: Context is null", 338300, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1500000, 338300, "800/javax.naming.NamingException: Context is null", 338300, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 30000, 30000, " 32/ No Such Object", 23234, "800/javax.naming.NamingException: Context is null", 6766, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
