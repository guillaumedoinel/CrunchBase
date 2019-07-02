(function() {

  /***************************************************************************************************/
  /**************************** PREPARATION CODE *****************************************************/
  /***************************************************************************************************/

  // choose ONE category amongst all CrunchBase ones AND affects one AllianceVenture Category
  // input is a table of categories | separated
  function assignCategory(p_category) {
    var InputCategories = p_category.split("|");
    var TempCrunchBaseCategory = "";
    var CrunchBaseCategory = "";
    var AllianceCategory = "";

    for (var i=0, len=InputCategories.length; i < len; i++) {  // last category selected in case of multiple categories ... ;
      TempCrunchBaseCategory = InputCategories[i];

      // New Mobility
      if (TempCrunchBaseCategory == "Air Mobility"
       || TempCrunchBaseCategory == "Bike-Sharing"
       || TempCrunchBaseCategory == "Car Hailing"
       || TempCrunchBaseCategory == "Car Rental"
       || TempCrunchBaseCategory == "Car Sharing"
       || TempCrunchBaseCategory == "Delivery"
       || TempCrunchBaseCategory == "e-scooter"
       || TempCrunchBaseCategory == "Food Services"
       || TempCrunchBaseCategory == "Mobility Platform"
       || TempCrunchBaseCategory == "P2P Carpooling"
       || TempCrunchBaseCategory == "Platform"
       || TempCrunchBaseCategory == "Public Transportation"
       || TempCrunchBaseCategory == "Ride Hailing"
       || TempCrunchBaseCategory == "Ride Sharing"
       || TempCrunchBaseCategory == "Scooter Sharing"
       || TempCrunchBaseCategory == "Space Travel"
       || TempCrunchBaseCategory == "Transportation info"
       || TempCrunchBaseCategory == "Car Leasing"
       || TempCrunchBaseCategory == "Car Manufacturer"
     ) {CrunchBaseCategory = TempCrunchBaseCategory; AllianceCategory = "New Mobility";}

      // EV & Energy
      if (TempCrunchBaseCategory == "Battery technology"
       || TempCrunchBaseCategory == "Charging Station"
       || TempCrunchBaseCategory == "Electric Battery"
       || TempCrunchBaseCategory == "Electric Vehicles"
       || TempCrunchBaseCategory == "Energy storage"
       || TempCrunchBaseCategory == "EV Battery"
       || TempCrunchBaseCategory == "EV Bus"
       || TempCrunchBaseCategory == "EV Components"
      ) {CrunchBaseCategory = TempCrunchBaseCategory; AllianceCategory = "EV & Energy";}

      // Enterprise 2.0
      if (TempCrunchBaseCategory == "3D Printing"
       || TempCrunchBaseCategory == "Car Marketplace"
       || TempCrunchBaseCategory == "commerce"
       || TempCrunchBaseCategory == "e-commerce"
       || TempCrunchBaseCategory == "Electronics"
       || TempCrunchBaseCategory == "Enterprise Software"
       || TempCrunchBaseCategory == "Financial Services"
       || TempCrunchBaseCategory == "Logistic"
       || TempCrunchBaseCategory == "Manufacturing Solution"
      ) {CrunchBaseCategory = TempCrunchBaseCategory; AllianceCategory = "Enterprise 2.0";}

      // Autonomous Driving
      if (TempCrunchBaseCategory == "AI"
       || TempCrunchBaseCategory == "Artificial Intelligence"
       || TempCrunchBaseCategory == "Autonomous vehicle"
       || TempCrunchBaseCategory == "Big Data"
       || TempCrunchBaseCategory == "Lidar solution"
       || TempCrunchBaseCategory == "Sounds sensor"
      ) {CrunchBaseCategory = TempCrunchBaseCategory; AllianceCategory = "Autonomous Driving";}

      // Connectiviy & Services
      if (TempCrunchBaseCategory == "AR"
       || TempCrunchBaseCategory == "Cloud"
       || TempCrunchBaseCategory == "Map"
       || TempCrunchBaseCategory == "Navigation"
       || TempCrunchBaseCategory == "Social Platform"
       || TempCrunchBaseCategory == "VPA"
       || TempCrunchBaseCategory == "Wireless Technology"
       || TempCrunchBaseCategory == "Telecommunication"
       || TempCrunchBaseCategory == "Action Cam"
      ) {CrunchBaseCategory = TempCrunchBaseCategory; AllianceCategory = "Connectiviy & Services";}
    }

    var AssignedCategories = {
      crunchBaseCategory: CrunchBaseCategory,
      allianceCategory: AllianceCategory
    };
    return AssignedCategories;
  }

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
                  var organizationDetailJSON = response2.data.relationships;
                  var organizationTableData = [];
                  var Nb_Investments = organizationDetailJSON.investments.paging.total_items;
                  var Nb_Acquisitions = organizationDetailJSON.acquisitions.paging.total_items;
                  var categoriesJSON = organizationDetailJSON.categories.items;
                  var CategoryTable = "";
                  for (var iC = 0, lenC = categoriesJSON.length; iC < lenC; iC++) {
                    CategoryTable += categoriesJSON[iC].properties.name + "|";  // adds a pipe after last category ; example : Auto|Finance|
                  }

                  if (Nb_Investments != 0 || Nb_Acquisitions != 0) {
                    organizationTableData.push({
                      "uuid": this.indexValue.paramUUID, // to get UUID value from out of the ajaxCall
                      "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                      "nb_investments": Nb_Investments,
                      "nb_acquisitions": Nb_Acquisitions,
                      "crunchBaseCategory": assignCategory(CategoryTable).crunchBaseCategory,
                      "allianceCategory": assignCategory(CategoryTable).allianceCategory
                    });
                  }
                  p_table.appendRows(organizationTableData);
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
      var Investor = p_companyList[i].CompanyName;
      var UUID = p_companyList[i].UUID;

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
              var FinalFundingType = FundingRoundType + " " + FundingType + " " + Series;
              var FundedCompany = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.properties.name;
              var FundedCompanyUUID = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.uuid;

              // GET FUNDED COMPANY CATEGORIES
            /*  var CategoryTable = "";
              $.ajax({
                url: "https://api.crunchbase.com/v3.1/organizations/" + FundedCompanyUUID + "?user_key=9df45b533650fb1b95e83357b5da2db3",
                async: false,
                success: function(response3) {
                  var categoriesJSON = response3.data.relationships.categories.items;
                  for (var iC = 0, lenC = categoriesJSON.length; iC < lenC; iC++) {
                    CategoryTable += categoriesJSON[iC].properties.name + "|";  // adds a pipe after last category ; example : Auto|Finance|
                  }
                }
              });*/

              investmentTableData.push({
                "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                "transaction_type": "Investment",
                "funding_type": FinalFundingType,
                "funded_company": FundedCompany,
                "money_raised": MoneyRaised,
                "announced_date": Announced_Date/*,
                "crunchBaseCategory": assignCategory(CategoryTable).crunchBaseCategory,
                "allianceCategory": assignCategory(CategoryTable).allianceCategory*/
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
      }, {
        id: "crunchBaseCategory",
        alias: "CrunchBase Category",
        dataType: tableau.dataTypeEnum.string
      }, {
        id: "allianceCategory",
        alias: "Alliance Category",
        dataType: tableau.dataTypeEnum.string
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
    }/*, {
      id: "crunchBaseCategory",
      alias: "CrunchBase Category",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "allianceCategory",
      alias: "Alliance Category",
      dataType: tableau.dataTypeEnum.string
    }*/
    ];
    var Transactions_Schema = {
      id: "Transactions", // table.tableInfo.id
      alias: "Transactions",
      columns: Transactions_cols
    };

    // Categories : Companies and their categories, coming from StartUp Flow
    var Categories_cols = [{
      id: "company_name",
      alias: "Company Name",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "subcategory",
      alias: "Sub Category",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "category",
      alias: "Category",
      dataType: tableau.dataTypeEnum.string
    }
    ];
    var Categories_Schema = {
      id: "Categories", // table.tableInfo.id
      alias: "Categories",
      columns: Categories_cols
    };

    // It's only when several schemas are passed to this function that the getData function is called several times
    schemaCallback([Transactions_Schema,Categories_Schema]);
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
        {CompanyName:"Alliance RNM",UUID:"bded51bc070240d5ba0e6771d44c5146"}, // Alliance Ventures
        {CompanyName:"Volkswagen",UUID:"81a1ceaa081ffe4ffbb4ca4cbc8293a8"}, // Audi
        {CompanyName:"BMW",UUID:"0e35699837f1d2b1b6eb2b62cf418b3e"}, // BMW i Ventures
        {CompanyName:"Daimler",UUID:"5d6ed201f03268afb4227e7c68129485"},
        {CompanyName:"Didi",UUID:"eab915a8f41464e05138c5f341596a5b"}, // Didi Chuxing
        {CompanyName:"FIAT",UUID:"e7b7f5416f80e13f335f3b0932884c4c"}, // FIAT S.p.A
        {CompanyName:"Ford",UUID:"9249e8b6409aa80c1a1e29ae21b1db47"}, // Ford Motor Company
        {CompanyName:"Ford",UUID:"0ee8cd71bfd9bf6bfb96a38012b1e001"},    // Ford Foundation
        {CompanyName:"Ford",UUID:"e5a7c1b5702f9efe3e3ebacc0e5e654c"}, // Ford Smart Mobility
        {CompanyName:"Geely",UUID:"cbcae3286143e6a215efd8b736ca9fff"}, // Zhejiang Geely Holding Group
        {CompanyName:"General Motors",UUID:"5087a04780c54aa3dfdf30dd8ac88b5e"},
        {CompanyName:"General Motors",UUID:"759be29a69e1615d373f8f8d8f020591"}, // General Motors Ventures
        {CompanyName:"General Motors",UUID:"a1d14b6f137ebeaa847a8ba7ad65b4ea"}, // General Motors Investment Management
        {CompanyName:"Honda",UUID:"0017e370d941822e83bc538beaab28da"}, // Honda Motor
        {CompanyName:"Hyundai",UUID:"271e1bf5086adbb89806b76a591b864e"}, // Hyundai Motor Company
        {CompanyName:"Jaguar Land Rover",UUID:"4b6fd457050953c1db591f694f5ef77b"},
        {CompanyName:"Jaguar Land Rover",UUID:"75213e229421b3687e50a36e9ddf1cec"}, // Jaguar Ventures
        {CompanyName:"Kia",UUID:"396458db49b8888dfba24953402d3d66"}, // Kia Motors
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

    if (table.tableInfo.id == "Categories") {
      var CategoriesList = [
        {CompanyName:"99",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"19pay",SubCategory:"null",Category:"null"},
{CompanyName:"3D Media",SubCategory:"",Category:""},
{CompanyName:"A8 Digital Music",SubCategory:"",Category:""},
{CompanyName:"ABEJA",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Accelight Networks",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Adero",SubCategory:"Delivery",Category:"New Mobility"},
{CompanyName:"Adexa",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"AdInnovation",SubCategory:"",Category:""},
{CompanyName:"Agility Communications",SubCategory:"",Category:""},
{CompanyName:"Aiming",SubCategory:"",Category:""},
{CompanyName:"Air2Web",SubCategory:"",Category:""},
{CompanyName:"Akoustic Arts",SubCategory:"",Category:""},
{CompanyName:"Algolux",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Allegro.AI",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Alpaca",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"AlpacaAI",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"AmeriCredit",SubCategory:"null",Category:"null"},
{CompanyName:"Anaeropharma Science",SubCategory:"",Category:""},
{CompanyName:"Anagog",SubCategory:"Navigation",Category:"Connectiviy & Services"},
{CompanyName:"Annuncio Software",SubCategory:"",Category:""},
{CompanyName:"Anthera Pharmaceuticals",SubCategory:"",Category:""},
{CompanyName:"Antrim Design Systems",SubCategory:"",Category:""},
{CompanyName:"anydooR",SubCategory:"",Category:""},
{CompanyName:"AOS Mobile",SubCategory:"",Category:""},
{CompanyName:"Aperto Networks",SubCategory:"",Category:""},
{CompanyName:"Apex.AI",SubCategory:"",Category:""},
{CompanyName:"Apollo Voice Assistant",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Ardana Bioscience",SubCategory:"",Category:""},
{CompanyName:"Argo AI",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"ArrayComm",SubCategory:"",Category:""},
{CompanyName:"ASTES4",SubCategory:"null",Category:"null"},
{CompanyName:"Astro Malaysia Holdings Berhad",SubCategory:"",Category:""},
{CompanyName:"AtomicTangerine",SubCategory:"",Category:""},
{CompanyName:"Audioburst",SubCategory:"",Category:""},
{CompanyName:"Aurora",SubCategory:"",Category:""},
{CompanyName:"AutoAI",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Autobiz.fr",SubCategory:"",Category:""},
{CompanyName:"Autobutler.dk",SubCategory:"null",Category:"null"},
{CompanyName:"AutoFi",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"AutoGravity",SubCategory:"",Category:""},
{CompanyName:"Automobile Craiova",SubCategory:"null",Category:"null"},
{CompanyName:"Autonomic",SubCategory:"null",Category:"null"},
{CompanyName:"AutoSpot",SubCategory:"",Category:""},
{CompanyName:"Autotalks",SubCategory:"",Category:""},
{CompanyName:"AvantGo",SubCategory:"",Category:""},
{CompanyName:"Axiata",SubCategory:"",Category:""},
{CompanyName:"BAIC BJEV",SubCategory:"",Category:""},
{CompanyName:"BarterTrust.com",SubCategory:"",Category:""},
{CompanyName:"Beat",SubCategory:"null",Category:"null"},
{CompanyName:"Ben & Frank",SubCategory:"",Category:""},
{CompanyName:"BeneStream",SubCategory:"",Category:""},
{CompanyName:"BeXcom Korea",SubCategory:"",Category:""},
{CompanyName:"BioAmber",SubCategory:"",Category:""},
{CompanyName:"BioMimetic Therapeutics",SubCategory:"",Category:""},
{CompanyName:"bitFlyer",SubCategory:"",Category:""},
{CompanyName:"Black Girls CODE",SubCategory:"",Category:""},
{CompanyName:"Blacklane",SubCategory:"",Category:""},
{CompanyName:"Blackmore Sensors and Analytics",SubCategory:"3D Printing",Category:"Enterprise 2.0"},
{CompanyName:"Bluegogo",SubCategory:"null",Category:"null"},
{CompanyName:"Bolt",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"BoostWorks",SubCategory:"",Category:""},
{CompanyName:"Boxbot",SubCategory:"",Category:""},
{CompanyName:"Brandtrack",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Breeze",SubCategory:"null",Category:"null"},
{CompanyName:"Broadlane",SubCategory:"",Category:""},
{CompanyName:"Bus.com",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"Butterfield Fulcrum",SubCategory:"null",Category:"null"},
{CompanyName:"Cadillac",SubCategory:"null",Category:"null"},
{CompanyName:"Cadre",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Cambrios Technologies",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Campus Pipeline",SubCategory:"",Category:""},
{CompanyName:"Caocao Chuxing",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Cape Wind",SubCategory:"",Category:""},
{CompanyName:"Capital Analytics",SubCategory:"null",Category:"null"},
{CompanyName:"Capy Inc.",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Car Next Door",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"Cara Therapeutics",SubCategory:"",Category:""},
{CompanyName:"Carbon",SubCategory:"3D Printing",Category:"Enterprise 2.0"},
{CompanyName:"carClub",SubCategory:"",Category:""},
{CompanyName:"Cardiac Dimensions",SubCategory:"",Category:""},
{CompanyName:"Careem",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"CARFIT",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Cargomatic",SubCategory:"Public Transportation",Category:"New Mobility"},
{CompanyName:"CARIZY",SubCategory:"null",Category:"null"},
{CompanyName:"Caroobi",SubCategory:"",Category:""},
{CompanyName:"carpooling.com",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Carventura SAS",SubCategory:"null",Category:"null"},
{CompanyName:"Cascade Corporation",SubCategory:"null",Category:"null"},
{CompanyName:"Catalytic Solutions",SubCategory:"",Category:""},
{CompanyName:"Cermaq",SubCategory:"null",Category:"null"},
{CompanyName:"CETITEC",SubCategory:"null",Category:"null"},
{CompanyName:"Chainalysis",SubCategory:"",Category:""},
{CompanyName:"Challenge Media Group",SubCategory:"",Category:""},
{CompanyName:"Chargemaster",SubCategory:"",Category:""},
{CompanyName:"ChargePoint",SubCategory:"",Category:""},
{CompanyName:"Chariot",SubCategory:"null",Category:"null"},
{CompanyName:"Chariot Transit",SubCategory:"null",Category:"null"},
{CompanyName:"China Unicom",SubCategory:"",Category:""},
{CompanyName:"Chordia Therapeutics",SubCategory:"",Category:""},
{CompanyName:"CINQS",SubCategory:"",Category:""},
{CompanyName:"CINTEO GmbH",SubCategory:"null",Category:"null"},
{CompanyName:"Civil Maps",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Claroty",SubCategory:"",Category:""},
{CompanyName:"ClimaCell",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"CloudCar",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Cohesive Technologies",SubCategory:"",Category:""},
{CompanyName:"Coinbase",SubCategory:"",Category:""},
{CompanyName:"Commerx Corp.",SubCategory:"",Category:""},
{CompanyName:"Conekta",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Conyac",SubCategory:"",Category:""},
{CompanyName:"Coord",SubCategory:"",Category:""},
{CompanyName:"Coskata",SubCategory:"",Category:""},
{CompanyName:"Crowd Realty",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Cruise",SubCategory:"",Category:""},
{CompanyName:"Cswitch",SubCategory:"",Category:""},
{CompanyName:"CureApp",SubCategory:"",Category:""},
{CompanyName:"CyberHeart",SubCategory:"",Category:""},
{CompanyName:"Daihatsu",SubCategory:"null",Category:"null"},
{CompanyName:"Daimler",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Data Enlighten",SubCategory:"Space Travel",Category:"New Mobility"},
{CompanyName:"DataChassi DC AB",SubCategory:"",Category:""},
{CompanyName:"Dejima",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"DeNA",SubCategory:"",Category:""},
{CompanyName:"Desktop Metal",SubCategory:"3D Printing",Category:"Enterprise 2.0"},
{CompanyName:"Devialet",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"D-ID",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"DiscGenics",SubCategory:"",Category:""},
{CompanyName:"Droom Technology",SubCategory:"",Category:""},
{CompanyName:"DSP Concepts",SubCategory:"",Category:""},
{CompanyName:"eBags.com",SubCategory:"",Category:""},
{CompanyName:"EDS (Electronic Data Systems)",SubCategory:"null",Category:"null"},
{CompanyName:"Elementary Robotics",SubCategory:"",Category:""},
{CompanyName:"e-LogiT",SubCategory:"",Category:""},
{CompanyName:"Embark",SubCategory:"Public Transportation",Category:"New Mobility"},
{CompanyName:"Embodied, Inc.",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Emerald Automotive",SubCategory:"null",Category:"null"},
{CompanyName:"Empower Energies Inc.",SubCategory:"",Category:""},
{CompanyName:"Encryptix",SubCategory:"Delivery",Category:"New Mobility"},
{CompanyName:"Enevate",SubCategory:"",Category:""},
{CompanyName:"Engs Commercial Finance",SubCategory:"null",Category:"null"},
{CompanyName:"Entuity",SubCategory:"",Category:""},
{CompanyName:"Envia Systems",SubCategory:"",Category:""},
{CompanyName:"eRoom Technology",SubCategory:"",Category:""},
{CompanyName:"Eurus Energy Holdings",SubCategory:"",Category:""},
{CompanyName:"EXest",SubCategory:"",Category:""},
{CompanyName:"FA Tech Co Ltd.",SubCategory:"null",Category:"null"},
{CompanyName:"Fair",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"feezu.cn",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"Fiat Chrysler Automobiles",SubCategory:"null",Category:"null"},
{CompanyName:"Flexitech Holding",SubCategory:"null",Category:"null"},
{CompanyName:"FlixBus",SubCategory:"Public Transportation",Category:"New Mobility"},
{CompanyName:"Forciot",SubCategory:"",Category:""},
{CompanyName:"Free2Move",SubCategory:"null",Category:"null"},
{CompanyName:"freee",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"FreeWire Technologies",SubCategory:"",Category:""},
{CompanyName:"Gadauto",SubCategory:"null",Category:"null"},
{CompanyName:"GaN Systems",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Garantibil",SubCategory:"null",Category:"null"},
{CompanyName:"Gaudena",SubCategory:"",Category:""},
{CompanyName:"Gengo",SubCategory:"",Category:""},
{CompanyName:"GeoDigital",SubCategory:"",Category:""},
{CompanyName:"Getaround",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"Gett",SubCategory:"Delivery",Category:"New Mobility"},
{CompanyName:"Girls Who Code",SubCategory:"",Category:""},
{CompanyName:"GM Financial",SubCategory:"null",Category:"null"},
{CompanyName:"GottaPark",SubCategory:"",Category:""},
{CompanyName:"Grab",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Graphcore",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Grohmann Engineering",SubCategory:"null",Category:"null"},
{CompanyName:"H2scan",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Hap2U",SubCategory:"",Category:""},
{CompanyName:"HDS Global",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"HERE Technologies",SubCategory:"Navigation",Category:"Connectiviy & Services"},
{CompanyName:"Heycar",SubCategory:"",Category:""},
{CompanyName:"Hibernia Networks",SubCategory:"",Category:""},
{CompanyName:"Hino Ottawa-Gatineau",SubCategory:"null",Category:"null"},
{CompanyName:"HoloEyes",SubCategory:"",Category:""},
{CompanyName:"Hubject",SubCategory:"",Category:""},
{CompanyName:"Humanigen",SubCategory:"",Category:""},
{CompanyName:"iBiquity Digital Corporation",SubCategory:"",Category:""},
{CompanyName:"ICONICS",SubCategory:"null",Category:"null"},
{CompanyName:"Ignite Sports Media",SubCategory:"",Category:""},
{CompanyName:"Illuminate Labs",SubCategory:"",Category:""},
{CompanyName:"Immotor",SubCategory:"",Category:""},
{CompanyName:"Infolibria",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Informative",SubCategory:"",Category:""},
{CompanyName:"INRIX",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Intelligent Apps (mytaxi)",SubCategory:"",Category:""},
{CompanyName:"Intuition Robotics",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Ionic Materials",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"iPierian",SubCategory:"",Category:""},
{CompanyName:"iRidge",SubCategory:"",Category:""},
{CompanyName:"iSpace China",SubCategory:"Space Travel",Category:"New Mobility"},
{CompanyName:"I-Tech",SubCategory:"",Category:""},
{CompanyName:"Jaguar",SubCategory:"null",Category:"null"},
{CompanyName:"JapanTaxi",SubCategory:"",Category:""},
{CompanyName:"Jedlix",SubCategory:"",Category:""},
{CompanyName:"JIMU Intelligent",SubCategory:"",Category:""},
{CompanyName:"Joby Aviation",SubCategory:"",Category:""},
{CompanyName:"JTOWER Inc.",SubCategory:"",Category:""},
{CompanyName:"JustPark",SubCategory:"",Category:""},
{CompanyName:"JX PRESS",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Kalray",SubCategory:"",Category:""},
{CompanyName:"Kamaz",SubCategory:"",Category:""},
{CompanyName:"KH-Automation Projects GmbH",SubCategory:"null",Category:"null"},
{CompanyName:"Kia Motors",SubCategory:"null",Category:"null"},
{CompanyName:"Kii Corporation",SubCategory:"",Category:""},
{CompanyName:"Kinestral Technologies",SubCategory:"",Category:""},
{CompanyName:"Kinzan.com",SubCategory:"",Category:""},
{CompanyName:"KnowledgeNet",SubCategory:"",Category:""},
{CompanyName:"Konfio",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Koolicar",SubCategory:"",Category:""},
{CompanyName:"Kuaidi Dache",SubCategory:"null",Category:"null"},
{CompanyName:"Kyriba",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Kyriba Japan",SubCategory:"",Category:""},
{CompanyName:"Life360",SubCategory:"",Category:""},
{CompanyName:"LifeRobotics",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Liftit",SubCategory:"",Category:""},
{CompanyName:"Lincoln Motor Company",SubCategory:"null",Category:"null"},
{CompanyName:"Livio Radio",SubCategory:"null",Category:"null"},
{CompanyName:"Lizardtech",SubCategory:"",Category:""},
{CompanyName:"LoiLo",SubCategory:"",Category:""},
{CompanyName:"Lotus Cars",SubCategory:"null",Category:"null"},
{CompanyName:"Luminar",SubCategory:"",Category:""},
{CompanyName:"Lunewave",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Luxe",SubCategory:"null",Category:"null"},
{CompanyName:"LUXI Co. Ltd.",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"LuxN",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Lyft",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Lytx",SubCategory:"",Category:""},
{CompanyName:"Macro",SubCategory:"",Category:""},
{CompanyName:"MakeMusic, Inc.",SubCategory:"",Category:""},
{CompanyName:"mana.bo Inc.",SubCategory:"",Category:""},
{CompanyName:"Manganese Bronze Holdings PLC",SubCategory:"null",Category:"null"},
{CompanyName:"Manthey-Racing",SubCategory:"null",Category:"null"},
{CompanyName:"MapAnything",SubCategory:"",Category:""},
{CompanyName:"Mapillary",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Markforged",SubCategory:"3D Printing",Category:"Enterprise 2.0"},
{CompanyName:"Matternet",SubCategory:"",Category:""},
{CompanyName:"Maxwell Technologies",SubCategory:"null",Category:"null"},
{CompanyName:"May Mobility",SubCategory:"",Category:""},
{CompanyName:"Mazda Motor Corp.",SubCategory:"",Category:""},
{CompanyName:"Mcity",SubCategory:"",Category:""},
{CompanyName:"Medcom Sp. z o.o.",SubCategory:"",Category:""},
{CompanyName:"MELCO Hydronics & IT Cooling S.p.A.",SubCategory:"null",Category:"null"},
{CompanyName:"Mesh Korea",SubCategory:"",Category:""},
{CompanyName:"Messung Group",SubCategory:"null",Category:"null"},
{CompanyName:"Metawave",SubCategory:"",Category:""},
{CompanyName:"MICIN Inc.",SubCategory:"",Category:""},
{CompanyName:"Miles",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Mind Palette",SubCategory:"",Category:""},
{CompanyName:"MineSense Technologies",SubCategory:"",Category:""},
{CompanyName:"Mister Auto",SubCategory:"null",Category:"null"},
{CompanyName:"Mitsubishi Electric Klimat Transportation Systems S.p.A",SubCategory:"null",Category:"null"},
{CompanyName:"Mitsubishi Motors",SubCategory:"",Category:""},
{CompanyName:"Mobile Go",SubCategory:"",Category:""},
{CompanyName:"Mobileum",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"mobilityX",SubCategory:"",Category:""},
{CompanyName:"Mobvoi",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Modulated Imaging",SubCategory:"",Category:""},
{CompanyName:"Moixa Technology",SubCategory:"",Category:""},
{CompanyName:"Momenta",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Momentum Dynamics Corp",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Money Forward",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Moneytree",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Monstar Lab",SubCategory:"",Category:""},
{CompanyName:"Moovit",SubCategory:"Navigation",Category:"Connectiviy & Services"},
{CompanyName:"Muse & Co",SubCategory:"",Category:""},
{CompanyName:"MyCityWay",SubCategory:"",Category:""},
{CompanyName:"Mycroft",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"NanoSteel",SubCategory:"",Category:""},
{CompanyName:"Nanotech Partners",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Nauto",SubCategory:"",Category:""},
{CompanyName:"Navistar",SubCategory:"",Category:""},
{CompanyName:"Nema Labs",SubCategory:"",Category:""},
{CompanyName:"NEO RETRO",SubCategory:"null",Category:"null"},
{CompanyName:"NeoPhotonics",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"NetLogic Microsystems",SubCategory:"",Category:""},
{CompanyName:"NeurogesX",SubCategory:"",Category:""},
{CompanyName:"Nexu",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Northvolt",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Nubimetrics",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Nuvve",SubCategory:"",Category:""},
{CompanyName:"NxtPhase",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"NxtWave Communications",SubCategory:"",Category:""},
{CompanyName:"ObjectVideo",SubCategory:"",Category:""},
{CompanyName:"Oceans Inc.",SubCategory:"",Category:""},
{CompanyName:"ofo",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Ogwugo",SubCategory:"",Category:""},
{CompanyName:"Ola",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"OLAM International",SubCategory:"",Category:""},
{CompanyName:"OmniSonics Medical Technologies",SubCategory:"",Category:""},
{CompanyName:"Opel Group",SubCategory:"null",Category:"null"},
{CompanyName:"Opel Special Vehicles",SubCategory:"null",Category:"null"},
{CompanyName:"Open Harbor",SubCategory:"",Category:""},
{CompanyName:"Orocobre",SubCategory:"",Category:""},
{CompanyName:"OYO",SubCategory:"",Category:""},
{CompanyName:"Panacea Pharmaceuticals",SubCategory:"",Category:""},
{CompanyName:"Parallel Domain",SubCategory:"",Category:""},
{CompanyName:"ParkTAG",SubCategory:"",Category:""},
{CompanyName:"PayByPhone Technologies",SubCategory:"null",Category:"null"},
{CompanyName:"Peloton Technology",SubCategory:"",Category:""},
{CompanyName:"Peninsula Pharmaceuticals",SubCategory:"",Category:""},
{CompanyName:"Perbix",SubCategory:"null",Category:"null"},
{CompanyName:"Perceptive Automata",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Percepto",SubCategory:"",Category:""},
{CompanyName:"Pivotal",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Pixim",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Plaid inc",SubCategory:"",Category:""},
{CompanyName:"Platypus Technology",SubCategory:"",Category:""},
{CompanyName:"Plumtree Software",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"PointGrab",SubCategory:"",Category:""},
{CompanyName:"PontaMedia",SubCategory:"",Category:""},
{CompanyName:"Porsche",SubCategory:"null",Category:"null"},
{CompanyName:"Port Medical",SubCategory:"",Category:""},
{CompanyName:"Power Vehicle Innovation",SubCategory:"null",Category:"null"},
{CompanyName:"PowerCell Sweden",SubCategory:"",Category:""},
{CompanyName:"Powerex",SubCategory:"null",Category:"null"},
{CompanyName:"Powermat Technologies",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"PowerShare",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Preferred Networks",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Prescient Markets",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Producteca",SubCategory:"",Category:""},
{CompanyName:"Promethera Biosciences",SubCategory:"",Category:""},
{CompanyName:"Prophesee",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"proteanTecs",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Proterra",SubCategory:"Public Transportation",Category:"New Mobility"},
{CompanyName:"PROTON Holdings",SubCategory:"",Category:""},
{CompanyName:"PTV Group",SubCategory:"null",Category:"null"},
{CompanyName:"Pulsar Technology",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Quake Technologies",SubCategory:"",Category:""},
{CompanyName:"Quantum Biosystems",SubCategory:"",Category:""},
{CompanyName:"Quantumscape",SubCategory:"",Category:""},
{CompanyName:"R3",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Rally",SubCategory:"",Category:""},
{CompanyName:"Rapid Motor Vehicle Company",SubCategory:"null",Category:"null"},
{CompanyName:"RareJob Inc.",SubCategory:"",Category:""},
{CompanyName:"Raven Biotechnologies",SubCategory:"",Category:""},
{CompanyName:"Realtime Robotics, Inc.",SubCategory:"",Category:""},
{CompanyName:"REGiMMUNE Corporation",SubCategory:"",Category:""},
{CompanyName:"Reliance Jio Infocomm Limited",SubCategory:"",Category:""},
{CompanyName:"Reliance Motor Car Company",SubCategory:"null",Category:"null"},
{CompanyName:"Renewable Energy Trust Capital",SubCategory:"",Category:""},
{CompanyName:"RenRenChe",SubCategory:"",Category:""},
{CompanyName:"Retty",SubCategory:"",Category:""},
{CompanyName:"Rever",SubCategory:"",Category:""},
{CompanyName:"Revl",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Revv",SubCategory:"",Category:""},
{CompanyName:"Ridecell",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"RidePal",SubCategory:"Public Transportation",Category:"New Mobility"},
{CompanyName:"Rimac Automobili",SubCategory:"",Category:""},
{CompanyName:"Rioport",SubCategory:"Delivery",Category:"New Mobility"},
{CompanyName:"Rivian Automotive",SubCategory:"",Category:""},
{CompanyName:"Riviera Tool LLC",SubCategory:"null",Category:"null"},
{CompanyName:"SAIPS",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Sakti3",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Sansan",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Saxo Bank",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Scania",SubCategory:"null",Category:"null"},
{CompanyName:"Scoop Technologies",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"SDC Materials,Inc.",SubCategory:"",Category:""},
{CompanyName:"Seak",SubCategory:"",Category:""},
{CompanyName:"Security Bank Corporation",SubCategory:"",Category:""},
{CompanyName:"Sequence Design",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Serenex",SubCategory:"",Category:""},
{CompanyName:"Setsuyo Astec Corp.",SubCategory:"null",Category:"null"},
{CompanyName:"Seurat Technologies",SubCategory:"",Category:""},
{CompanyName:"Seven Seas Technologies Group",SubCategory:"",Category:""},
{CompanyName:"Shenyang Brilliance JinBei Automobile",SubCategory:"",Category:""},
{CompanyName:"Shift",SubCategory:"",Category:""},
{CompanyName:"Shouqi Zhixing",SubCategory:"",Category:""},
{CompanyName:"Sidecar Technologies",SubCategory:"null",Category:"null"},
{CompanyName:"Sila Nanotechnologies",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Silicon Wave",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Silvercar",SubCategory:"",Category:""},
{CompanyName:"SiRF Technology",SubCategory:"Navigation",Category:"Connectiviy & Services"},
{CompanyName:"Sirrus",SubCategory:"",Category:""},
{CompanyName:"Skurt",SubCategory:"",Category:""},
{CompanyName:"Skybox Security",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"SLAMcore Limited",SubCategory:"",Category:""},
{CompanyName:"SMARTCAMP Co.,Ltd.",SubCategory:"",Category:""},
{CompanyName:"Snapeee",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"SoftWheel",SubCategory:"",Category:""},
{CompanyName:"SolarCity",SubCategory:"null",Category:"null"},
{CompanyName:"SolidEnergy Systems",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Solve MIT",SubCategory:"",Category:""},
{CompanyName:"Sonexa Therapeutics",SubCategory:"",Category:""},
{CompanyName:"Sonus Networks",SubCategory:"",Category:""},
{CompanyName:"SoundHound Inc.",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"Spare",SubCategory:"",Category:""},
{CompanyName:"Spin",SubCategory:"null",Category:"null"},
{CompanyName:"Spring Labs",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Starship Technologies",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"StoreDot",SubCategory:"",Category:""},
{CompanyName:"StradVision",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"STRATIM Systems",SubCategory:"",Category:""},
{CompanyName:"STRIVR",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Summit Power International Ltd.",SubCategory:"",Category:""},
{CompanyName:"Summon",SubCategory:"",Category:""},
{CompanyName:"Sunhill Technologies",SubCategory:"null",Category:"null"},
{CompanyName:"Swiftly",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Sylpheo",SubCategory:"null",Category:"null"},
{CompanyName:"Symphony Communication Services",SubCategory:"",Category:""},
{CompanyName:"Tantau Software",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Tekion",SubCategory:"",Category:""},
{CompanyName:"Teknovus",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Telcontar",SubCategory:"",Category:""},
{CompanyName:"TeraLogic",SubCategory:"",Category:""},
{CompanyName:"Terrafugia",SubCategory:"null",Category:"null"},
{CompanyName:"Terra-Gen Power",SubCategory:"",Category:""},
{CompanyName:"Tesla",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"The Markup",SubCategory:"",Category:""},
{CompanyName:"ticketstreet",SubCategory:"",Category:""},
{CompanyName:"tiramizoo",SubCategory:"",Category:""},
{CompanyName:"Tokyo Otaku Mode",SubCategory:"",Category:""},
{CompanyName:"TradeBeam",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"TradeCard",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Tragara",SubCategory:"",Category:""},
{CompanyName:"TranSiC",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Transit",SubCategory:"Navigation",Category:"Connectiviy & Services"},
{CompanyName:"TransLoc",SubCategory:"null",Category:"null"},
{CompanyName:"TravelCar",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"Trillium Secure",SubCategory:"Artificial Intelligence",Category:"Autonomous Driving"},
{CompanyName:"TRINAMIC Motion Control",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"TTTech",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Tula Technology",SubCategory:"",Category:""},
{CompanyName:"Turo",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"TVS Logistics Services",SubCategory:"",Category:""},
{CompanyName:"Uber",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Uber Advanced Technologies Group",SubCategory:"",Category:""},
{CompanyName:"Uber China",SubCategory:"null",Category:"null"},
{CompanyName:"ubitricity",SubCategory:"",Category:""},
{CompanyName:"UDcast",SubCategory:"",Category:""},
{CompanyName:"United States Artists",SubCategory:"",Category:""},
{CompanyName:"Univision Communications",SubCategory:"",Category:""},
{CompanyName:"Urgent.ly Roadside Assistance",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"Ushr",SubCategory:"",Category:""},
{CompanyName:"Uzabase",SubCategory:"",Category:""},
{CompanyName:"Validated",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Vantage Power",SubCategory:"",Category:""},
{CompanyName:"Vaprema",SubCategory:"",Category:""},
{CompanyName:"Varjo",SubCategory:"",Category:""},
{CompanyName:"VAYAVISION",SubCategory:"",Category:""},
{CompanyName:"Velodyne LiDAR",SubCategory:"",Category:""},
{CompanyName:"VeriSign",SubCategory:"",Category:""},
{CompanyName:"Via",SubCategory:"Ride Sharing",Category:"New Mobility"},
{CompanyName:"Vincotech Holdings S.a.r.l.",SubCategory:"null",Category:"null"},
{CompanyName:"Virent Energy Systems",SubCategory:"",Category:""},
{CompanyName:"Volocopter",SubCategory:"",Category:""},
{CompanyName:"Volvo Cars Group",SubCategory:"null",Category:"null"},
{CompanyName:"Vontu",SubCategory:"Enterprise Software",Category:"Enterprise 2.0"},
{CompanyName:"VTXRM",SubCategory:"null",Category:"null"},
{CompanyName:"Waypoint Leasing Services",SubCategory:"",Category:""},
{CompanyName:"WayRay",SubCategory:"Navigation",Category:"Connectiviy & Services"},
{CompanyName:"Wealthnavi",SubCategory:"",Category:""},
{CompanyName:"Wejo",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"WeRide.ai",SubCategory:"",Category:""},
{CompanyName:"what3words",SubCategory:"",Category:""},
{CompanyName:"WHILL",SubCategory:"",Category:""},
{CompanyName:"Whyteboard",SubCategory:"",Category:""},
{CompanyName:"WirelessCar",SubCategory:"null",Category:"null"},
{CompanyName:"xenodata lab",SubCategory:"Financial Services",Category:"Enterprise 2.0"},
{CompanyName:"Xiaomi",SubCategory:"",Category:""},
{CompanyName:"Xometry",SubCategory:"3D Printing",Category:"Enterprise 2.0"},
{CompanyName:"Yellowbrick Data",SubCategory:"",Category:""},
{CompanyName:"Yeong Guan Energy",SubCategory:"",Category:""},
{CompanyName:"Yestock",SubCategory:"Car Sharing",Category:"New Mobility"},
{CompanyName:"Yoshi",SubCategory:"",Category:""},
{CompanyName:"Zebra Imaging",SubCategory:"",Category:""},
{CompanyName:"Zendrive",SubCategory:"Big Data",Category:"Autonomous Driving"},
{CompanyName:"Zhidou",SubCategory:"",Category:""},
{CompanyName:"Zipline",SubCategory:"",Category:""},
{CompanyName:"Zola Electric",SubCategory:"",Category:""},
{CompanyName:"Zolvers",SubCategory:"",Category:""},
{CompanyName:"Zonar",SubCategory:"",Category:""},
{CompanyName:"ZoomCar",SubCategory:"",Category:""},
{CompanyName:"ZRRO",SubCategory:"Electronics",Category:"Enterprise 2.0"},
{CompanyName:"Zum",SubCategory:"Ride Sharing",Category:"New Mobility"}/*,
{CompanyName:"The Mobility House",SubCategory:"Charging",Category:"EV"}*/
      ];
      var categoriesTableData = [];
      for (var i = 0, len = CategoriesList.length; i < len; i++) {
        categoriesTableData.push({
          "company_name": CategoriesList[i].CompanyName,
          "subcategory": CategoriesList[i].SubCategory,
          "category": CategoriesList[i].Category
        });
      }
      table.appendRows(categoriesTableData);
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
