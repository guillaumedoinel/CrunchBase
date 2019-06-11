(function() {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function(schemaCallback) {
    var cols = [{
      id: "uuid",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "type",
      alias: "Company Type",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "name",
      alias: "Company Name",
      dataType: tableau.dataTypeEnum.string
    }];

    var tableSchema = {
      id: "CrunchBaseFeed_Organizations",
      alias: "List of Organizations",
      columns: cols
    };

    schemaCallback([tableSchema]);
  };

  // ONE CALL API EXAMPLE
  /*myConnector.getData = function(table, doneCallback) {
    $.getJSON("https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=1", function(resp) {

      // &categories=Automotive&name=BMW
      var itemsJSON = resp.data.items, // data Structure in JSON to read
        tableData = [];
      // Iterate over the JSON object
      for (var i = 0, len = itemsJSON.length; i < len; i++) {
        tableData.push({
          "uuid": itemsJSON[i].uuid,
          "type": itemsJSON[i].type,
          "name": itemsJSON[i].properties.name
        });
      }

      table.appendRows(tableData);
      doneCallback();
    });
  };*/

  // MULTIPLE CALLS API EXAMPLE
  var PageNo = 1;
  myConnector.getData = function(table, doneCallback) {
    do {
      /*$.ajax({
        url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo,
        async: false,
        sucess: function(response) {  // response is a custom name
          var tableData = [];
          var itemsJSON = response.data.items;
          for (var i = 0, len = itemsJSON.length; i < len; i++) {
            tableData.push({   // data.items is the CrunchBase API JSON Structure
              "uuid": itemsJSON[i].uuid,
              "type": itemsJSON[i].type,
              "name": itemsJSON[i].properties.name
            });
          }

          table.appendRows(tableData); // append data for each API call
        }
      });*/

      $.getJSON("https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page="+PageNo, function(resp) {

        // &categories=Automotive&name=BMW
        var itemsJSON = resp.data.items, // data Structure in JSON to read
          tableData = [];
        // Iterate over the JSON object
        for (var i = 0, len = itemsJSON.length; i < len; i++) {
          tableData.push({
            "uuid": itemsJSON[i].uuid,
            "type": itemsJSON[i].type,
            "name": itemsJSON[i].properties.name
          });
        }

        table.appendRows(tableData);
      });


      PageNo++;
    } while (PageNo<4);

    doneCallback();
  };

  tableau.registerConnector(myConnector);

  $(document).ready(function() {
    $("#submitButton").click(function() {
      tableau.connectionName = "CrunchBase Feed";
      tableau.submit();
    });
  });
})();
