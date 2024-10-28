var update = false;
var binaryappid = 35612;
var url = "wss://ws.binaryws.com/websockets/v3?app_id=" + binaryappid + "&l=EN";
var ws, token, market, tf, curency;
var lastReqTime = 0;
var newReqTime = 0;
var counterTime = 0;
var isLive = false;
var OnTrade = false;
var signalTrading = "NETRAL";
var signalButton = "kosong";
var timeout = null;
//global transaksi var
var lastStake = 0;
var contractId = 0;
var tradeResult = 1;
var lastSignal = "NETRAL";
var lastOpenTime;
var isNewBar = false;
var barrierup, barrierdn;
var lastRefNumber, transactionId, buyPrice, sellPrice, profitLoss, payout, longCode, shortCode, purchaseTime, shellTime, entrySpot, exitSpot, isSold, isExpire, isAllowSell, tradeStatus, dateExpired;
var pattern = [];
var candles_o = [];
var candles_h = []
var candles_l = [];
var candles_c = [];
var candles_t = [];
var ticker = [];
var af;
var shc;
var candlex = [];
var trexid = [];
var cok ="0";
market = "R_100";
tf = 300;

function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += +data[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}


function printText(message) {
    $('#showtext').html(message);
}

function showNotification(message) {
    $('#notificationtext').html(message);
    setTimeout(() => {
        const box = document.getElementById('notificationtext');
        notificationtext.style.display = 'none';
    }, 2000);
}

autotrade.addEventListener('click', function(e) {
    if ($('#autotrade').is(":checked") == true) {
        $('#tblresult tbody').empty();
        $('#lblPL').html('0.00');
        $('#lblTO').html('0.00');
        lastStake = parseFloat($('#stake').val()).toFixed(2);
    }
}, false);

btnconnect.addEventListener('click', function(e) {
    if ($('#token').val().length > 0) {
        $('#autotrade').prop('checked', false);
        token = $('#token').val().trim();
        Init();
    } else {
        //showAlert("Notification", "Please insert API Token !");
    }
}, false);

logout.addEventListener('click', function(e) {
    Forget_all_spot();
    Forget_all_price_proposal();
    clearCandle();
    $('autotrade').prop('checked', false);
    signalTrading = "NETRAL";
    $('#splash').show();
    $('#utama').hide();
    $('#tblresult tbody').empty();
    $('#lblPL').html('0.00');
    $('#lblTO').html('0.00');
    $('#contractinfo').hide();
    SignOut();
}, false);

function btncall() {
    signalButton = "munggah";
    setTimeout(function() {
        signalButton = "kosong";
    }, 2000);
}

function btnput() {
    signalButton = "mudun";
    setTimeout(function() {
        signalButton = "kosong";
    }, 2000);
}

symbol.addEventListener('change', function(e) {
    var val = $("#symbol option:selected").text();
    $('#symbolname').html(val);
    market = $('#symbol').val();
    Forget_all_spot();
    clearCandle();
    Tick_History();
    switch ($('#symbol').val()) {
        case "R_100":
            document.getElementById("barrier1").value = "+0.82";
            document.getElementById("barrier2").value = "-0.82";
            break;
        case "R_75":
            document.getElementById("barrier1").value = "+48.7481";
            document.getElementById("barrier2").value = "-48.7481";
            break;
        case "R_50":
            document.getElementById("barrier1").value = "+0.0758";
            document.getElementById("barrier2").value = "-0.0758";
            break;
        case "R_25":
            document.getElementById("barrier1").value = "+0.302";
            document.getElementById("barrier2").value = "-0.302";
            break;
        case "R_10":
            document.getElementById("barrier1").value = "+0.378";
            document.getElementById("barrier2").value = "-0.378";
            break;
    }

}, false);




aftermarti.addEventListener('change', function(e) {
    af = $('#aftermarti').val();
}, false);




contract.addEventListener('change', function(e) {
    switch ($('#contract').val()) {
        case "RF":
            $('#barrier-set').hide();
            $('#hlmenu').hide();
            $('#rfmenu').show();
            break;
        case "HLH":
            $('#barrier-set').show();
            $('#hlmenu').show();
            $('#rfmenu').hide();
            break;
    }

}, false);

falsesignal.addEventListener('change', function(e) {
    switch ($('#falsesignal').val()) {
        case "stoptrade":
            break;
        case "continue":
            break;
        case "switch":
            break;
        case "newanalyze":
            break;
    }
}, false);

signaltotrade.addEventListener('change', function(e) {
    switch ($('#signaltotrade').val()) {
        case "hedge":
            break;
        case "standart":
            break;
    }
}, false);

CheckStatus();
TradeMonitor();


function stopTrade() {
    var maxStake = $('#maxstake').val();
    if (parseFloat(lastStake) >= parseFloat(maxStake)) {
        $('#autotrade').prop('checked', false);
        showNotification("Max Stake reached");
    }
}

function CheckStatus() {
    var status = setInterval(function() {
        //console.log(lastReqTime);
        if (lastReqTime > 0) {
            if (newReqTime != lastReqTime) {
                newReqTime = lastReqTime;
                counterTime = 0;
            } else {
                counterTime++;
            }
        } else {
            counterTime = 0;
        }
        if (counterTime > 10) {
            isLive = false;
            counterTime = 0;
            if (navigator.onLine) {
                Init();
            } else {
                //console.log("Periksa koneksi internet anda !");
            }
        }
        //console.log(counterTime);
    }, 1000);
}

function cekDetik() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
}

function TradeMonitor() {
    var monitor = setInterval(function() {
        if (OnTrade == false) {
            if (signalTrading != "NETRAL") {
                OnTrade == true;
                lastSignal = signalTrading;
                signalTrading = "NETRAL";
                //clear status
                $('#buyprice').html('');
                $('#longcode').html('');
                $('#refnumber').html('');
                $('#payout').html('');
                $('#entryspot').html('');
                $('#purchasetime').html('');
                $('#indicative').html('');
                $('#profitloss').html('');
                $('#traderesult').html('');
                $('#stakesekarang').html('');
                
                //normalkan stake
                if (parseFloat(lastStake) >= parseFloat($('#maxstake').val())) {
                    switch ($('#aftermarti').val()) {
                        case "stopstake":
                            $('#autotrade').prop('checked', false);
                            lastStake = parseFloat($('#stake').val()).toFixed(2);
                            break;
                        case "resetstake":
                            lastStake = parseFloat($('#stake').val()).toFixed(2);
                            //      lastSignal=signalTrading;
                            break;
                    }
                }
                //console.log(ys);
                switch ($('#contract').val()) {
                    case "RF":
                        switch ($('#signaltotrade').val()) {
                            case "hedge":
                                if (lastSignal == "UP") {
                                    BuyContractNoBarrier(lastStake, "CALL", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val());
                                    setTimeout(function() {
                                        BuyContractNoBarrier(lastStake, "PUT", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val());
                                    }, 1000);
                                } else {
                                    BuyContractNoBarrier(lastStake, "PUT", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val());
                                    setTimeout(function() {
                                        BuyContractNoBarrier(lastStake, "CALL", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val());;
                                    }, 1000);
                                }
                                break;
                            case "standart":
                                if (lastSignal == "UP") {
                                    BuyContractNoBarrier(lastStake, "CALL", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val());
                                } else {
                                    BuyContractNoBarrier(lastStake, "PUT", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val());
                                }
                                break;
                        }
                        break;
                    case "HLH":
                        switch ($('#signaltotrade').val()) {
                            case "hedge":
                                if (lastSignal == "UP") {
                                    barrierup = $('#barrier1').val();
                                    barrierdn = $('#barrier2').val();
                                    BuyContractSingleBarrier(lastStake, "CALL", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val(), barrierup);
                                    setTimeout(function() {
                                        BuyContractSingleBarrier(lastStake, "PUT", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val(), barrierdn);
                                    }, 1000);
                                } else {
                                    barrierup = $('#barrier1').val();
                                    barrierdn = $('#barrier2').val();
                                    BuyContractSingleBarrier(lastStake, "PUT", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val(), barrierup);
                                    setTimeout(function() {
                                        BuyContractSingleBarrier(lastStake, "CALL", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val(), barrierdn);
                                    }, 1000);
                                }
                                break;
                            case "standart":
                                if (lastSignal == "UP") {
                                    barrierup = $('#barrier1').val();
                                    BuyContractSingleBarrier(lastStake, "CALL", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val(), barrierup);
                                } else {
                                    barrierdn = $('#barrier2').val();
                                    BuyContractSingleBarrier(lastStake, "PUT", $('#duration').val(), $('#duration-unit').val(), $('#symbol').val(), barrierdn);
                                }
                                break;
                        }
                        break;
                }
            }
        }
    }, 1000);
}

function Tick_History() {
    var msg = {
        ticks_history: market,
        end: "latest",
        style: "candles",
        granularity: 60,
        count: tf,
        subscribe: 1
    }
    ws.send(JSON.stringify(msg));
}

function GetSettings() {
    var msg = {
        get_settings: 1
    }
    ws.send(JSON.stringify(msg));
}

function Authorize() {
    var msg = {
        authorize: token
    }
    ws.send(JSON.stringify(msg));
}

function Forget_all_spot() {
    var msg = {
        forget_all: ["ticks", "candles"]
    }
    ws.send(JSON.stringify(msg));

}



function Forget_all_price_proposal() {
    var msg = {
        forget_all: ["proposal", "proposal_array", "proposal_open_contract", "transaction", "portfolio"]
    }
    ws.send(JSON.stringify(msg));
}


function SellContract() {
    if (contractId != 0 && isAllowSell == true) {
        var msg = {
            sell: contractId
        }
        ws.send(JSON.stringify(msg));
    }
}

function BuyContractNoBarrier(amount, contract_type, duration, duration_unit, market) {
    //console.log('Melakukan transaksi .. ' + market + " durasi : " +  duration + " " + duration_unit + " stake : " + amount + " kontract : " + contract_type);
    var msg = {
        buy: 1,
        price: amount,
        parameters: {
            amount: amount,
            basis: "stake",
            contract_type: contract_type,
            currency: curency,
            duration: duration,
            duration_unit: duration_unit,
            symbol: market
        }
    }
    ws.send(JSON.stringify(msg));
}

function BuyContractMultiBarrier(amount, contract_type, duration, duration_unit, market, barrier, barrier2) {
    //console.log('Melakukan transaksi .. ' + market + " durasi : " +  duration + " " + duration_unit + " stake : " + amount + " kontract : " + contract_type);
    var msg = {
        buy: 1,
        price: amount,
        parameters: {
            amount: amount,
            basis: "stake",
            contract_type: contract_type,
            currency: curency,
            duration: duration,
            duration_unit: duration_unit,
            symbol: market,
            barrier: barrier,
            barrier2: barrier2
        }
    }
    ws.send(JSON.stringify(msg));
}

function BuyContractSingleBarrier(amount, contract_type, duration, duration_unit, market, barrier) {
    //console.log('Melakukan transaksi .. ' + market + " durasi : " +  duration + " " + duration_unit + " stake : " + amount + " kontract : " + contract_type);
    var msg = {
        buy: 1,
        price: amount,
        parameters: {
            amount: amount,
            basis: "stake",
            contract_type: contract_type,
            currency: curency,
            duration: duration,
            duration_unit: duration_unit,
            symbol: market,
            barrier: barrier
        }
    }
    ws.send(JSON.stringify(msg));
}

function ProposalOpenContract() {
    var msg = {
        proposal_open_contract: 1,
        contract_id: contractId,
        subscribe: 1
    }
    ws.send(JSON.stringify(msg));
}

function Balance() {
    var msg = {
        balance: 1,
        subscribe: 1
    }
    ws.send(JSON.stringify(msg));
}


function SignOut() {
    var msg = {
        logout: 1
    }
    ws.send(JSON.stringify(msg));
}

