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

    var data = {"OkPercent": 79.1259365079365, "KoPercent": 20.87406349206349};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7821169841269842, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3194166666666667, 500, 1500, "Add"], "isController": false}, {"data": [0.7868833333333334, 500, 1500, "Delete"], "isController": false}, {"data": [0.0676, 500, 1500, "Bind"], "isController": false}, {"data": [0.7993053333333333, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.7996636666666667, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [0.9999333333333333, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3150000, 657533, 20.87406349206349, 160.67364539682063, 0, 26649, 1.0, 6.0, 8.0, 19.0, 6645.02287786448, 2411.024398259558, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 30000, 20123, 67.07666666666667, 187.53016666666613, 0, 2859, 176.0, 398.0, 448.0, 576.0, 63.75829654833835, 22.646926179315958, 0.0], "isController": false}, {"data": ["Delete", 30000, 5955, 19.85, 182.9603666666679, 0, 1766, 172.0, 391.0, 441.0, 577.0, 63.77456117787363, 10.334717462750342, 0.0], "isController": false}, {"data": ["Bind", 30000, 5955, 19.85, 8408.446099999968, 1, 26649, 8826.5, 15375.900000000001, 16703.9, 19208.81000000003, 63.2908721904127, 14.950896584428968, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 297750, 19.85, 80.90320799999989, 0, 4291, 4.0, 48.0, 65.0, 105.0, 3166.026425767234, 1221.7295668447118, 0.0], "isController": false}, {"data": ["Search", 1500000, 297750, 19.85, 78.94426333333278, 0, 6792, 5.0, 50.0, 65.0, 102.0, 3165.8126007783676, 1111.958962626527, 0.0], "isController": false}, {"data": ["Compare", 30000, 30000, 100.0, 98.30970000000005, 0, 2127, 77.0, 223.0, 256.0, 330.9900000000016, 63.77686600480452, 18.634360832899297, 0.0], "isController": false}, {"data": ["Unbind", 30000, 0, 0.0, 1.1128666666666598, 0, 678, 0.0, 1.0, 1.0, 2.0, 63.80440122759667, 12.461797114764977, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": [" 32/ No Such Object", 24045, 3.6568506827794196, 0.7633333333333333], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 2287, 0.34781524273306436, 0.0726031746031746], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 3652, 0.5554093862969616, 0.11593650793650793], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.io.IOException: connection closed]", 3, 4.562508649755982E-4, 9.523809523809524E-5], "isController": false}, {"data": [" 68/ Entry Already Exists", 14168, 2.1547207516580915, 0.4497777777777778], "isController": false}, {"data": ["800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.net.SocketException: Socket closed]", 13, 0.0019770870815609253, 4.126984126984127E-4], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 613365, 93.28277059858593, 19.471904761904764], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3150000, 657533, "800/javax.naming.NamingException: Context is null", 613365, " 32/ No Such Object", 24045, " 68/ Entry Already Exists", 14168, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 3652, "800/javax.naming.NamingException: LDAP connection has been closed", 2287], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 30000, 20123, " 68/ Entry Already Exists", 14168, "800/javax.naming.NamingException: Context is null", 5955, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 30000, 5955, "800/javax.naming.NamingException: Context is null", 5955, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 30000, 5955, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 3652, "800/javax.naming.NamingException: LDAP connection has been closed", 2287, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.net.SocketException: Socket closed]", 13, "800/javax.naming.CommunicationException: simple bind failed: 192.168.122.225:389 [Root exception is java.io.IOException: connection closed]", 3, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 1500000, 297750, "800/javax.naming.NamingException: Context is null", 297750, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 1500000, 297750, "800/javax.naming.NamingException: Context is null", 297750, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 30000, 30000, " 32/ No Such Object", 24045, "800/javax.naming.NamingException: Context is null", 5955, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
