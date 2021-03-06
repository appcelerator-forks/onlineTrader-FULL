function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "dealer_pos";
    this.args = arguments[0] || {};
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
    $.__views.dealer_pos = Ti.UI.createWindow({
        fullscreen: "false",
        backgroundImage: "/images/bg.jpg",
        navBarHidden: true,
        id: "dealer_pos"
    });
    $.__views.dealer_pos && $.addTopLevelView($.__views.dealer_pos);
    $.__views.__alloyId47 = Alloy.createController("_subheader", {
        id: "__alloyId47",
        __parentSymbol: $.__views.dealer_pos
    });
    $.__views.__alloyId47.setParent($.__views.dealer_pos);
    $.__views.content = Ti.UI.createView({
        top: "60dp",
        font: {
            fontSize: "16dp"
        },
        color: "#e02222",
        layout: "vertical",
        left: "5dp",
        right: "5dp",
        id: "content"
    });
    $.__views.dealer_pos.add($.__views.content);
    $.__views.__alloyId48 = Ti.UI.createLabel({
        width: Titanium.UI.FILL,
        color: "#e02222",
        font: {
            fontSize: "18dp"
        },
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        text: "DEALER - COURIER",
        id: "__alloyId48"
    });
    $.__views.content.add($.__views.__alloyId48);
    $.__views.__alloyId49 = Ti.UI.createImageView({
        width: "100%",
        height: 1,
        backgroundColor: "#9d0404",
        id: "__alloyId49"
    });
    $.__views.content.add($.__views.__alloyId49);
    $.__views.posview = Ti.UI.createWebView({
        layout: "vertical",
        width: "100%",
        bottom: 2,
        height: Ti.UI.SIZE,
        top: "90",
        id: "posview",
        url: "/html/dealer_pos.html"
    });
    $.__views.dealer_pos.add($.__views.posview);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    Ti.App.fireEvent("getSession", {
        session: Ti.App.Properties.getString("session")
    });
    var addOrderComplete = function() {
        goBack();
        Ti.App.fireEvent("app:refreshPage");
        Ti.App.removeEventListener("addOrderComplete", addOrderComplete);
    };
    Ti.App.addEventListener("addOrderComplete", addOrderComplete);
    $.posview.addEventListener("load", function() {
        Ti.App.fireEvent("app:PosParam", {
            session: Ti.App.Properties.getString("session"),
            url: Ti.API.ADDPOS,
            state: Ti.API.GETSTATE,
            product: Ti.API.GETPRODUCT,
            user: Ti.API.GETUSER + Ti.App.Properties.getString("session")
        });
    });
    var triggerAlert = function(e) {
        createAlert(e.tt, e.msg);
        Ti.App.removeEventListener("app:triggerAlert", triggerAlert);
    };
    Ti.App.addEventListener("app:triggerAlert", triggerAlert);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;