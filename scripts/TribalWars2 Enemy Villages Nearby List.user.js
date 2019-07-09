// ==UserScript==
// @name         TribalWars2 Enemy Villages Nearby List
// @namespace    http://tampermonkey.net/
// @version      0.2
// @author       JPylypiw (https://github.com/JPylypiw)
// @description  You will get a list of the nearby villages then you type villages_nearby() into your Browser Console.
// @homepage     https://github.com/jpylypiw/tw2tools
// @icon64       https://de.tribalwars2.com/favicon.ico
// @updateURL    https://github.com/jpylypiw/tw2tools/raw/master/scripts/TribalWars2%20Enemy%20Villages%20Nearby%20List.user.js
// @supportURL   https://github.com/jpylypiw/tw2tools/issues
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// @noframes
// ==/UserScript==

var modelDataService,
    routeProvider,
    socketService;

var startBot = function () {
    modelDataService = injector.get('modelDataService');
    var selectedVillage = modelDataService.getSelectedVillage();
    routeProvider = injector.get('routeProvider');
    socketService = injector.get('socketService');
    var sx = selectedVillage.getX();
    var sy = selectedVillage.getY();

    getVillages(sx - 25, sy - 25, 50, 50, function (data) {
        var villages = data.villages,
            nearby = [],
            i = villages.length,
            village,
            distance;

        while (i--) {
            village = villages[i];

            if (village.affiliation == "own" || village.affiliation == "tribe" || village.points < 1000) {
                continue;
            }

            distance = _distanceXY(sx, village.x, sy, village.y);

            nearby.push({
                distance: distance,
                village: village
            });
        }

        self.targetList = nearby.sort(function (a, b) {
            return a.distance - b.distance;
        });

        downloadObjectAsJson(self.targetList, "targetlist");
    });
}

function getVillages(x, y, width, height, callback) {
    socketService.emit(routeProvider.MAP_GETVILLAGES, {
        x: x,
        y: y,
        width: width,
        height: height
    }, function (data) {
        callback(data);
    });
}

function _distanceXY(x1, x2, y1, y2) {
    if (typeof y1 === 'undefined') {
        var start = x1.split('|'),
            target = x2.split('|');

        x1 = start[0];
        x2 = start[1];
        y1 = target[0];
        y2 = target[1];
    }

    return Math.round(Math.sqrt((+x1 - +x2) * (+x1 - +x2) + (+y1 - +y2) * (+y1 - +y2)) * 100) / 100;
}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function waitForInjector() {
    if (typeof injector == "undefined") {
        setTimeout(function () { waitForInjector(); }, 3000);
    } else {
        window.villages_nearby = startBot;
    }
}

waitForInjector();