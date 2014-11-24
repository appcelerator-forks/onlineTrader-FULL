function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function loadTableRow(data) {
        var tableData = [];
        for (var i = 0; i < data.length; i++) {
            var row = Ti.UI.createTableViewRow({
                className: "forumEvent",
                rowIndex: i,
                selectionStyle: 0,
                separatorColor: "#ccc",
                width: "100%",
                month: data[i]["date"]
            });
            var lblField = Ti.UI.createLabel({
                text: data[i]["date"],
                color: "#222",
                top: "10dp",
                left: "10dp"
            });
            var lblField2 = Ti.UI.createLabel({
                realValue: "Value",
                textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                top: "10dp",
                width: "20%",
                left: "80%",
                text: data[i]["value"],
                color: "#222"
            });
            var separator = Ti.UI.createView({
                top: 49,
                backgroundColor: "#9d0404",
                height: 1
            });
            row.add(lblField);
            row.add(lblField2);
            row.add(separator);
            tableData.push(row);
        }
        $.tableView.setData(tableData);
    }
    function getSummary() {
        var url = Ti.API.GETSUMMARY + Ti.App.Properties.getString("session");
        var data = [];
        var client = Ti.Network.createHTTPClient({
            onload: function() {
                var res = JSON.parse(this.responseText);
                if ("Success" == res.status) {
                    for (var key in res.data) {
                        var obj = res.data[key];
                        data.push({
                            date: obj.created,
                            value: obj.commission
                        });
                    }
                    loadTableRow(data);
                } else {
                    alert(res.status);
                    createAlert("Error", res.status);
                }
            },
            onerror: function() {
                createAlert("Network declined", "Failed to contact with server. Please make sure your device are connected to internet.");
            },
            timeout: 1e4
        });
        client.open("GET", url);
        client.send();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "dealer_monthly_commission";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    $.__views.dealer_monthly_commission = Ti.UI.createWindow({
        backgroundImage: "/images/bg.jpg",
        navBarHidden: true,
        id: "dealer_monthly_commission"
    });
    $.__views.dealer_monthly_commission && $.addTopLevelView($.__views.dealer_monthly_commission);
    $.__views.footer = Alloy.createController("_subheader", {
        height: 64,
        width: Titanium.UI.FILL,
        contentHeight: Ti.UI.SIZE,
        contentWidth: Ti.UI.SIZE,
        layout: "horizontal",
        bottom: 0,
        backgroundColor: "#e02222",
        id: "footer",
        __parentSymbol: $.__views.dealer_monthly_commission
    });
    $.__views.footer.setParent($.__views.dealer_monthly_commission);
    $.__views.__alloyId22 = Ti.UI.createView({
        top: "60dp",
        font: {
            fontSize: "14dp",
            fontFamily: "sans-serif"
        },
        color: "#525252",
        layout: "vertical",
        left: "5dp",
        right: "5dp",
        height: "88%",
        id: "__alloyId22"
    });
    $.__views.dealer_monthly_commission.add($.__views.__alloyId22);
    $.__views.__alloyId23 = Ti.UI.createLabel({
        width: Titanium.UI.FILL,
        color: "#e02222",
        font: {
            fontSize: "18dp"
        },
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        text: "DEALER - MONTHLY COMMISSION",
        id: "__alloyId23"
    });
    $.__views.__alloyId22.add($.__views.__alloyId23);
    $.__views.__alloyId24 = Ti.UI.createImageView({
        width: "100%",
        height: 1,
        backgroundColor: "#9d0404",
        id: "__alloyId24"
    });
    $.__views.__alloyId22.add($.__views.__alloyId24);
    $.__views.tableView = Ti.UI.createTableView({
        width: "100%",
        id: "tableView"
    });
    $.__views.__alloyId22.add($.__views.tableView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var clickTime = null;
    getSummary();
    $.tableView.addEventListener("click", function(e) {
        var currentTime = new Date();
        if (1e3 > currentTime - clickTime) return;
        clickTime = currentTime;
        var prop = e.rowData.month;
        var param = {
            date: prop
        };
        var orderdetail = Alloy.createController("dealer_monthly_commission_detail", param).getView();
        setWindowRelationship(orderdetail);
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;