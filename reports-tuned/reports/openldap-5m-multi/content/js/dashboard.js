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

    var data = {"OkPercent": 86.04555555555555, "KoPercent": 13.954444444444444};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8521914285714286, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8712, 500, 1500, "Delete"], "isController": false}, {"data": [0.33158333333333334, 500, 1500, "Add"], "isController": false}, {"data": [0.07108333333333333, 500, 1500, "Bind"], "isController": false}, {"data": [0.872054, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.872071, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [0.9999833333333333, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3150000, 439565, 13.954444444444444, 144.19774952380953, 0, 20114, 6.0, 32.0, 40.0, 77.0, 8667.25182081076, 3148.6384568542826, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete", 30000, 3819, 12.73, 128.7780666666662, 0, 2270, 118.0, 266.0, 311.0, 392.0, 82.9797474096489, 13.21614547317818, 0.0], "isController": false}, {"data": ["Add", 30000, 20027, 66.75666666666666, 128.8479333333318, 0, 1090, 119.0, 264.0, 310.0, 393.0, 82.95267273511553, 29.3221874464264, 0.0], "isController": false}, {"data": ["Bind", 30000, 3819, 12.73, 7862.806500000049, 0, 20114, 7521.0, 14466.700000000004, 15647.0, 17404.99, 82.5516153975273, 18.917331479476292, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 190950, 12.73, 69.69909133333535, 0, 2771, 20.0, 70.0, 92.0, 115.0, 4128.671421061179, 1595.710656599819, 0.0], "isController": false}, {"data": ["Search", 1500000, 190950, 12.73, 68.54152400000058, 0, 2764, 20.0, 69.0, 90.95000000000073, 115.0, 4128.307806630062, 1452.5308811399977, 0.0], "isController": false}, {"data": ["Compare", 30000, 30000, 100.0, 108.02630000000019, 0, 2487, 96.0, 236.0, 281.0, 353.9900000000016, 82.98686317955868, 24.074043278167817, 0.0], "isController": false}, {"data": ["Unbind", 30000, 0, 0.0, 0.2741333333333338, 0, 706, 0.0, 0.0, 1.0, 1.0, 82.99237300092122, 16.209447851742425, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 26181, 5.956115705299558, 0.8311428571428572], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 1370, 0.31167176640542354, 0.04349206349206349], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 2438, 0.5546392456178267, 0.0773968253968254], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.io.IOException: connection closed]", 7, 0.001592483477983916, 2.2222222222222223E-4], "isController": false}, {"data": [" 68/ Entry Already Exists", 16208, 3.6872817444519015, 0.5145396825396825], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.net.SocketException: Socket closed]", 4, 9.099905588479519E-4, 1.2698412698412698E-4], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 393357, 89.48778906418846, 12.48752380952381], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3150000, 439565, "800/javax.naming.NamingException: Context is null", 393357, " 32/ No Such Object", 26181, " 68/ Entry Already Exists", 16208, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 2438, "800/javax.naming.NamingException: LDAP connection has been closed", 1370], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete", 30000, 3819, "800/javax.naming.NamingException: Context is null", 3819, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add", 30000, 20027, " 68/ Entry Already Exists", 16208, "800/javax.naming.NamingException: Context is null", 3819, "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 30000, 3819, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 2438, "800/javax.naming.NamingException: LDAP connection has been closed", 1370, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.io.IOException: connection closed]", 7, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.net.SocketException: Socket closed]", 4, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 190950, "800/javax.naming.NamingException: Context is null", 190950, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1500000, 190950, "800/javax.naming.NamingException: Context is null", 190950, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 30000, 30000, " 32/ No Such Object", 26181, "800/javax.naming.NamingException: Context is null", 3819, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
