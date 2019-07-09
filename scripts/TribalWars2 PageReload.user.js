// ==UserScript==
// @name         TribalWars2 PageReload
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Periodically reload the Game and check if the reload was successful.
// @author       JPylypiw (https://github.com/JPylypiw)
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// ==/UserScript==

var reload_after_minutes = 10;

setTimeout(function() {
    location.reload();
}, 60000 * reload_after_minutes);

function waitForInjector(count) {
    if (count >= 10) {
        location.reload();
    }
    if (typeof injector == "undefined") {
        setTimeout(function () { waitForInjector(count+1); }, 1000);
    }
}

waitForInjector(0);