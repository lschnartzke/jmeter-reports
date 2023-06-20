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

    var data = {"OkPercent": 1.0355976045835824, "KoPercent": 98.96440239541641};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.009515984053236127, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.0, 500, 1500, "Delete"], "isController": false}, {"data": [0.001674589455488332, 500, 1500, "Bind"], "isController": false}, {"data": [4.13264125367805E-6, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.0, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 764293, 756378, 98.96440239541641, 1699.3442397091285, 0, 474798, 0.0, 129687.9, 130680.75, 204293.8500000005, 1112.9081343656305, 410.3474620219169, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 7256, 7256, 100.0, 0.1500826901874306, 0, 91, 0.0, 0.0, 1.0, 1.0, 16.26373429325826, 6.359198243119965, 0.0], "isController": false}, {"data": ["Delete", 7256, 7256, 100.0, 0.011025358324145562, 0, 15, 0.0, 0.0, 0.0, 0.0, 16.26373429325826, 3.144745498110484, 0.0], "isController": false}, {"data": ["Bind", 9256, 9010, 97.34226447709594, 134268.94727744194, 8, 474798, 130341.5, 130954.0, 131048.0, 314747.58, 13.785974825999729, 4.518272239304922, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 362964, 362800, 99.95481645562646, 48.524407379244074, 0, 205039, 0.0, 0.0, 0.0, 0.0, 660.3271399541181, 258.39853912291943, 0.0], "isController": false}, {"data": ["Search", 363049, 362800, 99.9314142168137, 105.74213949081351, 0, 267816, 0.0, 0.0, 0.0, 0.0, 528.6841618574551, 187.42307701846724, 0.0], "isController": false}, {"data": ["Compare", 7256, 7256, 100.0, 0.004685777287761851, 0, 2, 0.0, 0.0, 0.0, 0.0, 16.26373429325826, 5.329483037083152, 0.0], "isController": false}, {"data": ["Unbind", 7256, 0, 0.0, 0.018880926130099198, 0, 9, 0.0, 0.0, 0.0, 1.0, 16.26373429325826, 3.176510604152004, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2289, 0.302626464545505, 0.2994924721278358], "isController": false}, {"data": ["800/javax.naming.NamingException: LDAP connection has been closed", 4, 5.288361110450066E-4, 5.233594969468515E-4], "isController": false}, {"data": ["800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 61, 0.00806475069343635, 0.007981232328439485], "isController": false}, {"data": ["800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out]", 6656, 0.879983288778891, 0.870870202919561], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 747368, 98.80879665987112, 97.78553512854363], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 764293, 756378, "800/javax.naming.NamingException: Context is null", 747368, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out]", 6656, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2289, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 61, "800/javax.naming.NamingException: LDAP connection has been closed", 4], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 7256, 7256, "800/javax.naming.NamingException: Context is null", 7256, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 7256, 7256, "800/javax.naming.NamingException: Context is null", 7256, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 9256, 9010, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out]", 6656, "800/javax.naming.CommunicationException: 192.168.122.119:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 2289, "800/javax.naming.CommunicationException: LDAP connection has been closed [Root exception is java.io.IOException: LDAP connection has been closed]", 61, "800/javax.naming.NamingException: LDAP connection has been closed", 4, "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 362964, 362800, "800/javax.naming.NamingException: Context is null", 362800, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 363049, 362800, "800/javax.naming.NamingException: Context is null", 362800, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 7256, 7256, "800/javax.naming.NamingException: Context is null", 7256, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
