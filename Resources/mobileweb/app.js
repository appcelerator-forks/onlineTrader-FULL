function goNav(event) {
    checkSession();
    if (goNav.__isExecuting) return;
    goNav.__isExecuting = true;
    var page = event.source.mod;
    var module = Ti.App.Properties.getString("module");
    var roles = Ti.App.Properties.getString("roles");
    page = roles + "_" + page;
    if (module != page) {
        var navigate = Alloy.createController(page).getView();
        "" != Ti.App.CURRENTWINDOW && removeWindowRelationship();
        setWindowRelationship(navigate);
    }
    setTimeout(function() {
        goNav.__isExecuting = false;
    }, 200);
}

function goBack() {
    var windowtree = Ti.App.WindowCabinet;
    windowtree.length - 1 >= 0 && removeWindowRelationship();
}

function popup(event) {
    var currentTime = new Date();
    if (1e3 > currentTime - clickTime) return;
    clickTime = currentTime;
    var page = event.source.mod;
    var module = Ti.App.Properties.getString("module");
    var roles = Ti.App.Properties.getString("roles");
    page = roles + "_" + page;
    if (module != page) {
        var navigate = Alloy.createController(page).getView();
        setWindowRelationship(navigate);
    }
}

function removeWindowRelationship() {
    Ti.App.CURRENTWINDOW.close({
        transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT
    });
    var tempArr = Ti.App.WindowCabinet;
    tempArr.splice(tempArr.length - 1, 1);
    Ti.App.WindowCabinet = tempArr;
    Ti.App.CURRENTWINDOW = tempArr[tempArr.length - 1];
}

function removeAllWindow() {
    var tempArr = Ti.App.WindowCabinet;
    if (tempArr.length > 0) for (var a = 0; a < tempArr.length; a++) tempArr[a].close();
}

function setWindowRelationship(current) {
    var tempArr = Ti.App.WindowCabinet;
    current.open();
    Ti.App.CURRENTWINDOW = current;
    var tempArr = Ti.App.WindowCabinet;
    tempArr.push(current);
    Ti.App.WindowCabinet = tempArr;
}

function slideEffect() {
    var effect = Ti.UI.createAnimation({
        top: "0",
        left: "0",
        height: Titanium.Platform.displayCaps.platformHeight,
        width: Titanium.Platform.displayCaps.platformWidth,
        duration: 100
    });
    return effect;
}

function goHome() {
    var roles = Ti.App.Properties.getString("roles");
    var module = Ti.App.Properties.getString("module");
    var home = "dispatcher_home";
    if ("dealer" == roles) var home = "dealer_summary";
    if (module != home) {
        var naviHome = Alloy.createController(home).getView();
        naviHome.open();
    }
}

function createAlert(tt, msg) {
    var box = Titanium.UI.createAlertDialog({
        title: tt,
        message: msg
    });
    box.show();
}

function isiOS7Plus() {
    return true;
}

function doLogout() {
    var dialog = Ti.UI.createAlertDialog({
        cancel: 1,
        buttonNames: [ "Cancel", "Confirm" ],
        message: "Would you like to logout?",
        title: "Logout Online Trader"
    });
    dialog.addEventListener("click", function(e) {
        e.index === e.source.cancel;
        if (1 === e.index) {
            var url = Ti.API.LOGOUT + Ti.App.Properties.getString("session");
            var client = Ti.Network.createHTTPClient({
                onload: function() {
                    console.log("logout success");
                    JSON.parse(this.responseText);
                    removeAllWindow();
                    Ti.App.Properties.removeProperty("session");
                    var login = Alloy.createController("index").getView();
                    login.open({
                        transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                    });
                },
                onerror: function() {
                    createAlert("Network declined", "Failed to contact with server. Please make sure your device are connected to internet.");
                },
                timeout: 5e3
            });
            client.open("GET", url);
            client.send();
        }
    });
    console.log("dialog show");
    dialog.show();
}

