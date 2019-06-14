(function() {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function(schemaCallback) {

    // CrunchBase Categories
    /*var Categories_cols = [
    {
      id: "uuid",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "name",
      alias: "Category Name",
      dataType: tableau.dataTypeEnum.string
    }];
    var Categories_Schema = {
      id: "CrunchBase_Categories",   // table.tableInfo.id
      alias: "List of Categories",
      columns: Categories_cols
    };*/

    // CrunchBase Organizations
    var Organizations_cols = [{
      id: "company_name",
      alias: "Company Name",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "transaction_type",
      alias: "Transaction Type",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "funding_type",
      alias: "Funding Type",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "funded_company_name",
      alias: "Funded Company Name",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "transaction_amount",
      alias: "Transaction Amount",
      dataType: tableau.dataTypeEnum.int
    }, {
      id: "transaction_date",
      alias: "Transaction Date",
      dataType: tableau.dataTypeEnum.date
    }];
    var Organizations_Schema = {
      id: "CrunchBase_Organizations", // table.tableInfo.id
      alias: "Organizations",
      columns: Organizations_cols
    };

    schemaCallback([Organizations_Schema]);
  };



  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  // As a result, you need a way to change the call to the API for each table. The easiest way to do this is to use the table.tableInfo.id value that we set in the table schemas.
  myConnector.getData = function(table, doneCallback) {

    // ORGANIZATIONS & ORAGANIZATIONS PERMALINK API
    if (table.tableInfo.id == "CrunchBase_Organizations") {

      // Calls the Organizations API for as many categories listed
      //var CategoriesList = ["Auto Insurance","Automotive","Autonomous Vehicles","Battery","Car Sharing","Electric Vehicle","Last Mile Transportation","Limousine Service","Ride Sharing","Taxi Service"];
      var CategoriesList = ["Auto Insurance"];

      //for (var i = 0, len = CategoriesList.length; i < len; i++) {
      //var CategoryName = CategoriesList[i];

      // Organizations : MULTIPLE CALLS to a PAGED API
      var PageNo = 1;
      var Next_page_url = "init";
      do {
        $.ajax({
          url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&name=Daimler&page=" + PageNo, // browse the list of companies
          async: false,
          success: function(response) { // response is a custom name
            var organizationsJSON = response.data.items; // data.items is the CrunchBase API JSON Structure
            for (var iO = 0, leniO = organizationsJSON.length; iO < leniO; iO++) { // For each organization, call the organization's investments URL
              var UUID = organizationsJSON[iO].uuid;
              var CompanyName = organizationsJSON[iO].properties.name;

              // FIRST GET INVESTMENTS DATA
              var PageNo2 = 1;
              var Next_page_url2 = "init";
              do {
                $.ajax({
                  url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "/investments?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=" + PageNo2, // browse the list of investments
                  async: false,
                  indexValue: {
                    paramCompanyName: CompanyName
                  }, // to get CompanyName value from out of the ajaxCall
                  success: function(response2) {
                    var investmentTableData = [];

                    var investmentsJSON = response2.data.items;
                    for (var iI = 0, leniI = investmentsJSON.length; iI < leniI; iI++) {
                      var Announced_On = investmentsJSON[iI].properties.announced_on;

                      if (typeof(investmentsJSON[iI].relationships.funding_round) != 'undefined') { // test if funding_round type of investment is there ; TO DELETE ?
                        var TransactionAmount = investmentsJSON[iI].relationships.funding_round.properties.money_raised_usd; if (TransactionAmount == null) TransactionAmount = 0;
                        var FundingRoundType = investmentsJSON[iI].relationships.funding_round.type;
                        var FundingType = investmentsJSON[iI].relationships.funding_round.properties.funding_type;
                        var Series = investmentsJSON[iI].relationships.funding_round.properties.series; if (Series == null) Series = "";
                        var FundedCompanyName = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.properties.name;
                        var FinalFundingType = FundingRoundType + " " + FundingType + " " + Series;

                        investmentTableData.push({
                          "company_name": this.indexValue.paramCompanyName, // to get CompanyName value from out of the ajaxCall
                          "transaction_type": "Investment",
                          "funding_type": FinalFundingType,
                          "funded_company_name": FundedCompanyName,
                          "transaction_amount": TransactionAmount,
                          "transaction_date": Announced_On
                        });
                      }
                    }
                    Next_page_url2 = response2.data.paging.next_page_url;
                  }
                });
                table.appendRows(investmentTableData); // append INVESTMENTS data
                PageNo2++;
              } while (Next_page_url2 != null)

              // THEN GET ACQUISITIONS DATA ?
            }
            Next_page_url = response.data.paging.next_page_url;
          }
        });
        PageNo++;
      } while (Next_page_url != null); // while there are some data left
      //}


      doneCallback();
    }

    /*// Organizations : MULTIPLE CALLS to a PAGED API
    var PageNo = 1;
    var Next_page_url = "init";
    do {
      $.ajax({
        url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&categories=" + CategoryName + "&page=" + PageNo,
        async: false,
        success: function(response) { // response is a custom name
          var tableData = [];
          var itemsJSON = response.data.items; // data.items is the CrunchBase API JSON Structure
          for (var i = 0, len = itemsJSON.length; i < len; i++) {
            tableData.push({
              "uuid": itemsJSON[i].uuid,
              "name": itemsJSON[i].properties.name
            });
          }

          table.appendRows(tableData); // append data for each API call
          Next_page_url = response.data.paging.next_page_url;
        }
      });
      PageNo++;
    } while (Next_page_url != null); // while there are some data left*/


    /*if (table.tableInfo.id == "CrunchBase_People") {
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
    }*/

  };

  tableau.registerConnector(myConnector);

  $(document).ready(function() {
    $("#submitButton").click(function() {
      tableau.connectionName = "CrunchBase Feed";
      tableau.submit();
    });
  });
})();
