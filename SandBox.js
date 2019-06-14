(function() {
  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function(schemaCallback) {

    // CrunchBase Organizations
    var Transactions_cols = [{
      id: "investor",
      alias: "Investor",
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
      id: "funded_company",
      alias: "Funded Company",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "money_raised",
      alias: "Money Raised",
      dataType: tableau.dataTypeEnum.int
    }, {
      id: "announced_date",
      alias: "Announced Date",
      dataType: tableau.dataTypeEnum.date
    }];
    var Transactions_Schema = {
      id: "Transactions", // table.tableInfo.id
      alias: "Transactions",
      columns: Transactions_cols
    };

    schemaCallback([Transactions_Schema]);
  };

  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  // As a result, you need a way to change the call to the API for each table. The easiest way to do this is to use the table.tableInfo.id value that we set in the table schemas.
  myConnector.getData = function(table, doneCallback) {

    // LOOKING AT Investments API
    if (table.tableInfo.id == "Transactions") {

      //var CategoriesList = ["Auto Insurance","Automotive","Autonomous Vehicles","Battery","Car Sharing","Electric Vehicle","Last Mile Transportation","Limousine Service","Ride Sharing","Taxi Service"];
      var CategoriesList = ["Auto Insurance"];

      // Iterate for as many categories as listed above
      //for (var i = 0, len = CategoriesList.length; i < len; i++) {
        //var CategoryName = CategoriesList[i];

        // Organizations : MULTIPLE CALLS to a PAGED API
        var PageNo = 1;
        var Next_page_url = "init";
        do {
          $.ajax({
            url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&name=Daimler&page=" + PageNo, // browse the list of companies
            //url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&categories=" + CategoryName + "&page=" + PageNo, // browse the list of companies
            async: false,
            success: function(response) { // response is a custom name
              var organizationsJSON = response.data.items; // data.items is the CrunchBase API JSON Structure
              for (var iO = 0, leniO = organizationsJSON.length; iO < leniO; iO++) { // For each organization, call the organization's investments URL
                var UUID = organizationsJSON[iO].uuid;
                var Investor = organizationsJSON[iO].properties.name;

                // FIRST GET INVESTMENTS DATA
                var PageNo2 = 1;
                var Next_page_url2 = "init";
                do {
                  $.ajax({
                    url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "/investments?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo2, // browse the list of investments
                    async: false,
                    indexValue: {
                      paramInvestor: Investor
                    }, // to get Investor value from out of the ajaxCall
                    success: function(response2) {
                      var investmentsJSON = response2.data.items;
                      var investmentTableData = [];
                      for (var iI = 0, leniI = investmentsJSON.length; iI < leniI; iI++) {
                        var Announced_Date = investmentsJSON[iI].properties.announced_on;
                        var MoneyRaised = investmentsJSON[iI].relationships.funding_round.properties.money_raised_usd;
                        if (MoneyRaised == null) MoneyRaised = 0;
                        var FundingRoundType = investmentsJSON[iI].relationships.funding_round.type;
                        var FundingType = investmentsJSON[iI].relationships.funding_round.properties.funding_type;
                        var Series = investmentsJSON[iI].relationships.funding_round.properties.series;
                        if (Series == null) Series = "";
                        var FundedCompany = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.properties.name;
                        var FinalFundingType = FundingRoundType + " " + FundingType + " " + Series;

                        investmentTableData.push({
                          "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                          "transaction_type": "Investment",
                          "funding_type": FinalFundingType,
                          "funded_company": FundedCompany,
                          "money_raised": MoneyRaised,
                          "announced_date": Announced_Date
                        });

                      }
                      table.appendRows(investmentTableData);
                      Next_page_url2 = response2.data.paging.next_page_url;
                    }
                  });
                  PageNo2++;
                } while (Next_page_url2 != null)

                // THEN GET ACQUISITIONS DATA
                var PageNo3 = 1;
                var Next_page_url3 = "init";
                do {
                  $.ajax({
                    url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "/acquisitions?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo3, // browse the list of acquisitions
                    async: false,
                    indexValue: {
                      paramInvestor: Investor
                    }, // to get Investor value from out of the ajaxCall
                    success: function(response3) {
                      var acquisitionsJSON = response3.data.items;
                      var acquisitionTableData = [];
                      for (var iA = 0, leniA = acquisitionsJSON.length; iA < leniA; iA++) {
                        var Announced_Date = acquisitionsJSON[iA].properties.announced_on;
                        var MoneyRaised = acquisitionsJSON[iA].properties.price_usd;
                        if (MoneyRaised == null) MoneyRaised = 0;
                        var AcquiredCompany = acquisitionsJSON[iA].relationships.acquiree.relationships.properties.name;

                        acquisitionTableData.push({
                          "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                          "transaction_type": "Acquisition",
                          "funding_type": "",
                          "funded_company": AcquiredCompany,
                          "money_raised": MoneyRaised,
                          "announced_date": Announced_Date
                        });

                      }
                      table.appendRows(acquisitionTableData);
                      Next_page_url3 = response3.data.paging.next_page_url;
                    }
                  });
                  PageNo3++;
                } while (Next_page_url3 != null)
              }
              Next_page_url = response.data.paging.next_page_url;
            }
          });
          PageNo++;
        } while (Next_page_url != null); // while there are some data left
      //} // end of For categories loop

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
