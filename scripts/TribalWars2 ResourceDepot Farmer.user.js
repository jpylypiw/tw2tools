// ==UserScript==
// @name         TribalWars2 ResourceDepot Farmer
// @namespace    http://tampermonkey.net/
// @version      0.3
// @author       JPylypiw (https://github.com/JPylypiw)
// @description  This bot checks the Resource Depot for new Jobs and automatically executes and collects these jobs.
// @homepage     https://github.com/jpylypiw/tw2tools
// @icon64       https://de.tribalwars2.com/favicon.ico
// @updateURL    https://github.com/jpylypiw/tw2tools/raw/master/scripts/TribalWars2%20ResourceDepot%20Farmer.user.js
// @supportURL   https://github.com/jpylypiw/tw2tools/issues
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// @noframes
// ==/UserScript==

var modelDataService,
    socketService,
    routeProvider,
    eventTypeProvider,
    resource_type = [];

resource_type = [
    "Reiche Ernte - steigert den Proviant in einem Dorf um 10%",
];

function waitForInjector() {
    if (typeof injector == "undefined") {
        setTimeout(function () { waitForInjector(); }, 3000);
    } else {
        startBot();
    }
}

function startBot() {
    modelDataService = injector.get('modelDataService');
    socketService = injector.get('socketService');
    routeProvider = injector.get('routeProvider');
    eventTypeProvider = injector.get('eventTypeProvider');
    checkResourceDepotLoop();
}

function checkResourceDepotLoop() {
    console.log('Resource Depot Farmer: checkResourceDepotLoop');

    getResourceDepotInfo(function (info) {
        var usePremium = false;
        var sleep = 10000;

        if (info.milestones[5].reached === false) {

            if (resource_type.indexOf(info.milestones[5].reward.i18n) != -1) {
                usePremium = true;
            }

            if (info.jobs.length >= 1) {

                if (info.jobs[0].state === 0) {
                    console.log('Resource Depot Farmer: nothing to do');
                    loopHelper(60000);
                    return true;
                }

                if (info.jobs[0].state === 1) {
                    console.log('Resource Depot Farmer: collecting');
                    var currVillageId = modelDataService.getSelectedVillage().data.villageId;
                    collectResource(currVillageId, info.jobs[0].id, function (data) { });
                    if (info.jobs.length > 1) {
                        startJob(info.jobs[1].id, function (data) { });
                    }
                    sleep = info.jobs[1].duration * 1000;
                }

                if (info.jobs[0].state === 2) {
                    console.log('Resource Depot Farmer: starting job');
                    startJob(info.jobs[0].id, function (data) { });
                    sleep = info.jobs[0].duration * 1000;
                }
            }
            else {
                if (usePremium === true) {
                    resetResourceDepotJobs(function (data) { });
                }
                // 1 Minute * x
                sleep = 60000 * 10;
            }

        }

        loopHelper(sleep);
    });
}

function loopHelper(timeout) {
    setTimeout(checkResourceDepotLoop, timeout);
}

function getResourceDepotInfo(callback) {
    socketService.emit(routeProvider.RESOURCE_DEPOSIT_OPEN, {
    }, callback);
}

function collectResource(vid, job_id, callback) {
    socketService.emit(routeProvider.RESOURCE_DEPOSIT_COLLECT, {
        job_id: job_id,
        village_id: vid
    }, callback);
}

function startJob(job_id, callback) {
    socketService.emit(routeProvider.RESOURCE_DEPOSIT_START_JOB, {
        job_id: job_id
    }, callback);
}

function resetResourceDepotJobs(callback) {
    socketService.emit(routeProvider.PREMIUM_RESOURCE_DEPOSIT_REROLL, {
    }, callback);
}
