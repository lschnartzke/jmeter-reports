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

    var data = {"OkPercent": 1.724522240325807, "KoPercent": 98.27547775967419};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.009451653122532827, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.0, 500, 1500, "Delete"], "isController": false}, {"data": [0.0018113824938646723, 500, 1500, "Bind"], "isController": false}, {"data": [0.0, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.0, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 695381, 683389, 98.27547775967419, 1854.678522996805, 0, 261314, 0.0, 53618.8, 130201.95, 130978.98000000001, 1045.3068887816596, 386.02783497822594, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 6557, 6557, 100.0, 0.28442885465914336, 0, 96, 0.0, 1.0, 1.0, 2.0, 16.238478035830152, 6.372218201762533, 0.0], "isController": false}, {"data": ["Delete", 6557, 6557, 100.0, 0.008082964770474314, 0, 1, 0.0, 0.0, 0.0, 0.0, 16.238478035830152, 3.139861963959346, 0.0], "isController": false}, {"data": ["Bind", 8557, 8018, 93.70106345681897, 129857.82330255925, 7, 261314, 130132.0, 130914.0, 131041.0, 234708.38, 12.863007541627772, 4.138545102921348, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 330182, 327850, 99.29372285587948, 257.91218176641746, 0, 56832, 0.0, 0.0, 0.0, 52243.67000000006, 509.5369781668014, 200.05572520578576, 0.0], "isController": false}, {"data": ["Search", 330414, 327850, 99.22400382550376, 282.5384214954529, 0, 57123, 0.0, 0.0, 0.0, 52879.95000000001, 503.45731307805994, 178.47724638688692, 0.0], "isController": false}, {"data": ["Compare", 6557, 6557, 100.0, 0.005947842000915078, 0, 3, 0.0, 0.0, 0.0, 0.0, 16.238478035830152, 5.342045541786159, 0.0], "isController": false}, {"data": ["Unbind", 6557, 0, 0.0, 0.03736464846728704, 0, 51, 0.0, 0.0, 0.0, 1.0, 16.238478035830152, 3.1715777413730764, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 6197, 0.906804177415791, 0.8911661377000522], "isController": false}, {"data": ["800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1821, 0.2664660976398508, 0.2618708305231233], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 675371, 98.82672972494436, 97.12244079145101], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 695381, 683389, "800/javax.naming.NamingException: Context is null", 675371, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 6197, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1821, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 6557, 6557, "800/javax.naming.NamingException: Context is null", 6557, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 6557, 6557, "800/javax.naming.NamingException: Context is null", 6557, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 8557, 8018, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 6197, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1821, "", "", "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 330182, 327850, "800/javax.naming.NamingException: Context is null", 327850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 330414, 327850, "800/javax.naming.NamingException: Context is null", 327850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 6557, 6557, "800/javax.naming.NamingException: Context is null", 6557, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
