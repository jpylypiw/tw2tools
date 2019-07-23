// ==UserScript==
// @name         TribalWars2 Resource Balancer
// @namespace    http://tampermonkey.net/
// @version      0.5
// @author       JPylypiw (https://github.com/JPylypiw)
// @description  This bot exchanges resources between the villages. You can set the threshold to a value between 0 and 1. Practical values are between 0.3 and 0.7.
// @homepage     https://github.com/jpylypiw/tw2tools
// @icon64       https://de.tribalwars2.com/favicon.ico
// @updateURL    https://github.com/jpylypiw/tw2tools/raw/master/scripts/TribalWars2%20Resource%20Balancer.user.js
// @supportURL   https://github.com/jpylypiw/tw2tools/issues
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// @noframes
// ==/UserScript==

var threshold = 0.3;

function waitForInjector() {
    if (typeof injector == "undefined") {
        setTimeout(function () { waitForInjector(); }, 3000);
    } else {
        startBot();
    }
}

var modelDataService,
    socketService,
    routeProvider,
    villages = [],
    villageResources = [];


function startBot() {
    modelDataService = injector.get('modelDataService');
    socketService = injector.get('socketService');
    routeProvider = injector.get('routeProvider');
    var villagesObj = modelDataService.getSelectedCharacter().getVillages();

    for (var id in villagesObj) {
        villages.push(id);
    }

    villageResourceBalanceLoop();
}

function villageResourceBalanceLoop() {

    var vid;

    if (villages.length) {
        vid = villages.shift();
        console.log('resource balancing in village: ' + vid);
    } else {
        balanceResources();
    }

    getVillageInfo(vid, function (villageinfo) {

        if (villageinfo.resources != null) {
            var resources = villageinfo.resources;
            var storage = villageinfo.storage;
            var resourcetype = "shortfall";
            var factor = 0;

            if (resources.clay > storage * threshold) {
                resourcetype = "overlap";
            }
            if (resourcetype == "shortfall") {
                factor = storage * threshold / resources.clay;
            } else {
                factor = resources.clay / storage * threshold;
            }

            villageResources.push({
                vid: vid,
                resource: 'clay',
                amount: Math.abs(storage * threshold - resources.clay),
                storage: storage,
                resourcetype: resourcetype,
                factor: factor
            });

            resourcetype = "shortfall";
            if (resources.iron > storage * threshold) {
                resourcetype = "overlap";
            }
            if (resourcetype == "shortfall") {
                factor = storage * threshold / resources.iron;
            } else {
                factor = resources.iron / storage * threshold;
            }

            villageResources.push({
                vid: vid,
                resource: 'iron',
                amount: Math.abs(storage * threshold - resources.iron),
                storage: storage,
                resourcetype: resourcetype,
                factor: factor
            });

            resourcetype = "shortfall";
            if (resources.wood > storage * threshold) {
                resourcetype = "overlap";
            }
            if (resourcetype == "shortfall") {
                factor = storage * threshold / resources.wood;
            } else {
                factor = resources.wood / storage * threshold;
            }

            villageResources.push({
                vid: vid,
                resource: 'wood',
                amount: Math.abs(storage * threshold - resources.wood),
                storage: storage,
                resourcetype: resourcetype,
                factor: factor
            });

            villageResourceBalanceLoop();
        }

    });

}

function getVillageInfo(vid, callback) {
    socketService.emit(routeProvider.VILLAGE_GET_VILLAGE, {
        village_id: vid
    }, function (data) {
        callback(data);
    });
}

function compare(a, b) {
    if (a.factor > b.factor) {
        return -1;
    }
    if (a.factor < b.factor) {
        return 1;
    }
    return 0;
}

function balanceResources() {
    var moreRes = villageResources.filter(element => element.resourcetype == "overlap");
    var lessRes = villageResources.filter(element => element.resourcetype == "shortfall");
    lessRes.sort(compare);
    moreRes.sort(compare);
    var amount = 0;
    var maxMerchantAmount = 0;
    window.villageResources = villageResources;

    doSynchronousLoop(lessRes,
        function (lres, n, lcallback) {
            doSynchronousLoop(moreRes,
                function (mres, i, mcallback) {
                    if (mres.resource === lres.resource && lres.amount > 0) {

                        // Maximale Lieferungsgröße erfassen
                        getMerchantInfo(mres.vid, function (data) {

                            if (data.free > 0) {
                                maxMerchantAmount = data.free * 1000;
                                if (mres.amount > maxMerchantAmount) {
                                    mres.amount = maxMerchantAmount;
                                }

                                if (mres.amount > lres.amount) {
                                    amount = lres.amount;
                                    lres.amount = 0;
                                    moreRes[i].amount -= amount;
                                } else {
                                    amount = mres.amount;
                                    lres.amount = lres.amount - mres.amount;
                                    moreRes.splice(i, 1);
                                }

                                sendResources(mres.vid, lres.vid, amount, lres.resource, function (data) {
                                    console.log(data);
                                    mcallback();
                                });
                            } else {
                                mcallback();
                            }
                        });
                    } else {
                        mcallback();
                    }
                },
                function () { console.log("finished moreRes"); lcallback(); }
            );
        },
        function () { console.log("finished lessRes"); }
    );

}

function getMerchantInfo(vid, callback) {
    socketService.emit(routeProvider.TRADING_GET_MERCHANT_STATUS, {
        village_id: vid
    }, function (data) {
        callback(data);
    });
}

function sendResources(oriVid, destVid, amount, resType, callback) {
    var wood = 0, clay = 0, iron = 0;
    amount = Math.round(Number(amount));

    if (resType === 'wood') {
        wood = amount;
    } else if (resType === 'clay') {
        clay = amount;
    } else if (resType === 'iron') {
        iron = amount;
    }

    socketService.emit(routeProvider.TRADING_SEND_RESOURCES, {
        start_village: oriVid,
        target_village: destVid,
        wood: wood,
        clay: clay,
        iron: iron
    }, function (data) {
        callback(data);
    });
}

function doSynchronousLoop(data, processData, done) {
    if (data.length > 0) {
        var loop = function (data, i, processData, done) {
            processData(data[i], i, function () {
                if (++i < data.length) {
                    setTimeout(function () {
                        loop(data, i, processData, done);
                    }, 0);
                } else {
                    done();
                }
            });
        };
        loop(data, 0, processData, done);
    } else {
        done();
    }
}

waitForInjector();
