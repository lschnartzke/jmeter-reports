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

    var data = {"OkPercent": 86.1795873015873, "KoPercent": 13.820412698412698};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8539904761904762, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8731666666666666, 500, 1500, "Delete"], "isController": false}, {"data": [0.3300666666666667, 500, 1500, "Add"], "isController": false}, {"data": [0.1057, 500, 1500, "Bind"], "isController": false}, {"data": [0.8735866666666666, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.8736203333333333, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [0.9997166666666667, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3150000, 435343, 13.820412698412698, 122.81612952380281, 0, 16389, 8.0, 65.0, 78.0, 102.0, 9351.232284609949, 3392.7888524219693, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete", 30000, 3777, 12.59, 115.08606666666692, 0, 1230, 115.0, 234.0, 266.0, 330.0, 90.05871828432139, 14.338684759963497, 0.0], "isController": false}, {"data": ["Add", 30000, 20089, 66.96333333333334, 118.33156666666672, 0, 2737, 116.0, 236.0, 267.0, 340.0, 90.00171003249062, 31.730896832352315, 0.0], "isController": false}, {"data": ["Bind", 30000, 3777, 12.59, 5883.284899999995, 2, 16389, 5503.0, 12198.0, 13598.0, 14651.980000000003, 89.066758504391, 20.409876756656253, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 188850, 12.59, 67.34098333333135, 0, 2960, 12.0, 55.0, 72.0, 102.0, 4455.361730818925, 1717.8119172061986, 0.0], "isController": false}, {"data": ["Search", 1500000, 188850, 12.59, 66.30171533333568, 0, 3429, 12.0, 55.0, 71.0, 104.0, 4454.9118372947405, 1567.4508050118502, 0.0], "isController": false}, {"data": ["Compare", 30000, 30000, 100.0, 95.9296000000001, 0, 1096, 93.0, 207.0, 235.0, 296.0, 90.06277375330606, 26.042504164465132, 0.0], "isController": false}, {"data": ["Unbind", 30000, 0, 0.0, 0.926533333333326, 0, 2516, 0.0, 1.0, 1.0, 1.0, 90.09441895106072, 17.596566201379048, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 26223, 6.023526276981598, 0.8324761904761905], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 1298, 0.29815570710910705, 0.041206349206349205], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 2431, 0.5584102650094294, 0.07717460317460317], "isController": false}, {"data": [" 68/ Entry Already Exists", 16312, 3.746930581173925, 0.5178412698412699], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.io.IOException: connection closed]", 25, 0.005742598364967394, 7.936507936507937E-4], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.net.SocketException: Socket closed]", 23, 0.005283190495770002, 7.301587301587302E-4], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 389031, 89.36195138086521, 12.350190476190477], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3150000, 435343, "800/javax.naming.NamingException: Context is null", 389031, " 32/ No Such Object", 26223, " 68/ Entry Already Exists", 16312, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 2431, "800/javax.naming.NamingException: LDAP connection has been closed", 1298], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete", 30000, 3777, "800/javax.naming.NamingException: Context is null", 3777, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add", 30000, 20089, " 68/ Entry Already Exists", 16312, "800/javax.naming.NamingException: Context is null", 3777, "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 30000, 3777, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 2431, "800/javax.naming.NamingException: LDAP connection has been closed", 1298, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.io.IOException: connection closed]", 25, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.net.SocketException: Socket closed]", 23, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 188850, "800/javax.naming.NamingException: Context is null", 188850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1500000, 188850, "800/javax.naming.NamingException: Context is null", 188850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 30000, 30000, " 32/ No Such Object", 26223, "800/javax.naming.NamingException: Context is null", 3777, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
