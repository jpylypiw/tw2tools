// ==UserScript==
// @name         TribalWars2 TWOverflow
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  This script starts TWOverflow for TribalWars2
// @author       JPylypiw (https://github.com/JPylypiw)
// @match        https://de.tribalwars2.com/game.php*
// @grant        none
// ==/UserScript==

var url = 'https://relaxeaza.gitlab.io/twoverflow-cdn/releases/latest/tw2overflow.min.js?';
var rand = Math.round(Math.random() * 1e7);
var elem = document.createElement('script');
elem.setAttribute('type', 'text/javascript');
elem.setAttribute('src', url + rand);
document.body.appendChild(elem);