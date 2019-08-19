(function() {

  /***************************************************************************************************/
  /**************************** PREPARATION CODE *****************************************************/
  /***************************************************************************************************/

  // Browse companies listed as parameter by UUID & Name and get all investments & acquisitions from CrunchBase APIs
  function getInvestmentsAcquisitionsByCompanies(p_companyList, p_table) {
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
                "funding_type": FinalFundingType,
                "money_raised": MoneyRaised,
                "announced_date": Announced_Date,
                "company_name_JOIN": FundedCompany,
                "target_company": FundedCompany,
                "short_description": ShortDescription,
                "description": Description
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
                "funding_type": "",
                "money_raised": MoneyRaised,
                "announced_date": Announced_Date,
                "company_name_JOIN": AcquiredCompany,
                "target_company": AcquiredCompany,
                "short_description": ShortDescription,
                "description": Description
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

  // Inserts HARDCODED partnerships into the same table as Investments/Acquisitions
  function insertPartnerships(p_table) {
    var PartnershipsList = [
      {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"AmazonCS",Company1:"Amazon"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Supplier",CompanyNameJOIN:"Here",Company1:"Here"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"What3Words",Company1:"What3Words"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Supplier",CompanyNameJOIN:"AT&T",Company1:"AT&T"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Chargepoint",Company1:"Chargepoint"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"QualcommCEC",Company1:"Qualcomm"},
  {Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia",TransactionType:"Partnership",CompanyNameJOIN:"Vodafone",Company1:"Vodafone"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Vodafone",Company1:"Vodafone"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Wal-mart",Company1:"Wal-mart"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Otonomo",Company1:"Otonomo"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Deepglint",Company1:"Deepglint"},
  {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Soundhound",Company1:"Soundhound"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Acquisitions",CompanyNameJOIN:"SPIN",Company1:"SPIN"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"WayRay",Company1:"WayRay"},
  {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Soundhound",Company1:"Soundhound"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Shell",Company1:"Shell"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Spring",Company1:"Spring"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Acquisitions",CompanyNameJOIN:"Parkmobile",Company1:"Parkmobile"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Acquisitions",CompanyNameJOIN:"Flinc",Company1:"Flinc"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Acquisitions",CompanyNameJOIN:"Autonomic",Company1:"Autonomic"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Acquisitions",CompanyNameJOIN:"TransLoc",Company1:"TransLoc"},
  {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Acquisitions",CompanyNameJOIN:"Carventura",Company1:"Carventura"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Acquisitions",CompanyNameJOIN:"Garantibil",Company1:"Garantibil"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Parkmobile",Company1:"Parkmobile"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"DaimlerCS",Company1:"Daimler"},
  {Sector:"OEM",Group:"FCA",Company:"FCA",Investor:"FCA",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
  {Sector:"OEM",Group:"Byton",Company:"Byton",Investor:"Byton",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
  {Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia",TransactionType:"Partnership",CompanyNameJOIN:"Vulog",Company1:"Vulog"},
  {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Vulog",Company1:"Vulog"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Cleenup",Company1:"Cleenup"},
  {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiCEC",Company1:"Huawei"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Lyft",Company1:"Lyft"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"UBER",Company1:"UBER"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"UBER",Company1:"UBER"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"UBER",Company1:"UBER"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Getaround",Company1:"Getaround"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Bosch",Company1:"Bosch"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"UBER",Company1:"UBER"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"VIA",Company1:"VIA"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Aurora",Company1:"Aurora"},
  {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Continental",Company1:"Continental"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Delphi",Company1:"Delphi"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Intel",Company1:"Intel"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Lyft",Company1:"Lyft"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"FCA",Company:"FCA",Investor:"FCA",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Mobileye",Company1:"Mobileye"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"Google",Company1:"Google"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Google",Company1:"Google"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"JLR",Company1:"JLR"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Alibaba",Company1:"Alibaba"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"Alibaba",Company1:"Alibaba"},
  {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Alibaba",Company1:"Alibaba"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"IBM",Company1:"IBM"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"IBM",Company1:"IBM"},
  {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"IBM",Company1:"IBM"},
  {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA",TransactionType:"Partnership",CompanyNameJOIN:"Valeo",Company1:"Valeo"},
  {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiCEC",Company1:"Huawei"},
  {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"Vodafone",Company1:"Vodafone"},
  {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"Partnership",CompanyNameJOIN:"Siemens",Company1:"Siemens"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"QualcommAE",Company1:"Qualcomm"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Didi",Company1:"Didi"},
  {Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Here",Company1:"Here"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"YandexN",Company1:"Yandex"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"YandexN",Company1:"Yandex"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Tomtom",Company1:"Tomtom"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"NASA",Company1:"NASA"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"DeNA",Company1:"DeNA"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"Didi",Company1:"Didi"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiS",Company1:"Huawei"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Microsoft",Company1:"Microsoft"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Argo AI",Company1:"Argo AI"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Ford",Company1:"Ford"},
  {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",TransactionType:"Partnership",CompanyNameJOIN:"BMW",Company1:"BMW"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"Chargepoint",Company1:"Chargepoint"},
  {Sector:"OEM",Group:"FCA",Company:"FCA",Investor:"FCA",TransactionType:"Partnership",CompanyNameJOIN:"Engie",Company1:"Engie"},
  {Sector:"OEM",Group:"FCA",Company:"FCA",Investor:"FCA",TransactionType:"Partnership",CompanyNameJOIN:"Enel",Company1:"Enel"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"EVgo",Company1:"EVgo"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"EVgo",Company1:"EVgo"},
  {Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",TransactionType:"Partnership",CompanyNameJOIN:"Panasonic",Company1:"Panasonic"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Panasonic",Company1:"Panasonic"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"CATL",Company1:"CATL"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Samsung SDI",Company1:"Samsung SDI"},
  {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda",TransactionType:"Partnership",CompanyNameJOIN:"CATL",Company1:"CATL"},
  {Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",TransactionType:"Partnership",CompanyNameJOIN:"Chargetrip",Company1:"Chargetrip"},
  {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"JLR",TransactionType:"",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Rimac",Company1:"Rimac"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnerhip",CompanyNameJOIN:"Disney",Company1:"Disney"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"INRIX Park",Company1:"INRIX Park"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Nvidia",Company1:"Nvidia"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"AmazonS",Company1:"Amazon"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Pizza Hut",Company1:"Pizza Hut"},
  {Sector:"OEM",Group:"Ford",Company:"Ford",Investor:"Ford",TransactionType:"Partnership",CompanyNameJOIN:"Dominos",Company1:"Dominos"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Supplier",CompanyNameJOIN:"Zenuity",Company1:"Zenuity"},
  {Sector:"OEM",Group:"Alliance RNM",Company:"RNM",Investor:"RNM",TransactionType:"Partnership",CompanyNameJOIN:"Waymo",Company1:"Waymo"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Baidu",Company1:"Baidu"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"AmazonS",Company1:"Amazon"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Luminar",Company1:"Luminar"},
  {Sector:"OEM",Group:"Geely",Company:"Volvo",Investor:"Volvo",TransactionType:"Partnership",CompanyNameJOIN:"Luminar",Company1:"Luminar"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Luminar",Company1:"Luminar"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"HuaweiADS",Company1:"Huawei"},
  {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",TransactionType:"Partnership",CompanyNameJOIN:"Airbus",Company1:"Airbus"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"YandexADS",Company1:"Yandex"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Garmin",Company1:"Garmin"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"Partnership",CompanyNameJOIN:"Lidl",Company1:"Lidl"},
  {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen",TransactionType:"partnership",CompanyNameJOIN:"Kaufland",Company1:"Kaufland"},
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
  {Sector:"OEM",Group:"FCA",Company:"FCA",Investor:"FCA",TransactionType:"Partnership",CompanyNameJOIN:"Xevo",Company1:"Xevo"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Xevo",Company1:"Xevo"},
  {Sector:"OEM",Group:"GM",Company:"GM",Investor:"GM",TransactionType:"Partnership",CompanyNameJOIN:"Xevo",Company1:"Xevo"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Wind River",Company1:"Wind River"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Tencent",Company1:"Tencent"},
  {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",TransactionType:"Partnership",CompanyNameJOIN:"Baidu",Company1:"Baidu"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"BYD",Company1:"BYD"},
  {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota",TransactionType:"Partnership",CompanyNameJOIN:"Softbank",Company1:"Softbank"},
  {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai",TransactionType:"Partnership",CompanyNameJOIN:"Soundhound",Company1:"Soundhound"}
];

    var partnershipsTableData = [];
    for (var i = 0, len = PartnershipsList.length; i < len; i++) {
      partnershipsTableData.push({
        "sector": PartnershipsList[i].Sector,
        "group": PartnershipsList[i].Group,
        "company": PartnershipsList[i].Company,
        "investor": PartnershipsList[i].Investor,
        "transaction_type": PartnershipsList[i].TransactionType,
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
        {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW",UUID:"b462608d8bf493f14f68e41ee10f0df2"},
        {Sector:"OEM",Group:"BMW",Company:"BMW",Investor:"BMW i Ventures",UUID:"0e35699837f1d2b1b6eb2b62cf418b3e"},
        {Sector:"OEM",Group:"Daimler",Company:"Daimler",Investor:"Daimler",UUID:"5d6ed201f03268afb4227e7c68129485"},
        {Sector:"Mobility",Group:"Didi Chuxing",Company:"Didi",Investor:"Didi Chuxing",UUID:"eab915a8f41464e05138c5f341596a5b"},
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
        {Sector:"Mobility",Group:"Grab",Company:"Grab",Investor:"Grab",UUID:"a76824768a83dbcf73dc41a841ef850e"},
        {Sector:"OEM",Group:"Honda",Company:"Honda",Investor:"Honda Motor",UUID:"0017e370d941822e83bc538beaab28da"},
        {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai Motor Company",UUID:"271e1bf5086adbb89806b76a591b864e"},
        {Sector:"OEM",Group:"Hyundai",Company:"Hyundai",Investor:"Hyundai Venture Investment Corporation",UUID:"994661433b9eb9fc9283116b7b32af5a"},
        {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"Jaguar Land Rover",UUID:"4b6fd457050953c1db591f694f5ef77b"},
        {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"Jaguar Ventures",UUID:"75213e229421b3687e50a36e9ddf1cec"},
        {Sector:"OEM",Group:"JLR",Company:"JLR",Investor:"Jaguar Land Rover’s venture capital fund",UUID:"ec11c33226e64c7db12a92b9305cf0dd"},
        {Sector:"OEM",Group:"KIA",Company:"Kia",Investor:"Kia Motors",UUID:"396458db49b8888dfba24953402d3d66"},
        {Sector:"Mobility",Group:"Lyft",Company:"Lyft",Investor:"Lyft",UUID:"33a97e70f137e90f8d68950a043ee09f"},
        {Sector:"OEM",Group:"PSA",Company:"PSA",Investor:"PSA Group",UUID:"7c01753993a20640220b5b05a855210a"},
        {Sector:"OEM",Group:"PSA",Company:"Peugeot",Investor:"Peugeot SA",UUID:"ee1dec4f08abb10cd37aa27ef162d215"},
        {Sector:"OEM",Group:"Tesla",Company:"Tesla",Investor:"Tesla",UUID:"a367b036595254357541ad7ee8869e24"},
        {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota Motor Corporation",UUID:"12b90373ab49a56a4b4ec7b3e9236faf"},
        {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota Tsusho",UUID:"4ecb67dc639df5b6cd57da212250cebc"},
        {Sector:"OEM",Group:"Toyota",Company:"Toyota",Investor:"Toyota AI Ventures",UUID:"4419828e7e06f10e323c4e985821dafd"},
        {Sector:"Mobility",Group:"Uber",Company:"Uber",Investor:"Uber",UUID:"1eb371093b9301a9177ffee2cb1bfcdc"},
        {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen group",UUID:"8a2b18d24cfbac1708b207b01d092e2a"},
        {Sector:"OEM",Group:"VAG",Company:"Audi",Investor:"Audi",UUID:"81a1ceaa081ffe4ffbb4ca4cbc8293a8"},
        {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen We",UUID:"a31b34c32f6543789fb20993d74b4dad"},
        {Sector:"OEM",Group:"VAG",Company:"Volkswagen",Investor:"Volkswagen Financial Services",UUID:"5449c78f0a2a24b1c2f1414ec2e27917"},
        {Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche",UUID:"68255d6d16144c7c1a0b3d3998c1d2c2"},
        {Sector:"OEM",Group:"VAG",Company:"Porsche",Investor:"Porsche Automobil Holding",UUID:"8ea457a172805992c020e741fef4a8dc"},
        {Sector:"OEM",Group:"VAG",Company:"Seat",Investor:"Seat",UUID:"fdf2b2f2241533a054ad3b9755b84f33"},
        {Sector:"OEM",Group:"VAG",Company:"Škoda",Investor:"Škoda Auto a.s ",UUID:"7c71810f27514e8c95d7e2fae0b96178"}
      ];
      getInvestmentsAcquisitionsByCompanies(CompaniesList, table);
      insertPartnerships(table);
      doneCallback();
    }

    if (table.tableInfo.id == "Categories") {
      var CategoriesList = [
        {CompanyNameJOIN:"99",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Agility Communications",SubCategory:"",Category:"Others"},
{CompanyNameJOIN:"Airbus",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Algolux",SubCategory:"",Category:"Others"},
{CompanyNameJOIN:"Alibaba",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Alphabet Energy",SubCategory:"Energy production",Category:"Electrification"},
{CompanyNameJOIN:"AmazonCS",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"AmazonS",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Anagog",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Apex.AI",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Apollo Voice",SubCategory:"VPA",Category:"Connected"},
{CompanyNameJOIN:"Argo AI",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"AT&T",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"Audible",SubCategory:"Entertainment",Category:"Connected"},
{CompanyNameJOIN:"Aurora",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Aurora",SubCategory:"Autonomy enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Autobiz.fr",SubCategory:"Marketplace",Category:"Others"},
{CompanyNameJOIN:"AutoFi",SubCategory:"Financial Services",Category:"Others"},
{CompanyNameJOIN:"AutoGravity",SubCategory:"e-commerce",Category:"Others"},
{CompanyNameJOIN:"Autonomic",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Autotalks",SubCategory:"Wireless Technology",Category:"Connected"},
{CompanyNameJOIN:"AvantGo",SubCategory:"Internet",Category:"Connected"},
{CompanyNameJOIN:"BAIC BJEV",SubCategory:"Electric Vehicles",Category:"Electrification"},
{CompanyNameJOIN:"Baidu",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"BarterTrust.com",SubCategory:"",Category:"Others"},
{CompanyNameJOIN:"BeXcom Korea",SubCategory:"e-commerce",Category:"Others"},
{CompanyNameJOIN:"BioAmber",SubCategory:"Industry",Category:"Others"},
{CompanyNameJOIN:"Black Girls CODE",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Blacklane",SubCategory:"Car Hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Blackmore Sensors and Analytics",SubCategory:"Lidar solution",Category:"Autonomous"},
{CompanyNameJOIN:"BMW",SubCategory:"Electric Vehicles",Category:"Electrification"},
{CompanyNameJOIN:"Bolt",SubCategory:"Micro Mobility",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Bosch",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Boxbot",SubCategory:"Last mile delivery",Category:"Autonomous"},
{CompanyNameJOIN:"Bright Automotive",SubCategory:"Car Manufacturer",Category:"Electrification"},
{CompanyNameJOIN:"Broadlane",SubCategory:"Supply Chain",Category:"Others"},
{CompanyNameJOIN:"Bus.com",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Campus Pipeline",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Caocao Zhuanche",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Car Next Door",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Carbon",SubCategory:"3D Printing",Category:"Others"},
{CompanyNameJOIN:"carClub",SubCategory:"e-commerce",Category:"Others"},
{CompanyNameJOIN:"Careem",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"CARFIT",SubCategory:"Big Data",Category:"Connected"},
{CompanyNameJOIN:"Caroobi",SubCategory:"Car Marketplace",Category:"Others"},
{CompanyNameJOIN:"carpooling.com",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Carventura",SubCategory:"Car Sales Platforms",Category:"Others"},
{CompanyNameJOIN:"Catalytic Solutions",SubCategory:"Pollution Technology",Category:"Others"},
{CompanyNameJOIN:"CATL",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Chargemaster",SubCategory:"Charging Solution",Category:"Electrification"},
{CompanyNameJOIN:"ChargePoint",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Chargepoint",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Chargetrip",SubCategory:"Others",Category:"Electrification"},
{CompanyNameJOIN:"China Unicom",SubCategory:"Telecommunication",Category:"Others"},
{CompanyNameJOIN:"CINQS",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Civil Maps",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"Claroty",SubCategory:"Cybersecurity",Category:"Others"},
{CompanyNameJOIN:"Cleenup",SubCategory:"Car Cleening",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"CloudCar",SubCategory:"Cloud",Category:"Connected"},
{CompanyNameJOIN:"Continental",SubCategory:"Autonomy enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Coord",SubCategory:"Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Coskata",SubCategory:"Energy production",Category:"Electrification"},
{CompanyNameJOIN:"Cruise",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"DaimlerCS",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"DaimlerADS",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Data Enlighten",SubCategory:"Space Travel",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"deCarta",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"Deepglint",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"DeepMap",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Delphi",SubCategory:"Autonomy enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Delta ID",SubCategory:"Identity Management",Category:"Connected"},
{CompanyNameJOIN:"DeNA",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Desktop Metal",SubCategory:"3D Printing",Category:"Others"},
{CompanyNameJOIN:"Didi",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Disney",SubCategory:"Entertainment",Category:"Connected"},
{CompanyNameJOIN:"Dominos",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"DSP Concepts",SubCategory:"Sounds sensor",Category:"Autonomous"},
{CompanyNameJOIN:"Elementary Robotics",SubCategory:"Robot",Category:"Others"},
{CompanyNameJOIN:"Embark",SubCategory:"Public Transportation app",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"eMov",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Empower Energies Inc.",SubCategory:"Solar Energy",Category:"Electrification"},
{CompanyNameJOIN:"Enel",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Enevate",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Engie",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Envia Systems",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"eRoom Technology",SubCategory:"Entreprise Software",Category:"Others"},
{CompanyNameJOIN:"EVgo",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Fair",SubCategory:"Car Leasing",Category:"Others"},
{CompanyNameJOIN:"feezu.cn",SubCategory:"Car Sharing Solution",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Flinc",SubCategory:"Micro Mobility",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"flinc GmbH",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"FlixBus",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Ford",SubCategory:"Electric Vehicles",Category:"Electrification"},
{CompanyNameJOIN:"Free2Move",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Free2Move Paris",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"GaN Systems",SubCategory:"Battery technology",Category:"Electrification"},
{CompanyNameJOIN:"Garantibil",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Garmin",SubCategory:"Entertainment",Category:"Connected"},
{CompanyNameJOIN:"GeoDigital",SubCategory:"Lidar solution",Category:"Autonomous"},
{CompanyNameJOIN:"Getaround",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Getaround",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Gett",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Girls Who Code",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Google",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"GottaPark",SubCategory:"Parking",Category:"Connected"},
{CompanyNameJOIN:"Grab",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Graphcore",SubCategory:"AI components",Category:"Others"},
{CompanyNameJOIN:"Hap2U",SubCategory:"HMI",Category:"Connected"},
{CompanyNameJOIN:"HDS Global",SubCategory:"e-commerce",Category:"Others"},
{CompanyNameJOIN:"Here",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"HERE Technologies",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"Heycar",SubCategory:"e-commerce",Category:"Others"},
{CompanyNameJOIN:"Hive",SubCategory:"e-scooter",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"HuaweiCEC",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"HuaweiS",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"HuaweiADS",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Hubject",SubCategory:"Charging Solution",Category:"Electrification"},
{CompanyNameJOIN:"iBiquity Digital Corporation",SubCategory:"Connectivity",Category:"Connected"},
{CompanyNameJOIN:"IBM",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Ignite Sports Media",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Immotor",SubCategory:"e-scooter",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"INRIX",SubCategory:"Parking",Category:"Connected"},
{CompanyNameJOIN:"INRIX Park",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Intel",SubCategory:"Autonomy enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Intelligent Apps (mytaxi)",SubCategory:"Ride Hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Intuition Robotics",SubCategory:"",Category:"Others"},
{CompanyNameJOIN:"Ionic Materials",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Ionity",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"iSpace China",SubCategory:"Space Travel",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"JapanTaxi",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"JLR",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Joby Aviation",SubCategory:"e-Plane",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"JustPark",SubCategory:"Parking",Category:"Connected"},
{CompanyNameJOIN:"Kalray",SubCategory:"Electronics",Category:"Others"},
{CompanyNameJOIN:"Kamaz",SubCategory:"Trucks",Category:"Others"},
{CompanyNameJOIN:"Kaufland",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Keyfactor",SubCategory:"Identity Management",Category:"Connected"},
{CompanyNameJOIN:"KnowledgeNet",SubCategory:"e-learning",Category:"Others"},
{CompanyNameJOIN:"Lidl",SubCategory:"Charging Station",Category:"Electrification"},
{CompanyNameJOIN:"Life360",SubCategory:"Mobile Application",Category:"Connected"},
{CompanyNameJOIN:"Luminar",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Lunewave",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Lyft",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Maluuba",SubCategory:"Machine learning",Category:"Others"},
{CompanyNameJOIN:"MapAnything",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Mapillary",SubCategory:"Map",Category:"Connected"},
{CompanyNameJOIN:"Mascoma",SubCategory:"Energy production",Category:"Electrification"},
{CompanyNameJOIN:"Matternet",SubCategory:"Delivery",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"May Mobility",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Mazda Motor Corp.",SubCategory:"Car Manufacturer",Category:"Others"},
{CompanyNameJOIN:"Mcity",SubCategory:"AD Test simulator",Category:"Autonomous"},
{CompanyNameJOIN:"Mesh Korea",SubCategory:"Logistic",Category:"Others"},
{CompanyNameJOIN:"Metawave Corporation",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Microsoft",SubCategory:"Cloud/Data Platforms",Category:"Others"},
{CompanyNameJOIN:"Migo",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Miles",SubCategory:"Social Plateform",Category:"Connected"},
{CompanyNameJOIN:"Mobile Go",SubCategory:"Food services",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Mobileye",SubCategory:"Autonomy enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Mobvoi",SubCategory:"VPA",Category:"Connected"},
{CompanyNameJOIN:"Momenta",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Moovit",SubCategory:"Transportation info",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"MyCityWay",SubCategory:"Digital Platform",Category:"Others"},
{CompanyNameJOIN:"Mycroft",SubCategory:"VPA",Category:"Connected"},
{CompanyNameJOIN:"NanoSteel",SubCategory:"Nano Technology",Category:"Others"},
{CompanyNameJOIN:"NASA",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Nauto",SubCategory:"AI",Category:"Autonomous"},
{CompanyNameJOIN:"Navistar",SubCategory:"Trucks",Category:"Others"},
{CompanyNameJOIN:"Northvolt",SubCategory:"Energy production",Category:"Electrification"},
{CompanyNameJOIN:"Nvidia",SubCategory:"Autonomy enablers",Category:"Autonomous"},
{CompanyNameJOIN:"ofo",SubCategory:"Bike-Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Ola",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Omada",SubCategory:"Identity Management",Category:"Connected"},
{CompanyNameJOIN:"OpenSynergy",SubCategory:"Software",Category:"Connected"},
{CompanyNameJOIN:"Otonomo",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"Panasonic",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Parallel Domain",SubCategory:"AD Test simulator",Category:"Autonomous"},
{CompanyNameJOIN:"Parkmobile",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"ParkTAG",SubCategory:"Parking",Category:"Connected"},
{CompanyNameJOIN:"Perceptive Automata",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Pivotal",SubCategory:"Entreprise Software",Category:"Others"},
{CompanyNameJOIN:"Pixim",SubCategory:"Hardware",Category:"Others"},
{CompanyNameJOIN:"Pizza Hut",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Plumtree Software",SubCategory:"Entreprise Software",Category:"Others"},
{CompanyNameJOIN:"Powermat Technologies",SubCategory:"Wireless Charging",Category:"Electrification"},
{CompanyNameJOIN:"Preferred Networks",SubCategory:"AI",Category:"Connected"},
{CompanyNameJOIN:"Prescient Markets",SubCategory:"Electronics",Category:"Others"},
{CompanyNameJOIN:"Proterra",SubCategory:"EV Bus",Category:"Electrification"},
{CompanyNameJOIN:"PROTON Holdings",SubCategory:"Car Manufacturer",Category:"Others"},
{CompanyNameJOIN:"QualcommCEC",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"QualcommAE",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Quantumscape",SubCategory:"Energy storage",Category:"Electrification"},
{CompanyNameJOIN:"Rally",SubCategory:"Bus sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Realtime Robotics",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"RenRenChe",SubCategory:"commerce",Category:"Others"},
{CompanyNameJOIN:"Rever",SubCategory:"Social Plateform",Category:"Connected"},
{CompanyNameJOIN:"Revl",SubCategory:"Action Cam",Category:"Others"},
{CompanyNameJOIN:"Revv",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Ridecell",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Rimac",SubCategory:"Electric Vehicles",Category:"Electrification"},
{CompanyNameJOIN:"Rimac Automobili",SubCategory:"EV Components",Category:"Electrification"},
{CompanyNameJOIN:"Rivian Automotive",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"SAIPS",SubCategory:"Machine learning",Category:"Others"},
{CompanyNameJOIN:"Sakti3",SubCategory:"Battery technology",Category:"Electrification"},
{CompanyNameJOIN:"Samsung SDI",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Sansan",SubCategory:"Entreprise Software",Category:"Others"},
{CompanyNameJOIN:"Saxo Bank",SubCategory:"Financial Services",Category:"Others"},
{CompanyNameJOIN:"Scoop Technologies",SubCategory:"P2P Carpooling",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"SDC Materials,Inc.",SubCategory:"Nano Technology",Category:"Others"},
{CompanyNameJOIN:"Sequence Design",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Seurat Technologies",SubCategory:"Printing Solution",Category:"Others"},
{CompanyNameJOIN:"ShareNow",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Shell",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Shift",SubCategory:"Car Marketplace",Category:"Others"},
{CompanyNameJOIN:"Shouqi Zhixing",SubCategory:"e-scooter",Category:"Electrification"},
{CompanyNameJOIN:"Siemens",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"Sila Nanotechnologies",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Silvercar",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Sirrus",SubCategory:"Material",Category:"Others"},
{CompanyNameJOIN:"Sital Technology",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Skurt",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"SLAMcore Limited",SubCategory:"Spatial AI",Category:"Others"},
{CompanyNameJOIN:"Solid Power",SubCategory:"Battery technology",Category:"Electrification"},
{CompanyNameJOIN:"SolidEnergy Systems",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"Solve MIT",SubCategory:"",Category:"Others"},
{CompanyNameJOIN:"Soundhound",SubCategory:"Car Control",Category:"Connected"},
{CompanyNameJOIN:"SoundHound Inc.",SubCategory:"Car Control",Category:"Connected"},
{CompanyNameJOIN:"Spin",SubCategory:"Scooter Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"SPIN",SubCategory:"Micro Mobility",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Spotify",SubCategory:"Entertainment",Category:"Connected"},
{CompanyNameJOIN:"Spring",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Spring Labs",SubCategory:"Financial Services",Category:"Others"},
{CompanyNameJOIN:"Starship Technologies",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"StoreDot",SubCategory:"Batteries",Category:"Electrification"},
{CompanyNameJOIN:"StradVision, Inc",SubCategory:"ADAS",Category:"Autonomous"},
{CompanyNameJOIN:"STRATIM Systems",SubCategory:"Fleet Management",Category:"Others"},
{CompanyNameJOIN:"STRIVR",SubCategory:"VR training",Category:"Others"},
{CompanyNameJOIN:"Strobe",SubCategory:"Lidar solution",Category:"Autonomous"},
{CompanyNameJOIN:"Summon",SubCategory:"Car Hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Sunlogics",SubCategory:"Solar Energy",Category:"Electrification"},
{CompanyNameJOIN:"Tantau Software",SubCategory:"e-commerce",Category:"Others"},
{CompanyNameJOIN:"Taxify",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Tekion",SubCategory:"Machine learning",Category:"Others"},
{CompanyNameJOIN:"Telcontar",SubCategory:"Connectivity",Category:"Connected"},
{CompanyNameJOIN:"Telogis",SubCategory:"Navigation",Category:"Others"},
{CompanyNameJOIN:"Tencent",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Tesla",SubCategory:"Electric Vehicles",Category:"Electrification"},
{CompanyNameJOIN:"tiramizoo",SubCategory:"Delivery",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Tomtom",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"Transit",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"TransLoc",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"TravelCar",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"TTTech",SubCategory:"Electronics",Category:"Connected"},
{CompanyNameJOIN:"Tula Technology",SubCategory:"ICE Technology",Category:"Electrification"},
{CompanyNameJOIN:"TuneIn",SubCategory:"Entertainment",Category:"Connected"},
{CompanyNameJOIN:"Turo",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Uber",SubCategory:"Ride hailing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Uber Advanced Technologies Group",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"Urgent.ly Roadside Assistance",SubCategory:"Services platform",Category:"Connected"},
{CompanyNameJOIN:"Ushr",SubCategory:"Navigation",Category:"Autonomous"},
{CompanyNameJOIN:"Valeo",SubCategory:"ADAS",Category:"Autonomous"},
{CompanyNameJOIN:"Validated",SubCategory:"Ride Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Vantage Power",SubCategory:"Electric Engine",Category:"Electrification"},
{CompanyNameJOIN:"Velodyne LiDAR",SubCategory:"Autonomous vehicle",Category:"Autonomous"},
{CompanyNameJOIN:"VIA",SubCategory:"Autonomous VAN/Trucks",Category:"Autonomous"},
{CompanyNameJOIN:"Via Transportation, Inc.",SubCategory:"Shuttle Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Virent Energy Systems",SubCategory:"Energy provider",Category:"Electrification"},
{CompanyNameJOIN:"Vodafone",SubCategory:"Car External Connections",Category:"Connected"},
{CompanyNameJOIN:"Volocopter",SubCategory:"Air Mobility",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Vontu",SubCategory:"Software",Category:"Others"},
{CompanyNameJOIN:"Vulog",SubCategory:"MaaS Platform",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Wal-mart",SubCategory:"Autonomy Enablers",Category:"Autonomous"},
{CompanyNameJOIN:"Waymo",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"WayRay",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Wejo",SubCategory:"Big Data",Category:"Connected"},
{CompanyNameJOIN:"WeRide.ai",SubCategory:"AI",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"WeShare",SubCategory:"Car Sharing",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"What3Words",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"Wind River",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Xevo",SubCategory:"Services",Category:"Connected"},
{CompanyNameJOIN:"Xometry",SubCategory:"Manufacturing Solution",Category:"Others"},
{CompanyNameJOIN:"YandexN",SubCategory:"Navigation",Category:"Connected"},
{CompanyNameJOIN:"YandexADS",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Yellowbrick Data",SubCategory:"Data Management",Category:"Others"},
{CompanyNameJOIN:"Yestock",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Yoshi",SubCategory:"Cleaning and gas services",Category:"Connected"},
{CompanyNameJOIN:"Zebra Imaging",SubCategory:"3D technology",Category:"Others"},
{CompanyNameJOIN:"Zendrive",SubCategory:"Sensors",Category:"Connected"},
{CompanyNameJOIN:"Zenuity",SubCategory:"AD Software",Category:"Autonomous"},
{CompanyNameJOIN:"Zhidou",SubCategory:"Electric Vehicles",Category:"Electrification"},
{CompanyNameJOIN:"Zonar",SubCategory:"Fleet Management",Category:"Connected"},
{CompanyNameJOIN:"ZoomCar",SubCategory:"Car Rental",Category:"Sharing/Subscription"},
{CompanyNameJOIN:"Zum",SubCategory:"Child Transportation",Category:"Sharing/Subscription"}
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
