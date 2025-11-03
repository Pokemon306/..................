// ==UserScript==
// @name         JustForFansOpenNew
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description  JustForFansOpenNew
// @author       Sam
// @match        https://justfor.fans/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/buttons.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// ==/UserScript==

(function () {
    console.log(" JustForFansOpenNew init ");

    const targetNode = document.body;

    // 监听页面变化
    const config = {childList: true, subtree: true};
    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (!node) {
                        continue;
                    }

                    if (node.nodeName === "DIV" || node.nodeName === "SECTION" || node.nodeName === "I" || node.nodeName === "IFRAME") {
                        console.log('全局 DOM 发生变化');

                        let cards = targetNode.querySelectorAll(".mbsc-card")
                        // 回复奖励
                        if (cards && cards.length > 0) {
                            console.log(cards.length)
                            cards.forEach(function (card) {
                                console.log(card)
                                let title = card.querySelector(".mbsc-card-title")
                                if(title) {
                                    console.log(title)
                                    let _open = title.querySelector(".open");
                                    if(!_open) {
                                        let span = document.createElement("span");
                                        span.innerText = "open"
                                        span.className = "open"

                                        title.appendChild(span);
                                    }
                                }
                            })
                        }
                    }
                }
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

})();

