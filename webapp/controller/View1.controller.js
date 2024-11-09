sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/m/Token"
  ],
  function (Controller,JSONModel,Fragment,MessageToast,Filter,FilterOperator,MessageBox,Spreadsheet,Token) {
    "use strict";

    return Controller.extend("project2.controller.View1", {
      onInit: function () {
        var oModel = new JSONModel();
        oModel.loadData("model/data.json",null,false);
        sap.ui.getCore().setModel(oModel, "productsModel");
        this.getView().setModel(oModel, "productsModel");

      //This Model is for Create Product Operation 
        var oViewModel1 = new JSONModel();
        this.getView().setModel(oViewModel1, "view1");


        // This code is to give unique Brand to the 2nd filter
        var oBrandModel = new JSONModel({
           Brands: [{ "brand":"Lenovo" },{ "brand": "Apple" },{ "brand": "Vivo" },{ "brand": "HP" }] });
        this.getView().setModel(oBrandModel, "BrandModel");

  
// This code is to Get Unique Colors from the table and give that to 3rd Filter MultiComboBox
      
        var aProducts = oModel.getProperty("/Products");
        var aColors = [...new Set(aProducts.map((product) => product.color))];
       // console.log("aColors:",aColors);
        var oColorModel = new JSONModel({ colors: aColors });
        this.getView().setModel(oColorModel, "colorModel");
  




  // This code for Filters 
        this._oMultipleConditionsInput = this.byId("All");  
        this.oFilterBar = this.getView().byId("filterbar");
        this.oTable = this.getView().byId("idProductsTable");

       
      },

    
      //Second Filter Bar fragment open code

      onbrandSearch: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue(),
        
          oView = this.getView();
          console.log("sInputValue" ,sInputValue);

        // create value help dialog
        if (!this._pValueHelpDialog) {
         Fragment.load({
            id: oView.getId(),
            name: "project2.fragments.brandsearch",
            controller: this,
          }).then(function (oValueHelpDialog) {
            this._pValueHelpDialog = oValueHelpDialog;
            oView.addDependent(oValueHelpDialog);
            this._pValueHelpDialog.open();
            
          }.bind(this));
        }
        else {
          this._pValueHelpDialog.open();
        }
      },

      
      _handleValueHelpClose: function (evt) {
        var aSelectedItems = evt.getParameter("selectedItems"),
          oMultiInput = this.byId("brandfilter");
        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach(function (oItem) {
            oMultiInput.addToken(
              new Token({
                text: oItem.getTitle(),
              })
            );
          });
        }
        this.onSelectionChange();
      },

      // Filter one
      searchall: function () {
        this.loadFragment({
          name: "project2.fragments.search",
        }).then(
          function (oMultipleConditionsDialog) {
            this._oMultipleConditionsDialog = oMultipleConditionsDialog;
            this.getView().addDependent(oMultipleConditionsDialog);

            oMultipleConditionsDialog.setRangeKeyFields([
              {
                label: "ProductId",
                key: "id",
                type: "string",
                typeInstance: new sap.ui.model.type.String({},
                  {
                    maxLength: 10,
                  }
                ),
              },
              {
                label: "Product Name",
                key: "name",
                type: "string",
                typeInstance: new sap.ui.model.type.String({},
                  {
                    maxLength: 100,
                  }
                ),
              },
              {
                label: "Brand",
                key: "brand",
                type: "string",
                typeInstance: new sap.ui.model.type.String(
                  {},
                  {
                    maxLength: 50,
                  }
                ),
              },
              {
                label: "Price",
                key: "price",
                type: "number",
                typeInstance: new sap.ui.model.type.Float(
                  {},
                  {
                    precision: 2,
                  }
                ),
              },
              {
                label: "Discount Percentage",
                key: "discountPercentage",
                type: "number",
                typeInstance: new sap.ui.model.type.Float(
                  {},
                  {
                    precision: 2,
                  }
                ),
              },
              {
                label: "Ratings",
                key: "ratings",
                type: "number",
                typeInstance: new sap.ui.model.type.Integer({}, {}),
              },
              {
                label: "Color",
                key: "color",
                type: "string",
                typeInstance: new sap.ui.model.type.String(
                  {},
                  {
                    maxLength: 20,
                  }
                ),
              },
            ]);

            oMultipleConditionsDialog.open();
          }.bind(this)
        );
      },

      onMultipleConditionsValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        this._oMultipleConditionsInput.setTokens(aTokens);
        this.onSelectionChange();
        this._oMultipleConditionsDialog.close();
      },
      onMultipleConditionsCancelPress: function () {
        this._oMultipleConditionsDialog.close();
      },
      onMultipleConditionsAfterClose: function () {
        this._oMultipleConditionsDialog.destroy();
      },

     

      onSelectionChange: function (oEvent) {
        this.oFilterBar.fireFilterChange(oEvent);
      },

      onSearch: function () {
        var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
            var oControl = oFilterGroupItem.getControl(),
              aSelectedValues = [];

            // Handling MultiComboBox
            if (oControl && oControl instanceof sap.m.MultiComboBox) {
              aSelectedValues = oControl.getSelectedKeys();
              if (aSelectedValues.length > 0) {
                var aFilters = aSelectedValues.map(function (sKey) {
                  return new Filter({
                    path: oFilterGroupItem.getName(),
                    operator: FilterOperator.Contains,
                    value1: sKey,
                  });
                });
                aResult.push(
                  new Filter({
                    filters: aFilters,
                    and: false, // Change to true if you want all filters to match
                  })
                );
              }
            }

            //second filter
            else if (oControl && oControl instanceof sap.m.MultiInput && oFilterGroupItem.getName() === "brand" ) {
              aSelectedValues = oControl.getTokens().map(function (oToken) {
                return {
                  operator: FilterOperator.Contains, 
                  value: oToken.getText(),
                };
              });

              console.log("Brand Selected Tokens:", aSelectedValues);

              var aFilters = aSelectedValues.map(function (oFilterData) {
                return new Filter({
                  path: oFilterGroupItem.getName(),
                  operator: oFilterData.operator,
                  value1: oFilterData.value,
                });
              });

              if (aFilters.length > 0) {
                aResult.push(
                  new Filter({
                    filters: aFilters,
                    and: false,
                  })
                );
              }
            }
             else if ( oControl &&  oControl instanceof sap.m.MultiInput &&  oFilterGroupItem.getName() === "AllSearch"  ) {
              aSelectedValues = oControl.getTokens().map(function (oToken) {
                var oProperties = oToken.data("range");
                console.log("oproperties:", oProperties);

                var sOperator = oProperties.operation;

                if (oProperties.exclude) {
                  // If "exclude" is true, change the operator to "NE" (Not Equal)
                  sOperator = "NE";
                }

                return {
                  key: oProperties.keyField,
                  operator: sOperator,
                  value: oProperties.value1,
                };
              });

              console.log("MultiInput Selected Tokens for", aSelectedValues);

              var aFilters = aSelectedValues.map(function (oFilterData) {
                return new Filter({
                  path: oFilterData.key,
                  operator: oFilterData.operator,
                  value1: oFilterData.value,
                });
              });

              if (aFilters.length > 0) {
                aResult.push(
                  new Filter({
                    filters: aFilters,
                    and: false,
                  })
                );
              }
            }

            return aResult;
          }, []);
        this.oTable.getBinding("items").filter(aTableFilters);
       
      },
     
  
    //<!----------------Filter Code Ends--------------->
         // <!----------This is Create Product Fragment Code----------------->
      onopenForm: function () {
        if (!this.oDialog) {
          Fragment.load({
            id: this.getView().getId(),
            name: "project2.fragments.form",
            controller: this,
          })
            .then(
              function (oDialog) {
                this.oDialog = oDialog;
                this.getView().addDependent(this.oDialog);
                this.oDialog.open();
              }.bind(this))
        } else {
          this.oDialog.open();
        }
      },

    // Create Product Submit Button
      onSubmitPress: function () {
        var oidInput = this.byId("idInput");
        var oNameInput = this.byId("nameInput");
        var obrandInput = this.byId("brandInput");
        var opriceInput = this.byId("priceInput");
        var odiscountInput = this.byId("discountInput");
        var oratingsInput = this.byId("ratingsInput");
  

        var sid = oidInput.getValue();
        var sName = oNameInput.getValue();
        var sbrand = obrandInput.getValue();
        var sprice = opriceInput.getValue();
        var sdiscount = odiscountInput.getValue();
        var sratings = oratingsInput.getValue();
   

        var oViewModel1 = this.getView().getModel("view1");
        var scolor = oViewModel1.getProperty("/selectedColor");
        var sIndex = oViewModel1.getProperty("/Index");
        var bAccepted = oViewModel1.getProperty("/freedelivery");

        var aCurrencies = ["USD", "INR", "EUR"];
        var sCurrency = aCurrencies[sIndex];

        var oModel = this.getView().getModel("productsModel");
        var aData = oModel.getProperty("/Products");

        if (!sid ||!sName ||!sbrand ||!sprice ||!sdiscount ||!sratings ||!scolor ) {
          MessageToast.show("Empty value cannot add into table! Enter some value");
        } else {
          var bExists = aData.some(function (product) {
            return product.id === sid;
          });

          if (bExists) {
            MessageToast.show("Product ID already exists.");
          } else {
            aData.push({
              id: sid,
              name: sName,
              brand: sbrand,
              price: sprice,
              priceUnit: sCurrency,
              discountPercentage: sdiscount,
              ratings: sratings,
              color: scolor,
              selected: bAccepted,
            });

            oModel.setProperty("/Products", aData);
            MessageToast.show("Product ID added successfully.");

            // Clear the input fields
            oidInput.setValue("");
            oNameInput.setValue("");
            obrandInput.setValue("");
            opriceInput.setValue("");
            odiscountInput.setValue("");
            oratingsInput.setValue("");
            oViewModel1.setProperty("/selectedColor", "");
            oViewModel1.setProperty("/Index", -1);
            oViewModel1.setProperty("/freeDelivery", false);

            this.oDialog.close();
          }
        }
      },

      onDialogClose: function () {
        this.oDialog.destroy();
        this.oDialog = null;
      },

      onCancelPress: function () {
        this.oDialog.destroy();
        this.oDialog = null;
      },

     
     //Delete product operation
      onDeletePress: function () {
        var oTable = this.byId("idProductsTable");
        var aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          MessageToast.show("No items selected.");
          return;
        }

        var aItems = oTable.getItems();
        if (aSelectedItems.length === aItems.length) {
          MessageToast.show(
            "You have selected all items. Please confirm deletion."
          );
          return;
        }

        // Show a confirmation dialog before proceeding with deletion
        MessageBox.warning(
          "Are you sure you want to delete the selected items?",
          {
            title: "Confirm Deletion",
            onClose: function (sAction) {
              if (sAction === MessageBox.Action.OK) {
                // Proceed with deletion
                var oModel = this.getView().getModel("productsModel");
                var aData = oModel.getProperty("/Products");

                for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                  var oItem = aSelectedItems[i];
                  var sPath = oItem .getBindingContext("productsModel").getPath();
                  var iIndex = parseInt(sPath.split("/").pop());

                  aData.splice(iIndex, 1);
                }

                oModel.setProperty("/Products", aData);
                oTable.removeSelections(true);
                MessageToast.show("Selected entries deleted successfully.");
              }
            }.bind(this), // Ensure the context is maintained
          }
        );
      },
