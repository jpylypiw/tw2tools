// ==UserScript==
// @name         TribalWars2 Tavern Recuit
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This is a simple bot that recuits Spys in the Tavern when there are free slots.
// @author       JPylypiw (https://github.com/JPylypiw)
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// ==/UserScript==

function waitForInjector() {
    if (typeof injector == "undefined") {
        setTimeout(function () { waitForInjector(); }, 3000);
    } else {
        startBot();
    }
}

function startBot() {
    var socketService = injector.get('socketService');
    var modelDataService = injector.get('modelDataService');
    var routeProvider = injector.get('routeProvider');
    var villagesList = modelDataService.getSelectedCharacter().getVillages();
    villagesList = Object.keys(villagesList).map(function (key) { return key; });

    window.villagesList = villagesList
    doSynchronousLoop(villagesList,
        function (village, i, callback) {

            getVillageInfo(village, function (villageinfo) {

                var tavernlevel = villageinfo.buildings.tavern.level;
                if (tavernlevel > 0) {

                    getScoutingInfo(village, function (scoutinginfo) {

                        doSynchronousLoop([1, 2, 3, 4, 5],
                            function (spyid, i, callback2) {
                                if (scoutinginfo["spy_" + spyid] == 0 && canAffordSpy(villageinfo.resources, scoutinginfo.spy_prices, i) && spyIdUnlocked(spyid, tavernlevel)) {
                                    villageinfo.resources = correctResources(villageinfo.resources, scoutinginfo.spy_prices, i);
                                    recuitScout(village, spyid, function(info) {
                                        console.log(info);
                                        callback2();
                                    });
                                } else {
                                    callback2();
                                }
                            },
                            function () { callback(); }
                        );

                    });
                } else {
                    callback();
                }
            });
        },
        function () { console.log("finished recuiting spys."); }
    );

    function spyIdUnlocked(spyid, tavernlevel) {
        if (tavernlevel >= 12) {
            return true;
        } else if (tavernlevel >= 9 && spyid < 5) {
            return true;
        } else if (tavernlevel >= 6 && spyid < 4) {
            return true;
        } else if (tavernlevel >= 3 && spyid < 3) {
            return true;
        } else if (tavernlevel >= 0 && spyid < 2) {
            return true;
        }
        return false;
    }

    function correctResources(resources, spy_prices, spyid) {
        resources.wood -= spy_prices[spyid].wood;
        resources.clay -= spy_prices[spyid].clay;
        resources.iron -= spy_prices[spyid].iron;
        return resources;
    }

    function canAffordSpy(resources, spy_prices, spyid) {
        if (resources.wood < spy_prices[spyid].wood) {
            return false;
        } else if (resources.clay < spy_prices[spyid].clay) {
            return false;
        } else if (resources.iron < spy_prices[spyid].iron) {
            return false;
        }
        return true;
    }

    function getVillageInfo(vid, callback) {
        socketService.emit(routeProvider.VILLAGE_GET_VILLAGE, {
            village_id: vid
        }, function (data) {
            callback(data);
        });
    }


    function getScoutingInfo(vid, callback) {
        socketService.emit(routeProvider.SCOUTING_GET_INFO, {
            village_id: vid
        }, function (data) {
            callback(data);
        });
    }

    function recuitScout(vid, slot, callback) {
        socketService.emit(routeProvider.SCOUTING_RECRUIT, {
            village_id: vid,
            slot: slot
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
}

waitForInjector();