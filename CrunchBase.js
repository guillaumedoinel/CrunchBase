(function() {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function(schemaCallback) {

    // CrunchBase Organizations
    var Organizations_cols = [{
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
    var Organizations_Schema = {
      id: "CrunchBase_Organizations",   // table.tableInfo.id
      alias: "List of Organizations",
      columns: Organizations_cols
    };

    // CrunchBase People
    var People_cols = [{
      id: "uuid",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "title",
      alias: "Job Title",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "last_name",
      alias: "Person's Name",
      dataType: tableau.dataTypeEnum.string
    }];
    var People_Schema = {
      id: "CrunchBase_People",     // table.tableInfo.id
      alias: "List of People",
      columns: People_cols
    };

    schemaCallback([Organizations_Schema]);
  };

  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  // As a result, you need a way to change the call to the API for each table. The easiest way to do this is to use the table.tableInfo.id value that we set in the table schemas.
  myConnector.getData = function(table, doneCallback) {

    if (table.tableInfo.id == "CrunchBase_Organizations") {
      // Organizations : MULTIPLE CALLS API EXAMPLE
      var PageNo = 1;
      var next_page_url = "init";
      do {
        $.ajax({
          url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo,
          async: false,
          success: function(response) {  // response is a custom name
            var tableData = [];
            var itemsJSON = response.data.items; // data.items is the CrunchBase API JSON Structure
            for (var i = 0, len = itemsJSON.length; i < len; i++) {
              tableData.push({
                "uuid": itemsJSON[i].uuid,
                "type": itemsJSON[i].type,
                "name": itemsJSON[i].properties.name
              });
            }

            table.appendRows(tableData); // append data for each API call
            next_page_url = response.data.paging.next_page_url;
          }
        });

        PageNo++;
      } while (next_page_url != null);    // while there are some data left
      doneCallback();
    }

    if (table.tableInfo.id == "CrunchBase_People") {
      // ONE CALL API EXAMPLE
      $.getJSON("https://api.crunchbase.com/v3.1/people?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=1", function(resp) {

        var itemsJSON = resp.data.items, // data Structure in JSON to read
          tableData = [];
        // Iterate over the JSON object
        for (var i = 0, len = itemsJSON.length; i < len; i++) {
          tableData.push({
            "uuid": itemsJSON[i].uuid,
            "title": itemsJSON[i].properties.title,
            "last_name": itemsJSON[i].properties.last_name
          });
        }

        table.appendRows(tableData);
        doneCallback();
      });
    }

  };

  tableau.registerConnector(myConnector);

  $(document).ready(function() {
    $("#submitButton").click(function() {
      tableau.connectionName = "CrunchBase Feed";
      tableau.submit();
    });
  });
})();
