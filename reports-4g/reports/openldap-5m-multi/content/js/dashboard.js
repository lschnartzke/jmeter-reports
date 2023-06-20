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

    var data = {"OkPercent": 78.4028888888889, "KoPercent": 21.59711111111111};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7765860317460317, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.32675, 500, 1500, "Add"], "isController": false}, {"data": [0.7919, 500, 1500, "Delete"], "isController": false}, {"data": [0.05333333333333334, 500, 1500, "Bind"], "isController": false}, {"data": [0.7936756666666667, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.7937163333333334, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [0.99995, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3150000, 680309, 21.59711111111111, 118.46806476190181, 0, 15172, 5.0, 25.0, 33.0, 84.0, 9922.509922509922, 3598.8190349030197, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 30000, 20153, 67.17666666666666, 141.98506666666626, 0, 1793, 127.0, 312.0, 357.0, 454.0, 95.11700977485805, 33.803588279285734, 0.0], "isController": false}, {"data": ["Delete", 30000, 6178, 20.593333333333334, 138.99989999999985, 0, 1957, 123.0, 310.0, 355.0, 449.0, 95.1296776055226, 15.443460865236128, 0.0], "isController": false}, {"data": ["Bind", 30000, 6178, 20.593333333333334, 6380.172666666628, 7, 15172, 6370.0, 10952.400000000009, 12584.0, 14729.970000000005, 94.52748859368305, 22.399688487615325, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 308900, 20.593333333333334, 57.493096000001536, 0, 2237, 24.0, 98.0, 122.0, 168.0, 4726.791453961051, 1823.2504870810883, 0.0], "isController": false}, {"data": ["Search", 1500000, 308900, 20.593333333333334, 56.572289333334886, 0, 2695, 24.0, 97.0, 122.0, 168.0, 4726.434000075623, 1659.3520115604638, 0.0], "isController": false}, {"data": ["Compare", 30000, 30000, 100.0, 74.43413333333326, 0, 1819, 58.0, 181.0, 214.0, 285.0, 95.13752128702038, 27.818053281174183, 0.0], "isController": false}, {"data": ["Unbind", 30000, 0, 0.0, 0.285766666666667, 0, 618, 0.0, 0.0, 1.0, 1.0, 95.21663371113178, 18.596998771705422, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 23822, 3.5016441058401404, 0.7562539682539683], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 2380, 0.349841028121045, 0.07555555555555556], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 3753, 0.5516610834194462, 0.11914285714285715], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.io.IOException: connection closed]", 24, 0.0035278086869349077, 7.619047619047619E-4], "isController": false}, {"data": [" 68/ Entry Already Exists", 13975, 2.0542135999964724, 0.44365079365079363], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.net.SocketException: Socket closed]", 21, 0.003086832601068044, 6.666666666666666E-4], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 636334, 93.5360255413349, 20.201079365079366], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3150000, 680309, "800/javax.naming.NamingException: Context is null", 636334, " 32/ No Such Object", 23822, " 68/ Entry Already Exists", 13975, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 3753, "800/javax.naming.NamingException: LDAP connection has been closed", 2380], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 30000, 20153, " 68/ Entry Already Exists", 13975, "800/javax.naming.NamingException: Context is null", 6178, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 30000, 6178, "800/javax.naming.NamingException: Context is null", 6178, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 30000, 6178, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 3753, "800/javax.naming.NamingException: LDAP connection has been closed", 2380, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.io.IOException: connection closed]", 24, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.net.SocketException: Socket closed]", 21, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 308900, "800/javax.naming.NamingException: Context is null", 308900, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1500000, 308900, "800/javax.naming.NamingException: Context is null", 308900, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 30000, 30000, " 32/ No Such Object", 23822, "800/javax.naming.NamingException: Context is null", 6178, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