// Download as Excel code
      onDownloadExcel: function () {
        var oTable = this.byId("idProductsTable");
        var oList = oTable.getBinding("items").getContexts().map((context) => context.getObject());
        console.log(oList);
        var aExportData = oList.map(function (product) {
          if (!product) {
            console.error("Product is undefined");
            return {};
          }
          return {
            ID: product.id,
            Product: product.name,
            Brand: product.brand,
            Price: product.price,
            "Price Unit": product.priceUnit,
            "Discount Percentage": product.discountPercentage,
            Ratings: product.ratings,
            Color: product.color,
            "Free Delivery": product.selected ? "Yes" : "No",
          };
        });

        var column = [
          { label: "ID", property: "ID" },
          { label: "Product", property: "Product" },
          { label: "Brand", property: "Brand" },
          { label: "Price", property: "Price" },
          { label: "Price Unit", property: "Price Unit" },
          { label: "Discount Percentage", property: "Discount Percentage" },
          { label: "Ratings", property: "Ratings" },
          { label: "Color", property: "Color" },
          { label: "Free Delivery", property: "Free Delivery" },
        ];

        var oSettings = {
          workbook: { columns: column },
          dataSource: aExportData,
          fileName: "Products.xlsx",
        };

        // Instantiate and build the export
        var oSheet = new Spreadsheet(oSettings);
        oSheet
          .build()
          .then(function () {
            sap.m.MessageToast.show("File Downloaded");
          })
          .finally(function () {
            oSheet.destroy();
          });
      },
      onRowPress: function (oEvent) {

        sap.ui.core.BusyIndicator.show(0);
    
        // Get the selected item and its context
        var oSelectedItem = oEvent.getSource();
        var oContext = oSelectedItem.getBindingContext("productsModel");
        var oSelectedProduct = oContext.getObject();
    
       

        var oCoreModel = new JSONModel();
        sap.ui.getCore().setModel(oCoreModel, "selectedProduct");
    
        // Set new selected row data
        oCoreModel.setData(oSelectedProduct);
    
        // Get the router and navigate to the second page
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("View2");
    
        // Attach a route matched event to hide BusyIndicator when the second page (View2) is loaded
        oRouter.attachRoutePatternMatched(function(oEvent) {
            // Check if the event is for the second page (View2)
            if (oEvent.getParameter("name") === "View2") {
                // Hide Busy Indicator once the second page is loaded
                sap.ui.core.BusyIndicator.hide();
            }
        });
    },
    onExit: function () {
      this.oModel = null;
      this.oFilterBar = null;
      this.oTable = null;
    },
    });
  },
  
);