function checkSession() {
    var ses = Ti.App.Properties.getString("session");
    if (null == ses) {
        var login = Alloy.createController("index").getView();
        login.open({
            transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
        });
    } else {
        var url = Ti.API.CHECKSESSION + ses;
        var client = Ti.Network.createHTTPClient({
            onload: function() {
                var res = JSON.parse(this.responseText);
                if ("success" == res.status) ; else {
                    createAlert("Session End", "Your account are login at another device. Please login again.");
                    var login = Alloy.createController("index").getView();
                    login.open({
                        transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                    });
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
}

function getNotificationNumber(payload) {
    var ses = Ti.App.Properties.getString("session");
    var url = Ti.API.GETNOTISCOUNT + ses;
    var extra = "";
    var target = "";
    var client = Ti.Network.createHTTPClient({
        onload: function() {
            var res = JSON.parse(this.responseText);
            "success" == res.status && (notificationNumber = res.data.total);
            console.log("notification number: " + notificationNumber);
            if (notificationNumber > 1) target = "group"; else {
                target = payload.target;
                extra = payload.extra;
            }
            "running" == app_status ? notificationNav(target, extra) : notificationNav(target, extra);
        },
        onerror: function() {
            createAlert("Network declined", "Failed to contact with server. Please make sure your device are connected to internet.");
        },
        timeout: 1e4
    });
    client.open("GET", url);
    client.send();
}

function notificationNav(target, extra) {
    var param = {
        o_id: extra
    };
    console.log("o_id = " + extra);
    if ("dealer_ordertracking" == target) {
        removeAllWindow();
        Ti.App.Properties.setString("module", target);
        var orderlisting = Alloy.createController("dealer_orderlist").getView();
        setWindowRelationship(orderlisting);
        var orderdetail = Alloy.createController("dealer_orderdetail", param).getView();
        setWindowRelationship(orderdetail);
        var targetWindow = Alloy.createController(target, param).getView();
        setWindowRelationship(targetWindow);
    } else if ("dealer_orderdetail" == target) {
        removeAllWindow();
        Ti.App.Properties.setString("module", target);
        var orderlisting = Alloy.createController("dealer_orderlist").getView();
        setWindowRelationship(orderlisting);
        var targetWindow = Alloy.createController(target, param).getView();
        setWindowRelationship(targetWindow);
    } else if ("group" == target) {
        removeAllWindow();
        var roles = Ti.App.Properties.getString("roles");
        if ("dealer" == roles) {
            target = roles + "_orderlist";
            Ti.App.Properties.setString("module", target);
            var targetWindow = Alloy.createController(target, param).getView();
            setWindowRelationship(targetWindow);
        } else if ("dispatcher" == roles) {
            target = roles + "_home";
            Ti.App.Properties.setString("module", target);
            console.log("order_list:" + target);
            var targetWindow = Alloy.createController(target, param).getView();
            setWindowRelationship(targetWindow);
        }
    } else if ("dispatcher_home" == target) {
        removeAllWindow();
        Ti.App.Properties.setString("module", target);
        var targetWindow = Alloy.createController(target, param).getView();
        setWindowRelationship(targetWindow);
    } else if ("dispatcher_orderdetail" == target) {
        removeAllWindow();
        Ti.App.Properties.setString("module", target);
        var orderlisting = Alloy.createController("dispatcher_orderlist").getView();
        setWindowRelationship(orderlisting);
        var targetWindow = Alloy.createController(target, param).getView();
        setWindowRelationship(targetWindow);
    } else if ("dispatcher_ordertracking" == target) {
        removeAllWindow();
        Ti.App.Properties.setString("module", target);
        var orderlisting = Alloy.createController("dispatcher_orderlist").getView();
        setWindowRelationship(orderlisting);
        var orderdetail = Alloy.createController("dispatcher_orderdetail").getView();
        setWindowRelationship(orderdetail);
        var targetWindow = Alloy.createController(target, param).getView();
        setWindowRelationship(targetWindow);
    }
}

function deviceTokenSuccess(e) {
    Ti.API.info("Device Token: " + e.deviceToken);
    Ti.App.Properties.setString("deviceToken", e.deviceToken);
}

function subscribeDeviceToken(deviceToken, channel) {
    Cloud.Users.login({
        login: "geomilano",
        password: "123456"
    }, function(e) {
        e.success ? Cloud.PushNotifications.subscribe({
            channel: channel,
            device_token: deviceToken,
            type: "gcm"
        }, function(e) {
            e.success || alert("Subscribe error:" + (e.error + ": " + e.message || JSON.stringify(e)));
        }) : alert("Error: " + (e.error + " : " + e.message || JSON.stringify(e)));
    });
}

function deviceTokenError(e) {
    alert("Failed to register for push! " + e.error);
}

var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Ti.API.API_DOMAIN = "onlinetrader.com.my";

Ti.API.USER = "biomas";

Ti.API.KEY = "06b53047cf294f7207789ff5293ad2dc";

Ti.API.CHECKSESSION = "http://" + Ti.API.API_DOMAIN + "/api/checkSession?version=1.0.55&user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.LOGIN = "http://" + Ti.API.API_DOMAIN + "/api/loginUser?version=1.0.55&user=" + Ti.API.USER + "&key=" + Ti.API.KEY;

Ti.API.LOGOUT = "http://" + Ti.API.API_DOMAIN + "/api/logoutUser?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETDAILYSUMMARY = "http://" + Ti.API.API_DOMAIN + "/api/getDailySummaryByDealer?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETSUMMARY = "http://" + Ti.API.API_DOMAIN + "/api/getSummaryByDealer?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETCOMMISSION = "http://" + Ti.API.API_DOMAIN + "/api/getCommissionByDate?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETINVENTORY = "http://" + Ti.API.API_DOMAIN + "/webview/summaryInventory?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETUSER = "http://" + Ti.API.API_DOMAIN + "/api/getUser?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETORDDETAILS = "http://" + Ti.API.API_DOMAIN + "/api/getOrderDetails?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.UPDATEUSER = "http://" + Ti.API.API_DOMAIN + "/api/updateUser?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.UPDATEORDER = "http://" + Ti.API.API_DOMAIN + "/api/updateOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.ADDORDER = "http://" + Ti.API.API_DOMAIN + "/api/addOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.RELEASEORDER = "http://" + Ti.API.API_DOMAIN + "/api/releaseOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.ADDPOS = "http://" + Ti.API.API_DOMAIN + "/api/addPos?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.UPDATEPOS = "http://" + Ti.API.API_DOMAIN + "/api/updatePos?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETPOS = "http://" + Ti.API.API_DOMAIN + "/api/getPos?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETPOSDETAIL = "http://" + Ti.API.API_DOMAIN + "/api/getPosDetails?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.PICKORDER = "http://" + Ti.API.API_DOMAIN + "/api/pickOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.CANCELORDER = "http://" + Ti.API.API_DOMAIN + "/api/cancelOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.COMPLETEORDER = "http://" + Ti.API.API_DOMAIN + "/api/completeOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETDEALERORD = "http://" + Ti.API.API_DOMAIN + "/api/getOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&type=dealer_id&session=";

Ti.API.GETDISPATCHORD = "http://" + Ti.API.API_DOMAIN + "/api/getOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&type=dispatch_id&session=";

Ti.API.GETPNDORDER = "http://" + Ti.API.API_DOMAIN + "/api/getOrder?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&type=status&value=1&session=";

Ti.API.GETSTATISTIC = "http://" + Ti.API.API_DOMAIN + "/api/getStatisticByDate?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETUSERSTAT = "http://" + Ti.API.API_DOMAIN + "/api/getStatisticByUser?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETSTATE = "http://" + Ti.API.API_DOMAIN + "/api/getState?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETPRODUCT = "http://" + Ti.API.API_DOMAIN + "/api/getProduct?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.ADDTRACKING = "http://" + Ti.API.API_DOMAIN + "/api/addTrackingLog?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETTRACKING = "http://" + Ti.API.API_DOMAIN + "/api/getOrderTracking?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETDATELIST = "http://" + Ti.API.API_DOMAIN + "/api/getMonthYear?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETDONELIST = "http://" + Ti.API.API_DOMAIN + "/api/getDoneList?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.SETUNREAD = "http://" + Ti.API.API_DOMAIN + "/api/unsetUserNotification?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETNOTISCOUNT = "http://" + Ti.API.API_DOMAIN + "/api/totalUserNotificationByUser?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETDAILYSUMMARYBYMONTH = "http://" + Ti.API.API_DOMAIN + "/api/getDailySummaryByMonth?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETDEALERRANKINGBYMONTH = "http://" + Ti.API.API_DOMAIN + "/api/getMonthlyRankingByDealer?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.API.GETLOCATIONRANKINGBYMONTH = "http://" + Ti.API.API_DOMAIN + "/api/getMonthlyRankingByLocation?user=" + Ti.API.USER + "&key=" + Ti.API.KEY + "&session=";

Ti.CURRENTWINDOW = "";

Ti.App.CURRENTWINDOW = "";

Ti.App.WindowCabinet = [];

Ti.App.Payload = "";

Alloy.Globals.deviceHeight = Ti.Platform.displayCaps.platformHeight;

Alloy.Globals.osname = "mobileweb";

var XHR = require("lib/xhr");

var xhr = new XHR();

var redirect = false;

var notificationNumber = 0;

var app_status = "";

xhr.clean();

var clickTime = null;

if ("android" == Alloy.Globals.osname) {
    var CloudPush = require("ti.cloudpush");
    var Cloud = require("ti.cloud");
    CloudPush.addEventListener("callback", function(evt) {
        console.log("call back!");
        var payload = JSON.parse(evt.payload);
        Ti.App.Payload = payload;
        if (redirect) if ("not_running" == app_status) ; else {
            redirect = false;
            getNotificationNumber(payload);
        } else {
            var current_controller = Ti.App.Properties.getString("controller");
            console.log(current_controller + "-" + payload.target);
            current_controller == payload.target && Ti.App.fireEvent("app:refresh");
        }
    });
    CloudPush.addEventListener("trayClickLaunchedApp", function() {
        redirect = true;
        app_status = "not_running";
        console.log("app not running");
        getNotificationNumber(Ti.App.Payload);
    });
    CloudPush.addEventListener("trayClickFocusedApp", function() {
        redirect = true;
        app_status = "running";
        console.log("app running");
    });
    CloudPush.retrieveDeviceToken({
        success: deviceTokenSuccess,
        error: deviceTokenError
    });
}

Alloy.createController("index");