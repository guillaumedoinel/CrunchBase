(function() {

  /***************************************************************************************************/
  /**************************** PREPARATION CODE *****************************************************/
  /***************************************************************************************************/


  // Browse companies listed as parameter by Name, for the desired Category
  function listCompaniesByNameByCategory(p_companyList, p_category, p_table) {
    for (var i = 0, len = p_companyList.length; i < len; i++) {
      var CompanyName = p_companyList[i];
      var PageNo = 1;
      var Next_page_url = "init";
      do {
        $.ajax({
          url: "https://api.crunchbase.com/v3.1/organizations?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&Categories=" + p_category + "&name=" + CompanyName + "&page=" + PageNo,
          async: false,
          success: function(response) { // response is a custom name
            var organizationsJSON = response.data.items; // data.items is the CrunchBase API JSON Structure
            for (var iO = 0, leniO = organizationsJSON.length; iO < leniO; iO++) { // For each organization, get the number of investments & acquisitions
              var UUID = organizationsJSON[iO].uuid;
              var Investor = organizationsJSON[iO].properties.name;

              $.ajax({
                url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "?user_key=9df45b533650fb1b95e83357b5da2db3", // browse the details of each company
                async: false,
                indexValue: {
                  paramInvestor: Investor,
                  paramUUID: UUID
                }, // to get values from out of the ajaxCall
                success: function(response2) {
                  var investmentsJSON = response2.data.relationships;
                  var investmentTableData = [];
                  var Nb_Investments = investmentsJSON.investments.paging.total_items;
                  var Nb_Acquisitions = investmentsJSON.acquisitions.paging.total_items;

                  if (Nb_Investments != 0 || Nb_Acquisitions != 0) {
                    investmentTableData.push({
                      "uuid": this.indexValue.paramUUID, // to get UUID value from out of the ajaxCall
                      "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                      "nb_investments": Nb_Investments,
                      "nb_acquisitions": Nb_Acquisitions
                    });
                  }
                  p_table.appendRows(investmentTableData);
                }
              });
            }
            Next_page_url = response.data.paging.next_page_url;
          }
        });
        PageNo++;
      } while (Next_page_url != null); // while there are some data left
    }
  }

  // Browse companies listed as parameter by UUID & Name and get all investments & acquisitions
  function getInvestmentsAcquisitionsByCompanies(p_companyList, p_table) {
    // Iterate for as many companies as listed above
    for (var i = 0, len = p_companyList.length; i < len; i++) {
      var UUID = p_companyList[i].UUID;
      var Investor = p_companyList[i].CompanyName;

      // GET INVESTMENTS DATA
      var PageNo = 1;
      var Next_page_url = "init";
      do {
        $.ajax({
          url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "/investments?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo, // browse the list of investments
          async: false,
          indexValue: {
            paramInvestor: Investor
          }, // to get Investor value from out of the ajaxCall
          success: function(response) {
            var investmentsJSON = response.data.items;
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
            p_table.appendRows(investmentTableData);
            Next_page_url = response.data.paging.next_page_url;
          }
        });
        PageNo++;
      }
      while (Next_page_url != null)

      // GET ACQUISITIONS DATA
      var PageNo2 = 1;
      var Next_page_url2 = "init";
      do {
        $.ajax({
          url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "/acquisitions?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo2, // browse the list of acquisitions
          async: false,
          indexValue: {
            paramInvestor: Investor
          }, // to get Investor value from out of the ajaxCall
          success: function(response2) {
            var acquisitionsJSON = response2.data.items;
            var acquisitionTableData = [];
            for (var iA = 0, leniA = acquisitionsJSON.length; iA < leniA; iA++) {
              var Announced_Date = acquisitionsJSON[iA].properties.announced_on;
              var MoneyRaised = acquisitionsJSON[iA].properties.price_usd;
              if (MoneyRaised == null) MoneyRaised = 0;
              var AcquiredCompany = acquisitionsJSON[iA].relationships.acquiree.properties.name;

              acquisitionTableData.push({
                "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                "transaction_type": "Acquisition",
                "funding_type": "",
                "funded_company": AcquiredCompany,
                "money_raised": MoneyRaised,
                "announced_date": Announced_Date
              });
            }
            p_table.appendRows(acquisitionTableData);
            Next_page_url2 = response2.data.paging.next_page_url;
          }
        });
        PageNo2++;
      } while (Next_page_url2 != null)
    }
  }

  /***************************************************************************************************/
  /******************************** RUNNING CODE *****************************************************/
  /***************************************************************************************************/

  var myConnector = tableau.makeConnector();

  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  myConnector.getSchema = function(schemaCallback) {

    // Companies
    var Companies_cols = [{
        id: "uuid",
        alias: "UUID",
        dataType: tableau.dataTypeEnum.string
      },
      {
        id: "investor",
        alias: "Investor",
        dataType: tableau.dataTypeEnum.string
      }, {
        id: "nb_investments",
        alias: "Nb INVESTMENTS",
        dataType: tableau.dataTypeEnum.int
      }, {
        id: "nb_acquisitions",
        alias: "Nb ACQUISITIONS",
        dataType: tableau.dataTypeEnum.int
      }
    ];
    var Companies_Schema = {
      id: "Companies", // table.tableInfo.id
      alias: "Companies",
      columns: Companies_cols
    };

    // Transactions : Investments & Acquisitions
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

    // It's only when several schemas are passed to this function that the getData function is called several times
    schemaCallback([Transactions_Schema]);
  };

  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  // As a result, you need a way to change the call to the API for each table. The easiest way to do this is to use the table.tableInfo.id value that we set in the table schemas.
  myConnector.getData = function(table, doneCallback) {

    if (table.tableInfo.id == "Companies") {
      //var CategoriesList = ["Auto Insurance","Automotive","Autonomous Vehicles","Battery","Car Sharing","Electric Vehicle","Last Mile Transportation","Limousine Service","Ride Sharing","Taxi Service"];
      //var CompaniesList = ["Audi","BMW", "Fiat","Chrysler","Ford","General Motors","Honda","Hyundai","Jaguar","Land Rover","KIA","Lexus","Mazda","Daimler","Mitsubishi","Nissan","Porsche","PSA","Peugeot","Citroen","Renault","Seat","Skoda","Tesla","Toyota","Volvo","Volkswagen" ];
      var CompaniesList = ["BMW"];
      listCompaniesByNameByCategory(CompaniesList, "Automotive", table);
      doneCallback();
    }

    if (table.tableInfo.id == "Transactions") {
      var CompaniesList = [
        {CompanyName:"Audi",UUID:"81a1ceaa081ffe4ffbb4ca4cbc8293a8"},
        {CompanyName:"BMW",UUID:"0e35699837f1d2b1b6eb2b62cf418b3e"}, // BMW i Ventures
        {CompanyName:"FIAT",UUID:"e7b7f5416f80e13f335f3b0932884c4c"}, // FIAT S.p.A
        {CompanyName:"Ford",UUID:"9249e8b6409aa80c1a1e29ae21b1db47"}, // Ford Motor Company
        {CompanyName:"Ford",UUID:"0ee8cd71bfd9bf6bfb96a38012b1e001"},    // Ford Foundation
        {CompanyName:"Ford",UUID:"e5a7c1b5702f9efe3e3ebacc0e5e654c"}, // Ford Smart Mobility
        {CompanyName:"General Motors",UUID:"5087a04780c54aa3dfdf30dd8ac88b5e"},
        {CompanyName:"General Motors",UUID:"759be29a69e1615d373f8f8d8f020591"}, // General Motors Ventures
        {CompanyName:"General Motors",UUID:"a1d14b6f137ebeaa847a8ba7ad65b4ea"}, // General Motors Investment Management
        {CompanyName:"Honda",UUID:"0017e370d941822e83bc538beaab28da"}, // Honda Motor
        {CompanyName:"Hyundai",UUID:"271e1bf5086adbb89806b76a591b864e"}, // Hyundai Motor Company
        {CompanyName:"Jaguar Land Rover",UUID:"4b6fd457050953c1db591f694f5ef77b"},
        {CompanyName:"Jaguar Land Rover",UUID:"75213e229421b3687e50a36e9ddf1cec"}, // Jaguar Ventures
        {CompanyName:"Kia",UUID:"396458db49b8888dfba24953402d3d66"}, // Kia Motors
        {CompanyName:"Daimler",UUID:"5d6ed201f03268afb4227e7c68129485"},
        {CompanyName:"Mitsubishi",UUID:"fe8f7d6b2f90470223b5d7f18ca63a51"}, // Mitsubishi Motors
        {CompanyName:"Mitsubishi",UUID:"2e1e8791e661a34d9a78bcabfdd1825f"}, // Mitsubishi Electric
        {CompanyName:"Mitsubishi",UUID:"d4974159c3765f1b93c50cc0c187423b"}, // Mitsubishi UFJ Financial Group
        {CompanyName:"Mitsubishi",UUID:"b8d382916018dd9083ec0723756f2949"}, // Mitsubishi Corporation
        {CompanyName:"Mitsubishi",UUID:"d300b7548f03f143a08309c355f716ba"}, // Mitsubishi UFJ Capital
        {CompanyName:"Mitsubishi",UUID:"453bb5c7da0798805c29a960edbb0676"}, // Bank Of Tokyo - Mitsubishi UFJ
        {CompanyName:"Mitsubishi",UUID:"176c343305f21c86a44393949ae65681"}, // Mitsubishi International Corporation (MIC)
        {CompanyName:"Nissan",UUID:"718eb41ba3098cd45e019958ac876ee5"}, // Nissan Motor Corporation
        {CompanyName:"Renault-Nissan-Mitsubishi",UUID:"96fa22e600c4656428f64b2066e4021d"}, // Renault-Nissan-Mitsubishi
        {CompanyName:"Porsche",UUID:"68255d6d16144c7c1a0b3d3998c1d2c2"},
        {CompanyName:"Porsche",UUID:"8ea457a172805992c020e741fef4a8dc"}, // Porsche Automobil Holding
        {CompanyName:"PSA",UUID:"7c01753993a20640220b5b05a855210a"}, // PSA Group
        {CompanyName:"Peugeot",UUID:"ee1dec4f08abb10cd37aa27ef162d215"}, // Peugeot SA
        {CompanyName:"Renault",UUID:"96ff3fd230b3249437059d861033a53e"},
        {CompanyName:"Tesla",UUID:"a367b036595254357541ad7ee8869e24"},
        {CompanyName:"Toyota",UUID:"12b90373ab49a56a4b4ec7b3e9236faf"}, // Toyota Motor Corporation
        {CompanyName:"Toyota",UUID:"4419828e7e06f10e323c4e985821dafd"}, // Toyota AI Ventures
        {CompanyName:"Toyota",UUID:"4ecb67dc639df5b6cd57da212250cebc"}, // Toyota Tsusho
        {CompanyName:"Volvo",UUID:"1894c8007d82904566067461508339da"}, // Volvo Cars Group
        {CompanyName:"Volvo",UUID:"9a59d1e9d183001585270a39d01a9bfc"}, // Volvo Group Venture Capital
        {CompanyName:"Volvo",UUID:"86d2a05fdff04a4cbccb9f467e5ecc6e"}, // Volvo Cars Tech Fund
        {CompanyName:"Volkswagen",UUID:"8a2b18d24cfbac1708b207b01d092e2a"}, // Volkswagen Group
        {CompanyName:"Volkswagen",UUID:"5449c78f0a2a24b1c2f1414ec2e27917"} // Volkswagen Financial Services
      ];
      getInvestmentsAcquisitionsByCompanies(CompaniesList, table);
      doneCallback();
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


/***************************************************************************************************/
/********************************* EXAMPLES ********************************************************/
/***************************************************************************************************/

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
