sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("project2.controller.View2", {
       
        onInit: function () {
           
            var oCoreModel = sap.ui.getCore().getModel("selectedProduct");
            this.getView().setModel(oCoreModel, "selectedProduct");
           
            this.isEditMode = false; 
            this.setEditMode(this.isEditMode);
        },
       
        setEditMode: function(editable) {
            this.isEditMode = editable; // Update the edit mode state
            var aInputs = [
                this.byId("inputProductId"),
                this.byId("inputBrand"),
                this.byId("inputRatings"),
                this.byId("inputDiscount"),
                this.byId("inputColor"),
                this.byId("inputfreedel")
            ];
        
            aInputs.forEach(function(oInput) {
                oInput.setEditable(editable);
            });

           
        },
        
        onEditPress: function() {
            // Set fields to editable when edit button is pressed
            this.setEditMode(true);
            var oObjectPage = this.byId("ObjectPageLayout");
            var bShowFooter = oObjectPage.getShowFooter();
            oObjectPage.setShowFooter(!bShowFooter);
        },

        onSave: function() {
            var oModel = this.getView().getModel("selectedProduct");
            var oData = oModel.getData();

            console.log("Selected Product Data:", oData);

            // Update the core model with the edited data
            var oCoreModel = sap.ui.getCore().getModel("productsModel");
            var aProducts = oCoreModel.getProperty("/Products");
          
            for (var i = 0; i < aProducts.length; i++) {
                if (aProducts[i].id === oData.id) {
                    aProducts[i] = oData;
                    break;
                }
            }

            console.log("Products Array After Update:", aProducts);
            oCoreModel.setData({ Products: aProducts });
             this.setEditMode(false); // Exit edit mode
            var oObjectPage = this.byId("ObjectPageLayout");
            oObjectPage.setShowFooter(false);

            // Navigate back to the first page
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
        },

        onCancel: function() {
            this.setEditMode(false); // Exit edit mode
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
            var oObjectPage = this.byId("ObjectPageLayout");
            oObjectPage.setShowFooter(false);
            oRouter.navTo("RouteView1"); 

        },

        onBack: function() {
            this.setEditMode(false); // Exit edit mode
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
            var oObjectPage = this.byId("ObjectPageLayout");
            oObjectPage.setShowFooter(false);
            oRouter.navTo("RouteView1"); 

        }
    });
});
