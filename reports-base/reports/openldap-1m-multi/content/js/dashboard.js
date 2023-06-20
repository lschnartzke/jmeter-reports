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

    var data = {"OkPercent": 92.33249714213133, "KoPercent": 7.667502857868665};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9150568398323383, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3288938525136685, 500, 1500, "Add"], "isController": false}, {"data": [0.9297096376304297, 500, 1500, "Delete"], "isController": false}, {"data": [0.12306999699869943, 500, 1500, "Bind"], "isController": false}, {"data": [0.9369658632609948, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.9370210427763982, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [0.9999833311108147, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3149200, 241465, 7.667502857868665, 121.92158738726907, 0, 16890, 1.0, 15.0, 25.0, 72.0, 8652.361458361953, 3142.118533979449, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 29996, 20015, 66.72556340845446, 157.13868515802133, 0, 1707, 152.0, 357.0, 418.0, 564.0, 82.54219844689902, 28.97542808136719, 0.0], "isController": false}, {"data": ["Delete", 29997, 1877, 6.257292395906258, 155.0999433276656, 0, 1730, 148.0, 351.0, 410.0, 552.9900000000016, 82.554264216578, 12.939648646593884, 0.0], "isController": false}, {"data": ["Bind", 29987, 1877, 6.2593790642611795, 6669.43602227634, 0, 16890, 6574.0, 13897.0, 14816.0, 15337.0, 82.39680821247809, 18.32532542816829, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1499616, 93850, 6.258268783475236, 57.881687712057634, 0, 1691, 5.0, 30.0, 39.0, 59.0, 4121.262088695781, 1590.965742275636, 0.0], "isController": false}, {"data": ["Search", 1499612, 93850, 6.258285476509924, 56.84502591336913, 0, 1672, 5.0, 31.0, 39.0, 56.0, 4120.571643681667, 1451.7785473433642, 0.0], "isController": false}, {"data": ["Compare", 29996, 29996, 100.0, 84.68149086544823, 0, 1114, 77.0, 222.0, 256.0, 313.0, 82.55923727110839, 23.719647263346793, 0.0], "isController": false}, {"data": ["Unbind", 29996, 0, 0.0, 0.2375650086678216, 0, 518, 0.0, 0.0, 1.0, 1.0, 82.55969173604899, 16.12493979219707, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 28119, 11.645165966082041, 0.8928934332528896], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 663, 0.2745739548174684, 0.021052965832592405], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1199, 0.4965522953637173, 0.03807316143782548], "isController": false}, {"data": [" 68/ Entry Already Exists", 18138, 7.511647650798253, 0.5759557982979805], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.io.IOException: connection closed]", 14, 0.005797941730685607, 4.4455734789787885E-4], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.net.SocketException: Socket closed]", 1, 4.141386950489719E-4, 3.175409627841992E-5], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 193331, 80.06584805251279, 6.139051187603201], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3149200, 241465, "800/javax.naming.NamingException: Context is null", 193331, " 32/ No Such Object", 28119, " 68/ Entry Already Exists", 18138, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1199, "800/javax.naming.NamingException: LDAP connection has been closed", 663], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 29996, 20015, " 68/ Entry Already Exists", 18138, "800/javax.naming.NamingException: Context is null", 1877, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 29997, 1877, "800/javax.naming.NamingException: Context is null", 1877, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 29987, 1877, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 1199, "800/javax.naming.NamingException: LDAP connection has been closed", 663, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.io.IOException: connection closed]", 14, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.120:389 [Root exception is java.net.SocketException: Socket closed]", 1, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1499616, 93850, "800/javax.naming.NamingException: Context is null", 93850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1499612, 93850, "800/javax.naming.NamingException: Context is null", 93850, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 29996, 29996, " 32/ No Such Object", 28119, "800/javax.naming.NamingException: Context is null", 1877, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
