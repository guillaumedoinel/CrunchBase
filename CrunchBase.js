(function() {

  /***************************************************************************************************/
  /**************************** PREPARATION CODE *****************************************************/
  /***************************************************************************************************/

  // To be able to sort the transactions array by Transaction ID


  // Browse companies listed as parameter by UUID & Name and get all investments & acquisitions from CrunchBase APIs
  function getInvestmentsAcquisitionsByCompanies(p_companyList, p_table) {
    var SortedTable = [];

    // Iterate for as many companies as listed above
    for (var i = 0, len = p_companyList.length; i < len; i++) {
      var Sector = p_companyList[i].Sector;
      var Group = p_companyList[i].Group;
      var Company = p_companyList[i].Company;
      var Investor = p_companyList[i].Investor;
      var UUID = p_companyList[i].UUID;

      // GET INVESTMENTS DATA
      var PageNo = 1;
      var Next_page_url = "init";
      do {
        $.ajax({
          url: "https://api.crunchbase.com/v3.1/organizations/" + UUID + "/investments?user_key=9df45b533650fb1b95e83357b5da2db3&items_per_page=250&page=" + PageNo, // browse the list of investments
          async: false,
          indexValue: {
            paramSector: Sector,
            paramGroup: Group,
            paramCompany: Company,
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
              var Transaction_ID = investmentsJSON[iI].relationships.funding_round.properties.permalink;
              var Series = investmentsJSON[iI].relationships.funding_round.properties.series;
              if (Series == null) Series = "";
              var FinalFundingType = FundingRoundType + " " + FundingType + " " + Series;
              var FundedCompany = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.properties.name;
              var FundedCompanyUUID = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.uuid;
              var ShortDescription = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.properties.short_description;
              var Description = investmentsJSON[iI].relationships.funding_round.relationships.funded_organization.properties.description;

              investmentTableData.push({
                "sector": this.indexValue.paramSector,
                "group": this.indexValue.paramGroup,
                "company": this.indexValue.paramCompany,
                "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                "transaction_type": "Investment",
                "transaction_ID": Transaction_ID,
                "nb_investors": 1,
                "funding_type": FinalFundingType,
                "money_raised": MoneyRaised,
                "announced_date": Announced_Date,
                "company_name_JOIN": FundedCompany,
                "target_company": FundedCompany,
                "short_description": ShortDescription,
                "description": Description
              });
            }
            SortedTable = SortedTable.concat(investmentTableData);
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
            paramSector: Sector,
            paramGroup: Group,
            paramCompany: Company,
            paramInvestor: Investor
          }, // to get Investor value from out of the ajaxCall
          success: function(response2) {
            var acquisitionsJSON = response2.data.items;
            var acquisitionTableData = [];
            for (var iA = 0, leniA = acquisitionsJSON.length; iA < leniA; iA++) {
              var Announced_Date = acquisitionsJSON[iA].properties.announced_on;
              var Transaction_ID = acquisitionsJSON[iA].properties.permalink;
              var MoneyRaised = acquisitionsJSON[iA].properties.price_usd;
              if (MoneyRaised == null) MoneyRaised = 0;
              var AcquiredCompany = acquisitionsJSON[iA].relationships.acquiree.properties.name;
              var ShortDescription = acquisitionsJSON[iA].relationships.acquiree.properties.short_description;
              var Description = acquisitionsJSON[iA].relationships.acquiree.properties.description;

              acquisitionTableData.push({
                "sector": this.indexValue.paramSector,
                "group": this.indexValue.paramGroup,
                "company": this.indexValue.paramCompany,
                "investor": this.indexValue.paramInvestor, // to get Investor value from out of the ajaxCall
                "transaction_type": "Acquisition",
                "transaction_ID": Transaction_ID,
                "nb_investors": 1,
                "funding_type": "",
                "money_raised": MoneyRaised,
                "announced_date": Announced_Date,
                "company_name_JOIN": AcquiredCompany,
                "target_company": AcquiredCompany,
                "short_description": ShortDescription,
                "description": Description
              });
            }
            SortedTable = SortedTable.concat(acquisitionTableData);
            Next_page_url2 = response2.data.paging.next_page_url;
          }
        });
        PageNo2++;
      } while (Next_page_url2 != null)
    }

    // Sort table by Transaction ID to then identify grouped investments
    SortedTable.sort(function (a,b) {
      var x = a.transaction_ID.toLowerCase();
      var y = b.transaction_ID.toLowerCase();
      if (x < y) return -1;
      else if (x > y) return 1;
      return 0;
    });

    // When table is sorted by transaction ID, goal is to compute indicator of multiple investors investments ; ie count number of lines per Transaction ID
    var Counter = 1;
    var TempTransactionID = "";
    var TempTable = [];
    var FinalTable = [];

    for (var i = 0, len = SortedTable.length; i < len; i++) {
      if (TempTransactionID = SortedTable[i].transaction_ID) {
        Counter+=1;
      } else {
        TempTransactionID = SortedTable[i].transaction_ID;
        if (i != 0) { // do this unless for the first line
          for (var j = 0, lenJ = TempTable.length; j < lenJ; j++ ) {
            TempTable[j].nb_investors = Counter;
            FinalTable.push(TempTable[j]);
          }
          // reinit variables
          Counter = 1;
          TempTable = [];
        }
      }
      TempTable.push(SortedTable[i]);
    }
    // deal with transcation ID NULL (partnerships / subsidiaries)

    for (var j = 0, lenJ = TempTable.length; j < lenJ; j++ ) {
      TempTable[j].nb_investors = Counter;
      FinalTable.push(TempTable[j]);
    }

    p_table.appendRows(FinalTable);


  }

  // Inserts HARDCODED partnerships into the same table as Investments/Acquisitions
  function insertPartnerships(p_table) {
    var PartnershipsList = [
      {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"AmazonCS",Company1:"Amazon"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Supplier",CompanyNameJOIN:"HERE Technologies",Company1:"HERE Technologies"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"what3words",Company1:"what3words"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Supplier",CompanyNameJOIN:"AT&T",Company1:"AT&T"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"ChargePoint",Company1:"ChargePoint"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"QualcommCEC",Company1:"Qualcomm"},
{Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia",TransactionType:"Partnership",CompanyNameJOIN:"Vodafone",Company1:"Vodafone"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Vodafone",Company1:"Vodafone"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Walmart",Company1:"Walmart"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Otonomo",Company1:"Otonomo"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Deepglint",Company1:"Deepglint"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Soundhound Inc.",Company1:"Soundhound Inc."},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Soundhound Inc.",Company1:"Soundhound Inc."},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Shell",Company1:"Shell"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"ParkMobile",Company1:"ParkMobile"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"DaimlerCS",Company1:"Daimler"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
{Sector:"OEM",Group:"Byton",Company:"Byton",Investor:"Byton",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
{Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia",TransactionType:"Partnership",CompanyNameJOIN:"Vulog",Company1:"Vulog"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Vulog",Company1:"Vulog"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Cleenup",Company1:"Cleenup"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiCEC",Company1:"Huawei"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Uber",Company1:"Uber"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Uber",Company1:"Uber"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Bosch",Company1:"Bosch"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Uber",Company1:"Uber"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Delphi",Company1:"Delphi"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Intel",Company1:"Intel"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Lyft",Company1:"Lyft"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Google",Company1:"Google"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Google",Company1:"Google"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"JLR",Company1:"JLR"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Alibaba",Company1:"Alibaba"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Alibaba",Company1:"Alibaba"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Alibaba",Company1:"Alibaba"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"IBM",Company1:"IBM"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"IBM",Company1:"IBM"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"IBM",Company1:"IBM"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Valeo",Company1:"Valeo"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiCEC",Company1:"Huawei"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"Vodafone",Company1:"Vodafone"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"Siemens",Company1:"Siemens"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"QualcommAE",Company1:"Qualcomm"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Didi Chuxing",Company1:"Didi Chuxing"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"YandexN",Company1:"Yandex"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"YandexN",Company1:"Yandex"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Tomtom",Company1:"Tomtom"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"NASA",Company1:"NASA"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"DeNA",Company1:"DeNA"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Didi Chuxing",Company1:"Didi Chuxing"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiS",Company1:"Huawei"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Ford",Company1:"Ford"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"BMW",Company1:"BMW"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"ChargePoint",Company1:"ChargePoint"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Engie",Company1:"Engie"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Enel",Company1:"Enel"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"EVgo",Company1:"EVgo"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"EVgo",Company1:"EVgo"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Panasonic",Company1:"Panasonic"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Panasonic",Company1:"Panasonic"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"CATL",Company1:"CATL"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Samsung SDI",Company1:"Samsung SDI"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"CATL",Company1:"CATL"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Chargetrip",Company1:"Chargetrip"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Disney",Company1:"Disney"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"INRIX",Company1:"INRIX"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"AmazonS",Company1:"Amazon"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Pizza Hut",Company1:"Pizza Hut"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Dominos",Company1:"Dominos"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Supplier",CompanyNameJOIN:"Zenuity",Company1:"Zenuity"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Baidu",Company1:"Baidu"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"AmazonS",Company1:"Amazon"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Luminar",Company1:"Luminar"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Luminar",Company1:"Luminar"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiADS",Company1:"Huawei"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Airbus",Company1:"Airbus"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"YandexADS",Company1:"Yandex"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Garmin",Company1:"Garmin"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Lidl",Company1:"Lidl"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Kaufland",Company1:"Kaufland"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Vulog",Company1:"Vulog"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"DaimlerADS",Company1:"Daimler"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"BMW",Company:"Mini",Investor:"Mini",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Spotify",Company1:"Spotify"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"BMW",Company:"Mini",Investor:"Mini",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"TuneIn",Company1:"TuneIn"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Audible",Company1:"Audible"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Xevo",Company1:"Xevo"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Xevo",Company1:"Xevo"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Xevo",Company1:"Xevo"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Wind River",Company1:"Wind River"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Tencent",Company1:"Tencent"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Baidu",Company1:"Baidu"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"BYD",Company1:"BYD"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Softbank",Company1:"Softbank"},
{Sector:"OEM",Group:"Geely",Company:"Geely",Investor:"Geely",TransactionType:"Partnership",CompanyNameJOIN:"Geely",Company1:"Huawei"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Mazda",Company1:"Mazda"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Supplier",CompanyNameJOIN:"LG Chem",Company1:"LG Chem"},
{Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia",TransactionType:"Partnership",CompanyNameJOIN:"Soundhound Inc.",Company1:"Soundhound Inc."},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"BoschAE",Company1:"Bosch"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Valeo",Company1:"Valeo"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"BoschAE",Company1:"Bosch"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Intel",Company1:"Intel"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Delphi",Company1:"Delphi"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Valeo",Company1:"Valeo"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Magna",Company1:"Magna"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Denso",Company1:"Denso"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Prophesee",Company1:"Prophesee"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"TomTomADS",Company1:"TomTom"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"LG",Company1:"LG"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft ADS",Company1:"Microsoft"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Intel",Company1:"Intel"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance",TransactionType:"Partnership",CompanyNameJOIN:"Embotech",Company1:"Embotech"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"LG",Company1:"LG"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Delphi",Company1:"Delphi"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Valeo",Company1:"Valeo"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Velodyne LiDAR",Company1:"Velodyne LiDAR"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Magna",Company1:"Magna"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Intel",Company1:"Intel"},
{Sector:"OEM",Group:"Fiat",Company:"Fiat",Investor:"Fiat",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"BoschAE",Company1:"Bosch"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Autoliv",Company1:"Autoliv"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"nuTonomy",Company1:"nuTonomy"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Aptiv",Company1:"Aptiv"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"AImotive",Company1:"AImotive"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Veoneer",Company1:"Veoneer"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Autoliv",Company1:"Autoliv"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Delphi",Company1:"Delphi"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Valeo",Company1:"Valeo"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Delphi",Company1:"Delphi"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"ARM",Company1:"ARM"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Samsung",Company1:"Samsung"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Denso",Company1:"Denso"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Autoliv",Company1:"Autoliv"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"ZF Friedrichshafen",Company1:"ZF Friedrichshafen"}
    ];

    var partnershipsTableData = [];
    for (var i = 0, len = PartnershipsList.length; i < len; i++) {
      partnershipsTableData.push({
        "sector": PartnershipsList[i].Sector,
        "group": PartnershipsList[i].Group,
        "company": PartnershipsList[i].Company,
        "investor": PartnershipsList[i].Investor,
        "transaction_type": PartnershipsList[i].TransactionType,
        "transaction_ID": "",
        "nb_investors": 0,
        "funding_type": "",
        "money_raised": "",
        "announced_date": "",
        "company_name_JOIN": PartnershipsList[i].CompanyNameJOIN,
        "target_company": PartnershipsList[i].Company1,
        "short_description": "",
        "description": ""
      });
    }
    p_table.appendRows(partnershipsTableData);
  }

  // Inserts HARDCODED subsidiaries into the same table as Investments/Acquisitions
  function insertSubsidiaries(p_table) {
    var SubsidiariesList = [
      {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Share Now",AnnouncedDate:"2019-01-01"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Share Now",AnnouncedDate:"2019-01-01"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Subsidiary",CompanyNameJOIN:"Free2Move",AnnouncedDate:""},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Subsidiary",CompanyNameJOIN:"Free2Move Paris",AnnouncedDate:""},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Subsidiary",CompanyNameJOIN:"eMov",AnnouncedDate:""},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Subsidiary",CompanyNameJOIN:"WeShare",AnnouncedDate:""},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Hive",AnnouncedDate:""},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Hive",AnnouncedDate:""},
{Sector:"OEM",Group:"Alliance",Company:"Renault",Investor:"Renault",TransactionType:"Subsidiary",CompanyNameJOIN:"Moov'In Paris",AnnouncedDate:""},
{Sector:"OEM",Group:"Alliance",Company:"Renault",Investor:"Renault",TransactionType:"Subsidiary",CompanyNameJOIN:"Marcel",AnnouncedDate:"2017-01-01"},
{Sector:"OEM",Group:"Alliance",Company:"Renault",Investor:"Renault",TransactionType:"Subsidiary",CompanyNameJOIN:"Renault Mobility",AnnouncedDate:""},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Ionity",AnnouncedDate:"2017-10-01"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Ionity",AnnouncedDate:"2017-10-01"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Subsidiary",CompanyNameJOIN:"Ionity",AnnouncedDate:"2017-10-01"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Subsidiary",CompanyNameJOIN:"Ionity",AnnouncedDate:"2017-10-01"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Charge Now",AnnouncedDate:"2019-01-01"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Charge Now",AnnouncedDate:"2019-01-01"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Park Now",AnnouncedDate:"2019-01-02"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Park Now",AnnouncedDate:"2019-01-03"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Free Now",AnnouncedDate:"2019-01-04"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Free Now",AnnouncedDate:"2019-01-05"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Subsidiary",CompanyNameJOIN:"Reach Now",AnnouncedDate:"2019-01-04"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Subsidiary",CompanyNameJOIN:"Reach Now",AnnouncedDate:"2019-01-05"}
    ];

    var subsidiariesTableData = [];
    for (var i = 0, len = SubsidiariesList.length; i < len; i++) {
      subsidiariesTableData.push({
        "sector": SubsidiariesList[i].Sector,
        "group": SubsidiariesList[i].Group,
        "company": SubsidiariesList[i].Company,
        "investor": SubsidiariesList[i].Investor,
        "transaction_type": SubsidiariesList[i].TransactionType,
        "transaction_ID": "",
        "nb_investors": 0,
        "funding_type": "",
        "money_raised": "",
        "announced_date": SubsidiariesList[i].AnnouncedDate,
        "company_name_JOIN": SubsidiariesList[i].CompanyNameJOIN,
        "target_company": SubsidiariesList[i].CompanyNameJOIN,
        "short_description": "",
        "description": ""
      });
    }
    p_table.appendRows(subsidiariesTableData);
  }

  /***************************************************************************************************/
  /******************************** RUNNING CODE *****************************************************/
  /***************************************************************************************************/

  var myConnector = tableau.makeConnector();

  // When you create multiple table schemas, the WDC API calls the getData function once for each schema.
  myConnector.getSchema = function(schemaCallback) {

    // Transactions : Investments & Acquisitions
    var Transactions_cols = [
    {
      id: "sector",
      alias: "Sector",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "group",
      alias: "Group",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "company",
      alias: "Company",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "investor",
      alias: "Investor",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "transaction_type",
      alias: "Transaction Type",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "transaction_ID",
      alias: "Transaction ID",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "funding_type",
      alias: "Funding Type",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "money_raised",
      alias: "Money Raised",
      dataType: tableau.dataTypeEnum.int
    }, {
      id: "announced_date",
      alias: "Announced Date",
      dataType: tableau.dataTypeEnum.date
    }, {
      id: "company_name_JOIN",
      alias: "Company Name JOIN",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "target_company",
      alias: "Target Company",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "short_description",
      alias: "Short Description",
      dataType: tableau.dataTypeEnum.string
    }, {
      id: "description",
      alias: "Description",
      dataType: tableau.dataTypeEnum.string
    }
    ];
    var Transactions_Schema = {
      id: "Transactions", // table.tableInfo.id
      alias: "Transactions",
      columns: Transactions_cols
    };

    // Categories : Companies and their categories, coming from StartUp Flow
    var Categories_cols = [
    {
      id: "company_name_JOIN",
      alias: "Company Name JOIN",
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

    if (table.tableInfo.id == "Transactions") {
      var CompaniesList = [
        {Sector:"Mobility",Group:"Didi Chuxing",Company:"Didi",Investor:"Didi Chuxing",UUID:"eab915a8f41464e05138c5f341596a5b"},
{Sector:"Mobility",Group:"Grab",Company:"Grab",Investor:"Grab",UUID:"a76824768a83dbcf73dc41a841ef850e"},
{Sector:"Mobility",Group:"Lyft",Company:"Lyft",Investor:"Lyft",UUID:"33a97e70f137e90f8d68950a043ee09f"},
{Sector:"Mobility",Group:"Uber",Company:"Uber",Investor:"Uber",UUID:"1eb371093b9301a9177ffee2cb1bfcdc"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Renault Nissan Mitsubishi",UUID:"96fa22e600c4656428f64b2066e4021d"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Alliance",Investor:"Alliance Ventures",UUID:"bded51bc070240d5ba0e6771d44c5146"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Mitsubishi Motors",UUID:"fe8f7d6b2f90470223b5d7f18ca63a51"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Mitsubishi Electric",UUID:"2e1e8791e661a34d9a78bcabfdd1825f"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Mitsubishi UFJ Financial Group",UUID:"d4974159c3765f1b93c50cc0c187423b"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Mitsubishi Corporation",UUID:"b8d382916018dd9083ec0723756f2949"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Mitsubishi UFJ Capital",UUID:"d300b7548f03f143a08309c355f716ba"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Bank Of Tokyo - Mitsubishi UFJ",UUID:"453bb5c7da0798805c29a960edbb0676"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Mitsubishi",Investor:"Mitsubishi International Corporation (MIC)",UUID:"176c343305f21c86a44393949ae65681"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Nissan",Investor:"Nissan Motor Corporation",UUID:"718eb41ba3098cd45e019958ac876ee5"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Renault",Investor:"Renault",UUID:"96ff3fd230b3249437059d861033a53e"},
{Sector:"OEM",Group:"Alliance RNM",Company:"Renault",Investor:"RCI Bank and Services",UUID:"46aec950da914c3e91d556bf0cf20b29"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",UUID:"b462608d8bf493f14f68e41ee10f0df2"},
{Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW i Ventures",UUID:"0e35699837f1d2b1b6eb2b62cf418b3e"},
{Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",UUID:"5d6ed201f03268afb4227e7c68129485"},
{Sector:"OEM",Group:"FCA",Company:"Fiat",Investor:"FIAT S.p.A",UUID:"e7b7f5416f80e13f335f3b0932884c4c"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford Motor Company",UUID:"9249e8b6409aa80c1a1e29ae21b1db47"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford Foundation",UUID:"0ee8cd71bfd9bf6bfb96a38012b1e001"},
{Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford Smart Mobility",UUID:"e5a7c1b5702f9efe3e3ebacc0e5e654c"},
{Sector:"OEM",Group:"Geely",Company:"Geely",Investor:"Zhejiang Geely Holding Group",UUID:"cbcae3286143e6a215efd8b736ca9fff"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo Group Venture Capital",UUID:"9a59d1e9d183001585270a39d01a9bfc"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo Cars Group",UUID:"1894c8007d82904566067461508339da"},
{Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo Cars Tech Fund",UUID:"86d2a05fdff04a4cbccb9f467e5ecc6e"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"General Motors Investment Management",UUID:"a1d14b6f137ebeaa847a8ba7ad65b4ea"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"General Motors",UUID:"5087a04780c54aa3dfdf30dd8ac88b5e"},
{Sector:"OEM",Group:"GM",Company:"GM",Investor:"General Motors Ventures",UUID:"759be29a69e1615d373f8f8d8f020591"},
{Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda Motor",UUID:"0017e370d941822e83bc538beaab28da"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai Motor Company",UUID:"271e1bf5086adbb89806b76a591b864e"},
{Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai Venture Investment Corporation",UUID:"994661433b9eb9fc9283116b7b32af5a"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"Jaguar Land Rover",UUID:"4b6fd457050953c1db591f694f5ef77b"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"Jaguar Ventures",UUID:"75213e229421b3687e50a36e9ddf1cec"},
{Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"Jaguar Land Rover’s venture capital fund",UUID:"ec11c33226e64c7db12a92b9305cf0dd"},
{Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia Motors",UUID:"396458db49b8888dfba24953402d3d66"},
{Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA Group",UUID:"7c01753993a20640220b5b05a855210a"},
{Sector:"OEM",Group:"PSA",Company:"Peugeot",Investor:"Peugeot SA",UUID:"ee1dec4f08abb10cd37aa27ef162d215"},
{Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",UUID:"a367b036595254357541ad7ee8869e24"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota Motor Corporation",UUID:"12b90373ab49a56a4b4ec7b3e9236faf"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota Tsusho",UUID:"4ecb67dc639df5b6cd57da212250cebc"},
{Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota AI Ventures",UUID:"4419828e7e06f10e323c4e985821dafd"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen group",UUID:"8a2b18d24cfbac1708b207b01d092e2a"},
{Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",UUID:"81a1ceaa081ffe4ffbb4ca4cbc8293a8"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen We",UUID:"a31b34c32f6543789fb20993d74b4dad"},
{Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen Financial Services",UUID:"5449c78f0a2a24b1c2f1414ec2e27917"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",UUID:"68255d6d16144c7c1a0b3d3998c1d2c2"},
{Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche Automobil Holding",UUID:"8ea457a172805992c020e741fef4a8dc"},
{Sector:"OEM",Group:"VAG",Company:"Seat",Investor:"Seat",UUID:"fdf2b2f2241533a054ad3b9755b84f33"},
{Sector:"OEM",Group:"VAG",Company:"Škoda",Investor:"Škoda Auto a.s",UUID:"7c71810f27514e8c95d7e2fae0b96178"},
{Sector:"Technology",Group:"Huawei",Company:"Huawei",Investor:"Huawei Enterprise",UUID:"cf93455ea23645ad97ff1f059a1ebecc"},
{Sector:"Technology",Group:"Huawei",Company:"Huawei",Investor:"Huawei Technologies",UUID:"09cce08ac9fc0e79e825249b00642c79"},
{Sector:"Technology",Group:"Baidu",Company:"Baidu",Investor:"Baidu",UUID:"c273424ac118e7ab29a6843775e7e6d0"},
{Sector:"Technology",Group:"Baidu",Company:"Baidu",Investor:"Baidu Ventures",UUID:"7d2096a8c85d135a5d87fbbd89ade46a"},
{Sector:"Technology",Group:"Baidu",Company:"Baidu",Investor:"Baidu Capital",UUID:"b8faf0f503a431ef91f9859ab9283428"},
{Sector:"Technology",Group:"Baidu",Company:"Baidu",Investor:"Baidu's Apollo fund",UUID:"e2c9981616d44a0fa70f4c43c17779f0"},
{Sector:"Technology",Group:"Baidu",Company:"Baidu",Investor:"Waimai",UUID:"3932dd5dd3c759f686fe7bf42c6af05d"},
{Sector:"Technology",Group:"Alibaba",Company:"Alibaba",Investor:"Alibaba Group",UUID:"17d626a727a7a51b93373839f8ed055e"},
{Sector:"Technology",Group:"Alibaba",Company:"Alibaba",Investor:"Alibaba Cloud",UUID:"77347697f336af8aa4e2ae9897c6bfde"},
{Sector:"Technology",Group:"Alibaba",Company:"Alibaba",Investor:"Alibaba Entrepreneurs fund",UUID:"d27edf4c9e7ceeb867f377e1c607fc55"},
{Sector:"Technology",Group:"Alibaba",Company:"Alibaba",Investor:"Alibaba.com",UUID:"c79315efd45b44baa355ad3a7caf3667"},
{Sector:"Technology",Group:"Alibaba",Company:"Alibaba",Investor:"Alibaba Capital Partners",UUID:"6cceb09c4daacd6b3eca917f2f86bbbd"},
{Sector:"Technology",Group:"Alibaba",Company:"Alibaba",Investor:"Alibaba Innovation Investment",UUID:"b472dcc9c13a8bf3ae8390843fb3f4a2"},
{Sector:"Technology",Group:"Tencent",Company:"Tencent",Investor:"Tencent Holdings",UUID:"3cae090bed2d95f879a9e32ca480258f"},
{Sector:"Technology",Group:"Tencent",Company:"Tencent",Investor:"Tencent Cloud",UUID:"62e44cabec754bbda7a72021842562fd"},
{Sector:"Technology",Group:"Tencent",Company:"Tencent",Investor:"Tencent Industry Win-Win Fund",UUID:"d53f2332b68c20e62741fcacf60eb62f"},
{Sector:"Technology",Group:"Tencent",Company:"Tencent",Investor:"Tencent WeStart",UUID:"1fb0af95267d4de0b5548e739c719826"},
{Sector:"Technology",Group:"Tencent",Company:"Tencent",Investor:"Tencent AI Lab",UUID:"9bfd896137b34f87888ce99895f58456"},
{Sector:"Technology",Group:"Tencent",Company:"Tencent",Investor:"Shenzhen Tencent Computer Systems Company Limited",UUID:"603ba3d2cb94a954f56039e97ad5083c"},
{Sector:"Technology",Group:"Xiaomi",Company:"Xiaomi",Investor:"Xiaomi",UUID:"1ac252063b8ab4a648b35df4b671e586"},
{Sector:"Technology",Group:"Xiaomi",Company:"Xiaomi",Investor:"Xiaomi Ventures",UUID:"94df65d648b34aeda07d89b0b9eefee8"},
{Sector:"Technology",Group:"Amazon",Company:"Amazon",Investor:"Amazon",UUID:"05554f656aa94dd162718ce2d60f10c4"},
{Sector:"Technology",Group:"Amazon",Company:"Amazon",Investor:"Amazon Web Services",UUID:"bd23a50d2ae3be332a35383ea9ed13fd"},
{Sector:"Technology",Group:"Microsoft",Company:"Microsoft",Investor:"Microsoft",UUID:"fd80725f53fc70099878aeecf1e9ffbb"},
{Sector:"Technology",Group:"Intel",Company:"Intel",Investor:"Intel",UUID:"1e4f199c363b451ba164f94571075ee5"},
{Sector:"Technology",Group:"Intel",Company:"Intel",Investor:"Intel Capital",UUID:"f3716725552db9b559adde4ec64b1751"},
{Sector:"Technology",Group:"Google",Company:"Google",Investor:"Google",UUID:"6acfa7da1dbd936ed985cf07a1b27711"},
{Sector:"Technology",Group:"Google",Company:"Google",Investor:"Google Assistant Investments",UUID:"783b321986bd4ef183d888bc130e24f2"},
{Sector:"Technology",Group:"Google",Company:"Google",Investor:"Alphabet",UUID:"096694c6bcd2a975b95cfab77c81d915"},
{Sector:"Technology",Group:"Google",Company:"Google",Investor:"Waymo",UUID:"c1833ca685d5e3b808e58fcceb76717b"},
{Sector:"Technology",Group:"Bosch",Company:"Bosch",Investor:"Bosch",UUID:"dcf152a123fc6a0e9a7668c3fc2ec472"},
{Sector:"Technology",Group:"Bosch",Company:"Bosch",Investor:"Bosch SoftTec",UUID:"ccbeec7c29e8feb7c014e6f7f63ac972"},
{Sector:"Technology",Group:"Bosch",Company:"Bosch",Investor:"Bosch Automotive Service Solutions",UUID:"88289b6675924d40bc9a4ac8e8e2961d"},
{Sector:"Technology",Group:"Bosch",Company:"Bosch",Investor:"Robert Bosch Venture Capital",UUID:"866d8084e70a75358603f5723d11736e"},
{Sector:"Technology",Group:"Hitachi",Company:"Hitachi",Investor:"Hitachi",UUID:"0c4a1fcb97f49b8b35e68b4425c50b7a"},
{Sector:"Technology",Group:"Nvidia",Company:"Nvidia",Investor:"Nvidia",UUID:"ee17319ef5ee9c9a6500edf82b4fbf05"},
{Sector:"Technology",Group:"Nvidia",Company:"Nvidia",Investor:"Nvidia GPU Ventures",UUID:"94abec53470829f9410983ffcedd2a31"},
{Sector:"Technology",Group:"Aptiv",Company:"Aptiv",Investor:"Aptiv",UUID:"4a7ae51246ea42c28cbbb6b25b2b11c5"},
{Sector:"Technology",Group:"Continental",Company:"Continental",Investor:"Continental",UUID:"f82127e63f7d1ed04906a61daf4135b0"},
{Sector:"Technology",Group:"Continental",Company:"Continental",Investor:"Continental Corporation",UUID:"e41b4ead7ad624ccadff754f1272f6f4"},
{Sector:"Technology",Group:"Continental",Company:"Continental",Investor:"Continental Tire",UUID:"ffeda93f9f4d964c7ff246484825d018"},
{Sector:"Technology",Group:"Valeo ",Company:"Valeo ",Investor:"Valeo",UUID:"b8f83b16a8928c024221dcb7862b6e2c"},
{Sector:"Technology",Group:"Valeo ",Company:"Valeo ",Investor:"Valeo Siemens eAutomotive",UUID:"16460dd0a6154e4f8abea6a720f5b349"},
{Sector:"Technology",Group:"Valeo ",Company:"Valeo ",Investor:"Valeo Group",UUID:"a9377eecaafacd53339173ae8121bb66"},
{Sector:"Technology",Group:"Faurecia",Company:"Faurecia",Investor:"Faurecia",UUID:"55c2d41d9ddcb9ab978ed86cca6f0c47"},
{Sector:"Technology",Group:"LG",Company:"LG",Investor:"LG",UUID:"17f849175568f1e2508a44c37b8070c8"},
{Sector:"Technology",Group:"CATL",Company:"CATL",Investor:"Contemporary Amperex Technology",UUID:"d04bc1442b384132b65709c55b2e97d8"},
{Sector:"Technology",Group:"BAIC",Company:"BAIC",Investor:"BAIC Group",UUID:"4bb45afb34cd9a713a4d3a361f9a7660"},
{Sector:"Technology",Group:"BAIC",Company:"BAIC",Investor:"BAIC BJEV",UUID:"e50e8a77b017b04fed2aa5383714e67c"},
{Sector:"Technology",Group:"BAIC",Company:"BAIC",Investor:"BAIC Motor",UUID:"dac217e44545db54f780a8d12bc0eef4"},
{Sector:"Technology",Group:"Panasonic",Company:"Panasonic",Investor:"Panasonic",UUID:"824fd405fe30fb47a4626d0e056c3d1d"},
{Sector:"Technology",Group:"Panasonic",Company:"Panasonic",Investor:"Panasonic Automotive",UUID:"bcf9a888b96a5bf8e5a1c16f20ccce64"},
{Sector:"Technology",Group:"Panasonic",Company:"Panasonic",Investor:"Panasonic Ventures",UUID:"27aacf7f4692e0ddf5ee5630278a0b42"},
{Sector:"Technology",Group:"Careem",Company:"Careem",Investor:"Careem",UUID:"8044fef371078de49564ab7ecf80eae4"},
{Sector:"Technology",Group:"Uber",Company:"Uber",Investor:"Uber",UUID:"1eb371093b9301a9177ffee2cb1bfcdc"},
{Sector:"Technology",Group:"Lyft ",Company:"Lyft ",Investor:"Lyft",UUID:"33a97e70f137e90f8d68950a043ee09f"},
{Sector:"Technology",Group:"Grab",Company:"Grab",Investor:"Grab",UUID:"a76824768a83dbcf73dc41a841ef850e"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank",UUID:"1a4103983a72588299b86318cf594850"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Capital",UUID:"ec26a756d387a455c6fc90fe11ece02c"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"Softbank Ventures Asia",UUID:"4710cdd6d89239adc10afe217e5cb7ca"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Robotics Europe",UUID:"cb14755a0091475589652e0a6928be8e"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Vision Fund",UUID:"3a1f2e3a9a6243f992615b58190532ce"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Robotics Holdings",UUID:"e1d576736a6014bc7214b0d9719c417d"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Mobile",UUID:"eff0f5ede56ae33e7c854fab24235fb7"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"Softbank Commerce Corp",UUID:"53de7d25ac6185fca8cd91fabd1a8eac"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Telecom Corp",UUID:"0ce0f4eb35149d152d64291cb3171fb0"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"Softbank China & India Holdings",UUID:"726402cd0a8e280da87dee7b339085eb"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Payment Service Corp.",UUID:"5a2f05f5d67cda4080bce6d443c97b3a"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SOFTBANK Latin America Ventures",UUID:"ddcf8e305c10b6f2a62befc33e26fea8"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank BB Corp",UUID:"d6718551778f02d2c5ceb864e36ece04"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"Softbank UK Ventures",UUID:"d9e08d1bae5073f6a3a39f7679815c16"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"SoftBank Robotics America",UUID:"5ad359c1d49f4003ae6fcf4d49c8a5c4"},
{Sector:"Technology",Group:"Softbank",Company:"Softbank",Investor:"Softbank-Indosat Fund",UUID:"577c769e4d6d0f4356722a55f1f34e1c"}
      ];
      getInvestmentsAcquisitionsByCompanies(CompaniesList, table);
      insertPartnerships(table);
      insertSubsidiaries(table);
      doneCallback();
    }

    if (table.tableInfo.id == "Categories") {
      var CategoriesList = [
        {CompanyNameJOIN:"Carbon",SubCategory:"3D Printing",Category:"Others"},
        {CompanyNameJOIN:"Desktop Metal",SubCategory:"3D Printing",Category:"Others"},
        {CompanyNameJOIN:"Markforged",SubCategory:"3D Printing",Category:"Others"},
        {CompanyNameJOIN:"3D Media",SubCategory:"3D technology",Category:"Others"},
        {CompanyNameJOIN:"Zebra Imaging",SubCategory:"3D technology",Category:"Others"},
        {CompanyNameJOIN:"Mitsubishi Electric Klimat Transportation Systems S.p.A",SubCategory:"AC",Category:"Others"},
        {CompanyNameJOIN:"Revl",SubCategory:"Action Cam",Category:"Others"},
        {CompanyNameJOIN:"Apex.AI",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Aptiv",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Argo AI",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Aurora",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Baidu",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Cruise",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"DaimlerADS",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Embotech",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"HuaweiADS",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"LG",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Microsoft ADS",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"NASA",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"nuTonomy",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Rivian Automotive",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"TomTomADS",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Waymo",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Wind River",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"YandexADS",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Zenuity",SubCategory:"AD Software",Category:"Autonomous"},
        {CompanyNameJOIN:"Mcity",SubCategory:"AD Test simulator",Category:"Autonomous"},
        {CompanyNameJOIN:"Parallel Domain",SubCategory:"AD Test simulator",Category:"Autonomous"},
        {CompanyNameJOIN:"StradVision",SubCategory:"ADAS",Category:"Autonomous"},
        {CompanyNameJOIN:"StradVision, Inc",SubCategory:"ADAS",Category:"Autonomous"},
        {CompanyNameJOIN:"Valeo",SubCategory:"ADAS",Category:"Autonomous"},
        {CompanyNameJOIN:"Veoneer",SubCategory:"ADAS",Category:"Autonomous"},
        {CompanyNameJOIN:"Informative",SubCategory:"Advertising",Category:"Others"},
        {CompanyNameJOIN:"iRidge",SubCategory:"Advertising",Category:"Others"},
        {CompanyNameJOIN:"PontaMedia",SubCategory:"Advertising",Category:"Others"},
        {CompanyNameJOIN:"Cermaq",SubCategory:"Agriculture",Category:"Others"},
        {CompanyNameJOIN:"OLAM International",SubCategory:"Agriculture",Category:"Others"},
        {CompanyNameJOIN:"Seak",SubCategory:"Agriculture",Category:"Others"},
        {CompanyNameJOIN:"ABEJA",SubCategory:"AI",Category:"Autonomous"},
        {CompanyNameJOIN:"Allegro.AI",SubCategory:"AI",Category:"Others"},
        {CompanyNameJOIN:"AOS Mobile",SubCategory:"AI",Category:"Others"},
        {CompanyNameJOIN:"AutoAI",SubCategory:"AI",Category:"Autonomous"},
        {CompanyNameJOIN:"Geometric Intelligence",SubCategory:"AI",Category:"Autonomous"},
        {CompanyNameJOIN:"Mighty AI",SubCategory:"AI",Category:"Autonomous"},
        {CompanyNameJOIN:"Nauto",SubCategory:"AI",Category:"Autonomous"},
        {CompanyNameJOIN:"Preferred Networks",SubCategory:"AI",Category:"Connected"},
        {CompanyNameJOIN:"Prophesee",SubCategory:"AI",Category:"Autonomous"},
        {CompanyNameJOIN:"Recogni",SubCategory:"AI",Category:"Electrification"},
        {CompanyNameJOIN:"WeRide.ai",SubCategory:"AI",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Graphcore",SubCategory:"AI components",Category:"Others"},
        {CompanyNameJOIN:"MakinaRocks",SubCategory:"AI Manufacturing",Category:"Others"},
        {CompanyNameJOIN:"Terrafugia",SubCategory:"Air Mobility",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Volocopter",SubCategory:"Air Mobility",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Waypoint Leasing Services",SubCategory:"Air Mobility",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"DataChassi DC AB",SubCategory:"Alarm",Category:"Others"},
        {CompanyNameJOIN:"Blue Vision Labs",SubCategory:"AR",Category:"Connected"},
        {CompanyNameJOIN:"Solve MIT",SubCategory:"Association",Category:"Others"},
        {CompanyNameJOIN:"United States Artists",SubCategory:"Association",Category:"Others"},
        {CompanyNameJOIN:"ASTES4",SubCategory:"Automation",Category:"Others"},
        {CompanyNameJOIN:"DeepMap",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Lunewave",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"May Mobility",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Metawave Corporation",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Momenta",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Otto",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Perceptive Automata",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Percepto",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Starship Technologies",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Uber Advanced Technologies Group",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Via",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
        {CompanyNameJOIN:"Aimotive",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"ARM",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Autoliv",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"BoschAE",SubCategory:"Autonomy enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Continental",SubCategory:"Autonomy enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Delphi",SubCategory:"Autonomy enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"DeNA",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Denso",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"IBM",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Intel",SubCategory:"Autonomy enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Luminar",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Magna",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Mobileye",SubCategory:"Autonomy enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Nvidia",SubCategory:"Autonomy enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"QualcommAE",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Samsung",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Velodyne LiDAR",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"Walmart",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"ZF Friedrichshafen",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
        {CompanyNameJOIN:"CATL",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"Enevate",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"Envia Systems",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"Ionic Materials",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"JLR",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"LG Chem",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"Panasonic",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"Samsung SDI",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"Sila Nanotechnologies",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"SolidEnergy Systems",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"StoreDot",SubCategory:"Batteries",Category:"Electrification"},
        {CompanyNameJOIN:"GaN Systems",SubCategory:"Battery technology",Category:"Electrification"},
        {CompanyNameJOIN:"Li-Tec Battery",SubCategory:"Battery technology",Category:"Electrification"},
        {CompanyNameJOIN:"Sakti3",SubCategory:"Battery technology",Category:"Electrification"},
        {CompanyNameJOIN:"Solid Power",SubCategory:"Battery technology",Category:"Electrification"},
        {CompanyNameJOIN:"CARFIT",SubCategory:"Big Data",Category:"Connected"},
        {CompanyNameJOIN:"DataScore",SubCategory:"Big Data",Category:"Others"},
        {CompanyNameJOIN:"Nubimetrics",SubCategory:"Big Data",Category:"Connected"},
        {CompanyNameJOIN:"Swiftly",SubCategory:"Big Data",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"VAYAVISION",SubCategory:"Big Data",Category:"Autonomous"},
        {CompanyNameJOIN:"Wejo",SubCategory:"Big Data",Category:"Connected"},
        {CompanyNameJOIN:"Bluegogo",SubCategory:"Bike-Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"JUMP Bikes",SubCategory:"Bike-Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Motivate",SubCategory:"Bike-Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"ofo",SubCategory:"Bike-Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Bus.com",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"FlixBus",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"FlixMobility",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Rally",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Cleenup",SubCategory:"Car Cleening",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Flexitech Holding",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Fonderie Aluminium Cleon",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Livio Radio",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Manthey-Racing",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Medcom Sp. z o.o.",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"MELCO Hydronics & IT Cooling S.p.A.",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"NEO RETRO",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"REE",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Reliance Motor Car Company",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Riviera Tool LLC",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"Setsuyo Astec Corp.",SubCategory:"Car components",Category:"Others"},
        {CompanyNameJOIN:"SoundHound Inc.",SubCategory:"Car Control",Category:"Connected"},
        {CompanyNameJOIN:"MDGo",SubCategory:"Car Data",Category:"Connected"},
        {CompanyNameJOIN:"AT&T",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"Deepglint",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"HuaweiCEC",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"Otonomo",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"QualcommCEC",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"Siemens",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"Vodafone",SubCategory:"Car External Connections",Category:"Connected"},
        {CompanyNameJOIN:"Blacklane",SubCategory:"Car Hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Summon",SubCategory:"Car Hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Fair",SubCategory:"Car Leasing",Category:"Others"},
        {CompanyNameJOIN:"Xchange Leasing",SubCategory:"Car Leasing",Category:"Others"},
        {CompanyNameJOIN:"Automobile Craiova",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Bright Automotive",SubCategory:"Car Manufacturer",Category:"Electrification"},
        {CompanyNameJOIN:"Grohmann Engineering",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Hans Glas",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Hino Ottawa-Gatineau",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Lincoln Motor Company",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Manganese Bronze Holdings PLC",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Mazda Motor Corp.",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"PROTON Holdings",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Rapid Motor Vehicle Company",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Shenyang Brilliance JinBei Automobile",SubCategory:"Car Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"CARIZY",SubCategory:"Car Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Caroobi",SubCategory:"Car Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Carventura",SubCategory:"Car Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Carwow",SubCategory:"Car Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Checkars",SubCategory:"Car Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Shift",SubCategory:"Car Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Koolicar",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Skurt",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Yestock",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"ZoomCar",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Renault Mobility",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Gadauto",SubCategory:"Car retailer",Category:"Others"},
        {CompanyNameJOIN:"99",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Car Next Door",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Careem",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"carpooling.com",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"DaimlerCS",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"DriveNow GmbH & Co. KG",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"eMov",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Free2Move Paris",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Getaround",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Respiro",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Revv",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"ShareNow",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Silvercar",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"TravelCar",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Turo",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"WeShare",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Share Now",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Free2Move Paris",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"eMov",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"WeShare",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Moov'In Paris",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"feezu.cn",SubCategory:"Car Sharing Solution",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Chargemaster",SubCategory:"Charging Solution",Category:"Electrification"},
        {CompanyNameJOIN:"Hubject",SubCategory:"Charging Solution",Category:"Electrification"},
        {CompanyNameJOIN:"Momentum Dynamics Corp",SubCategory:"Charging Solution",Category:"Electrification"},
        {CompanyNameJOIN:"Nuvve",SubCategory:"Charging Solution",Category:"Electrification"},
        {CompanyNameJOIN:"PowerShare",SubCategory:"Charging Solution",Category:"Electrification"},
        {CompanyNameJOIN:"AmazonCS",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"ChargePoint",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Enel",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Engie",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"EVgo",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Ionity",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Kaufland",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Lidl",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"ubitricity",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Ionity",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"Charge Now",SubCategory:"Charging Station",Category:"Electrification"},
        {CompanyNameJOIN:"FreeWire Technologies",SubCategory:"Charging Technology",Category:"Electrification"},
        {CompanyNameJOIN:"Jedlix",SubCategory:"Charging Technology",Category:"Electrification"},
        {CompanyNameJOIN:"I-Tech",SubCategory:"Chemical",Category:"Others"},
        {CompanyNameJOIN:"Zum",SubCategory:"Child Transportation",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Yoshi",SubCategory:"Cleaning and gas services",Category:"Connected"},
        {CompanyNameJOIN:"CloudCar",SubCategory:"Cloud",Category:"Connected"},
        {CompanyNameJOIN:"Encryptix",SubCategory:"Cloud",Category:"Others"},
        {CompanyNameJOIN:"Microsoft",SubCategory:"Cloud/Data Platforms",Category:"Others"},
        {CompanyNameJOIN:"RenRenChe",SubCategory:"commerce",Category:"Others"},
        {CompanyNameJOIN:"iBiquity Digital Corporation",SubCategory:"Connectivity",Category:"Connected"},
        {CompanyNameJOIN:"Peloton Technology",SubCategory:"Connectivity",Category:"Connected"},
        {CompanyNameJOIN:"Telcontar",SubCategory:"Connectivity",Category:"Connected"},
        {CompanyNameJOIN:"AtomicTangerine",SubCategory:"Consulting",Category:"Others"},
        {CompanyNameJOIN:"bitFlyer",SubCategory:"Crypto-currency",Category:"Others"},
        {CompanyNameJOIN:"Chainalysis",SubCategory:"Crypto-currency",Category:"Others"},
        {CompanyNameJOIN:"Coinbase",SubCategory:"Crypto-currency",Category:"Others"},
        {CompanyNameJOIN:"SMARTCAMP Co.,Ltd.",SubCategory:"Crypto-currency",Category:"Connected"},
        {CompanyNameJOIN:"Capy Inc.",SubCategory:"Cybersecurity",Category:"Connected"},
        {CompanyNameJOIN:"Claroty",SubCategory:"Cybersecurity",Category:"Others"},
        {CompanyNameJOIN:"Skybox Security",SubCategory:"Cybersecurity",Category:"Connected"},
        {CompanyNameJOIN:"Trillium Secure",SubCategory:"Cybersecurity",Category:"Connected"},
        {CompanyNameJOIN:"Yellowbrick Data",SubCategory:"Data Management",Category:"Others"},
        {CompanyNameJOIN:"Matternet",SubCategory:"Delivery",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Sidecar Technologies",SubCategory:"Delivery",Category:"Others"},
        {CompanyNameJOIN:"tiramizoo",SubCategory:"Delivery",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"MyCityWay",SubCategory:"Digital Platform",Category:"Others"},
        {CompanyNameJOIN:"Hive",SubCategory:"e scooter",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"AutoGravity",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"BeXcom Korea",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"carClub",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"eBags.com",SubCategory:"e-commerce",Category:"Connected"},
        {CompanyNameJOIN:"e-LogiT",SubCategory:"e-commerce",Category:"Connected"},
        {CompanyNameJOIN:"Gaudena",SubCategory:"e-commerce",Category:"Connected"},
        {CompanyNameJOIN:"HDS Global",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"Heycar",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"Kudo",SubCategory:"e-commerce",Category:"Connected"},
        {CompanyNameJOIN:"Mister Auto",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"Ogwugo",SubCategory:"e-commerce",Category:"Connected"},
        {CompanyNameJOIN:"Tantau Software",SubCategory:"e-commerce",Category:"Others"},
        {CompanyNameJOIN:"KnowledgeNet",SubCategory:"e-learning",Category:"Others"},
        {CompanyNameJOIN:"Vantage Power",SubCategory:"Electric Engine",Category:"Electrification"},
        {CompanyNameJOIN:"BAIC BJEV",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"BMW",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"Ford",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"Power Vehicle Innovation",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"Rimac",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"Tesla",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"Zhidou",SubCategory:"Electric Vehicles",Category:"Electrification"},
        {CompanyNameJOIN:"Kalray",SubCategory:"Electronics",Category:"Others"},
        {CompanyNameJOIN:"Prescient Markets",SubCategory:"Electronics",Category:"Others"},
        {CompanyNameJOIN:"TTTech",SubCategory:"Electronics",Category:"Connected"},
        {CompanyNameJOIN:"Xiaomi",SubCategory:"Electronics",Category:"Connected"},
        {CompanyNameJOIN:"Yeong Guan Energy",SubCategory:"Energy components",Category:"Electrification"},
        {CompanyNameJOIN:"Alphabet Energy",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Cape Wind",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Coskata",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Empower Energies Inc.",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Eurus Energy Holdings",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"KH-Automation Projects GmbH",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Mascoma",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Northvolt",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"OVO Energy",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Powerhive",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Renewable Energy Trust Capital",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"SolarCity",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Summit Power International Ltd.",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Sunlogics",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Terra-Gen Power",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Virent Energy Systems",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Zola Electric",SubCategory:"Energy Provider",Category:"Electrification"},
        {CompanyNameJOIN:"Maxwell Technologies",SubCategory:"Energy storage",Category:"Electrification"},
        {CompanyNameJOIN:"Moixa Technology",SubCategory:"Energy storage",Category:"Electrification"},
        {CompanyNameJOIN:"QuantumScape",SubCategory:"Energy storage",Category:"Electrification"},
        {CompanyNameJOIN:"Daihatsu",SubCategory:"Engine Manufacturer",Category:"Others"},
        {CompanyNameJOIN:"Adexa",SubCategory:"Enterprise software",Category:"Others"},
        {CompanyNameJOIN:"Annuncio Software",SubCategory:"Enterprise software",Category:"Others"},
        {CompanyNameJOIN:"Cascade Corporation",SubCategory:"Enterprise software",Category:"Others"},
        {CompanyNameJOIN:"EDS (Electronic Data Systems)",SubCategory:"Enterprise software",Category:"Others"},
        {CompanyNameJOIN:"eRoom Technology",SubCategory:"Enterprise Software",Category:"Others"},
        {CompanyNameJOIN:"Pivotal",SubCategory:"Enterprise Software",Category:"Others"},
        {CompanyNameJOIN:"Plumtree Software",SubCategory:"Enterprise Software",Category:"Others"},
        {CompanyNameJOIN:"Sansan",SubCategory:"Enterprise Software",Category:"Others"},
        {CompanyNameJOIN:"Aiming",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Astro Malaysia Holdings Berhad",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Audible",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Audioburst",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Brandtrack",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Disney",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Garmin",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Infolibria",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"JX PRESS",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Macro",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Prism Entertainment",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Rioport",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Spotify",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Tokyo Otaku Mode",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"TuneIn",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"Univision Communications",SubCategory:"Entertainment",Category:"Connected"},
        {CompanyNameJOIN:"19pay",SubCategory:"e-payment",Category:"Connected"},
        {CompanyNameJOIN:"Breeze",SubCategory:"e-payment",Category:"Connected"},
        {CompanyNameJOIN:"iKaaz",SubCategory:"e-payment",Category:"Connected"},
        {CompanyNameJOIN:"Kyash",SubCategory:"e-payment",Category:"Connected"},
        {CompanyNameJOIN:"Moca",SubCategory:"e-payment",Category:"Connected"},
        {CompanyNameJOIN:"Joby Aviation",SubCategory:"e-Plane",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Hive",SubCategory:"e scooter",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Immotor",SubCategory:"e scooter",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Shouqi Zhixing",SubCategory:"e scooter",Category:"Electrification"},
        {CompanyNameJOIN:"Proterra",SubCategory:"EV Bus",Category:"Electrification"},
        {CompanyNameJOIN:"NxtPhase",SubCategory:"EV Components",Category:"Electrification"},
        {CompanyNameJOIN:"Orocobre",SubCategory:"EV Components",Category:"Electrification"},
        {CompanyNameJOIN:"PowerCell Sweden",SubCategory:"EV Components",Category:"Electrification"},
        {CompanyNameJOIN:"Rimac Automobili",SubCategory:"EV Components",Category:"Electrification"},
        {CompanyNameJOIN:"TranSiC",SubCategory:"EV Components",Category:"Electrification"},
        {CompanyNameJOIN:"Emerald Automotive",SubCategory:"EV technology",Category:"Electrification"},
        {CompanyNameJOIN:"Ben & Frank",SubCategory:"Fashion",Category:"Others"},
        {CompanyNameJOIN:"Muse & Co",SubCategory:"Fashion",Category:"Others"},
        {CompanyNameJOIN:"sitateru",SubCategory:"Fashion",Category:"Others"},
        {CompanyNameJOIN:"Alpaca",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"AlpacaJapan",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"AmeriCredit",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"AutoFi",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Butterfield Fulcrum",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Cadre",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Capital Analytics",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Conekta",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Crowd Realty",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Engs Commercial Finance",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"freee",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Konfio",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Kyriba",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Kyriba Japan",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"MainVest",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Mobileum",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Money Forward",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Moneytree",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Nanotech Partners",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Nexu",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"R3",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Saxo Bank",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Security Bank Corporation",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Snapeee",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Softbank",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Spring Labs",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Symphony Communication Services",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Uzabase",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"VTXRM",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Wealthnavi",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"xenodata lab",SubCategory:"Financial Services",Category:"Others"},
        {CompanyNameJOIN:"Lytx",SubCategory:"Fleet Management",Category:"Others"},
        {CompanyNameJOIN:"STRATIM Systems",SubCategory:"Fleet Management",Category:"Others"},
        {CompanyNameJOIN:"Zonar",SubCategory:"Fleet Management",Category:"Connected"},
        {CompanyNameJOIN:"Mobile Go",SubCategory:"Food services",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Illuminate Labs",SubCategory:"Gaming",Category:"Connected"},
        {CompanyNameJOIN:"Cargomatic",SubCategory:"Geolocalisation",Category:"Connected"},
        {CompanyNameJOIN:"Cswitch",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"NetLogic Microsystems",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"Pixim",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"Quake Technologies",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"SiRF Technology",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"Teknovus",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"TeraLogic",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"TRINAMIC Motion Control",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"Vaprema",SubCategory:"Hardware",Category:"Others"},
        {CompanyNameJOIN:"Ambee (1st Consult Technologies)",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Anaeropharma Science",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Anthera Pharmaceuticals",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Ardana Bioscience",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"BeneStream",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"BioMimetic Therapeutics",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Cara Therapeutics",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Cardiac Dimensions",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Chordia Therapeutics",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Cohesive Technologies",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"CureApp",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"CyberHeart",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"DiscGenics",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Embodied, Inc.",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"HoloEyes",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Humanigen",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"iPierian",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"MICIN Inc.",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Modulated Imaging",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Nema Labs",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"NeurogesX",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"OmniSonics Medical Technologies",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Panacea Pharmaceuticals",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Peninsula Pharmaceuticals",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Port Medical",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Promethera Biosciences",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Quantum Biosystems",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Raven Biotechnologies",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"REGiMMUNE Corporation",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Serenex",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Seven Seas Technologies Group",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Sonexa Therapeutics",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Tragara",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Zipline",SubCategory:"Health services",Category:"Others"},
        {CompanyNameJOIN:"Hap2U",SubCategory:"HMI",Category:"Connected"},
        {CompanyNameJOIN:"ZRRO",SubCategory:"HMI",Category:"Connected"},
        {CompanyNameJOIN:"OYO",SubCategory:"Hotel",Category:"Others"},
        {CompanyNameJOIN:"H2scan",SubCategory:"Hydrogen technlogy",Category:"Electrification"},
        {CompanyNameJOIN:"Hydrogenious Technologies",SubCategory:"Hydrogen technlogy",Category:"Electrification"},
        {CompanyNameJOIN:"Tula Technology",SubCategory:"ICE Technology",Category:"Electrification"},
        {CompanyNameJOIN:"D-ID",SubCategory:"ID management",Category:"Connected"},
        {CompanyNameJOIN:"Delta ID",SubCategory:"ID management",Category:"Connected"},
        {CompanyNameJOIN:"Keyfactor",SubCategory:"ID management",Category:"Connected"},
        {CompanyNameJOIN:"Omada",SubCategory:"ID management",Category:"Connected"},
        {CompanyNameJOIN:"BioAmber",SubCategory:"Industry",Category:"Others"},
        {CompanyNameJOIN:"AvantGo",SubCategory:"Internet",Category:"Connected"},
        {CompanyNameJOIN:"Forciot",SubCategory:"IOT",Category:"Others"},
        {CompanyNameJOIN:"Kii Corporation",SubCategory:"IOT",Category:"Connected"},
        {CompanyNameJOIN:"VeriSign",SubCategory:"IT",Category:"Others"},
        {CompanyNameJOIN:"Agility Communications",SubCategory:"Laser",Category:"Autonomous"},
        {CompanyNameJOIN:"Boxbot",SubCategory:"Last mile delivery",Category:"Autonomous"},
        {CompanyNameJOIN:"Liftit",SubCategory:"Last mile delivery",Category:"Others"},
        {CompanyNameJOIN:"Ninja Van",SubCategory:"Last mile delivery",Category:"Connected"},
        {CompanyNameJOIN:"mana.bo Inc.",SubCategory:"learning platform",Category:"Others"},
        {CompanyNameJOIN:"RareJob Inc.",SubCategory:"learning platform",Category:"Others"},
        {CompanyNameJOIN:"Blackmore Sensors and Analytics",SubCategory:"Lidar solution",Category:"Autonomous"},
        {CompanyNameJOIN:"GeoDigital",SubCategory:"Lidar solution",Category:"Autonomous"},
        {CompanyNameJOIN:"Strobe",SubCategory:"Lidar solution",Category:"Autonomous"},
        {CompanyNameJOIN:"Mesh Korea",SubCategory:"Logistic",Category:"Others"},
        {CompanyNameJOIN:"Beat",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Free2Move",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Journey Holding Corporation",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Kuaidi Dache",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Migo",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"mobilityX",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Ola",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"PTV Group",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Ridecell",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Rover",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Splyt",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"The Mobility House",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Transit",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Vulog",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Free2Move",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Reach Now",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Algolux",SubCategory:"Machine learning",Category:"Autonomous"},
        {CompanyNameJOIN:"Maluuba",SubCategory:"Machine learning",Category:"Others"},
        {CompanyNameJOIN:"PointGrab",SubCategory:"Machine learning",Category:"Connected"},
        {CompanyNameJOIN:"SAIPS",SubCategory:"Machine learning",Category:"Others"},
        {CompanyNameJOIN:"Tekion",SubCategory:"Machine learning",Category:"Others"},
        {CompanyNameJOIN:"FA Tech Co Ltd.",SubCategory:"Machinery Manufacturing",Category:"Others"},
        {CompanyNameJOIN:"Kinestral Technologies",SubCategory:"Manufacturing Solution",Category:"Others"},
        {CompanyNameJOIN:"Perbix",SubCategory:"Manufacturing Solution",Category:"Others"},
        {CompanyNameJOIN:"TVS Logistics Services",SubCategory:"Manufacturing Solution",Category:"Others"},
        {CompanyNameJOIN:"Vincotech Holdings S.a.r.l.",SubCategory:"Manufacturing Solution",Category:"Others"},
        {CompanyNameJOIN:"Xometry",SubCategory:"Manufacturing Solution",Category:"Others"},
        {CompanyNameJOIN:"Lizardtech",SubCategory:"Map",Category:"Autonomous"},
        {CompanyNameJOIN:"Mapillary",SubCategory:"Map",Category:"Connected"},
        {CompanyNameJOIN:"Autobiz.fr",SubCategory:"Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Autobutler",SubCategory:"Marketplace",Category:"Others"},
        {CompanyNameJOIN:"AutoSpot",SubCategory:"Marketplace",Category:"Others"},
        {CompanyNameJOIN:"BarterTrust.com",SubCategory:"Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Droom Technology",SubCategory:"Marketplace",Category:"Others"},
        {CompanyNameJOIN:"Powerex",SubCategory:"Marketplace",Category:"Electrification"},
        {CompanyNameJOIN:"Ritase",SubCategory:"Marketplace",Category:"Others"},
        {CompanyNameJOIN:"ticketstreet",SubCategory:"Marketplace",Category:"Connected"},
        {CompanyNameJOIN:"Whyteboard",SubCategory:"Material",Category:"Connected"},
        {CompanyNameJOIN:"Sirrus",SubCategory:"Material",Category:"Others"},
        {CompanyNameJOIN:"The Markup",SubCategory:"Media",Category:"Others"},
        {CompanyNameJOIN:"Bolt",SubCategory:"Micro Mobility",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Flinc",SubCategory:"Micro Mobility",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"AdInnovation",SubCategory:"Mobile ads",Category:"Others"},
        {CompanyNameJOIN:"Air2Web",SubCategory:"Mobile Application",Category:"Connected"},
        {CompanyNameJOIN:"Complex Polygon",SubCategory:"Mobile Application",Category:"Connected"},
        {CompanyNameJOIN:"Life360",SubCategory:"Mobile Application",Category:"Connected"},
        {CompanyNameJOIN:"Sunhill Technologies",SubCategory:"Mobile Application",Category:"Connected"},
        {CompanyNameJOIN:"GOJEK",SubCategory:"Mobility Provider",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Lime",SubCategory:"Mobility Provider",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"A8 Digital Music",SubCategory:"Music platform",Category:"Connected"},
        {CompanyNameJOIN:"NanoSteel",SubCategory:"Nano Technology",Category:"Others"},
        {CompanyNameJOIN:"Platypus Technology",SubCategory:"Nano Technology",Category:"Others"},
        {CompanyNameJOIN:"SDC Materials,Inc.",SubCategory:"Nano Technology",Category:"Others"},
        {CompanyNameJOIN:"Civil Maps",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"deCarta",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"HERE Technologies",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"Telogis",SubCategory:"Navigation",Category:"Others"},
        {CompanyNameJOIN:"Tomtom",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"TransLoc",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"Ushr",SubCategory:"Navigation",Category:"Autonomous"},
        {CompanyNameJOIN:"what3words",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"YandexN",SubCategory:"Navigation",Category:"Connected"},
        {CompanyNameJOIN:"BoostWorks",SubCategory:"Network Technology",Category:"Connected"},
        {CompanyNameJOIN:"Entuity",SubCategory:"Network Technology",Category:"Connected"},
        {CompanyNameJOIN:"NxtWave Communications",SubCategory:"Network Technology",Category:"Connected"},
        {CompanyNameJOIN:"RidePal",SubCategory:"Network Technology",Category:"Connected"},
        {CompanyNameJOIN:"Silicon Wave",SubCategory:"Network Technology",Category:"Connected"},
        {CompanyNameJOIN:"Spare",SubCategory:"Network Technology",Category:"Autonomous"},
        {CompanyNameJOIN:"UDcast",SubCategory:"Network Technology",Category:"Connected"},
        {CompanyNameJOIN:"Adero",SubCategory:"Object location",Category:"Connected"},
        {CompanyNameJOIN:"BYD",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Cadillac",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Daimler",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Fiat Chrysler Automobiles",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"GM Financial",SubCategory:"OEM",Category:"others"},
        {CompanyNameJOIN:"Jaguar",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Kia Motors",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Lotus Cars",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Mitsubishi Motors",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Opel Group",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Opel Special Vehicles",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Porsche",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Volvo Cars Group",SubCategory:"OEM",Category:"Others"},
        {CompanyNameJOIN:"Accelight Networks",SubCategory:"Optical system",Category:"Others"},
        {CompanyNameJOIN:"Chargetrip",SubCategory:"Others",Category:"Electrification"},
        {CompanyNameJOIN:"Scoop Technologies",SubCategory:"P2P Carpooling",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"AppyParking",SubCategory:"Parking",Category:"Connected"},
        {CompanyNameJOIN:"GottaPark",SubCategory:"Parking",Category:"Connected"},
        {CompanyNameJOIN:"JustPark",SubCategory:"Parking",Category:"Connected"},
        {CompanyNameJOIN:"ParkTAG",SubCategory:"Parking",Category:"Connected"},
        {CompanyNameJOIN:"PayByPhone Technologies",SubCategory:"Parking",Category:"Connected"},
        {CompanyNameJOIN:"Park Now",SubCategory:"Parking",Category:"Connected"},
        {CompanyNameJOIN:"Coord",SubCategory:"Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Catalytic Solutions",SubCategory:"Pollution Technology",Category:"Others"},
        {CompanyNameJOIN:"Seurat Technologies",SubCategory:"Printing Solution",Category:"Others"},
        {CompanyNameJOIN:"Embark",SubCategory:"Public Transportation app",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Airbus",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"CINQS",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Didi Chuxing",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Grab",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Intelligent Apps",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Intelligent Apps (mytaxi)",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"JapanTaxi",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Lyft",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"macaron TAXI (KST Intelligence)",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Uber",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Uber China",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Marcel",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Free Now",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Caocao Chuxing",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Caocao Zhuanche",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"flinc GmbH",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Gett",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Hitch",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Taxify",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Validated",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"LUXI Co. Ltd.",SubCategory:"Ride-Sharing Platform",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Elementary Robotics",SubCategory:"Robot",Category:"Others"},
        {CompanyNameJOIN:"Freedom Robotics",SubCategory:"Robotics",Category:"Others"},
        {CompanyNameJOIN:"Intuition Robotics",SubCategory:"Robotics",Category:"Others"},
        {CompanyNameJOIN:"LifeRobotics",SubCategory:"Robotics",Category:"Others"},
        {CompanyNameJOIN:"Messung Group",SubCategory:"Robotics",Category:"Others"},
        {CompanyNameJOIN:"Quantum Signal",SubCategory:"Robotics",Category:"Others"},
        {CompanyNameJOIN:"Spin",SubCategory:"Scooter Sharing",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Cambrios Technologies",SubCategory:"Screen technology",Category:"Others"},
        {CompanyNameJOIN:"Aryballe Technologies",SubCategory:"Sensors",Category:"Autonomous"},
        {CompanyNameJOIN:"Metawave",SubCategory:"Sensors",Category:"Autonomous"},
        {CompanyNameJOIN:"Zendrive",SubCategory:"Sensors",Category:"Connected"},
        {CompanyNameJOIN:"Alibaba",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"AmazonS",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Anagog",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Autonomic",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Bosch",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Carventura SAS",SubCategory:"Services",Category:"Others"},
        {CompanyNameJOIN:"Cherry",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"CINTEO GmbH",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Dominos",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"EXest",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"FinitePaths Inc.",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Garantibil",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Google",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"HuaweiS",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"INRIX",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"ParkMobile",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Parkmobile Group Europe",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Pizza Hut",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Shell",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Spring",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Tencent",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"WayRay",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Xevo",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Zolvers",SubCategory:"Services",Category:"Connected"},
        {CompanyNameJOIN:"Urgent.ly Roadside Assistance",SubCategory:"Services platform",Category:"Connected"},
        {CompanyNameJOIN:"Kamcord",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Leo",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Miles",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Mind Palette",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Oceans Inc.",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Retty",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Rever",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Swipe Labs",SubCategory:"Social Plateform",Category:"Connected"},
        {CompanyNameJOIN:"Antrim Design Systems",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Black Girls CODE",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Campus Pipeline",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Girls Who Code",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Ignite Sports Media",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"JIMU Intelligent",SubCategory:"Software",Category:"Autonomous"},
        {CompanyNameJOIN:"JTOWER Inc.",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"LoiLo",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"MakeMusic, Inc.",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"MapAnything",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"ObjectVideo",SubCategory:"Software",Category:"Connected"},
        {CompanyNameJOIN:"Open Harbor",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"OpenSynergy",SubCategory:"Software",Category:"Connected"},
        {CompanyNameJOIN:"Producteca",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"proteanTecs",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Realtime Robotics",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Sequence Design",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Sital Technology",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"TradeBeam",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"TradeCard",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"Vontu",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"YesGraph",SubCategory:"Software",Category:"Others"},
        {CompanyNameJOIN:"CETITEC",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"Challenge Media Group",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"ICONICS",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"Monstar Lab",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"Plaid inc",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"Pulsar Technology",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"Sylpheo",SubCategory:"Software development",Category:"Others"},
        {CompanyNameJOIN:"Kinzan.com",SubCategory:"Software Enterprise",Category:"Others"},
        {CompanyNameJOIN:"Swit",SubCategory:"Software Enterprise",Category:"Others"},
        {CompanyNameJOIN:"UVeye",SubCategory:"Software Enterprise",Category:"Others"},
        {CompanyNameJOIN:"MineSense Technologies",SubCategory:"Softwaring",Category:"Others"},
        {CompanyNameJOIN:"Devialet",SubCategory:"Sounds",Category:"Connected"},
        {CompanyNameJOIN:"DSP Concepts",SubCategory:"Sounds sensor",Category:"Autonomous"},
        {CompanyNameJOIN:"Akoustic Arts",SubCategory:"Sounds Technology",Category:"Connected"},
        {CompanyNameJOIN:"Data Enlighten",SubCategory:"Space Travel",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"iSpace China",SubCategory:"Space Travel",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"SLAMcore",SubCategory:"Spatial AI",Category:"Others"},
        {CompanyNameJOIN:"Brigad",SubCategory:"Staffing Agency",Category:"Others"},
        {CompanyNameJOIN:"Broadlane",SubCategory:"Supply Chain",Category:"Others"},
        {CompanyNameJOIN:"Axiata",SubCategory:"Telecommunication",Category:"Connected"},
        {CompanyNameJOIN:"China Unicom",SubCategory:"Telecommunication",Category:"Others"},
        {CompanyNameJOIN:"Commerx Corp.",SubCategory:"Telecommunication",Category:"Connected"},
        {CompanyNameJOIN:"Hibernia Networks",SubCategory:"Telecommunication",Category:"Others"},
        {CompanyNameJOIN:"NeoPhotonics",SubCategory:"Telecommunication",Category:"Connected"},
        {CompanyNameJOIN:"Reliance Jio Infocomm Limited",SubCategory:"Telecommunication",Category:"Connected"},
        {CompanyNameJOIN:"Sonus Networks",SubCategory:"Telecommunication",Category:"Connected"},
        {CompanyNameJOIN:"WirelessCar",SubCategory:"Telematics",Category:"Connected"},
        {CompanyNameJOIN:"Gengo",SubCategory:"Translator",Category:"Connected"},
        {CompanyNameJOIN:"Xtra, Inc.",SubCategory:"Translator",Category:"Others"},
        {CompanyNameJOIN:"LuxN",SubCategory:"Transportation info",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Moovit",SubCategory:"Transportation info",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Kamaz",SubCategory:"Trucks",Category:"Others"},
        {CompanyNameJOIN:"Navistar",SubCategory:"Trucks",Category:"Others"},
        {CompanyNameJOIN:"Scania",SubCategory:"Trucks",Category:"Others"},
        {CompanyNameJOIN:"Luxe",SubCategory:"Valet parking",Category:"Connected"},
        {CompanyNameJOIN:"Chariot",SubCategory:"Van Pooling",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Via Transportation, Inc.",SubCategory:"Van Pooling",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"WHILL",SubCategory:"VPA",Category:"Sharing/Subscription"},
        {CompanyNameJOIN:"Apollo Voice",SubCategory:"VPA",Category:"Connected"},
        {CompanyNameJOIN:"Apollo Voice Assistant",SubCategory:"VPA",Category:"Connected"},
        {CompanyNameJOIN:"Dejima",SubCategory:"VPA",Category:"Connected"},
        {CompanyNameJOIN:"Mobvoi",SubCategory:"VPA",Category:"Connected"},
        {CompanyNameJOIN:"Mycroft",SubCategory:"VPA",Category:"Connected"},
        {CompanyNameJOIN:"Varjo",SubCategory:"VR",Category:"Connected"},
        {CompanyNameJOIN:"STRIVR",SubCategory:"VR training",Category:"Others"},
        {CompanyNameJOIN:"ClimaCell",SubCategory:"Weather",Category:"Connected"},
        {CompanyNameJOIN:"Powermat Technologies",SubCategory:"Wireless Charging",Category:"Electrification"},
        {CompanyNameJOIN:"Aperto Networks",SubCategory:"Wireless Technology",Category:"Connected"},
        {CompanyNameJOIN:"ArrayComm",SubCategory:"Wireless Technology",Category:"Connected"},
        {CompanyNameJOIN:"Autotalks",SubCategory:"Wireless Technology",Category:"Connected"}
      ];
      var categoriesTableData = [];
      for (var i = 0, len = CategoriesList.length; i < len; i++) {
        categoriesTableData.push({
          "company_name_JOIN": CategoriesList[i].CompanyNameJOIN,
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