function Init() {
        ws = new WebSocket(url);
        ws.onmessage = function(msg) {
            var data = JSON.parse(msg.data);
            switch (data.msg_type) {
                case "authorize":
                    //console.log(msg);
                    if (data.hasOwnProperty('error')) {
                        $('autotrade').prop('checked', false);
                        $('#splash').show();
                        $('#utama').hide();
                        showNotification("Warrning", data.error.message);
                    } else {
                        $('#fullname').html(data.authorize.fullname);
                        $('#email').html(data.authorize.email);
                        $('#balance').html(data.authorize.balance);
                        $('#loginid').html(data.authorize.loginid);
                        $('#curency').html(data.authorize.currency);
                        curency = data.authorize.currency;
                        var scp = data.authorize.scopes;
                        var bufscp = "";
                        for (var t = 0; t < scp.length; t++) {
                            if (t == 0) {
                                bufscp = capitalizeFirstLetter(scp[t]);
                            } else {
                                bufscp = bufscp + ", " + capitalizeFirstLetter(scp[t]);
                            }
                        }
                        $('#scope').html(bufscp);
                        $('#splash').hide();
                        $('#utama').show();
                        Balance();
                    }
                    break;
                case "balance":
                    if (data.hasOwnProperty('error')) {
                        //console.log(data.error.message);
                    } else {
                        $('#balance').html(data.balance.balance);
                    }
                    break;
                case "candles":
                    if (data.hasOwnProperty('error')) {
                        //console.log(data.error.message);
                    } else {
                        for (var i = 0; i < data.candles.length; i++) {
                            var op = data.candles[i].open;
                            var hl = data.candles[i].high;
                            var lo = data.candles[i].low;
                            var cl = data.candles[i].close;
                            var tm = data.candles[i].epoch;
                            candles_o.push(op);
                            candles_h.push(hl);
                            candles_l.push(lo);
                            candles_c.push(cl);
                            candles_t.push(tm);
                            //console.log(op);
                        }
                    }
                    break;
                case "active_symbols":
                    if (data.hasOwnProperty('error')) {
                        console.log(data.error.message);
                    } else {
                        $('#symbol').find('option').remove()
                        for (var s = 0; s < data.active_symbols.length - 1; s++) {
                            var symb = data.active_symbols[s].symbol;
                            var sname = data.active_symbols[s].display_name;
                            var stype = data.active_symbols[s].market;
                            var sopen = data.active_symbols[s].exchange_is_open;
                            if ((stype == "forex" || stype == "volidx" || stype == "indices") && sopen == "1") {
                                if (symb == "R_100") {
                                    $('#symbol').append("<option value='" + symb + "' selected>" + sname + "</option>");
                                } else {
                                    $('#symbol').append("<option value='" + symb + "'>" + sname + "</option>");
                                }
                            }
                        }
                    }
                    break;
                case "ohlc":
                    if (data.hasOwnProperty('error')) {
                        //console.log(data.error.message);
                    } else {
                        lastReqTime = data.ohlc.epoch;
                        var open_time = data.ohlc.open_time;
                        var op = data.ohlc.open;
                        var hl = data.ohlc.high;
                        var lo = data.ohlc.low;
                        var cl = data.ohlc.close;
                        var spot = data.ohlc.close;
                         //console.log(new Date(open_time*1000)-1);
                        //spot
                        var ts = "N";
                        var detol = getSecond(lastReqTime);
                        var serverTime = FromUnix(lastReqTime);
                        var price = $('#spot').text();
                        if (price > 0) {
                            if (price < spot) {
                                $('#spot').css('color', '#1fc7ff');
                                ts = "U";
                            } else if (price > spot) {
                                $('#spot').css('color', '#ff471a');
                                ts = "D";
                            } else {
                                $('#spot').css('color', 'black');
                                ts = "N";
                            }
                        } else {
                            $('#spot').css('color', 'black');
                            ts = "N";
                        }
                        $('#spot').html(spot);
                        $('#servertime').html(serverTime);
                        //pattern
                        pattern.push(ts);
                        if (pattern.length > 100) {
                            pattern.splice(0, 1); //delete element array pertama
                        }
                        ticker.push(spot);
                        if (ticker.length > 20) {
                            ticker.splice(0, 1); //delete element array pertama
                        }
                        candlex.push(spot);
                        if (candlex.length > 20) {
                            candlex.splice(0, 1); //delete element array pertama
                        }
                        
                        var dom = document.getElementById('candleStickChart');
                        var myChart = echarts.init(dom, null, {
                                        renderer: 'canvas',
                                        useDirtyRect: false
                                    });
                        var app = {};
                        var option;
                        
                        
                        var today = new Date(lastReqTime * 1000);
                        var mm = today.getHours() * 60 + today.getMinutes() % 60;
                        var mm1 = today.getHours() * 60 + today.getMinutes() - 1 % 60;
                        var mm2 = today.getHours() * 60 + today.getMinutes() - 2 % 60;
                        var mm3 = today.getHours() * 60 + today.getMinutes() - 3 % 60;
                        var mm4 = today.getHours() * 60 + today.getMinutes() - 4 % 60;
                        var mm5 = today.getHours() * 60 + today.getMinutes() - 5 % 60;
                        var mm6 = today.getHours() * 60 + today.getMinutes() - 6 % 60;
                        var mm7 = today.getHours() * 60 + today.getMinutes() - 7 % 60;
                        var mm8 = today.getHours() * 60 + today.getMinutes() - 8 % 60;
                        var mm9 = today.getHours() * 60 + today.getMinutes() - 9 % 60;
                        var mm10 = today.getHours() * 60 + today.getMinutes() - 10 % 60;
                        var mm11 = today.getHours() * 60 + today.getMinutes() - 11 % 60;
                        var mm12 = today.getHours() * 60 + today.getMinutes() - 12 % 60;
                        var mm13 = today.getHours() * 60 + today.getMinutes() - 13 % 60;
                        var mm14 = today.getHours() * 60 + today.getMinutes() - 14 % 60;
                        var mm15 = today.getHours() * 60 + today.getMinutes() - 15 % 60;
                        var mm16 = today.getHours() * 60 + today.getMinutes() - 16 % 60;
                        var mm17 = today.getHours() * 60 + today.getMinutes() - 17 % 60;
                        var mm18 = today.getHours() * 60 + today.getMinutes() - 18 % 60;
                        var mm19 = today.getHours() * 60 + today.getMinutes() - 19 % 60;
                        var mm20 = today.getHours() * 60 + today.getMinutes() - 20 % 60;
                        var mm21 = today.getHours() * 60 + today.getMinutes() - 21 % 60;
                        var mm22 = today.getHours() * 60 + today.getMinutes() - 22 % 60;
                        var mm23 = today.getHours() * 60 + today.getMinutes() - 23 % 60;
                        var mm24 = today.getHours() * 60 + today.getMinutes() - 24 % 60;
                        var mm25 = today.getHours() * 60 + today.getMinutes() - 25 % 60;
                        var mm26 = today.getHours() * 60 + today.getMinutes() - 26 % 60;
                        var mm27 = today.getHours() * 60 + today.getMinutes() - 27 % 60;
                        var mm28 = today.getHours() * 60 + today.getMinutes() - 28 % 60;
                        var mm29 = today.getHours() * 60 + today.getMinutes() - 29 % 60;
                        var mm30 = today.getHours() * 60 + today.getMinutes() - 30 % 60;
                        var mm31 = today.getHours() * 60 + today.getMinutes() - 31 % 60;
                        var mm32 = today.getHours() * 60 + today.getMinutes() - 32 % 60;
                        var mm33 = today.getHours() * 60 + today.getMinutes() - 33 % 60;
                        var mm34 = today.getHours() * 60 + today.getMinutes() - 34 % 60;
                        var mm35 = today.getHours() * 60 + today.getMinutes() - 35 % 60;
                        var mm36 = today.getHours() * 60 + today.getMinutes() - 36 % 60;
                        var mm37 = today.getHours() * 60 + today.getMinutes() - 37 % 60;
                        var mm38 = today.getHours() * 60 + today.getMinutes() - 38 % 60;
                        var mm39 = today.getHours() * 60 + today.getMinutes() - 39 % 60;
                        var mm40 = today.getHours() * 60 + today.getMinutes() - 40 % 60;
                        var mm41 = today.getHours() * 60 + today.getMinutes() - 41 % 60;
                        var mm42 = today.getHours() * 60 + today.getMinutes() - 42 % 60;
                        var mm43 = today.getHours() * 60 + today.getMinutes() - 43 % 60;
                        var mm44 = today.getHours() * 60 + today.getMinutes() - 44 % 60;
                        var mm45 = today.getHours() * 60 + today.getMinutes() - 45 % 60;
                        var mm46 = today.getHours() * 60 + today.getMinutes() - 46 % 60;
                        var mm47 = today.getHours() * 60 + today.getMinutes() - 47 % 60;
                        var mm48 = today.getHours() * 60 + today.getMinutes() - 48 % 60;
                        var mm49 = today.getHours() * 60 + today.getMinutes() - 49 % 60;
                        var mm50 = today.getHours() * 60 + today.getMinutes() - 50 % 60;
                        var mm51 = today.getHours() * 60 + today.getMinutes() - 51 % 60;
                        var mm52 = today.getHours() * 60 + today.getMinutes() - 52 % 60;
                        var mm53 = today.getHours() * 60 + today.getMinutes() - 53 % 60;
                        var mm54 = today.getHours() * 60 + today.getMinutes() - 54 % 60;
                        var mm55 = today.getHours() * 60 + today.getMinutes() - 55 % 60;
                        var mm56 = today.getHours() * 60 + today.getMinutes() - 56 % 60;
                        var mm57 = today.getHours() * 60 + today.getMinutes() - 57 % 60;
                        var mm58 = today.getHours() * 60 + today.getMinutes() - 58 % 60;
                        var mm59 = today.getHours() * 60 + today.getMinutes() - 59 % 60;
                        var mm60 = today.getHours() * 60 + today.getMinutes() - 60 % 60;
                        var mm61 = today.getHours() * 60 + today.getMinutes() - 61 % 60;
                        var mm62 = today.getHours() * 60 + today.getMinutes() - 62 % 60;
                        var mm63 = today.getHours() * 60 + today.getMinutes() - 63 % 60;
                        var mm64 = today.getHours() * 60 + today.getMinutes() - 64 % 60;
                        var mm65 = today.getHours() * 60 + today.getMinutes() - 65 % 60;
                        var mm66 = today.getHours() * 60 + today.getMinutes() - 66 % 60;
                        var mm67 = today.getHours() * 60 + today.getMinutes() - 67 % 60;
                        var mm68 = today.getHours() * 60 + today.getMinutes() - 68 % 60;
                        var mm69 = today.getHours() * 60 + today.getMinutes() - 69 % 60;
                        var mm70 = today.getHours() * 60 + today.getMinutes() - 70 % 60;
                        var mm71 = today.getHours() * 60 + today.getMinutes() - 71 % 60;
                        var mm72 = today.getHours() * 60 + today.getMinutes() - 72 % 60;
                        var mm73 = today.getHours() * 60 + today.getMinutes() - 73 % 60;
                        var mm74 = today.getHours() * 60 + today.getMinutes() - 74 % 60;
                        var mm75 = today.getHours() * 60 + today.getMinutes() - 75 % 60;
                        var mm76 = today.getHours() * 60 + today.getMinutes() - 76 % 60;
                        var mm77 = today.getHours() * 60 + today.getMinutes() - 77 % 60;
                        var mm78 = today.getHours() * 60 + today.getMinutes() - 78 % 60;
                        var mm79 = today.getHours() * 60 + today.getMinutes() - 79 % 60;
                        var mm80 = today.getHours() * 60 + today.getMinutes() - 80 % 60;
                        var mm81 = today.getHours() * 60 + today.getMinutes() - 81 % 60;
                        var mm82 = today.getHours() * 60 + today.getMinutes() - 82 % 60;
                        var mm83 = today.getHours() * 60 + today.getMinutes() - 83 % 60;
                        var mm84 = today.getHours() * 60 + today.getMinutes() - 84 % 60;
                        var mm85 = today.getHours() * 60 + today.getMinutes() - 85 % 60;
                        var mm86 = today.getHours() * 60 + today.getMinutes() - 86 % 60;
                        var mm87 = today.getHours() * 60 + today.getMinutes() - 87 % 60;
                        var mm88 = today.getHours() * 60 + today.getMinutes() - 88 % 60;
                        var mm89 = today.getHours() * 60 + today.getMinutes() - 89 % 60;
                        var mm90 = today.getHours() * 60 + today.getMinutes() - 90 % 60;
                        var mm91 = today.getHours() * 60 + today.getMinutes() - 91 % 60;
                        var mm92 = today.getHours() * 60 + today.getMinutes() - 92 % 60;
                        var mm93 = today.getHours() * 60 + today.getMinutes() - 93 % 60;
                        var mm94 = today.getHours() * 60 + today.getMinutes() - 94 % 60;
                        var mm95 = today.getHours() * 60 + today.getMinutes() - 95 % 60;
                        var mm96 = today.getHours() * 60 + today.getMinutes() - 96 % 60;
                        var mm97 = today.getHours() * 60 + today.getMinutes() - 97 % 60;
                        var mm98 = today.getHours() * 60 + today.getMinutes() - 98 % 60;
                        var mm99 = today.getHours() * 60 + today.getMinutes() - 99 % 60;
                        var mm100 = today.getHours() * 60 + today.getMinutes() - 100 % 60;
                        var mm101 = today.getHours() * 60 + today.getMinutes() - 101 % 60;
                        var mm102 = today.getHours() * 60 + today.getMinutes() - 102 % 60;
                        var mm103 = today.getHours() * 60 + today.getMinutes() - 103 % 60;
                        var mm104 = today.getHours() * 60 + today.getMinutes() - 104 % 60;
                        var mm105 = today.getHours() * 60 + today.getMinutes() - 105 % 60;
                        var mm106 = today.getHours() * 60 + today.getMinutes() - 106 % 60;
                        var mm107 = today.getHours() * 60 + today.getMinutes() - 107 % 60;
                        var mm108 = today.getHours() * 60 + today.getMinutes() - 108 % 60;
                        var mm109 = today.getHours() * 60 + today.getMinutes() - 109 % 60;
                        var mm110 = today.getHours() * 60 + today.getMinutes() - 110 % 60;
                        var mm111 = today.getHours() * 60 + today.getMinutes() - 111 % 60;
                        var mm112 = today.getHours() * 60 + today.getMinutes() - 112 % 60;
                        var mm113 = today.getHours() * 60 + today.getMinutes() - 113 % 60;
                        var mm114 = today.getHours() * 60 + today.getMinutes() - 114 % 60;
                        var mm115 = today.getHours() * 60 + today.getMinutes() - 115 % 60;
                        var mm116 = today.getHours() * 60 + today.getMinutes() - 116 % 60;
                        var mm117 = today.getHours() * 60 + today.getMinutes() - 117 % 60;
                        var mm118 = today.getHours() * 60 + today.getMinutes() - 118 % 60;
                        var mm119 = today.getHours() * 60 + today.getMinutes() - 119 % 60;
                        var mm120 = today.getHours() * 60 + today.getMinutes() - 120 % 60;
                        var mm121 = today.getHours() * 60 + today.getMinutes() - 121 % 60;
                        var mm122 = today.getHours() * 60 + today.getMinutes() - 122 % 60;
                        var mm123 = today.getHours() * 60 + today.getMinutes() - 123 % 60;
                        var mm124 = today.getHours() * 60 + today.getMinutes() - 124 % 60;
                        var mm125 = today.getHours() * 60 + today.getMinutes() - 125 % 60;
                        var mm126 = today.getHours() * 60 + today.getMinutes() - 126 % 60;
                        var mm127 = today.getHours() * 60 + today.getMinutes() - 127 % 60;
                        var mm128 = today.getHours() * 60 + today.getMinutes() - 128 % 60;
                        var mm129 = today.getHours() * 60 + today.getMinutes() - 129 % 60;
                        var mm130 = today.getHours() * 60 + today.getMinutes() - 130 % 60;
                        var mm131 = today.getHours() * 60 + today.getMinutes() - 131 % 60;
                        var mm132 = today.getHours() * 60 + today.getMinutes() - 132 % 60;
                        var mm133 = today.getHours() * 60 + today.getMinutes() - 133 % 60;
                        var mm134 = today.getHours() * 60 + today.getMinutes() - 134 % 60;
                        var mm135 = today.getHours() * 60 + today.getMinutes() - 135 % 60;
                        var mm136 = today.getHours() * 60 + today.getMinutes() - 136 % 60;
                        var mm137 = today.getHours() * 60 + today.getMinutes() - 137 % 60;
                        var mm138 = today.getHours() * 60 + today.getMinutes() - 138 % 60;
                        var mm139 = today.getHours() * 60 + today.getMinutes() - 139 % 60;
                        var mm140 = today.getHours() * 60 + today.getMinutes() - 140 % 60;
                        var mm141 = today.getHours() * 60 + today.getMinutes() - 141 % 60;
                        var mm142 = today.getHours() * 60 + today.getMinutes() - 142 % 60;
                        var mm143 = today.getHours() * 60 + today.getMinutes() - 143 % 60;
                        var mm144 = today.getHours() * 60 + today.getMinutes() - 144 % 60;
                        var mm145 = today.getHours() * 60 + today.getMinutes() - 145 % 60;
                        var mm146 = today.getHours() * 60 + today.getMinutes() - 146 % 60;
                        var mm147 = today.getHours() * 60 + today.getMinutes() - 147 % 60;
                        var mm148 = today.getHours() * 60 + today.getMinutes() - 148 % 60;
                        var mm149 = today.getHours() * 60 + today.getMinutes() - 149 % 60;
                        var mm150 = today.getHours() * 60 + today.getMinutes() - 150 % 60;
                        var mm151 = today.getHours() * 60 + today.getMinutes() - 151 % 60;
                        var mm152 = today.getHours() * 60 + today.getMinutes() - 152 % 60;
                        var mm153 = today.getHours() * 60 + today.getMinutes() - 153 % 60;
                        var mm154 = today.getHours() * 60 + today.getMinutes() - 154 % 60;
                        var mm155 = today.getHours() * 60 + today.getMinutes() - 155 % 60;
                        var mm156 = today.getHours() * 60 + today.getMinutes() - 156 % 60;
                        var mm157 = today.getHours() * 60 + today.getMinutes() - 157 % 60;
                        var mm158 = today.getHours() * 60 + today.getMinutes() - 158 % 60;
                        var mm159 = today.getHours() * 60 + today.getMinutes() - 159 % 60;
                        var mm160 = today.getHours() * 60 + today.getMinutes() - 160 % 60;
                        var mm161 = today.getHours() * 60 + today.getMinutes() - 161 % 60;
                        var mm162 = today.getHours() * 60 + today.getMinutes() - 162 % 60;
                        var mm163 = today.getHours() * 60 + today.getMinutes() - 163 % 60;
                        var mm164 = today.getHours() * 60 + today.getMinutes() - 164 % 60;
                        var mm165 = today.getHours() * 60 + today.getMinutes() - 165 % 60;
                        var mm166 = today.getHours() * 60 + today.getMinutes() - 166 % 60;
                        var mm167 = today.getHours() * 60 + today.getMinutes() - 167 % 60;
                        var mm168 = today.getHours() * 60 + today.getMinutes() - 168 % 60;
                        var mm169 = today.getHours() * 60 + today.getMinutes() - 169 % 60;
                        var mm170 = today.getHours() * 60 + today.getMinutes() - 170 % 60;
                        var mm171 = today.getHours() * 60 + today.getMinutes() - 171 % 60;
                        var mm172 = today.getHours() * 60 + today.getMinutes() - 172 % 60;
                        var mm173 = today.getHours() * 60 + today.getMinutes() - 173 % 60;
                        var mm174 = today.getHours() * 60 + today.getMinutes() - 174 % 60;
                        var mm175 = today.getHours() * 60 + today.getMinutes() - 175 % 60;
                        var mm176 = today.getHours() * 60 + today.getMinutes() - 176 % 60;
                        var mm177 = today.getHours() * 60 + today.getMinutes() - 177 % 60;
                        var mm178 = today.getHours() * 60 + today.getMinutes() - 178 % 60;
                        var mm179 = today.getHours() * 60 + today.getMinutes() - 179 % 60;
                        var mm180 = today.getHours() * 60 + today.getMinutes() - 180 % 60;
                        var mm181 = today.getHours() * 60 + today.getMinutes() - 181 % 60;
                        var mm182 = today.getHours() * 60 + today.getMinutes() - 182 % 60;
                        var mm183 = today.getHours() * 60 + today.getMinutes() - 183 % 60;
                        var mm184 = today.getHours() * 60 + today.getMinutes() - 184 % 60;
                        var mm185 = today.getHours() * 60 + today.getMinutes() - 185 % 60;
                        var mm186 = today.getHours() * 60 + today.getMinutes() - 186 % 60;
                        var mm187 = today.getHours() * 60 + today.getMinutes() - 187 % 60;
                        var mm188 = today.getHours() * 60 + today.getMinutes() - 188 % 60;
                        var mm189 = today.getHours() * 60 + today.getMinutes() - 189 % 60;
                        var mm190 = today.getHours() * 60 + today.getMinutes() - 190 % 60;
                        var mm191 = today.getHours() * 60 + today.getMinutes() - 191 % 60;
                        var mm192 = today.getHours() * 60 + today.getMinutes() - 192 % 60;
                        var mm193 = today.getHours() * 60 + today.getMinutes() - 193 % 60;
                        var mm194 = today.getHours() * 60 + today.getMinutes() - 194 % 60;
                        var mm195 = today.getHours() * 60 + today.getMinutes() - 195 % 60;
                        var mm196 = today.getHours() * 60 + today.getMinutes() - 196 % 60;
                        var mm197 = today.getHours() * 60 + today.getMinutes() - 197 % 60;
                        var mm198 = today.getHours() * 60 + today.getMinutes() - 198 % 60;
                        var mm199 = today.getHours() * 60 + today.getMinutes() - 199 % 60;
                        var mm200 = today.getHours() * 60 + today.getMinutes() - 200 % 60;
                        var mm201 = today.getHours() * 60 + today.getMinutes() - 201 % 60;
                        var mm202 = today.getHours() * 60 + today.getMinutes() - 202 % 60;
                        var mm203 = today.getHours() * 60 + today.getMinutes() - 203 % 60;
                        var mm204 = today.getHours() * 60 + today.getMinutes() - 204 % 60;
                        var mm205 = today.getHours() * 60 + today.getMinutes() - 205 % 60;
                        var mm206 = today.getHours() * 60 + today.getMinutes() - 206 % 60;
                        var mm207 = today.getHours() * 60 + today.getMinutes() - 207 % 60;
                        var mm208 = today.getHours() * 60 + today.getMinutes() - 208 % 60;
                        var mm209 = today.getHours() * 60 + today.getMinutes() - 209 % 60;
                        var mm210 = today.getHours() * 60 + today.getMinutes() - 210 % 60;
                        var mm211 = today.getHours() * 60 + today.getMinutes() - 211 % 60;
                        var mm212 = today.getHours() * 60 + today.getMinutes() - 212 % 60;
                        var mm213 = today.getHours() * 60 + today.getMinutes() - 213 % 60;
                        var mm214 = today.getHours() * 60 + today.getMinutes() - 214 % 60;
                        var mm215 = today.getHours() * 60 + today.getMinutes() - 215 % 60;
                        var mm216 = today.getHours() * 60 + today.getMinutes() - 216 % 60;
                        var mm217 = today.getHours() * 60 + today.getMinutes() - 217 % 60;
                        var mm218 = today.getHours() * 60 + today.getMinutes() - 218 % 60;
                        var mm219 = today.getHours() * 60 + today.getMinutes() - 219 % 60;
                        var mm220 = today.getHours() * 60 + today.getMinutes() - 220 % 60;
                        var mm221 = today.getHours() * 60 + today.getMinutes() - 221 % 60;
                        var mm222 = today.getHours() * 60 + today.getMinutes() - 222 % 60;
                        var mm223 = today.getHours() * 60 + today.getMinutes() - 223 % 60;
                        var mm224 = today.getHours() * 60 + today.getMinutes() - 224 % 60;
                        var mm225 = today.getHours() * 60 + today.getMinutes() - 225 % 60;
                        var mm226 = today.getHours() * 60 + today.getMinutes() - 226 % 60;
                        var mm227 = today.getHours() * 60 + today.getMinutes() - 227 % 60;
                        var mm228 = today.getHours() * 60 + today.getMinutes() - 228 % 60;
                        var mm229 = today.getHours() * 60 + today.getMinutes() - 229 % 60;
                        var mm230 = today.getHours() * 60 + today.getMinutes() - 230 % 60;
                        var mm231 = today.getHours() * 60 + today.getMinutes() - 231 % 60;
                        var mm232 = today.getHours() * 60 + today.getMinutes() - 232 % 60;
                        var mm233 = today.getHours() * 60 + today.getMinutes() - 233 % 60;
                        var mm234 = today.getHours() * 60 + today.getMinutes() - 234 % 60;
                        var mm235 = today.getHours() * 60 + today.getMinutes() - 235 % 60;
                        var mm236 = today.getHours() * 60 + today.getMinutes() - 236 % 60;
                        var mm237 = today.getHours() * 60 + today.getMinutes() - 237 % 60;
                        var mm238 = today.getHours() * 60 + today.getMinutes() - 238 % 60;
                        var mm239 = today.getHours() * 60 + today.getMinutes() - 239 % 60;
                        var mm240 = today.getHours() * 60 + today.getMinutes() - 240 % 60;
                        var mm241 = today.getHours() * 60 + today.getMinutes() - 241 % 60;
                        var mm242 = today.getHours() * 60 + today.getMinutes() - 242 % 60;
                        var mm243 = today.getHours() * 60 + today.getMinutes() - 243 % 60;
                        var mm244 = today.getHours() * 60 + today.getMinutes() - 244 % 60;
                        var mm245 = today.getHours() * 60 + today.getMinutes() - 245 % 60;
                        var mm246 = today.getHours() * 60 + today.getMinutes() - 246 % 60;
                        var mm247 = today.getHours() * 60 + today.getMinutes() - 247 % 60;
                        var mm248 = today.getHours() * 60 + today.getMinutes() - 248 % 60;
                        var mm249 = today.getHours() * 60 + today.getMinutes() - 249 % 60;
                        var mm250 = today.getHours() * 60 + today.getMinutes() - 250 % 60;
                        var mm251 = today.getHours() * 60 + today.getMinutes() - 251 % 60;
                        var mm252 = today.getHours() * 60 + today.getMinutes() - 252 % 60;
                        var mm253 = today.getHours() * 60 + today.getMinutes() - 253 % 60;
                        var mm254 = today.getHours() * 60 + today.getMinutes() - 254 % 60;
                        var mm255 = today.getHours() * 60 + today.getMinutes() - 255 % 60;
                        var mm256 = today.getHours() * 60 + today.getMinutes() - 256 % 60;
                        var mm257 = today.getHours() * 60 + today.getMinutes() - 257 % 60;
                        var mm258 = today.getHours() * 60 + today.getMinutes() - 258 % 60;
                        var mm259 = today.getHours() * 60 + today.getMinutes() - 259 % 60;
                        var mm260 = today.getHours() * 60 + today.getMinutes() - 260 % 60;
                        var mm261 = today.getHours() * 60 + today.getMinutes() - 261 % 60;
                        var mm262 = today.getHours() * 60 + today.getMinutes() - 262 % 60;
                        var mm263 = today.getHours() * 60 + today.getMinutes() - 263 % 60;
                        var mm264 = today.getHours() * 60 + today.getMinutes() - 264 % 60;
                        var mm265 = today.getHours() * 60 + today.getMinutes() - 265 % 60;
                        var mm266 = today.getHours() * 60 + today.getMinutes() - 266 % 60;
                        var mm267 = today.getHours() * 60 + today.getMinutes() - 267 % 60;
                        var mm268 = today.getHours() * 60 + today.getMinutes() - 268 % 60;
                        var mm269 = today.getHours() * 60 + today.getMinutes() - 269 % 60;
                        var mm270 = today.getHours() * 60 + today.getMinutes() - 270 % 60;
                        var mm271 = today.getHours() * 60 + today.getMinutes() - 271 % 60;
                        var mm272 = today.getHours() * 60 + today.getMinutes() - 272 % 60;
                        var mm273 = today.getHours() * 60 + today.getMinutes() - 273 % 60;
                        var mm274 = today.getHours() * 60 + today.getMinutes() - 274 % 60;
                        var mm275 = today.getHours() * 60 + today.getMinutes() - 275 % 60;
                        var mm276 = today.getHours() * 60 + today.getMinutes() - 276 % 60;
                        var mm277 = today.getHours() * 60 + today.getMinutes() - 277 % 60;
                        var mm278 = today.getHours() * 60 + today.getMinutes() - 278 % 60;
                        var mm279 = today.getHours() * 60 + today.getMinutes() - 279 % 60;
                        var mm280 = today.getHours() * 60 + today.getMinutes() - 280 % 60;
                        var mm281 = today.getHours() * 60 + today.getMinutes() - 281 % 60;
                        var mm282 = today.getHours() * 60 + today.getMinutes() - 282 % 60;
                        var mm283 = today.getHours() * 60 + today.getMinutes() - 283 % 60;
                        var mm284 = today.getHours() * 60 + today.getMinutes() - 284 % 60;
                        var mm285 = today.getHours() * 60 + today.getMinutes() - 285 % 60;
                        var mm286 = today.getHours() * 60 + today.getMinutes() - 286 % 60;
                        var mm287 = today.getHours() * 60 + today.getMinutes() - 287 % 60;
                        var mm288 = today.getHours() * 60 + today.getMinutes() - 288 % 60;
                        var mm289 = today.getHours() * 60 + today.getMinutes() - 289 % 60;
                        var mm290 = today.getHours() * 60 + today.getMinutes() - 290 % 60;
                        var mm291 = today.getHours() * 60 + today.getMinutes() - 291 % 60;
                        var mm292 = today.getHours() * 60 + today.getMinutes() - 292 % 60;
                        var mm293 = today.getHours() * 60 + today.getMinutes() - 293 % 60;
                        var mm294 = today.getHours() * 60 + today.getMinutes() - 294 % 60;
                        var mm295 = today.getHours() * 60 + today.getMinutes() - 295 % 60;
                        var mm296 = today.getHours() * 60 + today.getMinutes() - 296 % 60;
                        var mm297 = today.getHours() * 60 + today.getMinutes() - 297 % 60;
                        var mm298 = today.getHours() * 60 + today.getMinutes() - 298 % 60;
                        var mm299 = today.getHours() * 60 + today.getMinutes() - 299 % 60;

                        var hh = Math.floor(mm / 60);
                        var hh1 = Math.floor(mm1 / 60);
                        var hh2 = Math.floor(mm2 / 60);
                        var hh3 = Math.floor(mm3 / 60);
                        var hh4 = Math.floor(mm4 / 60);
                        var hh5 = Math.floor(mm5 / 60);
                        var hh6 = Math.floor(mm6 / 60);
                        var hh7 = Math.floor(mm7 / 60);
                        var hh8 = Math.floor(mm8 / 60);
                        var hh9 = Math.floor(mm9 / 60);
                        var hh10 = Math.floor(mm10 / 60);
                        var hh11 = Math.floor(mm11 / 60);
                        var hh12 = Math.floor(mm12 / 60);
                        var hh13 = Math.floor(mm13 / 60);
                        var hh14 = Math.floor(mm14 / 60);
                        var hh15 = Math.floor(mm15 / 60);
                        var hh16 = Math.floor(mm16 / 60);
                        var hh17 = Math.floor(mm17 / 60);
                        var hh18 = Math.floor(mm18 / 60);
                        var hh19 = Math.floor(mm19 / 60);
                        var hh20 = Math.floor(mm20 / 60);
                        var hh21 = Math.floor(mm21 / 60);
                        var hh22 = Math.floor(mm22 / 60);
                        var hh23 = Math.floor(mm23 / 60);
                        var hh24 = Math.floor(mm24 / 60);
                        var hh25 = Math.floor(mm25 / 60);
                        var hh26 = Math.floor(mm26 / 60);
                        var hh27 = Math.floor(mm27 / 60);
                        var hh28 = Math.floor(mm28 / 60);
                        var hh29 = Math.floor(mm29 / 60);
                        var hh30 = Math.floor(mm30 / 60);
                        var hh31 = Math.floor(mm31 / 60);
                        var hh32 = Math.floor(mm32 / 60);
                        var hh33 = Math.floor(mm33 / 60);
                        var hh34 = Math.floor(mm34 / 60);
                        var hh35 = Math.floor(mm35 / 60);
                        var hh36 = Math.floor(mm36 / 60);
                        var hh37 = Math.floor(mm37 / 60);
                        var hh38 = Math.floor(mm38 / 60);
                        var hh39 = Math.floor(mm39 / 60);
                        var hh40 = Math.floor(mm40 / 60);
                        var hh41 = Math.floor(mm41 / 60);
                        var hh42 = Math.floor(mm42 / 60);
                        var hh43 = Math.floor(mm43 / 60);
                        var hh44 = Math.floor(mm44 / 60);
                        var hh45 = Math.floor(mm45 / 60);
                        var hh46 = Math.floor(mm46 / 60);
                        var hh47 = Math.floor(mm47 / 60);
                        var hh48 = Math.floor(mm48 / 60);
                        var hh49 = Math.floor(mm49 / 60);
                        var hh50 = Math.floor(mm50 / 60);
                        var hh51 = Math.floor(mm51 / 60);
                        var hh52 = Math.floor(mm52 / 60);
                        var hh53 = Math.floor(mm53 / 60);
                        var hh54 = Math.floor(mm54 / 60);
                        var hh55 = Math.floor(mm55 / 60);
                        var hh56 = Math.floor(mm56 / 60);
                        var hh57 = Math.floor(mm57 / 60);
                        var hh58 = Math.floor(mm58 / 60);
                        var hh59 = Math.floor(mm59 / 60);
                        
                        var hh60 = Math.floor(mm60 / 60);
                        var hh61 = Math.floor(mm61 / 60);
                        var hh62 = Math.floor(mm62 / 60);
                        var hh63 = Math.floor(mm63 / 60);
                        var hh64 = Math.floor(mm64 / 60);
                        var hh65 = Math.floor(mm65 / 60);
                        var hh66 = Math.floor(mm66 / 60);
                        var hh67 = Math.floor(mm67 / 60);
                        var hh68 = Math.floor(mm68 / 60);
                        var hh69 = Math.floor(mm69 / 60);

                        var hh70 = Math.floor(mm70 / 60);
                        var hh71 = Math.floor(mm71 / 60);
                        var hh72 = Math.floor(mm72 / 60);
                        var hh73 = Math.floor(mm73 / 60);
                        var hh74 = Math.floor(mm74 / 60);
                        var hh75 = Math.floor(mm75 / 60);
                        var hh76 = Math.floor(mm76 / 60);
                        var hh77 = Math.floor(mm77 / 60);
                        var hh78 = Math.floor(mm78 / 60);
                        var hh79 = Math.floor(mm79 / 60);

                        var hh80 = Math.floor(mm80 / 60);
                        var hh81 = Math.floor(mm81 / 60);
                        var hh82 = Math.floor(mm82 / 60);
                        var hh83 = Math.floor(mm83 / 60);
                        var hh84 = Math.floor(mm84 / 60);
                        var hh85 = Math.floor(mm85 / 60);
                        var hh86 = Math.floor(mm86 / 60);
                        var hh87 = Math.floor(mm87 / 60);
                        var hh88 = Math.floor(mm88 / 60);
                        var hh89 = Math.floor(mm89 / 60);

                        var hh90 = Math.floor(mm90 / 60);
                        var hh91 = Math.floor(mm91 / 60);
                        var hh92 = Math.floor(mm92 / 60);
                        var hh93 = Math.floor(mm93 / 60);
                        var hh94 = Math.floor(mm94 / 60);
                        var hh95 = Math.floor(mm95 / 60);
                        var hh96 = Math.floor(mm96 / 60);
                        var hh97 = Math.floor(mm97 / 60);
                        var hh98 = Math.floor(mm98 / 60);
                        var hh99 = Math.floor(mm99 / 60);

                        var hh100 = Math.floor(mm100 / 60);
                        var hh101 = Math.floor(mm101 / 60);
                        var hh102 = Math.floor(mm102 / 60);
                        var hh103 = Math.floor(mm103 / 60);
                        var hh104 = Math.floor(mm104 / 60);
                        var hh105 = Math.floor(mm105 / 60);
                        var hh106 = Math.floor(mm106 / 60);
                        var hh107 = Math.floor(mm107 / 60);
                        var hh108 = Math.floor(mm108 / 60);
                        var hh109 = Math.floor(mm109 / 60);

                        var hh110 = Math.floor(mm110 / 60);
                        var hh111 = Math.floor(mm111 / 60);
                        var hh112 = Math.floor(mm112 / 60);
                        var hh113 = Math.floor(mm113 / 60);
                        var hh114 = Math.floor(mm114 / 60);
                        var hh115 = Math.floor(mm115 / 60);
                        var hh116 = Math.floor(mm116 / 60);
                        var hh117 = Math.floor(mm117 / 60);
                        var hh118 = Math.floor(mm118 / 60);
                        var hh119 = Math.floor(mm119 / 60);

                        var hh120 = Math.floor(mm120 / 60);
                        var hh121 = Math.floor(mm121 / 60);
                        var hh122 = Math.floor(mm122 / 60);
                        var hh123 = Math.floor(mm123 / 60);
                        var hh124 = Math.floor(mm124 / 60);
                        var hh125 = Math.floor(mm125 / 60);
                        var hh126 = Math.floor(mm126 / 60);
                        var hh127 = Math.floor(mm127 / 60);
                        var hh128 = Math.floor(mm128 / 60);
                        var hh129 = Math.floor(mm129 / 60);

                        var hh130 = Math.floor(mm130 / 60);
                        var hh131 = Math.floor(mm131 / 60);
                        var hh132 = Math.floor(mm132 / 60);
                        var hh133 = Math.floor(mm133 / 60);
                        var hh134 = Math.floor(mm134 / 60);
                        var hh135 = Math.floor(mm135 / 60);
                        var hh136 = Math.floor(mm136 / 60);
                        var hh137 = Math.floor(mm137 / 60);
                        var hh138 = Math.floor(mm138 / 60);
                        var hh139 = Math.floor(mm139 / 60);

                        var hh140 = Math.floor(mm140 / 60);
                        var hh141 = Math.floor(mm141 / 60);
                        var hh142 = Math.floor(mm142 / 60);
                        var hh143 = Math.floor(mm143 / 60);
                        var hh144 = Math.floor(mm144 / 60);
                        var hh145 = Math.floor(mm145 / 60);
                        var hh146 = Math.floor(mm146 / 60);
                        var hh147 = Math.floor(mm147 / 60);
                        var hh148 = Math.floor(mm148 / 60);
                        var hh149 = Math.floor(mm149 / 60);

                        var hh150 = Math.floor(mm150 / 60);
                        var hh151 = Math.floor(mm151 / 60);
                        var hh152 = Math.floor(mm152 / 60);
                        var hh153 = Math.floor(mm153 / 60);
                        var hh154 = Math.floor(mm154 / 60);
                        var hh155 = Math.floor(mm155 / 60);
                        var hh156 = Math.floor(mm156 / 60);
                        var hh157 = Math.floor(mm157 / 60);
                        var hh158 = Math.floor(mm158 / 60);
                        var hh159 = Math.floor(mm159 / 60);

                        var hh160 = Math.floor(mm160 / 60);
                        var hh161 = Math.floor(mm161 / 60);
                        var hh162 = Math.floor(mm162 / 60);
                        var hh163 = Math.floor(mm163 / 60);
                        var hh164 = Math.floor(mm164 / 60);
                        var hh165 = Math.floor(mm165 / 60);
                        var hh166 = Math.floor(mm166 / 60);
                        var hh167 = Math.floor(mm167 / 60);
                        var hh168 = Math.floor(mm168 / 60);
                        var hh169 = Math.floor(mm169 / 60);

                        var hh170 = Math.floor(mm170 / 60);
                        var hh171 = Math.floor(mm171 / 60);
                        var hh172 = Math.floor(mm172 / 60);
                        var hh173 = Math.floor(mm173 / 60);
                        var hh174 = Math.floor(mm174 / 60);
                        var hh175 = Math.floor(mm175 / 60);
                        var hh176 = Math.floor(mm176 / 60);
                        var hh177 = Math.floor(mm177 / 60);
                        var hh178 = Math.floor(mm178 / 60);
                        var hh179 = Math.floor(mm179 / 60);

                        var hh180 = Math.floor(mm180 / 60);
                        var hh181 = Math.floor(mm181 / 60);
                        var hh182 = Math.floor(mm182 / 60);
                        var hh183 = Math.floor(mm183 / 60);
                        var hh184 = Math.floor(mm184 / 60);
                        var hh185 = Math.floor(mm185 / 60);
                        var hh186 = Math.floor(mm186 / 60);
                        var hh187 = Math.floor(mm187 / 60);
                        var hh188 = Math.floor(mm188 / 60);
                        var hh189 = Math.floor(mm189 / 60);

                        var hh190 = Math.floor(mm190 / 60);
                        var hh191 = Math.floor(mm191 / 60);
                        var hh192 = Math.floor(mm192 / 60);
                        var hh193 = Math.floor(mm193 / 60);
                        var hh194 = Math.floor(mm194 / 60);
                        var hh195 = Math.floor(mm195 / 60);
                        var hh196 = Math.floor(mm196 / 60);
                        var hh197 = Math.floor(mm197 / 60);
                        var hh198 = Math.floor(mm198 / 60);
                        var hh199 = Math.floor(mm199 / 60);

                        var hh200 = Math.floor(mm200 / 60);
                        var hh201 = Math.floor(mm201 / 60);
                        var hh202 = Math.floor(mm202 / 60);
                        var hh203 = Math.floor(mm203 / 60);
                        var hh204 = Math.floor(mm204 / 60);
                        var hh205 = Math.floor(mm205 / 60);
                        var hh206 = Math.floor(mm206 / 60);
                        var hh207 = Math.floor(mm207 / 60);
                        var hh208 = Math.floor(mm208 / 60);
                        var hh209 = Math.floor(mm209 / 60);

                        var hh210 = Math.floor(mm210 / 60);
                        var hh211 = Math.floor(mm211 / 60);
                        var hh212 = Math.floor(mm212 / 60);
                        var hh213 = Math.floor(mm213 / 60);
                        var hh214 = Math.floor(mm214 / 60);
                        var hh215 = Math.floor(mm215 / 60);
                        var hh216 = Math.floor(mm216 / 60);
                        var hh217 = Math.floor(mm217 / 60);
                        var hh218 = Math.floor(mm218 / 60);
                        var hh219 = Math.floor(mm219 / 60);

                        var hh220 = Math.floor(mm220 / 60);
                        var hh221 = Math.floor(mm221 / 60);
                        var hh222 = Math.floor(mm222 / 60);
                        var hh223 = Math.floor(mm223 / 60);
                        var hh224 = Math.floor(mm224 / 60);
                        var hh225 = Math.floor(mm225 / 60);
                        var hh226 = Math.floor(mm226 / 60);
                        var hh227 = Math.floor(mm227 / 60);
                        var hh228 = Math.floor(mm228 / 60);
                        var hh229 = Math.floor(mm229 / 60);

                        var hh230 = Math.floor(mm230 / 60);
                        var hh231 = Math.floor(mm231 / 60);
                        var hh232 = Math.floor(mm232 / 60);
                        var hh233 = Math.floor(mm233 / 60);
                        var hh234 = Math.floor(mm234 / 60);
                        var hh235 = Math.floor(mm235 / 60);
                        var hh236 = Math.floor(mm236 / 60);
                        var hh237 = Math.floor(mm237 / 60);
                        var hh238 = Math.floor(mm238 / 60);
                        var hh239 = Math.floor(mm239 / 60);

                        var hh240 = Math.floor(mm240 / 60);
                        var hh241 = Math.floor(mm241 / 60);
                        var hh242 = Math.floor(mm242 / 60);
                        var hh243 = Math.floor(mm243 / 60);
                        var hh244 = Math.floor(mm244 / 60);
                        var hh245 = Math.floor(mm245 / 60);
                        var hh246 = Math.floor(mm246 / 60);
                        var hh247 = Math.floor(mm247 / 60);
                        var hh248 = Math.floor(mm248 / 60);
                        var hh249 = Math.floor(mm249 / 60);

                        var hh250 = Math.floor(mm250 / 60);
                        var hh251 = Math.floor(mm251 / 60);
                        var hh252 = Math.floor(mm252 / 60);
                        var hh253 = Math.floor(mm253 / 60);
                        var hh254 = Math.floor(mm254 / 60);
                        var hh255 = Math.floor(mm255 / 60);
                        var hh256 = Math.floor(mm256 / 60);
                        var hh257 = Math.floor(mm257 / 60);
                        var hh258 = Math.floor(mm258 / 60);
                        var hh259 = Math.floor(mm259 / 60);

                        var hh260 = Math.floor(mm260 / 60);
                        var hh261 = Math.floor(mm261 / 60);
                        var hh262 = Math.floor(mm262 / 60);
                        var hh263 = Math.floor(mm263 / 60);
                        var hh264 = Math.floor(mm264 / 60);
                        var hh265 = Math.floor(mm265 / 60);
                        var hh266 = Math.floor(mm266 / 60);
                        var hh267 = Math.floor(mm267 / 60);
                        var hh268 = Math.floor(mm268 / 60);
                        var hh269 = Math.floor(mm269 / 60);

                        var hh270 = Math.floor(mm270 / 60);
                        var hh271 = Math.floor(mm271 / 60);
                        var hh272 = Math.floor(mm272 / 60);
                        var hh273 = Math.floor(mm273 / 60);
                        var hh274 = Math.floor(mm274 / 60);
                        var hh275 = Math.floor(mm275 / 60);
                        var hh276 = Math.floor(mm276 / 60);
                        var hh277 = Math.floor(mm277 / 60);
                        var hh278 = Math.floor(mm278 / 60);
                        var hh279 = Math.floor(mm279 / 60);

                        var hh280 = Math.floor(mm280 / 60);
                        var hh281 = Math.floor(mm281 / 60);
                        var hh282 = Math.floor(mm282 / 60);
                        var hh283 = Math.floor(mm283 / 60);
                        var hh284 = Math.floor(mm284 / 60);
                        var hh285 = Math.floor(mm285 / 60);
                        var hh286 = Math.floor(mm286 / 60);
                        var hh287 = Math.floor(mm287 / 60);
                        var hh288 = Math.floor(mm288 / 60);
                        var hh289 = Math.floor(mm289 / 60);

                        var hh290 = Math.floor(mm290 / 60);
                        var hh291 = Math.floor(mm291 / 60);
                        var hh292 = Math.floor(mm292 / 60);
                        var hh293 = Math.floor(mm293 / 60);
                        var hh294 = Math.floor(mm294 / 60);
                        var hh295 = Math.floor(mm295 / 60);
                        var hh296 = Math.floor(mm296 / 60);
                        var hh297 = Math.floor(mm297 / 60);
                        var hh298 = Math.floor(mm298 / 60);
                        var hh299 = Math.floor(mm299 / 60);

                        var menit = (mm % 60);
                        var menit1 = (mm1 % 60);
                        var menit2 = (mm2 % 60);
                        var menit3 = (mm3 % 60);
                        var menit4 = (mm4 % 60);
                        var menit5 = (mm5 % 60);
                        var menit6 = (mm6 % 60);
                        var menit7 = (mm7 % 60);
                        var menit8 = (mm8 % 60);
                        var menit9 = (mm9 % 60);
                        var menit10 = (mm10 % 60);
                        var menit11 = (mm11 % 60);
                        var menit12 = (mm12 % 60);
                        var menit13 = (mm13 % 60);
                        var menit14 = (mm14 % 60);
                        var menit15 = (mm15 % 60);
                        var menit16 = (mm16 % 60);
                        var menit17 = (mm17 % 60);
                        var menit18 = (mm18 % 60);
                        var menit19 = (mm19 % 60);
                        var menit20 = (mm20 % 60);
                        var menit21 = (mm21 % 60);
                        var menit22 = (mm22 % 60);
                        var menit23 = (mm23 % 60);
                        var menit24 = (mm24 % 60);
                        var menit25 = (mm25 % 60);
                        var menit26 = (mm26 % 60);
                        var menit27 = (mm27 % 60);
                        var menit28 = (mm28 % 60);
                        var menit29 = (mm29 % 60);
                        var menit30 = (mm30 % 60);
                        var menit31 = (mm31 % 60);
                        var menit32 = (mm32 % 60);
                        var menit33 = (mm33 % 60);
                        var menit34 = (mm34 % 60);
                        var menit35 = (mm35 % 60);
                        var menit36 = (mm36 % 60);
                        var menit37 = (mm37 % 60);
                        var menit38 = (mm38 % 60);
                        var menit39 = (mm39 % 60);
                        var menit40 = (mm40 % 60);
                        var menit41 = (mm41 % 60);
                        var menit42 = (mm42 % 60);
                        var menit43 = (mm43 % 60);
                        var menit44 = (mm44 % 60);
                        var menit45 = (mm45 % 60);
                        var menit46 = (mm46 % 60);
                        var menit47 = (mm47 % 60);
                        var menit48 = (mm48 % 60);
                        var menit49 = (mm49 % 60);
                        var menit50 = (mm50 % 60);
                        var menit51 = (mm51 % 60);
                        var menit52 = (mm52 % 60);
                        var menit53 = (mm53 % 60);
                        var menit54 = (mm54 % 60);
                        var menit55 = (mm55 % 60);
                        var menit56 = (mm56 % 60);
                        var menit57 = (mm57 % 60);
                        var menit58 = (mm58 % 60);
                        var menit59 = (mm59 % 60);

                        var menit60 = (mm60 % 60);
                        var menit61 = (mm61 % 60);
                        var menit62 = (mm62 % 60);
                        var menit63 = (mm63 % 60);
                        var menit64 = (mm64 % 60);
                        var menit65 = (mm65 % 60);
                        var menit66 = (mm66 % 60);
                        var menit67 = (mm67 % 60);
                        var menit68 = (mm68 % 60);
                        var menit69 = (mm69 % 60);

                        var menit70 = (mm70 % 60);
                        var menit71 = (mm71 % 60);
                        var menit72 = (mm72 % 60);
                        var menit73 = (mm73 % 60);
                        var menit74 = (mm74 % 60);
                        var menit75 = (mm75 % 60);
                        var menit76 = (mm76 % 60);
                        var menit77 = (mm77 % 60);
                        var menit78 = (mm78 % 60);
                        var menit79 = (mm79 % 60);

                        var menit80 = (mm80 % 60);
                        var menit81 = (mm81 % 60);
                        var menit82 = (mm82 % 60);
                        var menit83 = (mm83 % 60);
                        var menit84 = (mm84 % 60);
                        var menit85 = (mm85 % 60);
                        var menit86 = (mm86 % 60);
                        var menit87 = (mm87 % 60);
                        var menit88 = (mm88 % 60);
                        var menit89 = (mm89 % 60);

                        var menit90 = (mm90 % 60);
                        var menit91 = (mm91 % 60);
                        var menit92 = (mm92 % 60);
                        var menit93 = (mm93 % 60);
                        var menit94 = (mm94 % 60);
                        var menit95 = (mm95 % 60);
                        var menit96 = (mm96 % 60);
                        var menit97 = (mm97 % 60);
                        var menit98 = (mm98 % 60);
                        var menit99 = (mm99 % 60);

                        var menit100 = (mm100 % 60);
                        var menit101 = (mm101 % 60);
                        var menit102 = (mm102 % 60);
                        var menit103 = (mm103 % 60);
                        var menit104 = (mm104 % 60);
                        var menit105 = (mm105 % 60);
                        var menit106 = (mm106 % 60);
                        var menit107 = (mm107 % 60);
                        var menit108 = (mm108 % 60);
                        var menit109 = (mm109 % 60);

                        var menit110 = (mm110 % 60);
                        var menit111 = (mm111 % 60);
                        var menit112 = (mm112 % 60);
                        var menit113 = (mm113 % 60);
                        var menit114 = (mm114 % 60);
                        var menit115 = (mm115 % 60);
                        var menit116 = (mm116 % 60);
                        var menit117 = (mm117 % 60);
                        var menit118 = (mm118 % 60);
                        var menit119 = (mm119 % 60);

                        var menit120 = (mm120 % 60);
                        var menit121 = (mm121 % 60);
                        var menit122 = (mm122 % 60);
                        var menit123 = (mm123 % 60);
                        var menit124 = (mm124 % 60);
                        var menit125 = (mm125 % 60);
                        var menit126 = (mm126 % 60);
                        var menit127 = (mm127 % 60);
                        var menit128 = (mm128 % 60);
                        var menit129 = (mm129 % 60);

                        var menit130 = (mm130 % 60);
                        var menit131 = (mm131 % 60);
                        var menit132 = (mm132 % 60);
                        var menit133 = (mm133 % 60);
                        var menit134 = (mm134 % 60);
                        var menit135 = (mm135 % 60);
                        var menit136 = (mm136 % 60);
                        var menit137 = (mm137 % 60);
                        var menit138 = (mm138 % 60);
                        var menit139 = (mm139 % 60);

                        var menit140 = (mm140 % 60);
                        var menit141 = (mm141 % 60);
                        var menit142 = (mm142 % 60);
                        var menit143 = (mm143 % 60);
                        var menit144 = (mm144 % 60);
                        var menit145 = (mm145 % 60);
                        var menit146 = (mm146 % 60);
                        var menit147 = (mm147 % 60);
                        var menit148 = (mm148 % 60);
                        var menit149 = (mm149 % 60);

                        var menit150 = (mm150 % 60);
                        var menit151 = (mm151 % 60);
                        var menit152 = (mm152 % 60);
                        var menit153 = (mm153 % 60);
                        var menit154 = (mm154 % 60);
                        var menit155 = (mm155 % 60);
                        var menit156 = (mm156 % 60);
                        var menit157 = (mm157 % 60);
                        var menit158 = (mm158 % 60);
                        var menit159 = (mm159 % 60);

                        var menit160 = (mm160 % 60);
                        var menit161 = (mm161 % 60);
                        var menit162 = (mm162 % 60);
                        var menit163 = (mm163 % 60);
                        var menit164 = (mm164 % 60);
                        var menit165 = (mm165 % 60);
                        var menit166 = (mm166 % 60);
                        var menit167 = (mm167 % 60);
                        var menit168 = (mm168 % 60);
                        var menit169 = (mm169 % 60);

                        var menit170 = (mm170 % 60);
                        var menit171 = (mm171 % 60);
                        var menit172 = (mm172 % 60);
                        var menit173 = (mm173 % 60);
                        var menit174 = (mm174 % 60);
                        var menit175 = (mm175 % 60);
                        var menit176 = (mm176 % 60);
                        var menit177 = (mm177 % 60);
                        var menit178 = (mm178 % 60);
                        var menit179 = (mm179 % 60);

                        var menit180 = (mm180 % 60);
                        var menit181 = (mm181 % 60);
                        var menit182 = (mm182 % 60);
                        var menit183 = (mm183 % 60);
                        var menit184 = (mm184 % 60);
                        var menit185 = (mm185 % 60);
                        var menit186 = (mm186 % 60);
                        var menit187 = (mm187 % 60);
                        var menit188 = (mm188 % 60);
                        var menit189 = (mm189 % 60);

                        var menit190 = (mm190 % 60);
                        var menit191 = (mm191 % 60);
                        var menit192 = (mm192 % 60);
                        var menit193 = (mm193 % 60);
                        var menit194 = (mm194 % 60);
                        var menit195 = (mm195 % 60);
                        var menit196 = (mm196 % 60);
                        var menit197 = (mm197 % 60);
                        var menit198 = (mm198 % 60);
                        var menit199 = (mm199 % 60);

                        var menit200 = (mm200 % 60);
                        var menit201 = (mm201 % 60);
                        var menit202 = (mm202 % 60);
                        var menit203 = (mm203 % 60);
                        var menit204 = (mm204 % 60);
                        var menit205 = (mm205 % 60);
                        var menit206 = (mm206 % 60);
                        var menit207 = (mm207 % 60);
                        var menit208 = (mm208 % 60);
                        var menit209 = (mm209 % 60);

                        var menit210 = (mm210 % 60);
                        var menit211 = (mm211 % 60);
                        var menit212 = (mm212 % 60);
                        var menit213 = (mm213 % 60);
                        var menit214 = (mm214 % 60);
                        var menit215 = (mm215 % 60);
                        var menit216 = (mm216 % 60);
                        var menit217 = (mm217 % 60);
                        var menit218 = (mm218 % 60);
                        var menit219 = (mm219 % 60);

                        var menit220 = (mm220 % 60);
                        var menit221 = (mm221 % 60);
                        var menit222 = (mm222 % 60);
                        var menit223 = (mm223 % 60);
                        var menit224 = (mm224 % 60);
                        var menit225 = (mm225 % 60);
                        var menit226 = (mm226 % 60);
                        var menit227 = (mm227 % 60);
                        var menit228 = (mm228 % 60);
                        var menit229 = (mm229 % 60);

                        var menit230 = (mm230 % 60);
                        var menit231 = (mm231 % 60);
                        var menit232 = (mm232 % 60);
                        var menit233 = (mm233 % 60);
                        var menit234 = (mm234 % 60);
                        var menit235 = (mm235 % 60);
                        var menit236 = (mm236 % 60);
                        var menit237 = (mm237 % 60);
                        var menit238 = (mm238 % 60);
                        var menit239 = (mm239 % 60);

                        var menit240 = (mm240 % 60);
                        var menit241 = (mm241 % 60);
                        var menit242 = (mm242 % 60);
                        var menit243 = (mm243 % 60);
                        var menit244 = (mm244 % 60);
                        var menit245 = (mm245 % 60);
                        var menit246 = (mm246 % 60);
                        var menit247 = (mm247 % 60);
                        var menit248 = (mm248 % 60);
                        var menit249 = (mm249 % 60);

                        var menit250 = (mm250 % 60);
                        var menit251 = (mm251 % 60);
                        var menit252 = (mm252 % 60);
                        var menit253 = (mm253 % 60);
                        var menit254 = (mm254 % 60);
                        var menit255 = (mm255 % 60);
                        var menit256 = (mm256 % 60);
                        var menit257 = (mm257 % 60);
                        var menit258 = (mm258 % 60);
                        var menit259 = (mm259 % 60);

                        var menit260 = (mm260 % 60);
                        var menit261 = (mm261 % 60);
                        var menit262 = (mm262 % 60);
                        var menit263 = (mm263 % 60);
                        var menit264 = (mm264 % 60);
                        var menit265 = (mm265 % 60);
                        var menit266 = (mm266 % 60);
                        var menit267 = (mm267 % 60);
                        var menit268 = (mm268 % 60);
                        var menit269 = (mm269 % 60);

                        var menit270 = (mm270 % 60);
                        var menit271 = (mm271 % 60);
                        var menit272 = (mm272 % 60);
                        var menit273 = (mm273 % 60);
                        var menit274 = (mm274 % 60);
                        var menit275 = (mm275 % 60);
                        var menit276 = (mm276 % 60);
                        var menit277 = (mm277 % 60);
                        var menit278 = (mm278 % 60);
                        var menit279 = (mm279 % 60);

                        var menit280 = (mm280 % 60);
                        var menit281 = (mm281 % 60);
                        var menit282 = (mm282 % 60);
                        var menit283 = (mm283 % 60);
                        var menit284 = (mm284 % 60);
                        var menit285 = (mm285 % 60);
                        var menit286 = (mm286 % 60);
                        var menit287 = (mm287 % 60);
                        var menit288 = (mm288 % 60);
                        var menit289 = (mm289 % 60);

                        var menit290 = (mm290 % 60);
                        var menit291 = (mm291 % 60);
                        var menit292 = (mm292 % 60);
                        var menit293 = (mm293 % 60);
                        var menit294 = (mm294 % 60);
                        var menit295 = (mm295 % 60);
                        var menit296 = (mm296 % 60);
                        var menit297 = (mm297 % 60);
                        var menit298 = (mm298 % 60);
                        var menit299 = (mm299 % 60);
    
                        var time = hh + ":" + menit;
                        var time1 = hh1 + ":" + menit1;
                        var time2 = hh2 + ":" + menit2;
                        var time3 = hh3 + ":" + menit3;
                        var time4 = hh4 + ":" + menit4;
                        var time5 = hh5 + ":" + menit5;
                        var time6 = hh6 + ":" + menit6;
                        var time7 = hh7 + ":" + menit7;
                        var time8 = hh8 + ":" + menit8;
                        var time9 = hh9 + ":" + menit9;
                        var time10 = hh10 + ":" + menit10;
                        var time11 = hh11 + ":" + menit11;
                        var time12 = hh12 + ":" + menit12;
                        var time13 = hh13 + ":" + menit13;
                        var time14 = hh14 + ":" + menit14;
                        var time15 = hh15 + ":" + menit15;
                        var time16 = hh16 + ":" + menit16;
                        var time17 = hh17 + ":" + menit17;
                        var time18 = hh18 + ":" + menit18;
                        var time19 = hh19 + ":" + menit19;
                        var time20 = hh20 + ":" + menit20;
                        var time21 = hh21 + ":" + menit21;
                        var time22 = hh22 + ":" + menit22;
                        var time23 = hh23 + ":" + menit23;
                        var time24 = hh24 + ":" + menit24;
                        var time25 = hh25 + ":" + menit25;
                        var time26 = hh26 + ":" + menit26;
                        var time27 = hh27 + ":" + menit27;
                        var time28 = hh28 + ":" + menit28;
                        var time29 = hh29 + ":" + menit29;
                        var time30 = hh30 + ":" + menit30;
                        var time31 = hh31 + ":" + menit31;
                        var time32 = hh32 + ":" + menit32;
                        var time33 = hh33 + ":" + menit33;
                        var time34 = hh34 + ":" + menit34;
                        var time35 = hh35 + ":" + menit35;
                        var time36 = hh36 + ":" + menit36;
                        var time37 = hh37 + ":" + menit37;
                        var time38 = hh38 + ":" + menit38;
                        var time39 = hh39 + ":" + menit39;
                        var time40 = hh40 + ":" + menit40;
                        var time41 = hh41 + ":" + menit41;
                        var time42 = hh42 + ":" + menit42;
                        var time43 = hh43 + ":" + menit43;
                        var time44 = hh44 + ":" + menit44;
                        var time45 = hh45 + ":" + menit45;
                        var time46 = hh46 + ":" + menit46;
                        var time47 = hh47 + ":" + menit47;
                        var time48 = hh48 + ":" + menit48;
                        var time49 = hh49 + ":" + menit49;
                        var time50 = hh50 + ":" + menit50;
                        var time51 = hh51 + ":" + menit51;
                        var time52 = hh52 + ":" + menit52;
                        var time53 = hh53 + ":" + menit53;
                        var time54 = hh54 + ":" + menit54;
                        var time55 = hh55 + ":" + menit55;
                        var time56 = hh56 + ":" + menit56;
                        var time57 = hh57 + ":" + menit57;
                        var time58 = hh58 + ":" + menit58;
                        var time59 = hh59 + ":" + menit59;

                        var time60 = hh60 + ":" + menit60;
                        var time61 = hh61 + ":" + menit61;
                        var time62 = hh62 + ":" + menit62;
                        var time63 = hh63 + ":" + menit63;
                        var time64 = hh64 + ":" + menit64;
                        var time65 = hh65 + ":" + menit65;
                        var time66 = hh66 + ":" + menit66;
                        var time67 = hh67 + ":" + menit67;
                        var time68 = hh68 + ":" + menit68;
                        var time69 = hh69 + ":" + menit69;

                        var time70 = hh70 + ":" + menit70;
                        var time71 = hh71 + ":" + menit71;
                        var time72 = hh72 + ":" + menit72;
                        var time73 = hh73 + ":" + menit73;
                        var time74 = hh74 + ":" + menit74;
                        var time75 = hh75 + ":" + menit75;
                        var time76 = hh76 + ":" + menit76;
                        var time77 = hh77 + ":" + menit77;
                        var time78 = hh78 + ":" + menit78;
                        var time79 = hh79 + ":" + menit79;

                        var time80 = hh80 + ":" + menit80;
                        var time81 = hh81 + ":" + menit81;
                        var time82 = hh82 + ":" + menit82;
                        var time83 = hh83 + ":" + menit83;
                        var time84 = hh84 + ":" + menit84;
                        var time85 = hh85 + ":" + menit85;
                        var time86 = hh86 + ":" + menit86;
                        var time87 = hh87 + ":" + menit87;
                        var time88 = hh88 + ":" + menit88;
                        var time89 = hh89 + ":" + menit89;

                        var time90 = hh90 + ":" + menit90;
                        var time91 = hh91 + ":" + menit91;
                        var time92 = hh92 + ":" + menit92;
                        var time93 = hh93 + ":" + menit93;
                        var time94 = hh94 + ":" + menit94;
                        var time95 = hh95 + ":" + menit95;
                        var time96 = hh96 + ":" + menit96;
                        var time97 = hh97 + ":" + menit97;
                        var time98 = hh98 + ":" + menit98;
                        var time99 = hh99 + ":" + menit99;

                        var time100 = hh100 + ":" + menit100;
                        var time101 = hh101 + ":" + menit101;
                        var time102 = hh102 + ":" + menit102;
                        var time103 = hh103 + ":" + menit103;
                        var time104 = hh104 + ":" + menit104;
                        var time105 = hh105 + ":" + menit105;
                        var time106 = hh106 + ":" + menit106;
                        var time107 = hh107 + ":" + menit107;
                        var time108 = hh108 + ":" + menit108;
                        var time109 = hh109 + ":" + menit109;

                        var time110 = hh110 + ":" + menit110;
                        var time111 = hh111 + ":" + menit111;
                        var time112 = hh112 + ":" + menit112;
                        var time113 = hh113 + ":" + menit113;
                        var time114 = hh114 + ":" + menit114;
                        var time115 = hh115 + ":" + menit115;
                        var time116 = hh116 + ":" + menit116;
                        var time117 = hh117 + ":" + menit117;
                        var time118 = hh118 + ":" + menit118;
                        var time119 = hh119 + ":" + menit119;

                        var time120 = hh120 + ":" + menit120;
                        var time121 = hh121 + ":" + menit121;
                        var time122 = hh122 + ":" + menit122;
                        var time123 = hh123 + ":" + menit123;
                        var time124 = hh124 + ":" + menit124;
                        var time125 = hh125 + ":" + menit125;
                        var time126 = hh126 + ":" + menit126;
                        var time127 = hh127 + ":" + menit127;
                        var time128 = hh128 + ":" + menit128;
                        var time129 = hh129 + ":" + menit129;

                        var time130 = hh130 + ":" + menit130;
                        var time131 = hh131 + ":" + menit131;
                        var time132 = hh132 + ":" + menit132;
                        var time133 = hh133 + ":" + menit133;
                        var time134 = hh134 + ":" + menit134;
                        var time135 = hh135 + ":" + menit135;
                        var time136 = hh136 + ":" + menit136;
                        var time137 = hh137 + ":" + menit137;
                        var time138 = hh138 + ":" + menit138;
                        var time139 = hh139 + ":" + menit139;

                        var time140 = hh140 + ":" + menit140;
                        var time141 = hh141 + ":" + menit141;
                        var time142 = hh142 + ":" + menit142;
                        var time143 = hh143 + ":" + menit143;
                        var time144 = hh144 + ":" + menit144;
                        var time145 = hh145 + ":" + menit145;
                        var time146 = hh146 + ":" + menit146;
                        var time147 = hh147 + ":" + menit147;
                        var time148 = hh148 + ":" + menit148;
                        var time149 = hh149 + ":" + menit149;

                        var time150 = hh150 + ":" + menit150;
                        var time151 = hh151 + ":" + menit151;
                        var time152 = hh152 + ":" + menit152;
                        var time153 = hh153 + ":" + menit153;
                        var time154 = hh154 + ":" + menit154;
                        var time155 = hh155 + ":" + menit155;
                        var time156 = hh156 + ":" + menit156;
                        var time157 = hh157 + ":" + menit157;
                        var time158 = hh158 + ":" + menit158;
                        var time159 = hh159 + ":" + menit159;

                        var time160 = hh160 + ":" + menit160;
                        var time161 = hh161 + ":" + menit161;
                        var time162 = hh162 + ":" + menit162;
                        var time163 = hh163 + ":" + menit163;
                        var time164 = hh164 + ":" + menit164;
                        var time165 = hh165 + ":" + menit165;
                        var time166 = hh166 + ":" + menit166;
                        var time167 = hh167 + ":" + menit167;
                        var time168 = hh168 + ":" + menit168;
                        var time169 = hh169 + ":" + menit169;

                        var time170 = hh170 + ":" + menit170;
                        var time171 = hh171 + ":" + menit171;
                        var time172 = hh172 + ":" + menit172;
                        var time173 = hh173 + ":" + menit173;
                        var time174 = hh174 + ":" + menit174;
                        var time175 = hh175 + ":" + menit175;
                        var time176 = hh176 + ":" + menit176;
                        var time177 = hh177 + ":" + menit177;
                        var time178 = hh178 + ":" + menit178;
                        var time179 = hh179 + ":" + menit179;

                        var time180 = hh180 + ":" + menit180;
                        var time181 = hh181 + ":" + menit181;
                        var time182 = hh182 + ":" + menit182;
                        var time183 = hh183 + ":" + menit183;
                        var time184 = hh184 + ":" + menit184;
                        var time185 = hh185 + ":" + menit185;
                        var time186 = hh186 + ":" + menit186;
                        var time187 = hh187 + ":" + menit187;
                        var time188 = hh188 + ":" + menit188;
                        var time189 = hh189 + ":" + menit189;

                        var time190 = hh190 + ":" + menit190;
                        var time191 = hh191 + ":" + menit191;
                        var time192 = hh192 + ":" + menit192;
                        var time193 = hh193 + ":" + menit193;
                        var time194 = hh194 + ":" + menit194;
                        var time195 = hh195 + ":" + menit195;
                        var time196 = hh196 + ":" + menit196;
                        var time197 = hh197 + ":" + menit197;
                        var time198 = hh198 + ":" + menit198;
                        var time199 = hh199 + ":" + menit199;

                        var time200 = hh200 + ":" + menit200;
                        var time201 = hh201 + ":" + menit201;
                        var time202 = hh202 + ":" + menit202;
                        var time203 = hh203 + ":" + menit203;
                        var time204 = hh204 + ":" + menit204;
                        var time205 = hh205 + ":" + menit205;
                        var time206 = hh206 + ":" + menit206;
                        var time207 = hh207 + ":" + menit207;
                        var time208 = hh208 + ":" + menit208;
                        var time209 = hh209 + ":" + menit209;

                        var time210 = hh210 + ":" + menit210;
                        var time211 = hh211 + ":" + menit211;
                        var time212 = hh212 + ":" + menit212;
                        var time213 = hh213 + ":" + menit213;
                        var time214 = hh214 + ":" + menit214;
                        var time215 = hh215 + ":" + menit215;
                        var time216 = hh216 + ":" + menit216;
                        var time217 = hh217 + ":" + menit217;
                        var time218 = hh218 + ":" + menit218;
                        var time219 = hh219 + ":" + menit219;

                        var time220 = hh220 + ":" + menit220;
                        var time221 = hh221 + ":" + menit221;
                        var time222 = hh222 + ":" + menit222;
                        var time223 = hh223 + ":" + menit223;
                        var time224 = hh224 + ":" + menit224;
                        var time225 = hh225 + ":" + menit225;
                        var time226 = hh226 + ":" + menit226;
                        var time227 = hh227 + ":" + menit227;
                        var time228 = hh228 + ":" + menit228;
                        var time229 = hh229 + ":" + menit229;

                        var time230 = hh230 + ":" + menit230;
                        var time231 = hh231 + ":" + menit231;
                        var time232 = hh232 + ":" + menit232;
                        var time233 = hh233 + ":" + menit233;
                        var time234 = hh234 + ":" + menit234;
                        var time235 = hh235 + ":" + menit235;
                        var time236 = hh236 + ":" + menit236;
                        var time237 = hh237 + ":" + menit237;
                        var time238 = hh238 + ":" + menit238;
                        var time239 = hh239 + ":" + menit239;

                        var time240 = hh240 + ":" + menit240;
                        var time241 = hh241 + ":" + menit241;
                        var time242 = hh242 + ":" + menit242;
                        var time243 = hh243 + ":" + menit243;
                        var time244 = hh244 + ":" + menit244;
                        var time245 = hh245 + ":" + menit245;
                        var time246 = hh246 + ":" + menit246;
                        var time247 = hh247 + ":" + menit247;
                        var time248 = hh248 + ":" + menit248;
                        var time249 = hh249 + ":" + menit249;

                        var time250 = hh250 + ":" + menit250;
                        var time251 = hh251 + ":" + menit251;
                        var time252 = hh252 + ":" + menit252;
                        var time253 = hh253 + ":" + menit253;
                        var time254 = hh254 + ":" + menit254;
                        var time255 = hh255 + ":" + menit255;
                        var time256 = hh256 + ":" + menit256;
                        var time257 = hh257 + ":" + menit257;
                        var time258 = hh258 + ":" + menit258;
                        var time259 = hh259 + ":" + menit259;

                        var time260 = hh260 + ":" + menit260;
                        var time261 = hh261 + ":" + menit261;
                        var time262 = hh262 + ":" + menit262;
                        var time263 = hh263 + ":" + menit263;
                        var time264 = hh264 + ":" + menit264;
                        var time265 = hh265 + ":" + menit265;
                        var time266 = hh266 + ":" + menit266;
                        var time267 = hh267 + ":" + menit267;
                        var time268 = hh268 + ":" + menit268;
                        var time269 = hh269 + ":" + menit269;

                        var time270 = hh270 + ":" + menit270;
                        var time271 = hh271 + ":" + menit271;
                        var time272 = hh272 + ":" + menit272;
                        var time273 = hh273 + ":" + menit273;
                        var time274 = hh274 + ":" + menit274;
                        var time275 = hh275 + ":" + menit275;
                        var time276 = hh276 + ":" + menit276;
                        var time277 = hh277 + ":" + menit277;
                        var time278 = hh278 + ":" + menit278;
                        var time279 = hh279 + ":" + menit279;

                        var time280 = hh280 + ":" + menit280;
                        var time281 = hh281 + ":" + menit281;
                        var time282 = hh282 + ":" + menit282;
                        var time283 = hh283 + ":" + menit283;
                        var time284 = hh284 + ":" + menit284;
                        var time285 = hh285 + ":" + menit285;
                        var time286 = hh286 + ":" + menit286;
                        var time287 = hh287 + ":" + menit287;
                        var time288 = hh288 + ":" + menit288;
                        var time289 = hh289 + ":" + menit289;

                        var time290 = hh290 + ":" + menit290;
                        var time291 = hh291 + ":" + menit291;
                        var time292 = hh292 + ":" + menit292;
                        var time293 = hh293 + ":" + menit293;
                        var time294 = hh294 + ":" + menit294;
                        var time295 = hh295 + ":" + menit295;
                        var time296 = hh296 + ":" + menit296;
                        var time297 = hh297 + ":" + menit297;
                        var time298 = hh298 + ":" + menit298;
                        var time299 = hh299 + ":" + menit299;
                        
                        

                        const data0 = splitData( [
                            [time299,parseFloat(candles_c[candles_c.length - 299]), parseFloat(candles_o[candles_o.length - 299]), parseFloat(candles_l[candles_l.length - 299]), parseFloat(candles_h[candles_h.length - 299])],
                            [time298,parseFloat(candles_c[candles_c.length - 298]), parseFloat(candles_o[candles_o.length - 298]), parseFloat(candles_l[candles_l.length - 298]), parseFloat(candles_h[candles_h.length - 298])],
                            [time297,parseFloat(candles_c[candles_c.length - 297]), parseFloat(candles_o[candles_o.length - 297]), parseFloat(candles_l[candles_l.length - 297]), parseFloat(candles_h[candles_h.length - 297])],
                            [time296,parseFloat(candles_c[candles_c.length - 296]), parseFloat(candles_o[candles_o.length - 296]), parseFloat(candles_l[candles_l.length - 296]), parseFloat(candles_h[candles_h.length - 296])],
                            [time295,parseFloat(candles_c[candles_c.length - 295]), parseFloat(candles_o[candles_o.length - 295]), parseFloat(candles_l[candles_l.length - 295]), parseFloat(candles_h[candles_h.length - 295])],
                            [time294,parseFloat(candles_c[candles_c.length - 294]), parseFloat(candles_o[candles_o.length - 294]), parseFloat(candles_l[candles_l.length - 294]), parseFloat(candles_h[candles_h.length - 294])],
                            [time293,parseFloat(candles_c[candles_c.length - 293]), parseFloat(candles_o[candles_o.length - 293]), parseFloat(candles_l[candles_l.length - 293]), parseFloat(candles_h[candles_h.length - 293])],
                            [time292,parseFloat(candles_c[candles_c.length - 292]), parseFloat(candles_o[candles_o.length - 292]), parseFloat(candles_l[candles_l.length - 292]), parseFloat(candles_h[candles_h.length - 292])],
                            [time290,parseFloat(candles_c[candles_c.length - 290]), parseFloat(candles_o[candles_o.length - 290]), parseFloat(candles_l[candles_l.length - 290]), parseFloat(candles_h[candles_h.length - 290])],

                            [time289,parseFloat(candles_c[candles_c.length - 289]), parseFloat(candles_o[candles_o.length - 289]), parseFloat(candles_l[candles_l.length - 289]), parseFloat(candles_h[candles_h.length - 289])],
                            [time288,parseFloat(candles_c[candles_c.length - 288]), parseFloat(candles_o[candles_o.length - 288]), parseFloat(candles_l[candles_l.length - 288]), parseFloat(candles_h[candles_h.length - 288])],
                            [time287,parseFloat(candles_c[candles_c.length - 287]), parseFloat(candles_o[candles_o.length - 287]), parseFloat(candles_l[candles_l.length - 287]), parseFloat(candles_h[candles_h.length - 287])],
                            [time286,parseFloat(candles_c[candles_c.length - 286]), parseFloat(candles_o[candles_o.length - 286]), parseFloat(candles_l[candles_l.length - 286]), parseFloat(candles_h[candles_h.length - 286])],
                            [time285,parseFloat(candles_c[candles_c.length - 285]), parseFloat(candles_o[candles_o.length - 285]), parseFloat(candles_l[candles_l.length - 285]), parseFloat(candles_h[candles_h.length - 285])],
                            [time284,parseFloat(candles_c[candles_c.length - 284]), parseFloat(candles_o[candles_o.length - 284]), parseFloat(candles_l[candles_l.length - 284]), parseFloat(candles_h[candles_h.length - 284])],
                            [time283,parseFloat(candles_c[candles_c.length - 283]), parseFloat(candles_o[candles_o.length - 283]), parseFloat(candles_l[candles_l.length - 283]), parseFloat(candles_h[candles_h.length - 283])],
                            [time282,parseFloat(candles_c[candles_c.length - 282]), parseFloat(candles_o[candles_o.length - 282]), parseFloat(candles_l[candles_l.length - 282]), parseFloat(candles_h[candles_h.length - 282])],
                            [time280,parseFloat(candles_c[candles_c.length - 280]), parseFloat(candles_o[candles_o.length - 280]), parseFloat(candles_l[candles_l.length - 280]), parseFloat(candles_h[candles_h.length - 280])],

                            [time279,parseFloat(candles_c[candles_c.length - 279]), parseFloat(candles_o[candles_o.length - 279]), parseFloat(candles_l[candles_l.length - 279]), parseFloat(candles_h[candles_h.length - 279])],
                            [time278,parseFloat(candles_c[candles_c.length - 278]), parseFloat(candles_o[candles_o.length - 278]), parseFloat(candles_l[candles_l.length - 278]), parseFloat(candles_h[candles_h.length - 278])],
                            [time277,parseFloat(candles_c[candles_c.length - 277]), parseFloat(candles_o[candles_o.length - 277]), parseFloat(candles_l[candles_l.length - 277]), parseFloat(candles_h[candles_h.length - 277])],
                            [time276,parseFloat(candles_c[candles_c.length - 276]), parseFloat(candles_o[candles_o.length - 276]), parseFloat(candles_l[candles_l.length - 276]), parseFloat(candles_h[candles_h.length - 276])],
                            [time275,parseFloat(candles_c[candles_c.length - 275]), parseFloat(candles_o[candles_o.length - 275]), parseFloat(candles_l[candles_l.length - 275]), parseFloat(candles_h[candles_h.length - 275])],
                            [time274,parseFloat(candles_c[candles_c.length - 274]), parseFloat(candles_o[candles_o.length - 274]), parseFloat(candles_l[candles_l.length - 274]), parseFloat(candles_h[candles_h.length - 274])],
                            [time273,parseFloat(candles_c[candles_c.length - 273]), parseFloat(candles_o[candles_o.length - 273]), parseFloat(candles_l[candles_l.length - 273]), parseFloat(candles_h[candles_h.length - 273])],
                            [time272,parseFloat(candles_c[candles_c.length - 272]), parseFloat(candles_o[candles_o.length - 272]), parseFloat(candles_l[candles_l.length - 272]), parseFloat(candles_h[candles_h.length - 272])],
                            [time270,parseFloat(candles_c[candles_c.length - 270]), parseFloat(candles_o[candles_o.length - 270]), parseFloat(candles_l[candles_l.length - 270]), parseFloat(candles_h[candles_h.length - 270])],

                            [time269,parseFloat(candles_c[candles_c.length - 269]), parseFloat(candles_o[candles_o.length - 269]), parseFloat(candles_l[candles_l.length - 269]), parseFloat(candles_h[candles_h.length - 269])],
                            [time268,parseFloat(candles_c[candles_c.length - 268]), parseFloat(candles_o[candles_o.length - 268]), parseFloat(candles_l[candles_l.length - 268]), parseFloat(candles_h[candles_h.length - 268])],
                            [time267,parseFloat(candles_c[candles_c.length - 267]), parseFloat(candles_o[candles_o.length - 267]), parseFloat(candles_l[candles_l.length - 267]), parseFloat(candles_h[candles_h.length - 267])],
                            [time266,parseFloat(candles_c[candles_c.length - 266]), parseFloat(candles_o[candles_o.length - 266]), parseFloat(candles_l[candles_l.length - 266]), parseFloat(candles_h[candles_h.length - 266])],
                            [time265,parseFloat(candles_c[candles_c.length - 265]), parseFloat(candles_o[candles_o.length - 265]), parseFloat(candles_l[candles_l.length - 265]), parseFloat(candles_h[candles_h.length - 265])],
                            [time264,parseFloat(candles_c[candles_c.length - 264]), parseFloat(candles_o[candles_o.length - 264]), parseFloat(candles_l[candles_l.length - 264]), parseFloat(candles_h[candles_h.length - 264])],
                            [time263,parseFloat(candles_c[candles_c.length - 263]), parseFloat(candles_o[candles_o.length - 263]), parseFloat(candles_l[candles_l.length - 263]), parseFloat(candles_h[candles_h.length - 263])],
                            [time262,parseFloat(candles_c[candles_c.length - 262]), parseFloat(candles_o[candles_o.length - 262]), parseFloat(candles_l[candles_l.length - 262]), parseFloat(candles_h[candles_h.length - 262])],
                            [time260,parseFloat(candles_c[candles_c.length - 260]), parseFloat(candles_o[candles_o.length - 260]), parseFloat(candles_l[candles_l.length - 260]), parseFloat(candles_h[candles_h.length - 260])],

                            [time259,parseFloat(candles_c[candles_c.length - 259]), parseFloat(candles_o[candles_o.length - 259]), parseFloat(candles_l[candles_l.length - 259]), parseFloat(candles_h[candles_h.length - 259])],
                            [time258,parseFloat(candles_c[candles_c.length - 258]), parseFloat(candles_o[candles_o.length - 258]), parseFloat(candles_l[candles_l.length - 258]), parseFloat(candles_h[candles_h.length - 258])],
                            [time257,parseFloat(candles_c[candles_c.length - 257]), parseFloat(candles_o[candles_o.length - 257]), parseFloat(candles_l[candles_l.length - 257]), parseFloat(candles_h[candles_h.length - 257])],
                            [time256,parseFloat(candles_c[candles_c.length - 256]), parseFloat(candles_o[candles_o.length - 256]), parseFloat(candles_l[candles_l.length - 256]), parseFloat(candles_h[candles_h.length - 256])],
                            [time255,parseFloat(candles_c[candles_c.length - 255]), parseFloat(candles_o[candles_o.length - 255]), parseFloat(candles_l[candles_l.length - 255]), parseFloat(candles_h[candles_h.length - 255])],
                            [time254,parseFloat(candles_c[candles_c.length - 254]), parseFloat(candles_o[candles_o.length - 254]), parseFloat(candles_l[candles_l.length - 254]), parseFloat(candles_h[candles_h.length - 254])],
                            [time253,parseFloat(candles_c[candles_c.length - 253]), parseFloat(candles_o[candles_o.length - 253]), parseFloat(candles_l[candles_l.length - 253]), parseFloat(candles_h[candles_h.length - 253])],
                            [time252,parseFloat(candles_c[candles_c.length - 252]), parseFloat(candles_o[candles_o.length - 252]), parseFloat(candles_l[candles_l.length - 252]), parseFloat(candles_h[candles_h.length - 252])],
                            [time250,parseFloat(candles_c[candles_c.length - 250]), parseFloat(candles_o[candles_o.length - 250]), parseFloat(candles_l[candles_l.length - 250]), parseFloat(candles_h[candles_h.length - 250])],

                            [time249,parseFloat(candles_c[candles_c.length - 249]), parseFloat(candles_o[candles_o.length - 249]), parseFloat(candles_l[candles_l.length - 249]), parseFloat(candles_h[candles_h.length - 249])],
                            [time248,parseFloat(candles_c[candles_c.length - 248]), parseFloat(candles_o[candles_o.length - 248]), parseFloat(candles_l[candles_l.length - 248]), parseFloat(candles_h[candles_h.length - 248])],
                            [time247,parseFloat(candles_c[candles_c.length - 247]), parseFloat(candles_o[candles_o.length - 247]), parseFloat(candles_l[candles_l.length - 247]), parseFloat(candles_h[candles_h.length - 247])],
                            [time246,parseFloat(candles_c[candles_c.length - 246]), parseFloat(candles_o[candles_o.length - 246]), parseFloat(candles_l[candles_l.length - 246]), parseFloat(candles_h[candles_h.length - 246])],
                            [time245,parseFloat(candles_c[candles_c.length - 245]), parseFloat(candles_o[candles_o.length - 245]), parseFloat(candles_l[candles_l.length - 245]), parseFloat(candles_h[candles_h.length - 245])],
                            [time244,parseFloat(candles_c[candles_c.length - 244]), parseFloat(candles_o[candles_o.length - 244]), parseFloat(candles_l[candles_l.length - 244]), parseFloat(candles_h[candles_h.length - 244])],
                            [time243,parseFloat(candles_c[candles_c.length - 243]), parseFloat(candles_o[candles_o.length - 243]), parseFloat(candles_l[candles_l.length - 243]), parseFloat(candles_h[candles_h.length - 243])],
                            [time242,parseFloat(candles_c[candles_c.length - 242]), parseFloat(candles_o[candles_o.length - 242]), parseFloat(candles_l[candles_l.length - 242]), parseFloat(candles_h[candles_h.length - 242])],
                            [time240,parseFloat(candles_c[candles_c.length - 240]), parseFloat(candles_o[candles_o.length - 240]), parseFloat(candles_l[candles_l.length - 240]), parseFloat(candles_h[candles_h.length - 240])],

                            [time239,parseFloat(candles_c[candles_c.length - 239]), parseFloat(candles_o[candles_o.length - 239]), parseFloat(candles_l[candles_l.length - 239]), parseFloat(candles_h[candles_h.length - 239])],
                            [time238,parseFloat(candles_c[candles_c.length - 238]), parseFloat(candles_o[candles_o.length - 238]), parseFloat(candles_l[candles_l.length - 238]), parseFloat(candles_h[candles_h.length - 238])],
                            [time237,parseFloat(candles_c[candles_c.length - 237]), parseFloat(candles_o[candles_o.length - 237]), parseFloat(candles_l[candles_l.length - 237]), parseFloat(candles_h[candles_h.length - 237])],
                            [time236,parseFloat(candles_c[candles_c.length - 236]), parseFloat(candles_o[candles_o.length - 236]), parseFloat(candles_l[candles_l.length - 236]), parseFloat(candles_h[candles_h.length - 236])],
                            [time235,parseFloat(candles_c[candles_c.length - 235]), parseFloat(candles_o[candles_o.length - 235]), parseFloat(candles_l[candles_l.length - 235]), parseFloat(candles_h[candles_h.length - 235])],
                            [time234,parseFloat(candles_c[candles_c.length - 234]), parseFloat(candles_o[candles_o.length - 234]), parseFloat(candles_l[candles_l.length - 234]), parseFloat(candles_h[candles_h.length - 234])],
                            [time233,parseFloat(candles_c[candles_c.length - 233]), parseFloat(candles_o[candles_o.length - 233]), parseFloat(candles_l[candles_l.length - 233]), parseFloat(candles_h[candles_h.length - 233])],
                            [time232,parseFloat(candles_c[candles_c.length - 232]), parseFloat(candles_o[candles_o.length - 232]), parseFloat(candles_l[candles_l.length - 232]), parseFloat(candles_h[candles_h.length - 232])],
                            [time230,parseFloat(candles_c[candles_c.length - 230]), parseFloat(candles_o[candles_o.length - 230]), parseFloat(candles_l[candles_l.length - 230]), parseFloat(candles_h[candles_h.length - 230])],

                            [time229,parseFloat(candles_c[candles_c.length - 229]), parseFloat(candles_o[candles_o.length - 229]), parseFloat(candles_l[candles_l.length - 229]), parseFloat(candles_h[candles_h.length - 229])],
                            [time228,parseFloat(candles_c[candles_c.length - 228]), parseFloat(candles_o[candles_o.length - 228]), parseFloat(candles_l[candles_l.length - 228]), parseFloat(candles_h[candles_h.length - 228])],
                            [time227,parseFloat(candles_c[candles_c.length - 227]), parseFloat(candles_o[candles_o.length - 227]), parseFloat(candles_l[candles_l.length - 227]), parseFloat(candles_h[candles_h.length - 227])],
                            [time226,parseFloat(candles_c[candles_c.length - 226]), parseFloat(candles_o[candles_o.length - 226]), parseFloat(candles_l[candles_l.length - 226]), parseFloat(candles_h[candles_h.length - 226])],
                            [time225,parseFloat(candles_c[candles_c.length - 225]), parseFloat(candles_o[candles_o.length - 225]), parseFloat(candles_l[candles_l.length - 225]), parseFloat(candles_h[candles_h.length - 225])],
                            [time224,parseFloat(candles_c[candles_c.length - 224]), parseFloat(candles_o[candles_o.length - 224]), parseFloat(candles_l[candles_l.length - 224]), parseFloat(candles_h[candles_h.length - 224])],
                            [time223,parseFloat(candles_c[candles_c.length - 223]), parseFloat(candles_o[candles_o.length - 223]), parseFloat(candles_l[candles_l.length - 223]), parseFloat(candles_h[candles_h.length - 223])],
                            [time222,parseFloat(candles_c[candles_c.length - 222]), parseFloat(candles_o[candles_o.length - 222]), parseFloat(candles_l[candles_l.length - 222]), parseFloat(candles_h[candles_h.length - 222])],
                            [time220,parseFloat(candles_c[candles_c.length - 220]), parseFloat(candles_o[candles_o.length - 220]), parseFloat(candles_l[candles_l.length - 220]), parseFloat(candles_h[candles_h.length - 220])],

                            [time219,parseFloat(candles_c[candles_c.length - 219]), parseFloat(candles_o[candles_o.length - 219]), parseFloat(candles_l[candles_l.length - 219]), parseFloat(candles_h[candles_h.length - 219])],
                            [time218,parseFloat(candles_c[candles_c.length - 218]), parseFloat(candles_o[candles_o.length - 218]), parseFloat(candles_l[candles_l.length - 218]), parseFloat(candles_h[candles_h.length - 218])],
                            [time217,parseFloat(candles_c[candles_c.length - 217]), parseFloat(candles_o[candles_o.length - 217]), parseFloat(candles_l[candles_l.length - 217]), parseFloat(candles_h[candles_h.length - 217])],
                            [time216,parseFloat(candles_c[candles_c.length - 216]), parseFloat(candles_o[candles_o.length - 216]), parseFloat(candles_l[candles_l.length - 216]), parseFloat(candles_h[candles_h.length - 216])],
                            [time215,parseFloat(candles_c[candles_c.length - 215]), parseFloat(candles_o[candles_o.length - 215]), parseFloat(candles_l[candles_l.length - 215]), parseFloat(candles_h[candles_h.length - 215])],
                            [time214,parseFloat(candles_c[candles_c.length - 214]), parseFloat(candles_o[candles_o.length - 214]), parseFloat(candles_l[candles_l.length - 214]), parseFloat(candles_h[candles_h.length - 214])],
                            [time213,parseFloat(candles_c[candles_c.length - 213]), parseFloat(candles_o[candles_o.length - 213]), parseFloat(candles_l[candles_l.length - 213]), parseFloat(candles_h[candles_h.length - 213])],
                            [time212,parseFloat(candles_c[candles_c.length - 212]), parseFloat(candles_o[candles_o.length - 212]), parseFloat(candles_l[candles_l.length - 212]), parseFloat(candles_h[candles_h.length - 212])],
                            [time210,parseFloat(candles_c[candles_c.length - 210]), parseFloat(candles_o[candles_o.length - 210]), parseFloat(candles_l[candles_l.length - 210]), parseFloat(candles_h[candles_h.length - 210])],

                            [time209,parseFloat(candles_c[candles_c.length - 209]), parseFloat(candles_o[candles_o.length - 209]), parseFloat(candles_l[candles_l.length - 209]), parseFloat(candles_h[candles_h.length - 209])],
                            [time208,parseFloat(candles_c[candles_c.length - 208]), parseFloat(candles_o[candles_o.length - 208]), parseFloat(candles_l[candles_l.length - 208]), parseFloat(candles_h[candles_h.length - 208])],
                            [time207,parseFloat(candles_c[candles_c.length - 207]), parseFloat(candles_o[candles_o.length - 207]), parseFloat(candles_l[candles_l.length - 207]), parseFloat(candles_h[candles_h.length - 207])],
                            [time206,parseFloat(candles_c[candles_c.length - 206]), parseFloat(candles_o[candles_o.length - 206]), parseFloat(candles_l[candles_l.length - 206]), parseFloat(candles_h[candles_h.length - 206])],
                            [time205,parseFloat(candles_c[candles_c.length - 205]), parseFloat(candles_o[candles_o.length - 205]), parseFloat(candles_l[candles_l.length - 205]), parseFloat(candles_h[candles_h.length - 205])],
                            [time204,parseFloat(candles_c[candles_c.length - 204]), parseFloat(candles_o[candles_o.length - 204]), parseFloat(candles_l[candles_l.length - 204]), parseFloat(candles_h[candles_h.length - 204])],
                            [time203,parseFloat(candles_c[candles_c.length - 203]), parseFloat(candles_o[candles_o.length - 203]), parseFloat(candles_l[candles_l.length - 203]), parseFloat(candles_h[candles_h.length - 203])],
                            [time202,parseFloat(candles_c[candles_c.length - 202]), parseFloat(candles_o[candles_o.length - 202]), parseFloat(candles_l[candles_l.length - 202]), parseFloat(candles_h[candles_h.length - 202])],
                            [time200,parseFloat(candles_c[candles_c.length - 200]), parseFloat(candles_o[candles_o.length - 200]), parseFloat(candles_l[candles_l.length - 200]), parseFloat(candles_h[candles_h.length - 200])],

                            [time199,parseFloat(candles_c[candles_c.length - 199]), parseFloat(candles_o[candles_o.length - 199]), parseFloat(candles_l[candles_l.length - 199]), parseFloat(candles_h[candles_h.length - 199])],
                            [time198,parseFloat(candles_c[candles_c.length - 198]), parseFloat(candles_o[candles_o.length - 198]), parseFloat(candles_l[candles_l.length - 198]), parseFloat(candles_h[candles_h.length - 198])],
                            [time197,parseFloat(candles_c[candles_c.length - 197]), parseFloat(candles_o[candles_o.length - 197]), parseFloat(candles_l[candles_l.length - 197]), parseFloat(candles_h[candles_h.length - 197])],
                            [time196,parseFloat(candles_c[candles_c.length - 196]), parseFloat(candles_o[candles_o.length - 196]), parseFloat(candles_l[candles_l.length - 196]), parseFloat(candles_h[candles_h.length - 196])],
                            [time195,parseFloat(candles_c[candles_c.length - 195]), parseFloat(candles_o[candles_o.length - 195]), parseFloat(candles_l[candles_l.length - 195]), parseFloat(candles_h[candles_h.length - 195])],
                            [time194,parseFloat(candles_c[candles_c.length - 194]), parseFloat(candles_o[candles_o.length - 194]), parseFloat(candles_l[candles_l.length - 194]), parseFloat(candles_h[candles_h.length - 194])],
                            [time193,parseFloat(candles_c[candles_c.length - 193]), parseFloat(candles_o[candles_o.length - 193]), parseFloat(candles_l[candles_l.length - 193]), parseFloat(candles_h[candles_h.length - 193])],
                            [time192,parseFloat(candles_c[candles_c.length - 192]), parseFloat(candles_o[candles_o.length - 192]), parseFloat(candles_l[candles_l.length - 192]), parseFloat(candles_h[candles_h.length - 192])],
                            [time190,parseFloat(candles_c[candles_c.length - 190]), parseFloat(candles_o[candles_o.length - 190]), parseFloat(candles_l[candles_l.length - 190]), parseFloat(candles_h[candles_h.length - 190])],

                            [time189,parseFloat(candles_c[candles_c.length - 189]), parseFloat(candles_o[candles_o.length - 189]), parseFloat(candles_l[candles_l.length - 189]), parseFloat(candles_h[candles_h.length - 189])],
                            [time188,parseFloat(candles_c[candles_c.length - 188]), parseFloat(candles_o[candles_o.length - 188]), parseFloat(candles_l[candles_l.length - 188]), parseFloat(candles_h[candles_h.length - 188])],
                            [time187,parseFloat(candles_c[candles_c.length - 187]), parseFloat(candles_o[candles_o.length - 187]), parseFloat(candles_l[candles_l.length - 187]), parseFloat(candles_h[candles_h.length - 187])],
                            [time186,parseFloat(candles_c[candles_c.length - 186]), parseFloat(candles_o[candles_o.length - 186]), parseFloat(candles_l[candles_l.length - 186]), parseFloat(candles_h[candles_h.length - 186])],
                            [time185,parseFloat(candles_c[candles_c.length - 185]), parseFloat(candles_o[candles_o.length - 185]), parseFloat(candles_l[candles_l.length - 185]), parseFloat(candles_h[candles_h.length - 185])],
                            [time184,parseFloat(candles_c[candles_c.length - 184]), parseFloat(candles_o[candles_o.length - 184]), parseFloat(candles_l[candles_l.length - 184]), parseFloat(candles_h[candles_h.length - 184])],
                            [time183,parseFloat(candles_c[candles_c.length - 183]), parseFloat(candles_o[candles_o.length - 183]), parseFloat(candles_l[candles_l.length - 183]), parseFloat(candles_h[candles_h.length - 183])],
                            [time182,parseFloat(candles_c[candles_c.length - 182]), parseFloat(candles_o[candles_o.length - 182]), parseFloat(candles_l[candles_l.length - 182]), parseFloat(candles_h[candles_h.length - 182])],
                            [time180,parseFloat(candles_c[candles_c.length - 180]), parseFloat(candles_o[candles_o.length - 180]), parseFloat(candles_l[candles_l.length - 180]), parseFloat(candles_h[candles_h.length - 180])],

                            [time179,parseFloat(candles_c[candles_c.length - 179]), parseFloat(candles_o[candles_o.length - 179]), parseFloat(candles_l[candles_l.length - 179]), parseFloat(candles_h[candles_h.length - 179])],
                            [time178,parseFloat(candles_c[candles_c.length - 178]), parseFloat(candles_o[candles_o.length - 178]), parseFloat(candles_l[candles_l.length - 178]), parseFloat(candles_h[candles_h.length - 178])],
                            [time177,parseFloat(candles_c[candles_c.length - 177]), parseFloat(candles_o[candles_o.length - 177]), parseFloat(candles_l[candles_l.length - 177]), parseFloat(candles_h[candles_h.length - 177])],
                            [time176,parseFloat(candles_c[candles_c.length - 176]), parseFloat(candles_o[candles_o.length - 176]), parseFloat(candles_l[candles_l.length - 176]), parseFloat(candles_h[candles_h.length - 176])],
                            [time175,parseFloat(candles_c[candles_c.length - 175]), parseFloat(candles_o[candles_o.length - 175]), parseFloat(candles_l[candles_l.length - 175]), parseFloat(candles_h[candles_h.length - 175])],
                            [time174,parseFloat(candles_c[candles_c.length - 174]), parseFloat(candles_o[candles_o.length - 174]), parseFloat(candles_l[candles_l.length - 174]), parseFloat(candles_h[candles_h.length - 174])],
                            [time173,parseFloat(candles_c[candles_c.length - 173]), parseFloat(candles_o[candles_o.length - 173]), parseFloat(candles_l[candles_l.length - 173]), parseFloat(candles_h[candles_h.length - 173])],
                            [time172,parseFloat(candles_c[candles_c.length - 172]), parseFloat(candles_o[candles_o.length - 172]), parseFloat(candles_l[candles_l.length - 172]), parseFloat(candles_h[candles_h.length - 172])],
                            [time170,parseFloat(candles_c[candles_c.length - 170]), parseFloat(candles_o[candles_o.length - 170]), parseFloat(candles_l[candles_l.length - 170]), parseFloat(candles_h[candles_h.length - 170])],

                            [time169,parseFloat(candles_c[candles_c.length - 169]), parseFloat(candles_o[candles_o.length - 169]), parseFloat(candles_l[candles_l.length - 169]), parseFloat(candles_h[candles_h.length - 169])],
                            [time168,parseFloat(candles_c[candles_c.length - 168]), parseFloat(candles_o[candles_o.length - 168]), parseFloat(candles_l[candles_l.length - 168]), parseFloat(candles_h[candles_h.length - 168])],
                            [time167,parseFloat(candles_c[candles_c.length - 167]), parseFloat(candles_o[candles_o.length - 167]), parseFloat(candles_l[candles_l.length - 167]), parseFloat(candles_h[candles_h.length - 167])],
                            [time166,parseFloat(candles_c[candles_c.length - 166]), parseFloat(candles_o[candles_o.length - 166]), parseFloat(candles_l[candles_l.length - 166]), parseFloat(candles_h[candles_h.length - 166])],
                            [time165,parseFloat(candles_c[candles_c.length - 165]), parseFloat(candles_o[candles_o.length - 165]), parseFloat(candles_l[candles_l.length - 165]), parseFloat(candles_h[candles_h.length - 165])],
                            [time164,parseFloat(candles_c[candles_c.length - 164]), parseFloat(candles_o[candles_o.length - 164]), parseFloat(candles_l[candles_l.length - 164]), parseFloat(candles_h[candles_h.length - 164])],
                            [time163,parseFloat(candles_c[candles_c.length - 163]), parseFloat(candles_o[candles_o.length - 163]), parseFloat(candles_l[candles_l.length - 163]), parseFloat(candles_h[candles_h.length - 163])],
                            [time162,parseFloat(candles_c[candles_c.length - 162]), parseFloat(candles_o[candles_o.length - 162]), parseFloat(candles_l[candles_l.length - 162]), parseFloat(candles_h[candles_h.length - 162])],
                            [time160,parseFloat(candles_c[candles_c.length - 160]), parseFloat(candles_o[candles_o.length - 160]), parseFloat(candles_l[candles_l.length - 160]), parseFloat(candles_h[candles_h.length - 160])],

                            [time159,parseFloat(candles_c[candles_c.length - 159]), parseFloat(candles_o[candles_o.length - 159]), parseFloat(candles_l[candles_l.length - 159]), parseFloat(candles_h[candles_h.length - 159])],
                            [time158,parseFloat(candles_c[candles_c.length - 158]), parseFloat(candles_o[candles_o.length - 158]), parseFloat(candles_l[candles_l.length - 158]), parseFloat(candles_h[candles_h.length - 158])],
                            [time157,parseFloat(candles_c[candles_c.length - 157]), parseFloat(candles_o[candles_o.length - 157]), parseFloat(candles_l[candles_l.length - 157]), parseFloat(candles_h[candles_h.length - 157])],
                            [time156,parseFloat(candles_c[candles_c.length - 156]), parseFloat(candles_o[candles_o.length - 156]), parseFloat(candles_l[candles_l.length - 156]), parseFloat(candles_h[candles_h.length - 156])],
                            [time155,parseFloat(candles_c[candles_c.length - 155]), parseFloat(candles_o[candles_o.length - 155]), parseFloat(candles_l[candles_l.length - 155]), parseFloat(candles_h[candles_h.length - 155])],
                            [time154,parseFloat(candles_c[candles_c.length - 154]), parseFloat(candles_o[candles_o.length - 154]), parseFloat(candles_l[candles_l.length - 154]), parseFloat(candles_h[candles_h.length - 154])],
                            [time153,parseFloat(candles_c[candles_c.length - 153]), parseFloat(candles_o[candles_o.length - 153]), parseFloat(candles_l[candles_l.length - 153]), parseFloat(candles_h[candles_h.length - 153])],
                            [time152,parseFloat(candles_c[candles_c.length - 152]), parseFloat(candles_o[candles_o.length - 152]), parseFloat(candles_l[candles_l.length - 152]), parseFloat(candles_h[candles_h.length - 152])],
                            [time150,parseFloat(candles_c[candles_c.length - 150]), parseFloat(candles_o[candles_o.length - 150]), parseFloat(candles_l[candles_l.length - 150]), parseFloat(candles_h[candles_h.length - 150])],

                            [time149,parseFloat(candles_c[candles_c.length - 149]), parseFloat(candles_o[candles_o.length - 149]), parseFloat(candles_l[candles_l.length - 149]), parseFloat(candles_h[candles_h.length - 149])],
                            [time148,parseFloat(candles_c[candles_c.length - 148]), parseFloat(candles_o[candles_o.length - 148]), parseFloat(candles_l[candles_l.length - 148]), parseFloat(candles_h[candles_h.length - 148])],
                            [time147,parseFloat(candles_c[candles_c.length - 147]), parseFloat(candles_o[candles_o.length - 147]), parseFloat(candles_l[candles_l.length - 147]), parseFloat(candles_h[candles_h.length - 147])],
                            [time146,parseFloat(candles_c[candles_c.length - 146]), parseFloat(candles_o[candles_o.length - 146]), parseFloat(candles_l[candles_l.length - 146]), parseFloat(candles_h[candles_h.length - 146])],
                            [time145,parseFloat(candles_c[candles_c.length - 145]), parseFloat(candles_o[candles_o.length - 145]), parseFloat(candles_l[candles_l.length - 145]), parseFloat(candles_h[candles_h.length - 145])],
                            [time144,parseFloat(candles_c[candles_c.length - 144]), parseFloat(candles_o[candles_o.length - 144]), parseFloat(candles_l[candles_l.length - 144]), parseFloat(candles_h[candles_h.length - 144])],
                            [time143,parseFloat(candles_c[candles_c.length - 143]), parseFloat(candles_o[candles_o.length - 143]), parseFloat(candles_l[candles_l.length - 143]), parseFloat(candles_h[candles_h.length - 143])],
                            [time142,parseFloat(candles_c[candles_c.length - 142]), parseFloat(candles_o[candles_o.length - 142]), parseFloat(candles_l[candles_l.length - 142]), parseFloat(candles_h[candles_h.length - 142])],
                            [time141,parseFloat(candles_c[candles_c.length - 141]), parseFloat(candles_o[candles_o.length - 141]), parseFloat(candles_l[candles_l.length - 141]), parseFloat(candles_h[candles_h.length - 141])],
                            [time140,parseFloat(candles_c[candles_c.length - 140]), parseFloat(candles_o[candles_o.length - 140]), parseFloat(candles_l[candles_l.length - 140]), parseFloat(candles_h[candles_h.length - 140])],

                            [time139,parseFloat(candles_c[candles_c.length - 139]), parseFloat(candles_o[candles_o.length - 139]), parseFloat(candles_l[candles_l.length - 139]), parseFloat(candles_h[candles_h.length - 139])],
                            [time138,parseFloat(candles_c[candles_c.length - 138]), parseFloat(candles_o[candles_o.length - 138]), parseFloat(candles_l[candles_l.length - 138]), parseFloat(candles_h[candles_h.length - 138])],
                            [time137,parseFloat(candles_c[candles_c.length - 137]), parseFloat(candles_o[candles_o.length - 137]), parseFloat(candles_l[candles_l.length - 137]), parseFloat(candles_h[candles_h.length - 137])],
                            [time136,parseFloat(candles_c[candles_c.length - 136]), parseFloat(candles_o[candles_o.length - 136]), parseFloat(candles_l[candles_l.length - 136]), parseFloat(candles_h[candles_h.length - 136])],
                            [time135,parseFloat(candles_c[candles_c.length - 135]), parseFloat(candles_o[candles_o.length - 135]), parseFloat(candles_l[candles_l.length - 135]), parseFloat(candles_h[candles_h.length - 135])],
                            [time134,parseFloat(candles_c[candles_c.length - 134]), parseFloat(candles_o[candles_o.length - 134]), parseFloat(candles_l[candles_l.length - 134]), parseFloat(candles_h[candles_h.length - 134])],
                            [time133,parseFloat(candles_c[candles_c.length - 133]), parseFloat(candles_o[candles_o.length - 133]), parseFloat(candles_l[candles_l.length - 133]), parseFloat(candles_h[candles_h.length - 133])],
                            [time132,parseFloat(candles_c[candles_c.length - 132]), parseFloat(candles_o[candles_o.length - 132]), parseFloat(candles_l[candles_l.length - 132]), parseFloat(candles_h[candles_h.length - 132])],
                            [time131,parseFloat(candles_c[candles_c.length - 131]), parseFloat(candles_o[candles_o.length - 131]), parseFloat(candles_l[candles_l.length - 131]), parseFloat(candles_h[candles_h.length - 131])],
                            [time130,parseFloat(candles_c[candles_c.length - 130]), parseFloat(candles_o[candles_o.length - 130]), parseFloat(candles_l[candles_l.length - 130]), parseFloat(candles_h[candles_h.length - 130])],

                            [time129,parseFloat(candles_c[candles_c.length - 129]), parseFloat(candles_o[candles_o.length - 129]), parseFloat(candles_l[candles_l.length - 129]), parseFloat(candles_h[candles_h.length - 129])],
                            [time128,parseFloat(candles_c[candles_c.length - 128]), parseFloat(candles_o[candles_o.length - 128]), parseFloat(candles_l[candles_l.length - 128]), parseFloat(candles_h[candles_h.length - 128])],
                            [time127,parseFloat(candles_c[candles_c.length - 127]), parseFloat(candles_o[candles_o.length - 127]), parseFloat(candles_l[candles_l.length - 127]), parseFloat(candles_h[candles_h.length - 127])],
                            [time126,parseFloat(candles_c[candles_c.length - 126]), parseFloat(candles_o[candles_o.length - 126]), parseFloat(candles_l[candles_l.length - 126]), parseFloat(candles_h[candles_h.length - 126])],
                            [time125,parseFloat(candles_c[candles_c.length - 125]), parseFloat(candles_o[candles_o.length - 125]), parseFloat(candles_l[candles_l.length - 125]), parseFloat(candles_h[candles_h.length - 125])],
                            [time124,parseFloat(candles_c[candles_c.length - 124]), parseFloat(candles_o[candles_o.length - 124]), parseFloat(candles_l[candles_l.length - 124]), parseFloat(candles_h[candles_h.length - 124])],
                            [time123,parseFloat(candles_c[candles_c.length - 123]), parseFloat(candles_o[candles_o.length - 123]), parseFloat(candles_l[candles_l.length - 123]), parseFloat(candles_h[candles_h.length - 123])],
                            [time122,parseFloat(candles_c[candles_c.length - 122]), parseFloat(candles_o[candles_o.length - 122]), parseFloat(candles_l[candles_l.length - 122]), parseFloat(candles_h[candles_h.length - 122])],
                            [time121,parseFloat(candles_c[candles_c.length - 121]), parseFloat(candles_o[candles_o.length - 121]), parseFloat(candles_l[candles_l.length - 121]), parseFloat(candles_h[candles_h.length - 121])],
                            [time120,parseFloat(candles_c[candles_c.length - 120]), parseFloat(candles_o[candles_o.length - 120]), parseFloat(candles_l[candles_l.length - 120]), parseFloat(candles_h[candles_h.length - 120])],

                            [time119,parseFloat(candles_c[candles_c.length - 119]), parseFloat(candles_o[candles_o.length - 119]), parseFloat(candles_l[candles_l.length - 119]), parseFloat(candles_h[candles_h.length - 119])],
                            [time118,parseFloat(candles_c[candles_c.length - 118]), parseFloat(candles_o[candles_o.length - 118]), parseFloat(candles_l[candles_l.length - 118]), parseFloat(candles_h[candles_h.length - 118])],
                            [time117,parseFloat(candles_c[candles_c.length - 117]), parseFloat(candles_o[candles_o.length - 117]), parseFloat(candles_l[candles_l.length - 117]), parseFloat(candles_h[candles_h.length - 117])],
                            [time116,parseFloat(candles_c[candles_c.length - 116]), parseFloat(candles_o[candles_o.length - 116]), parseFloat(candles_l[candles_l.length - 116]), parseFloat(candles_h[candles_h.length - 116])],
                            [time115,parseFloat(candles_c[candles_c.length - 115]), parseFloat(candles_o[candles_o.length - 115]), parseFloat(candles_l[candles_l.length - 115]), parseFloat(candles_h[candles_h.length - 115])],
                            [time114,parseFloat(candles_c[candles_c.length - 114]), parseFloat(candles_o[candles_o.length - 114]), parseFloat(candles_l[candles_l.length - 114]), parseFloat(candles_h[candles_h.length - 114])],
                            [time113,parseFloat(candles_c[candles_c.length - 113]), parseFloat(candles_o[candles_o.length - 113]), parseFloat(candles_l[candles_l.length - 113]), parseFloat(candles_h[candles_h.length - 113])],
                            [time112,parseFloat(candles_c[candles_c.length - 112]), parseFloat(candles_o[candles_o.length - 112]), parseFloat(candles_l[candles_l.length - 112]), parseFloat(candles_h[candles_h.length - 112])],
                            [time111,parseFloat(candles_c[candles_c.length - 111]), parseFloat(candles_o[candles_o.length - 111]), parseFloat(candles_l[candles_l.length - 111]), parseFloat(candles_h[candles_h.length - 111])],
                            [time110,parseFloat(candles_c[candles_c.length - 110]), parseFloat(candles_o[candles_o.length - 110]), parseFloat(candles_l[candles_l.length - 110]), parseFloat(candles_h[candles_h.length - 110])],

                            [time109,parseFloat(candles_c[candles_c.length - 109]), parseFloat(candles_o[candles_o.length - 109]), parseFloat(candles_l[candles_l.length - 109]), parseFloat(candles_h[candles_h.length - 109])],
                            [time108,parseFloat(candles_c[candles_c.length - 108]), parseFloat(candles_o[candles_o.length - 108]), parseFloat(candles_l[candles_l.length - 108]), parseFloat(candles_h[candles_h.length - 108])],
                            [time107,parseFloat(candles_c[candles_c.length - 107]), parseFloat(candles_o[candles_o.length - 107]), parseFloat(candles_l[candles_l.length - 107]), parseFloat(candles_h[candles_h.length - 107])],
                            [time106,parseFloat(candles_c[candles_c.length - 106]), parseFloat(candles_o[candles_o.length - 106]), parseFloat(candles_l[candles_l.length - 106]), parseFloat(candles_h[candles_h.length - 106])],
                            [time105,parseFloat(candles_c[candles_c.length - 105]), parseFloat(candles_o[candles_o.length - 105]), parseFloat(candles_l[candles_l.length - 105]), parseFloat(candles_h[candles_h.length - 105])],
                            [time104,parseFloat(candles_c[candles_c.length - 104]), parseFloat(candles_o[candles_o.length - 104]), parseFloat(candles_l[candles_l.length - 104]), parseFloat(candles_h[candles_h.length - 104])],
                            [time103,parseFloat(candles_c[candles_c.length - 103]), parseFloat(candles_o[candles_o.length - 103]), parseFloat(candles_l[candles_l.length - 103]), parseFloat(candles_h[candles_h.length - 103])],
                            [time102,parseFloat(candles_c[candles_c.length - 102]), parseFloat(candles_o[candles_o.length - 102]), parseFloat(candles_l[candles_l.length - 102]), parseFloat(candles_h[candles_h.length - 102])],
                            [time101,parseFloat(candles_c[candles_c.length - 101]), parseFloat(candles_o[candles_o.length - 101]), parseFloat(candles_l[candles_l.length - 101]), parseFloat(candles_h[candles_h.length - 101])],
                            [time100,parseFloat(candles_c[candles_c.length - 100]), parseFloat(candles_o[candles_o.length - 100]), parseFloat(candles_l[candles_l.length - 100]), parseFloat(candles_h[candles_h.length - 100])],

                            [time99,parseFloat(candles_c[candles_c.length - 99]), parseFloat(candles_o[candles_o.length - 99]), parseFloat(candles_l[candles_l.length - 99]), parseFloat(candles_h[candles_h.length - 99])],
                            [time98,parseFloat(candles_c[candles_c.length - 98]), parseFloat(candles_o[candles_o.length - 98]), parseFloat(candles_l[candles_l.length - 98]), parseFloat(candles_h[candles_h.length - 98])],
                            [time97,parseFloat(candles_c[candles_c.length - 97]), parseFloat(candles_o[candles_o.length - 97]), parseFloat(candles_l[candles_l.length - 97]), parseFloat(candles_h[candles_h.length - 97])],
                            [time96,parseFloat(candles_c[candles_c.length - 96]), parseFloat(candles_o[candles_o.length - 96]), parseFloat(candles_l[candles_l.length - 96]), parseFloat(candles_h[candles_h.length - 96])],
                            [time95,parseFloat(candles_c[candles_c.length - 95]), parseFloat(candles_o[candles_o.length - 95]), parseFloat(candles_l[candles_l.length - 95]), parseFloat(candles_h[candles_h.length - 95])],
                            [time94,parseFloat(candles_c[candles_c.length - 94]), parseFloat(candles_o[candles_o.length - 94]), parseFloat(candles_l[candles_l.length - 94]), parseFloat(candles_h[candles_h.length - 94])],
                            [time93,parseFloat(candles_c[candles_c.length - 93]), parseFloat(candles_o[candles_o.length - 93]), parseFloat(candles_l[candles_l.length - 93]), parseFloat(candles_h[candles_h.length - 93])],
                            [time92,parseFloat(candles_c[candles_c.length - 92]), parseFloat(candles_o[candles_o.length - 92]), parseFloat(candles_l[candles_l.length - 92]), parseFloat(candles_h[candles_h.length - 92])],
                            [time91,parseFloat(candles_c[candles_c.length - 91]), parseFloat(candles_o[candles_o.length - 91]), parseFloat(candles_l[candles_l.length - 91]), parseFloat(candles_h[candles_h.length - 91])],
                            [time90,parseFloat(candles_c[candles_c.length - 90]), parseFloat(candles_o[candles_o.length - 90]), parseFloat(candles_l[candles_l.length - 90]), parseFloat(candles_h[candles_h.length - 90])],

                            [time89,parseFloat(candles_c[candles_c.length - 89]), parseFloat(candles_o[candles_o.length - 89]), parseFloat(candles_l[candles_l.length - 89]), parseFloat(candles_h[candles_h.length - 89])],
                            [time88,parseFloat(candles_c[candles_c.length - 88]), parseFloat(candles_o[candles_o.length - 88]), parseFloat(candles_l[candles_l.length - 88]), parseFloat(candles_h[candles_h.length - 88])],
                            [time87,parseFloat(candles_c[candles_c.length - 87]), parseFloat(candles_o[candles_o.length - 87]), parseFloat(candles_l[candles_l.length - 87]), parseFloat(candles_h[candles_h.length - 87])],
                            [time86,parseFloat(candles_c[candles_c.length - 86]), parseFloat(candles_o[candles_o.length - 86]), parseFloat(candles_l[candles_l.length - 86]), parseFloat(candles_h[candles_h.length - 86])],
                            [time85,parseFloat(candles_c[candles_c.length - 85]), parseFloat(candles_o[candles_o.length - 85]), parseFloat(candles_l[candles_l.length - 85]), parseFloat(candles_h[candles_h.length - 85])],
                            [time84,parseFloat(candles_c[candles_c.length - 84]), parseFloat(candles_o[candles_o.length - 84]), parseFloat(candles_l[candles_l.length - 84]), parseFloat(candles_h[candles_h.length - 84])],
                            [time83,parseFloat(candles_c[candles_c.length - 83]), parseFloat(candles_o[candles_o.length - 83]), parseFloat(candles_l[candles_l.length - 83]), parseFloat(candles_h[candles_h.length - 83])],
                            [time82,parseFloat(candles_c[candles_c.length - 82]), parseFloat(candles_o[candles_o.length - 82]), parseFloat(candles_l[candles_l.length - 82]), parseFloat(candles_h[candles_h.length - 82])],
                            [time81,parseFloat(candles_c[candles_c.length - 81]), parseFloat(candles_o[candles_o.length - 81]), parseFloat(candles_l[candles_l.length - 81]), parseFloat(candles_h[candles_h.length - 81])],
                            [time80,parseFloat(candles_c[candles_c.length - 80]), parseFloat(candles_o[candles_o.length - 80]), parseFloat(candles_l[candles_l.length - 80]), parseFloat(candles_h[candles_h.length - 80])],

                            [time79,parseFloat(candles_c[candles_c.length - 79]), parseFloat(candles_o[candles_o.length - 79]), parseFloat(candles_l[candles_l.length - 79]), parseFloat(candles_h[candles_h.length - 79])],
                            [time78,parseFloat(candles_c[candles_c.length - 78]), parseFloat(candles_o[candles_o.length - 78]), parseFloat(candles_l[candles_l.length - 78]), parseFloat(candles_h[candles_h.length - 78])],
                            [time77,parseFloat(candles_c[candles_c.length - 77]), parseFloat(candles_o[candles_o.length - 77]), parseFloat(candles_l[candles_l.length - 77]), parseFloat(candles_h[candles_h.length - 77])],
                            [time76,parseFloat(candles_c[candles_c.length - 76]), parseFloat(candles_o[candles_o.length - 76]), parseFloat(candles_l[candles_l.length - 76]), parseFloat(candles_h[candles_h.length - 76])],
                            [time75,parseFloat(candles_c[candles_c.length - 75]), parseFloat(candles_o[candles_o.length - 75]), parseFloat(candles_l[candles_l.length - 75]), parseFloat(candles_h[candles_h.length - 75])],
                            [time74,parseFloat(candles_c[candles_c.length - 74]), parseFloat(candles_o[candles_o.length - 74]), parseFloat(candles_l[candles_l.length - 74]), parseFloat(candles_h[candles_h.length - 74])],
                            [time73,parseFloat(candles_c[candles_c.length - 73]), parseFloat(candles_o[candles_o.length - 73]), parseFloat(candles_l[candles_l.length - 73]), parseFloat(candles_h[candles_h.length - 73])],
                            [time72,parseFloat(candles_c[candles_c.length - 72]), parseFloat(candles_o[candles_o.length - 72]), parseFloat(candles_l[candles_l.length - 72]), parseFloat(candles_h[candles_h.length - 72])],
                            [time71,parseFloat(candles_c[candles_c.length - 71]), parseFloat(candles_o[candles_o.length - 71]), parseFloat(candles_l[candles_l.length - 71]), parseFloat(candles_h[candles_h.length - 71])],
                            [time70,parseFloat(candles_c[candles_c.length - 70]), parseFloat(candles_o[candles_o.length - 70]), parseFloat(candles_l[candles_l.length - 70]), parseFloat(candles_h[candles_h.length - 70])],

                            [time69,parseFloat(candles_c[candles_c.length - 69]), parseFloat(candles_o[candles_o.length - 69]), parseFloat(candles_l[candles_l.length - 69]), parseFloat(candles_h[candles_h.length - 69])],
                            [time68,parseFloat(candles_c[candles_c.length - 68]), parseFloat(candles_o[candles_o.length - 68]), parseFloat(candles_l[candles_l.length - 68]), parseFloat(candles_h[candles_h.length - 68])],
                            [time67,parseFloat(candles_c[candles_c.length - 67]), parseFloat(candles_o[candles_o.length - 67]), parseFloat(candles_l[candles_l.length - 67]), parseFloat(candles_h[candles_h.length - 67])],
                            [time66,parseFloat(candles_c[candles_c.length - 66]), parseFloat(candles_o[candles_o.length - 66]), parseFloat(candles_l[candles_l.length - 66]), parseFloat(candles_h[candles_h.length - 66])],
                            [time65,parseFloat(candles_c[candles_c.length - 65]), parseFloat(candles_o[candles_o.length - 65]), parseFloat(candles_l[candles_l.length - 65]), parseFloat(candles_h[candles_h.length - 65])],
                            [time64,parseFloat(candles_c[candles_c.length - 64]), parseFloat(candles_o[candles_o.length - 64]), parseFloat(candles_l[candles_l.length - 64]), parseFloat(candles_h[candles_h.length - 64])],
                            [time63,parseFloat(candles_c[candles_c.length - 63]), parseFloat(candles_o[candles_o.length - 63]), parseFloat(candles_l[candles_l.length - 63]), parseFloat(candles_h[candles_h.length - 63])],
                            [time62,parseFloat(candles_c[candles_c.length - 62]), parseFloat(candles_o[candles_o.length - 62]), parseFloat(candles_l[candles_l.length - 62]), parseFloat(candles_h[candles_h.length - 62])],
                            [time61,parseFloat(candles_c[candles_c.length - 61]), parseFloat(candles_o[candles_o.length - 61]), parseFloat(candles_l[candles_l.length - 61]), parseFloat(candles_h[candles_h.length - 61])],
                            [time60,parseFloat(candles_c[candles_c.length - 60]), parseFloat(candles_o[candles_o.length - 60]), parseFloat(candles_l[candles_l.length - 60]), parseFloat(candles_h[candles_h.length - 60])],

                            [time59,parseFloat(candles_c[candles_c.length - 59]), parseFloat(candles_o[candles_o.length - 59]), parseFloat(candles_l[candles_l.length - 59]), parseFloat(candles_h[candles_h.length - 59])],
                            [time58,parseFloat(candles_c[candles_c.length - 58]), parseFloat(candles_o[candles_o.length - 58]), parseFloat(candles_l[candles_l.length - 58]), parseFloat(candles_h[candles_h.length - 58])],
                            [time57,parseFloat(candles_c[candles_c.length - 57]), parseFloat(candles_o[candles_o.length - 57]), parseFloat(candles_l[candles_l.length - 57]), parseFloat(candles_h[candles_h.length - 57])],
                            [time56,parseFloat(candles_c[candles_c.length - 56]), parseFloat(candles_o[candles_o.length - 56]), parseFloat(candles_l[candles_l.length - 56]), parseFloat(candles_h[candles_h.length - 56])],
                            [time55,parseFloat(candles_c[candles_c.length - 55]), parseFloat(candles_o[candles_o.length - 55]), parseFloat(candles_l[candles_l.length - 55]), parseFloat(candles_h[candles_h.length - 55])],
                            [time54,parseFloat(candles_c[candles_c.length - 54]), parseFloat(candles_o[candles_o.length - 54]), parseFloat(candles_l[candles_l.length - 54]), parseFloat(candles_h[candles_h.length - 54])],
                            [time53,parseFloat(candles_c[candles_c.length - 53]), parseFloat(candles_o[candles_o.length - 53]), parseFloat(candles_l[candles_l.length - 53]), parseFloat(candles_h[candles_h.length - 53])],
                            [time52,parseFloat(candles_c[candles_c.length - 52]), parseFloat(candles_o[candles_o.length - 52]), parseFloat(candles_l[candles_l.length - 52]), parseFloat(candles_h[candles_h.length - 52])],
                            [time51,parseFloat(candles_c[candles_c.length - 51]), parseFloat(candles_o[candles_o.length - 51]), parseFloat(candles_l[candles_l.length - 51]), parseFloat(candles_h[candles_h.length - 51])],
                            [time50,parseFloat(candles_c[candles_c.length - 50]), parseFloat(candles_o[candles_o.length - 50]), parseFloat(candles_l[candles_l.length - 50]), parseFloat(candles_h[candles_h.length - 50])],
                            [time49,parseFloat(candles_c[candles_c.length - 49]), parseFloat(candles_o[candles_o.length - 49]), parseFloat(candles_l[candles_l.length - 49]), parseFloat(candles_h[candles_h.length - 49])],
                            [time48,parseFloat(candles_c[candles_c.length - 48]), parseFloat(candles_o[candles_o.length - 48]), parseFloat(candles_l[candles_l.length - 48]), parseFloat(candles_h[candles_h.length - 48])],
                            [time47,parseFloat(candles_c[candles_c.length - 47]), parseFloat(candles_o[candles_o.length - 47]), parseFloat(candles_l[candles_l.length - 47]), parseFloat(candles_h[candles_h.length - 47])],
                            [time46,parseFloat(candles_c[candles_c.length - 46]), parseFloat(candles_o[candles_o.length - 46]), parseFloat(candles_l[candles_l.length - 46]), parseFloat(candles_h[candles_h.length - 46])],
                            [time45,parseFloat(candles_c[candles_c.length - 45]), parseFloat(candles_o[candles_o.length - 45]), parseFloat(candles_l[candles_l.length - 45]), parseFloat(candles_h[candles_h.length - 45])],
                            [time44,parseFloat(candles_c[candles_c.length - 44]), parseFloat(candles_o[candles_o.length - 44]), parseFloat(candles_l[candles_l.length - 44]), parseFloat(candles_h[candles_h.length - 44])],
                            [time43,parseFloat(candles_c[candles_c.length - 43]), parseFloat(candles_o[candles_o.length - 43]), parseFloat(candles_l[candles_l.length - 43]), parseFloat(candles_h[candles_h.length - 43])],
                            [time42,parseFloat(candles_c[candles_c.length - 42]), parseFloat(candles_o[candles_o.length - 42]), parseFloat(candles_l[candles_l.length - 42]), parseFloat(candles_h[candles_h.length - 42])],
                            [time41,parseFloat(candles_c[candles_c.length - 41]), parseFloat(candles_o[candles_o.length - 41]), parseFloat(candles_l[candles_l.length - 41]), parseFloat(candles_h[candles_h.length - 41])],
                            [time40,parseFloat(candles_c[candles_c.length - 40]), parseFloat(candles_o[candles_o.length - 40]), parseFloat(candles_l[candles_l.length - 40]), parseFloat(candles_h[candles_h.length - 40])],
                            [time39,parseFloat(candles_c[candles_c.length - 39]), parseFloat(candles_o[candles_o.length - 39]), parseFloat(candles_l[candles_l.length - 39]), parseFloat(candles_h[candles_h.length - 39])],
                            [time38,parseFloat(candles_c[candles_c.length - 38]), parseFloat(candles_o[candles_o.length - 38]), parseFloat(candles_l[candles_l.length - 38]), parseFloat(candles_h[candles_h.length - 38])],
                            [time37,parseFloat(candles_c[candles_c.length - 37]), parseFloat(candles_o[candles_o.length - 37]), parseFloat(candles_l[candles_l.length - 37]), parseFloat(candles_h[candles_h.length - 37])],
                            [time36,parseFloat(candles_c[candles_c.length - 36]), parseFloat(candles_o[candles_o.length - 36]), parseFloat(candles_l[candles_l.length - 36]), parseFloat(candles_h[candles_h.length - 36])],
                            [time35,parseFloat(candles_c[candles_c.length - 35]), parseFloat(candles_o[candles_o.length - 35]), parseFloat(candles_l[candles_l.length - 35]), parseFloat(candles_h[candles_h.length - 35])],
                            [time34,parseFloat(candles_c[candles_c.length - 34]), parseFloat(candles_o[candles_o.length - 34]), parseFloat(candles_l[candles_l.length - 34]), parseFloat(candles_h[candles_h.length - 34])],
                            [time33,parseFloat(candles_c[candles_c.length - 33]), parseFloat(candles_o[candles_o.length - 33]), parseFloat(candles_l[candles_l.length - 33]), parseFloat(candles_h[candles_h.length - 33])],
                            [time32,parseFloat(candles_c[candles_c.length - 32]), parseFloat(candles_o[candles_o.length - 32]), parseFloat(candles_l[candles_l.length - 32]), parseFloat(candles_h[candles_h.length - 32])],
                            [time31,parseFloat(candles_c[candles_c.length - 31]), parseFloat(candles_o[candles_o.length - 31]), parseFloat(candles_l[candles_l.length - 31]), parseFloat(candles_h[candles_h.length - 31])],
                            [time30,parseFloat(candles_c[candles_c.length - 30]), parseFloat(candles_o[candles_o.length - 30]), parseFloat(candles_l[candles_l.length - 30]), parseFloat(candles_h[candles_h.length - 30])],
                            [time29,parseFloat(candles_c[candles_c.length - 29]), parseFloat(candles_o[candles_o.length - 29]), parseFloat(candles_l[candles_l.length - 29]), parseFloat(candles_h[candles_h.length - 29])],
                            [time28,parseFloat(candles_c[candles_c.length - 28]), parseFloat(candles_o[candles_o.length - 28]), parseFloat(candles_l[candles_l.length - 28]), parseFloat(candles_h[candles_h.length - 28])],
                            [time27,parseFloat(candles_c[candles_c.length - 27]), parseFloat(candles_o[candles_o.length - 27]), parseFloat(candles_l[candles_l.length - 27]), parseFloat(candles_h[candles_h.length - 27])],
                            [time26,parseFloat(candles_c[candles_c.length - 26]), parseFloat(candles_o[candles_o.length - 26]), parseFloat(candles_l[candles_l.length - 26]), parseFloat(candles_h[candles_h.length - 26])],
                            [time25,parseFloat(candles_c[candles_c.length - 25]), parseFloat(candles_o[candles_o.length - 25]), parseFloat(candles_l[candles_l.length - 25]), parseFloat(candles_h[candles_h.length - 25])],
                            [time24,parseFloat(candles_c[candles_c.length - 24]), parseFloat(candles_o[candles_o.length - 24]), parseFloat(candles_l[candles_l.length - 24]), parseFloat(candles_h[candles_h.length - 24])],
                            [time23,parseFloat(candles_c[candles_c.length - 23]), parseFloat(candles_o[candles_o.length - 23]), parseFloat(candles_l[candles_l.length - 23]), parseFloat(candles_h[candles_h.length - 23])],
                            [time22,parseFloat(candles_c[candles_c.length - 22]), parseFloat(candles_o[candles_o.length - 22]), parseFloat(candles_l[candles_l.length - 22]), parseFloat(candles_h[candles_h.length - 22])],
                            [time21,parseFloat(candles_c[candles_c.length - 21]), parseFloat(candles_o[candles_o.length - 21]), parseFloat(candles_l[candles_l.length - 21]), parseFloat(candles_h[candles_h.length - 21])],
                            [time20,parseFloat(candles_c[candles_c.length - 20]), parseFloat(candles_o[candles_o.length - 20]), parseFloat(candles_l[candles_l.length - 20]), parseFloat(candles_h[candles_h.length - 20])],
                            [time19,parseFloat(candles_c[candles_c.length - 19]), parseFloat(candles_o[candles_o.length - 19]), parseFloat(candles_l[candles_l.length - 19]), parseFloat(candles_h[candles_h.length - 19])],
                            [time18,parseFloat(candles_c[candles_c.length - 18]), parseFloat(candles_o[candles_o.length - 18]), parseFloat(candles_l[candles_l.length - 18]), parseFloat(candles_h[candles_h.length - 18])],
                            [time17,parseFloat(candles_c[candles_c.length - 17]), parseFloat(candles_o[candles_o.length - 17]), parseFloat(candles_l[candles_l.length - 17]), parseFloat(candles_h[candles_h.length - 17])],
                            [time16,parseFloat(candles_c[candles_c.length - 16]), parseFloat(candles_o[candles_o.length - 16]), parseFloat(candles_l[candles_l.length - 16]), parseFloat(candles_h[candles_h.length - 16])],
                            [time15,parseFloat(candles_c[candles_c.length - 15]), parseFloat(candles_o[candles_o.length - 15]), parseFloat(candles_l[candles_l.length - 15]), parseFloat(candles_h[candles_h.length - 15])],
                            [time14,parseFloat(candles_c[candles_c.length - 14]), parseFloat(candles_o[candles_o.length - 14]), parseFloat(candles_l[candles_l.length - 14]), parseFloat(candles_h[candles_h.length - 14])],
                            [time13,parseFloat(candles_c[candles_c.length - 13]), parseFloat(candles_o[candles_o.length - 13]), parseFloat(candles_l[candles_l.length - 13]), parseFloat(candles_h[candles_h.length - 13])],
                            [time12,parseFloat(candles_c[candles_c.length - 12]), parseFloat(candles_o[candles_o.length - 12]), parseFloat(candles_l[candles_l.length - 12]), parseFloat(candles_h[candles_h.length - 12])],
                            [time11,parseFloat(candles_c[candles_c.length - 11]), parseFloat(candles_o[candles_o.length - 11]), parseFloat(candles_l[candles_l.length - 11]), parseFloat(candles_h[candles_h.length - 11])],
                            [time10,parseFloat(candles_c[candles_c.length - 10]), parseFloat(candles_o[candles_o.length - 10]), parseFloat(candles_l[candles_l.length - 10]), parseFloat(candles_h[candles_h.length - 10])],
                            [time9,parseFloat(candles_c[candles_c.length - 9]), parseFloat(candles_o[candles_o.length - 9]), parseFloat(candles_l[candles_l.length - 9]), parseFloat(candles_h[candles_h.length - 9])],
                            [time8,parseFloat(candles_c[candles_c.length - 8]), parseFloat(candles_o[candles_o.length - 8]), parseFloat(candles_l[candles_l.length - 8]), parseFloat(candles_h[candles_h.length - 8])],
                            [time7,parseFloat(candles_c[candles_c.length - 7]), parseFloat(candles_o[candles_o.length - 7]), parseFloat(candles_l[candles_l.length - 7]), parseFloat(candles_h[candles_h.length - 7])],
                            [time6,parseFloat(candles_c[candles_c.length - 6]), parseFloat(candles_o[candles_o.length - 6]), parseFloat(candles_l[candles_l.length - 6]), parseFloat(candles_h[candles_h.length - 6])],
                            [time5,parseFloat(candles_c[candles_c.length - 5]), parseFloat(candles_o[candles_o.length - 5]), parseFloat(candles_l[candles_l.length - 5]), parseFloat(candles_h[candles_h.length - 5])],
                            [time4,parseFloat(candles_c[candles_c.length - 4]), parseFloat(candles_o[candles_o.length - 4]), parseFloat(candles_l[candles_l.length - 4]), parseFloat(candles_h[candles_h.length - 4])],
                            [time3,parseFloat(candles_c[candles_c.length - 3]), parseFloat(candles_o[candles_o.length - 3]), parseFloat(candles_l[candles_l.length - 3]), parseFloat(candles_h[candles_h.length - 3])],
                            [time2,parseFloat(candles_c[candles_c.length - 2]), parseFloat(candles_o[candles_o.length - 2]), parseFloat(candles_l[candles_l.length - 2]), parseFloat(candles_h[candles_h.length - 2])],
                            [time1,parseFloat(candles_c[candles_c.length - 1]), parseFloat(candles_o[candles_o.length - 1]), parseFloat(candles_l[candles_l.length - 1]), parseFloat(candles_h[candles_h.length - 1])],
                            [time,cl, op, lo, hl]
                        ]);
                        function splitData(rawData) {
                            const categoryData = [];
                            const values = [];
                            for (var i = 0; i < rawData.length; i++) {
                                categoryData.push(rawData[i].splice(0, 1)[0]);
                                values.push(rawData[i]);
                            }
                            return {
                                categoryData: categoryData,
                                values: values
                            };
                        }
                        function calculateMA(dayCount) {
                            var result = [];
                            for (var i = 0, len = data0.values.length; i < len; i++) {
                                if (i < dayCount) {
                                    result.push('-');
                                    continue;
                                }
                                var sum = 0;
                                for (var j = 0; j < dayCount; j++) {
                                    sum += +data0.values[i - j][1];
                                }
                                result.push(sum / dayCount);
                            }
                            return result;
                        }
                        option = {
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    animation: true,
                                    type: 'cross',
                                    lineStyle: {
                                        color: '#93a2b5',
                                        width: 1,
                                        opacity: 1
                                    }
                                }
                            },
                            xAxis: {
                                type:'category',
                                data: data0.categoryData,
                                boundaryGap: true,
                                axisLine: { onZero: false },
                                splitLine: { show: false },
                                min: 'dataMin',
                                max: 'dataMax',
                                axisLine: {
                                    lineStyle: {
                                        color: '#93a2b5'
                                    }
                                }
                            },
                            yAxis: {
                                scale: true,
                                axisLine: {
                                    lineStyle: {
                                        color: '#93a2b5'
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: '#93a2b5'
                                    }
                                }
                            },
                            grid: {
                                bottom: 25,
                                left:  55,
                                right: 5,
                                top: 10
                            },
                            dataZoom: [{
                                textStyle: {
                                    color: '#8392A5'
                                },
                                type: 'inside',
                                start: 88,
                                end: 100,
                                dataBackground: {
                                    areaStyle: {
                                        color: '#8392A5'
                                    },
                                    lineStyle: {
                                        opacity: 0.5,
                                        color: '#8392A5'
                                    }
                                },
                                brushSelect: true
                                },
                                {
                                    show: false,
                                    type: 'slider',
                                    top: '90%',
                                    start: 88,
                                    end: 100
                                }
                            ],
                            series: [
                                {
                                    type: 'candlestick',
                                    name: 'Period 1 Minute',
                                    data: data0.values,
                                    smooth: false,
                                    itemStyle: {
                                        color: '#ef232a',
                                        color0: '#14b143',
                                        borderColor: '#ef232a',
                                        borderColor0: '#14b143'
                                    }
                                    
                                }
                            ]
                        };
                        if (option && typeof option === 'object') {
                            myChart.setOption(option);
                            }
                            window.addEventListener('resize', myChart.resize);
                        //console.log(cok);
                        //logic
                        if (lastOpenTime) {
                            //ganti candle
                            if (lastOpenTime != open_time) {
                                isNewBar = true;
                                lastOpenTime = open_time;
                                //masukan candle data
                                candles_o.push(LastOpen);
                                candles_h.push(LastHigh);
                                candles_l.push(LastLow);
                                candles_c.push(LastClose);
                                //pastikan selalu 60 data
                                candles_o.splice(0, 1);
                                candles_h.splice(0, 1);
                                candles_l.splice(0, 1);
                                candles_c.splice(0, 1);
                            } else {
                                isNewBar = false;
                            }
                        } else {
                            lastOpenTime = open_time;
                            isNewBar = false;
                        }
                        LastOpen = op;
                        LastHigh = hl;
                        LastLow = lo;
                        LastClose = cl;
                        //console.log(menit);
                        if ($('#autotrade').is(":checked") == true) {
                            switch ($('#indicator').val()) {
                                case "engulfing":
                                    if (cok == "0") {
                                        var his = parseFloat(candles_h[candles_h.length - 1]);
                                        var los = parseFloat(candles_l[candles_l.length - 1]);
                                        var ope = data.ohlc.open;
                                        var clo = data.ohlc.close;
                                        var hhi = data.ohlc.high;
                                        var llo = data.ohlc.low;
                                        var upbro = hhi-ope > ope-llo;
                                        var dnbro = hhi-ope < ope-llo;
    
                                        if (detol > 30 && menit < 40 && upbro ) {
                                            signalTrading = "UP";
                                        }
                                        if (detol > 30 && menit < 40 && dnbro ) {
                                            signalTrading = "DOWN";
                                        }
                                    }
                                    break;
                                case "manual":
                                    if (signalButton == "munggah") {
                                        signalTrading = "UP";
                                    } else if (signalButton == "mudun") {
                                        signalTrading = "DOWN";
                                    } else {
                                        signalTrading = "NETRAL";
                                    }
                                    break;
                                
                            }
                        }
                    }
                    break;
                case "buy":
                    if (data.hasOwnProperty('error')) {
                        //    showAlert("Buy Contract",data.error.message);
                        showNotification("Max Stake reached");
                        console.log(data.error.message);
                        OnTrade = false;
                        signal = "NETRAL";
                    } else {
                        contractId = data.buy.contract_id;
                        transactionId = data.buy.transaction_id;
                        ProposalOpenContract();
                        cok = "1";
                        $('#longcode').show();
                        $('#indicative').show();
                        $('#stakesekarang').show();
                        if ($('#soundplay').is(":checked") == true) {
                            var deal = new Audio();
                            deal.src = "./dist/sound/sound_make_deal.wav";
                            deal.play();
                        }
                    }
                    break;
                case "sell":
                    if (data.hasOwnProperty('error')) {
                        //  showAlert("Buy Contract",data.error.message);
                        console.log(data.error.message);
                    } else {
                        Forget_all_price_proposal();
                        ProposalOpenContract();
                    }
                    break;
                case "sell_expired":
                    if (data.hasOwnProperty('error')) {
                        //console.log(data.error.message);
                    } else {
                        Forget_all_price_proposal();
                        Forget_all_spot();
                    }
                    break;
                case "forget_all":
                    //console.log(msg);
                    break;
                case "proposal_open_contract":
                    if (data.hasOwnProperty('error')) {
                        console.log(data.error.message);
                    } else {
                        //    for (var i=0;i<data.proposal_open_contract.length-1;i++){
                        contractId = data.proposal_open_contract.contract_id;
                        longCode = data.proposal_open_contract.longcode;
                        shortCode = data.proposal_open_contract.shortcode;
                        dateExpired = data.proposal_open_contract.date_expiry;
                        isExpire = data.proposal_open_contract.is_expired;
                        isSold = data.proposal_open_contract.is_sold;
                        isAllowSell = data.proposal_open_contract.is_valid_to_sell;
                        buyPrice = data.proposal_open_contract.buy_price;
                        sellPrice = data.proposal_open_contract.bid_price;
                        payout = data.proposal_open_contract.payout;
                        entrySpot = data.proposal_open_contract.entry_spot;
                        purchaseTime = data.proposal_open_contract.purchase_time;
                        tradeStatus = data.proposal_open_contract.status;
    
                        var margin = (parseFloat(sellPrice) - parseFloat(buyPrice)).toFixed(2);
                        if (lastRefNumber != transactionId && transactionId != 0) {
                            lastRefNumber = transactionId;
                        }
                        //contract confirmation
                        var codenya;
                        var waktunya;
                        var lcodenya = market.slice(2);
                        switch ($('#contract').val()) {
                            case "RF":
                                if (shortCode.slice(0, 4) == "CALL") {
                                    codenya = "Rise Volatility " + lcodenya;
                                }
                                if (shortCode.slice(0, 4) == "PUT_") {
                                    codenya = "Fall Volatility " + lcodenya;
                                }
                                break;
                            case "HLH":
                                if (shortCode.slice(0, 4) == "CALL") {
                                    codenya = "Higher Volatility " + lcodenya;
                                }
                                if (shortCode.slice(0, 4) == "PUT_") {
                                    codenya = "Lower Volatility " + lcodenya;
                                }
                                break;
                        }
                        $('#buyprice').html(buyPrice);
                        $('#longcode').html(codenya);
                        $('#refnumber').html(lastRefNumber);
                        $('#payout').html(payout);
                        $('#entryspot').html(entrySpot);
                        $('#purchasetime').html(FromUnix(parseFloat(purchaseTime)));
                        $('#indicative').html(margin);
                        $('#profitloss').html(margin);
                        $('#stakesekarang').html(buyPrice);
                        waktunya = FromUnix(purchaseTime);
    
                        
                        //cek sam
                        var pct = 0;
                        pct = (parseFloat(margin) / parseFloat(buyPrice)) * 100;
                        if (isSold == "1") {
                            if (tradeStatus == "sold") {
                                sellPrice = data.proposal_open_contract.sell_price;
                                margin = (parseFloat(sellPrice) - parseFloat(buyPrice)).toFixed(2);
                                if (margin >= 0) {
                                    tradeResult = 1;
                                }
                                if (margin < 0) {
                                    tradeResult = 0;
                                }
                            } else {
                                margin = (parseFloat(sellPrice) - parseFloat(buyPrice)).toFixed(2);
                                if (tradeStatus == "won") {
                                    tradeResult = 1;
                                }
                                if (tradeStatus == "lost") {
                                    tradeResult = 0;
                                }
                            }
                            Forget_all_price_proposal();
                            
                            //masukan ke table
                            if (transactionId != 0) {
                                var pls = (parseFloat(sellPrice) - parseFloat(buyPrice)).toFixed(2);
                                if (tradeResult == 1) {
                                    if ($('#soundplay').is(":checked") == true) {
                                        var win = new Audio();
                                        win.src = "./dist/sound/youwin.wav";
                                        win.play();
                                    }
                                    cok ="0";
                                    $('#stakesekarang').hide();
                                    $('#indicative').hide();
                                    $('#longcode').hide();
                                    $('#tblresult').append("<tr class='light'><td>" + waktunya + "</td><td>" + codenya + "</td><td>" + buyPrice + "</td><td>" + pls + "</td></tr>");
                                } else {
                                    if ($('#soundplay').is(":checked") == true) {
                                        var lost = new Audio();
                                        lost.src = "./dist/sound/youlose.wav";
                                        lost.play();
                                    }
                                    shc = new String(shortCode.slice(0, 4));
                                    cok ="0";
                                    $('#stakesekarang').hide();
                                    $('#indicative').hide();
                                    $('#longcode').hide();
                                    $('#tblresult').append("<tr class='light'><td>" + waktunya + "</td><td>" + codenya + "</td><td>" + buyPrice + "</td><td>" + pls + "</td></tr>");
                                }
                                transactionId = "0";
                                $('#lblPL').html((parseFloat($('#lblPL').text()) + parseFloat(margin)).toFixed(2));
                                $('#lblTO').html((parseFloat($('#lblTO').text()) + parseFloat(buyPrice)).toFixed(2));
    
    
                                //cek stake
                                if (tradeResult == 1) {
                                    lastStake = parseFloat($('#stake').val()).toFixed(2);
                                } else {
                                    lastStake = (parseFloat(buyPrice) * parseFloat($('#multiplier').val())).toFixed(2);
                                }
                                //martingale
                                if ($('#autotrade').is(":checked") == true) {
                                    if (tradeStatus == "lost") {
                                        switch ($('#falsesignal').val()) {
                                            case "stoptrade":
                                                $('autotrade').prop('checked', false);
                                                break;
                                            case "switch":
                                                if (transactionId = "0") {
                                                    if (shc == "CALL") {
                                                        signalTrading = "DOWN";
                                                    }
                                                    if (shc == "PUT_") {
                                                        signalTrading = "UP";
                                                    }
                                                }
                                                break;
                                            case "continue":
                                                if (transactionId = "0") {
                                                    if (shc == "CALL") {
                                                        signalTrading = "UP";
                                                    }
                                                    if (shc == "PUT_") {
                                                        signalTrading = "DOWN";
                                                    }
                                                }
                                                break;
                                            case "newanalyze":
        
                                                break;
                                        }
                                    }
                                }
                            }
    
                            //bersihkan variable
                            contractId = "0";
                            OnTrade = false;
                            //cek SL/TP
                            if (parseFloat($('#lblPL').text()) > 0 && parseFloat($('#takeprofit').val()) > 0 && parseFloat($('#lblPL').text()) >= parseFloat($('#takeprofit').val())) {
                                $('#autotrade').prop('checked', false);
                                signalTrading = "NETRAL";
                                if ($('#soundplay').is(":checked") == true) {
                                    var win = new Audio();
                                    win.src = "./dist/sound/applause_win.wav";
                                    win.play();
                                }
                                showNotification("Congratulations, your Take Profit has been reached !");
                                //  showAlert("Notification","Congratulations, your Take Profit has been reached !");
                            }
    
                            if (parseFloat($('#lblPL').text()) < 0 && parseFloat($('#stoploss').val()) > 0 && Math.abs(parseFloat($('#lblPL').text())) >= parseFloat($('#stoploss').val())) {
                                $('#autotrade').prop('checked', false);
                                signalTrading = "NETRAL";
                                if ($('#soundplay').is(":checked") == true) {
                                    var win = new Audio();
                                    win.src = "./dist/sound/Red_Alert.wav";
                                    win.play();
                                }
                                showNotification("Opps, it looks like your Stop Loss has been reached !");
                            }
                        }
                    }
                    break;
            }
        }
        ws.onopen = function(event) {
            //console.log("CONNECT");
            isLive = true;
            Authorize();
            Forget_all_spot();
            Forget_all_price_proposal();
            Tick_History();
            if (OnTrade == true && contractId != 0) {
                ProposalOpenContract();
            }
        }
        ws.onclosed = function(event) {
            console.log("Connection Timeout");
    
        }
        ws.onclosing = function(event) {
            //  console.log("Menutup Koneksi");
    
        }
}




