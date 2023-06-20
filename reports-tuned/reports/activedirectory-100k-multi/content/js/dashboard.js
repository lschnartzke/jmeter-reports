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

    var data = {"OkPercent": 2.0981250797159983, "KoPercent": 97.901874920284};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.009448338718591897, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add"], "isController": false}, {"data": [0.0, 500, 1500, "Delete"], "isController": false}, {"data": [0.002761820592134335, 500, 1500, "Bind"], "isController": false}, {"data": [1.538629388940332E-5, 500, 1500, "Search (No-Index, RDN-Base)"], "isController": false}, {"data": [0.0, 500, 1500, "Search"], "isController": false}, {"data": [0.0, 500, 1500, "Compare"], "isController": false}, {"data": [1.0, 500, 1500, "Unbind"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 752672, 736880, 97.901874920284, 1675.5397384252642, 0, 181830, 0.0, 47141.20000000001, 130069.95, 130889.0, 1087.146866338214, 401.4488191354066, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add", 7081, 7081, 100.0, 0.3735348114673084, 0, 90, 0.0, 1.0, 1.0, 9.0, 12.712929449615075, 4.989497787333571, 0.0], "isController": false}, {"data": ["Delete", 7081, 7081, 100.0, 0.027397260273972678, 0, 73, 0.0, 0.0, 0.0, 1.0, 12.712929449615075, 2.458164092796665, 0.0], "isController": false}, {"data": ["Bind", 9052, 8208, 90.67609368095448, 107369.14151568712, 2, 181830, 130120.5, 130901.0, 131012.35, 158501.41, 13.074557621505134, 4.091392010411837, 0.0], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 357461, 353722, 98.95401176631856, 384.7790192496531, 0, 50865, 0.0, 0.0, 0.0, 48186.83000000003, 556.5388381937838, 218.56079142424096, 0.0], "isController": false}, {"data": ["Search", 357835, 353707, 98.84639568516215, 423.8812553271758, 0, 51517, 0.0, 0.0, 0.0, 48602.85000000002, 554.7932674716429, 196.69198757137727, 0.0], "isController": false}, {"data": ["Compare", 7081, 7081, 100.0, 0.0066374805818387155, 0, 4, 0.0, 0.0, 0.0, 0.0, 12.71295227391466, 4.18303893431402, 0.0], "isController": false}, {"data": ["Unbind", 7081, 0, 0.0, 0.06340912300522542, 0, 32, 0.0, 0.0, 0.0, 1.0, 12.71295227391466, 2.482998490998957, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 5043, 0.6843719465856042, 0.670012967135751], "isController": false}, {"data": ["800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1799, 0.24413744436000434, 0.2390151354109094], "isController": false}, {"data": [" 49/ 80090308: LdapErr: DSID-0C090434, comment: AcceptSecurityContext error, data 52e, v4f7c\\u0000", 1366, 0.1853761806535664, 0.18148675651545426], "isController": false}, {"data": ["800/javax.naming.NamingException: Context is null", 728672, 98.88611442840083, 96.81136006122189], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 752672, 736880, "800/javax.naming.NamingException: Context is null", 728672, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 5043, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1799, " 49/ 80090308: LdapErr: DSID-0C090434, comment: AcceptSecurityContext error, data 52e, v4f7c\\u0000", 1366, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add", 7081, 7081, "800/javax.naming.NamingException: Context is null", 7081, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete", 7081, 7081, "800/javax.naming.NamingException: Context is null", 7081, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Bind", 9052, 8208, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out]", 5043, "800/javax.naming.CommunicationException: 192.168.122.58:389 [Root exception is java.net.ConnectException: Connection timed out (Connection timed out)]", 1799, " 49/ 80090308: LdapErr: DSID-0C090434, comment: AcceptSecurityContext error, data 52e, v4f7c\\u0000", 1366, "", "", "", ""], "isController": false}, {"data": ["Search (No-Index, RDN-Base)", 357461, 353722, "800/javax.naming.NamingException: Context is null", 353722, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search", 357835, 353707, "800/javax.naming.NamingException: Context is null", 353707, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Compare", 7081, 7081, "800/javax.naming.NamingException: Context is null", 7081, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
