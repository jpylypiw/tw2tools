// ==UserScript==
// @name         TribalWars2 PageReload
// @namespace    http://tampermonkey.net/
// @version      0.3
// @author       JPylypiw (https://github.com/JPylypiw)
// @description  Periodically reload the Game and check if the reload was successful.
// @homepage     https://github.com/jpylypiw/tw2tools
// @icon64       https://de.tribalwars2.com/favicon.ico
// @updateURL    https://github.com/jpylypiw/tw2tools/raw/master/scripts/TribalWars2%20PageReload.user.js
// @supportURL   https://github.com/jpylypiw/tw2tools/issues
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// @noframes
// ==/UserScript==

var reload_after_minutes = 10;

setTimeout(function () {
    location.reload();
}, 60000 * reload_after_minutes);

function waitForInjector(count) {
    if (count >= 10) {
        location.reload();
    }
    if (typeof injector == "undefined") {
        setTimeout(function () { waitForInjector(count + 1); }, 1000);
    }
}

waitForInjector(0);