function clearCandle() {
    candles_o = [];
    candles_h = []
    candles_l = [];
    candles_c = [];
    ticker = [];
    pattern = [];
    $('#spot').html('0.00000');
    $('#spot').css('color', 'black');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function FromUnix(ts) {
    var gmtDate = new Date(ts * 1000);
    //  var detike = gmtDate.getSeconds();
    return gmtDate;
}

function ToUnix(d) {
    return (d.getTime() - d.getMilliseconds()) / 1000;
}

function getSecond(ts) {
    var gmtDate = new Date(ts * 1000);
    var detike = gmtDate.getSeconds();
    return detike;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function playSound(url) {
    var audio = document.createElement('audio');
    audio.style.display = "none";
    audio.src = url;
    audio.autoplay = true;
    audio.onended = function() {
        audio.remove() //Remove when played.
    };
    document.body.appendChild(audio);
}


function standardDeviation(numbersArr) {
    //--CALCULATE AVAREGE--
    var total = 0;
    for (var key in numbersArr)
        total += numbersArr[key];
    var meanVal = total / numbersArr.length;
    //--CALCULATE AVAREGE--

    //--CALCULATE STANDARD DEVIATION--
    var sDprep = 0;
    for (var key in numbersArr)
        sDprep += Math.pow((parseFloat(numbersArr[key]) - meanVal), 2);
    var sDresult = Math.sqrt(sDprep / numbersArr.length);
    //--CALCULATE STANDARD DEVIATION--
    return (sDresult);

}

function iBolingerBand(numbersArr, periode, deviasi) {
    var c = numbersArr.map(Number);
    var sMA = parseFloat(iSMA(c, periode));
    var devi = parseFloat(standardDeviation(c, periode));
    var bLow = sMA - (devi * deviasi);
    var bHigh = sMA + (devi * deviasi);
    var res = [parseFloat(sMA).toFixed(2), parseFloat(bHigh).toFixed(2), parseFloat(bLow).toFixed(2)];
    //  console.log(c);
    //  console.log(res);
    //  console.log(parseFloat(devi).toFixed(2));
    return (res);
}

function iHigh(numbersArr, periode) {
    var res;
    if (parseFloat(periode) <= numbersArr.length) {
        for (var i = numbersArr.length - 1; i >= numbersArr.length - parseFloat(periode); i--) {
            var val = numbersArr[i];
            if (res) {
                if (parseFloat(res) < parseFloat(val)) {
                    res = val;
                }
            } else {
                res = val;
            }
        }
    }
    return (res);
}


function iLow(numbersArr, periode) {
    var res;
    if (parseFloat(periode) <= numbersArr.length) {
        for (var i = numbersArr.length - 1; i >= numbersArr.length - parseFloat(periode); i--) {
            var val = numbersArr[i];
            if (res) {
                if (parseFloat(res) > parseFloat(val)) {
                    res = val;
                }
            } else {
                res = val;
            }
        }
    }
    return (res);
}

function iSMA(numbersArr, periode) {
    var res = 0;
    if (parseFloat(periode) <= numbersArr.length) {
        for (var i = numbersArr.length - 1; i >= numbersArr.length - parseFloat(periode); i--) {
            var val = numbersArr[i];
            res += parseFloat(val);
            //  console.log(val);
        }
        res = parseFloat(res) / parseFloat(periode);
    }
    return (res);
    //ema 10 lwma 20
}

//EMA = ((Current price - Previous EMA) × k) + Previous EMA
function iEMA(mArray, mRange) {
    var k = 2 / (mRange + 1);
    emaArray = [mArray[0]];
    for (var i = 1; i < mArray.length; i++) {
        var resultEma = emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
        //  console.log(resultEma);
    }
    return emaArray;

}

function lWMA(array, weightedPeriod) {
    var weightedArray = [];
    for (var i = 0; i <= array.length - weightedPeriod; i++) {
        var sum = 0;
        for (var j = 0; j < weightedPeriod; j++) {
            sum += array[i + j] * (weightedPeriod - j);
        }
        weightedArray[i] = sum / ((weightedPeriod * (weightedPeriod + 1)) / 2);
    }
    return weightedArray;
}

