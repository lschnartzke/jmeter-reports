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

    var data = {"OkPercent": 1.0502570462735845, "KoPercent": 98.94974295372641};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.009515244755612254, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.0, 500, 1500, "Delete"], "isController": false}, {"data": [0.0011924119241192412, 500, 1500, "Bind"], "isController": false}, {"data": [1.7982128530721776E-5, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.0, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 761147, 753153, 98.94974295372641, 1712.58805197945, 0, 701632, 0.0, 129801.9, 130630.9, 131034.0, 1081.2837658343383, 396.6942364193513, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 7225, 7225, 100.0, 0.6297577854671268, 0, 227, 0.0, 1.0, 1.0, 13.0, 17.041018734506824, 6.602570164478262, 0.0], "isController": false}, {"data": ["Delete", 7225, 7225, 100.0, 0.026297577854671378, 0, 77, 0.0, 0.0, 0.0, 1.0, 17.041018734506824, 3.2950407318675308, 0.0], "isController": false}, {"data": ["Bind", 9225, 8978, 97.32249322493224, 135678.22449864465, 55, 701632, 130345.0, 130957.0, 131075.4, 329221.74, 13.119365605787596, 4.273469742885322, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 361470, 361250, 99.9391374111268, 55.94322073754372, 0, 163426, 0.0, 0.0, 0.0, 0.0, 556.2334866500578, 215.63261229847367, 0.0], "isController": false}, {"data": ["Search", 361552, 361250, 99.91647121299287, 87.60080984201319, 0, 165386, 0.0, 0.0, 0.0, 0.0, 513.7440515858411, 182.11067338481638, 0.0], "isController": false}, {"data": ["Compare", 7225, 7225, 100.0, 0.00788927335640139, 0, 3, 0.0, 0.0, 0.0, 0.0, 17.041018734506824, 5.520655269920303, 0.0], "isController": false}, {"data": ["Unbind", 7225, 0, 0.0, 0.11017301038062263, 0, 82, 0.0, 0.0, 0.0, 1.0, 17.041018734506824, 3.3283239715833646, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out]", 7087, 0.9409774640743647, 0.9310947819540772], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 744175, 98.80794473367297, 97.77020733182947], "isController": false}, {"data": ["800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1891, 0.25107780225266313, 0.2484408399428757], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 761147, 753153, "800/javax.naming.NamingException: Context is null", 744175, "800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out]", 7087, "800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1891, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 7225, 7225, "800/javax.naming.NamingException: Context is null", 7225, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 7225, 7225, "800/javax.naming.NamingException: Context is null", 7225, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 9225, 8978, "800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out]", 7087, "800/javax.naming.CommunicationException: 192.168.122.27:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1891, "", "", "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 361470, 361250, "800/javax.naming.NamingException: Context is null", 361250, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 361552, 361250, "800/javax.naming.NamingException: Context is null", 361250, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 7225, 7225, "800/javax.naming.NamingException: Context is null", 7225, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
