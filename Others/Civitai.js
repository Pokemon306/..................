// ==UserScript==
// @name         Sam Civitai
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description
// @updateURL
// @downloadURL
// @author       Sam
// @grant        GM_addStyle
// @match        https://civitai.com/**
// @icon         https://civitai.com/favicon-blue.ico
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/buttons.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// ==/UserScript==
(function () {
    const targetNode = document.body;

    const config = {childList: true, subtree: true};
    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeName === "DIV" || node.nodeName === "SECTION") {
                        console.log('全局 DOM 发生变化');
                        if(!node) {
                            continue;
                        }

                        if (node.querySelector('.mantine-yoffm')
                        ) {
                            init()
                        }
                    }
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const init = () => timer(100, check)

    const check = function () {
        // 看看有没有标题栏
        let title_column = document.querySelector('.mantine-yoffm');
        if(!title_column) {
            title_column = document.querySelector('.mantine-Stack-root');
        }
        if (title_column) {
            let title = title_column.querySelector('.mantine-Title-root');
            console.log(title);
            copy()
        } else {
            // console.log('not found');
            init()
        }
    }

// 初始化
    init()

    const copy = function () {
        let title_column = document.querySelector('.mantine-Stack-root');
        if(!title_column) {
            title_column = document.querySelector('.mantine-yoffm');
        }
        let title = title_column.querySelector('.mantine-Title-root');
        let name = title.innerText.trim()

        // 如果是模型的话
        let matchArray = window.location.href.match(/models\/(\d*)(\/.+)?(.*)?$/);
        console.log("matchArray:", matchArray);
        if(matchArray) {
            let modelId = matchArray[1];

            let Accordions = document.querySelectorAll('.mantine-Accordion-content');

            for (const Accordion of Accordions) {
                let trs = Accordion.querySelectorAll('.mantine-Table-tr');

                let type;
                let air;
                for (let tr of trs) {
                    if(tr.childNodes[0].innerText == 'Type') {
                        type = tr.childNodes[1]
                    }
                    if(tr.childNodes[0].innerText == 'AIR') {
                        air = tr.childNodes[1]
                    }
                }

                if(type && air) {
                    let modelVersion = undefined;

                    let area = document.querySelector('.mantine-ScrollArea-root');
                    if(area) {
                        let list = area.querySelectorAll('.mantine-Group-root');
                        console.log(list);
                        for (const node of list) {
                            let button = node.querySelector('button');
                            if(button) {
                                let button_hover = button?.style.getPropertyValue('--button-hover') || 'none';
                                if(button_hover == 'var(--mantine-color-blue-filled-hover)') {
                                    console.log(button.innerText, " true")
                                    modelVersion = button.innerText;
                                    break;
                                }
                            }
                        }
                    }

                    console.log(type.innerText)
                    console.log(air.innerText)

                    let filename = transfer(`[${type.innerText}] ${name} ${modelVersion?"- " + modelVersion + " ":""}(${air.innerText})`)
                        .replaceAll('：', '')
                        .replaceAll(',', ' ')
                        .replaceAll('、', ' ')

                    console.log(filename)

                    let button = createButton(filename);
                    // insertButtonAfter(title.parentNode.lastChild, button)
                    insertButtonAfter(title, button)

                    break
                }
            }
        }

        // 如果是图片的话
        matchArray = window.location.href.match(/images\/(\d*)?$/);
        if(matchArray) {
            console.log(matchArray);
            let modelId = matchArray[1];

            let gap = document.querySelectorAll('.gap-1');

            for (const Accordion of Accordions) {
                let type = Accordion.querySelector('.mantine-1cvam8p');
                if(!type) continue
                let air = Accordion.querySelector('.mantine-z88oh');
                console.log(type.innerText)
                console.log(air.innerText)

                let filename = transfer(`[${type.innerText}] ${name} (${air.innerText})`)
                console.log(filename)

                let button = createButton(filename);
                insertButtonAfter(title, button)

                break
            }
        }
    }

    const createButton = text => {
        let outDiv = document.createElement('div');
        outDiv.style.display = 'flex';

        let div = document.createElement('div');
        div.classList.add('mantine-Badge-root');
        div.classList.add('m_347db0ec');

        // let button = document.createElement('button');
        let buttonName = "copyName"
        div.id = "copy_" + buttonName
        div.classList.add(buttonName);
        div.style = 'display:flex;cursor:pointer;padding-left: 3px; padding-right: 5px; --badge-height: var(--badge-height-lg); --badge-padding-x: var(--badge-padding-x-lg); --badge-fz: var(--badge-fz-lg); --badge-radius: var(--mantine-radius-sm); --badge-bg: var(--mantine-color-green-light); --badge-color: var(--mantine-color-green-light-color); --badge-bd: calc(0.0625rem * var(--mantine-scale)) solid transparent;'

        div.value = text;
        // 点击按钮，拷贝内容到剪切板
        div.onclick = function () {
            const clipboardObj = navigator.clipboard;
            clipboardObj.writeText(this.value)
            Toast(`${buttonName} success`)
        }

        div.innerHTML = "".concat('<span class="m_91fdda9b mantine-Badge-section" style="margin-right:4px;" data-position="left"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-copy "><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path></svg></span>' +
            '<span class="m_5add502a mantine-Badge-label">' +
            '<p class="mantine-focus-auto _____slug___modelBadgeText__p3LRV m_b6d8b162 mantine-Text-root">')
            .concat('copy')
            .concat('</p></span>')

        outDiv.appendChild(div)
        return outDiv
    }
})();
