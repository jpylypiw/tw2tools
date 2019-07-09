// ==UserScript==
// @name         TribalWars2 TWOverflow
// @namespace    http://tampermonkey.net/
// @version      0.3
// @author       JPylypiw (https://github.com/JPylypiw)
// @description  This script starts TWOverflow for TribalWars2
// @homepage     https://github.com/jpylypiw/tw2tools
// @icon64       https://de.tribalwars2.com/favicon.ico
// @updateURL    https://github.com/jpylypiw/tw2tools/raw/master/scripts/TribalWars2%20TWOverflow.user.js
// @supportURL   https://github.com/jpylypiw/tw2tools/issues
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// @noframes
// ==/UserScript==

var url = 'https://relaxeaza.gitlab.io/twoverflow-cdn/releases/latest/tw2overflow.min.js?';
var rand = Math.round(Math.random() * 1e7);
var elem = document.createElement('script');
elem.setAttribute('type', 'text/javascript');
elem.setAttribute('src', url + rand);
document.body.appendChild(elem);