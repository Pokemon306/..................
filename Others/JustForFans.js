// ==UserScript==
// @name         JustForFans
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description  JustForFans
// @author       Sam
// @match        https://justfor.fans/**?Post=**&OnlyShowOnePost=yes
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

const btnSwitchName = "btnSwitch"
const btnSizeName = "btnSize"

const buttonGroup = {
    "复制名称": {"name": "copyName", "func": "copyName", "color": "purple"},
    "复制图片": {"name": "copyPics", "func": "copyPics", "color": "green"},
    "复制图片（文件夹）": {"name": "copyPics_folder", "func": "copyPics_folder", "color": "green"},
    "设置": {"name": "config", "func": "config", "color": "black"},
};
console.log(" JustForFans init ");

const configButGroup = {
    "显示位置": {"name": "showPosition", "func": "showPosition"},
    "按钮大小": {"name": "changeSize", "func": "changeSize"},
}
const configBtnGroupId = 'my_configBtnGroup'

// 按钮组到底部的距离
const btnTBPx = 100;
const btnLRPx = 10;

// 表位置
const trHeight = 30;
const tableWidth = 640;
const tableHeight = 800;

(function () {
    console.log(" JustForFans init ");

    const targetNode = document.body;

    // 方法组
    const funcs = {
        copyName() {
            copyName();
        },
        copyPics() {
            copyPics();
        },
        copyPics_folder() {
            copyPics(true);
        },
        config(event) {
            // 生成一套按钮组
            console.log(`点击的位置是 X=${event.clientX},Y=${event.clientY}`)
            const configBtnGroup = document.getElementById(configBtnGroupId);
            if (configBtnGroup) {
                showDiv(configBtnGroup, event.clientX, event.clientY)
            }
        },
        showPosition(event) {
            let positionDiv = document.getElementById('my_positionDiv');

            // 如果没有这个div 就生成一个
            if (!positionDiv) {
                positionDiv = document.createElement('div');
                positionDiv.id = 'my_positionDiv'
                let divStyle = `z-index:1001;position:fixed;margin:5px;padding:10px;border-radius:1em;` +
                    `background-color: rgba(128, 128, 128, 0.5);` + `display:none;`
                positionDiv.style.cssText = divStyle;
                positionDiv.style.display = 'none';
                positionDiv.className = 'my_position_container'
                positionDiv.innerHTML = `
<div class="my_position_square my_position_ul">↖</div>
<div class="my_position_square my_position_ur">↗</div>
<div class="my_position_square my_position_dl">↙</div>
<div class="my_position_square my_position_dr">↘</div>
`

                // 加到页面上
                document.body.appendChild(positionDiv)

                // 添加关闭事件
                setCloseEvent("my_positionDiv", "btn_showPosition")

                // 添加点击事件
                document.body.querySelectorAll('.my_position_square').forEach((item) => {
                    item.addEventListener('click', (event) => {
                        const classList = item.className.split(' ');
                        const udlr = classList[1].replace('my_position_', '')

                        console.log(udlr, udlr.substring(0, 1), udlr.substring(1))
                        document.body.querySelectorAll('.my_position_square').forEach((item) => {
                            item.classList.remove('active');
                        })

                        item.classList.add('active');

                        // 切换位置
                        changePosition(udlr.substring(0, 1), udlr.substring(1));
                    });
                });
            }

            positionDiv.style.display = 'grid'; // 临时显示以应用网格
            if (positionDiv) {
                // 在指定位置显示
                showDiv(positionDiv, event.clientX, event.clientY)

                // left or right
                const lr = GM_getValue("lr") || "r"
                // up or down
                const ud = GM_getValue("ud") || "u"

                let name = `.my_position_square.my_position_${ud}${lr}`
                console.log(name)
                // 指定的亮起来
                document.body.querySelector(name).classList.add("active")
            }

        },
        changeSize() {
            document.querySelectorAll('.my_button').forEach(el => {
                if (el.classList.contains('small')) {
                    el.classList.remove('small')
                    el.classList.add('large')
                    GM_setValue(btnSizeName, 'large')
                    localStorage.setItem(btnSizeName, 'large')
                } else if (el.classList.contains('medium')) {
                    el.classList.remove('medium')
                    el.classList.add('small')
                    GM_setValue(btnSizeName, 'small')
                    localStorage.setItem(btnSizeName, 'small')
                } else {
                    el.classList.remove('large')
                    el.classList.add('medium')
                    GM_setValue(btnSizeName, 'medium')
                    localStorage.setItem(btnSizeName, 'medium')
                }
            })
        }
    }

    // 初始化按钮
    function init() {
        console.log(" JustForFans init ");
        // left or right
        const lr = GM_getValue("lr") || "r"
        // up or down
        const ud = GM_getValue("ud") || "u"
        // large or small
        const size = GM_getValue(btnSizeName) || "large"

        let body = document.body;
        let div = document.createElement('div');
        div.id = "my_buttonGroup"
        div.style.cssText = `z-index:999;position:fixed;margin:10px;` +
            `${lr == "l" ? "left" : "right"}:${btnLRPx}px;${ud == "d" ? "bottom" : "top"}:${btnTBPx}px;` +
            `text-align:${lr == "l" ? "left" : "right"}`

        let btnStyle = `z-index:999;position:sticky;margin:5px;`

        let i = 1
        for (let buttonName in buttonGroup) {
            let btn = document.createElement('button');
            btn.id = "btn_" + buttonGroup[buttonName].func;
            btn.className = `my_button ${(buttonGroup[buttonName].color || 'red')} ${(size == "small" ? "small" : (size == "medium" ? "medium" : "large"))}`

            btn.style.cssText = btnStyle;

            btn.textContent = buttonName;
            btn.addEventListener('click', (event) => {
                funcs[buttonGroup[buttonName].func](event);
            });

            if (!btn.textContent) {
                continue
            }

            div.appendChild(btn);
            div.appendChild(document.createElement('br'));
            i += 1
        }

        body.appendChild(div);

        // 设置按钮组
        let configDiv = document.createElement('div');
        let configDivStyle = `z-index:1000;position:fixed;margin:5px;padding:10px;border-radius:1em;` +
            `background-color: rgba(128, 128, 128, 0.5);` + `display:none;`
        let configBtnstyle = `z-index:1000;position:sticky;margin:5px;`

        configDiv.id = configBtnGroupId;
        configDiv.style.cssText = configDivStyle;
        for (let buttonName in configButGroup) {
            let btn = document.createElement('button');
            btn.id = "btn_" + configButGroup[buttonName].func;
            btn.className = `my_button ${(configButGroup[buttonName].color || 'red')} ${(size == "small" ? "small" : (size == "medium" ? "medium" : "large"))}`

            btn.style.cssText = configBtnstyle;

            btn.textContent = buttonName;
            btn.addEventListener('click', (event) => {
                funcs[configButGroup[buttonName].func](event);
            });

            if (!btn.textContent) {
                continue
            }

            configDiv.appendChild(btn);
            configDiv.appendChild(document.createElement('br'));

            i += 1
        }

        body.appendChild(configDiv);
        setCloseEvent(configBtnGroupId, "btn_config")

        check()
    }

    init();

    const buttonCSS = GM_getResourceText("buttonCSS");
    GM_addStyle(buttonCSS);

    // 检查
    function check() {
        // 每隔两秒检测按钮组是否存在
        timer(2 * 1000, () => {
            const element = document.body.querySelector('#my_buttonGroup');
            if (element) {
                if (element.style.display == "none") {
                    element.style.display == "block"
                }
            } else {
                // 初始化
                init()
            }
            check()
        })
    }

    // 显示DIV
    function showDiv(div, x, y) {
        console.log('显示 ', div.id)

        // left or right
        const lr = GM_getValue("lr") || "r"
        // up or down
        const ud = GM_getValue("ud") || "u"

        // 如果弹窗已显示，则进行关闭
        if (div.style.display != 'none' && div.style.display != 'grid') {
            div.style.display = 'none';
            return;
        }

        // 整体在右边，就向左边显示
        if (lr == 'r') {

            div.style.left = null
            div.style.right = window.innerWidth - x + 'px';
        } else {
            div.style.left = x + 'px';
            div.style.right = null
        }

        // 整体在上面，就向下面显示
        if (ud == 'u') {
            div.style.top = y + 'px';
            div.style.bottom = null
        } else {
            div.style.top = null
            div.style.bottom = window.innerHeight - y + 'px';
        }

        // 显示配置按钮组
        if (div.style.display != 'grid') {
            div.style.display = 'block';
        }
    }

    function changePosition(ud, lr) {
        changeUD(ud)
        changeLR(lr)
    }

    function changeUD(ud) {
        GM_setValue("ud", ud != "u" ? "d" : "u")

        if (ud != 'u') {
            console.log("换到下边")
            document.querySelector('#my_buttonGroup').style.top = null
            document.querySelector('#my_buttonGroup').style.bottom = btnTBPx + 'px'
        } else {
            console.log("换到上边")
            document.querySelector('#my_buttonGroup').style.top = btnTBPx + 'px';
            document.querySelector('#my_buttonGroup').style.bottom = null
        }
    }

    function changeLR(lr) {
        GM_setValue("lr", lr != "l" ? "r" : "l")

        if (lr != 'l') {
            console.log("换到右边")
            document.querySelector('#my_buttonGroup').style.textAlign = 'right';
            document.querySelector('#my_buttonGroup').style.left = null
            document.querySelector('#my_buttonGroup').style.right = btnLRPx + 'px'
        } else {
            console.log("换到左边")
            document.querySelector('#my_buttonGroup').style.textAlign = 'left';
            document.querySelector('#my_buttonGroup').style.left = btnLRPx + 'px';
            document.querySelector('#my_buttonGroup').style.right = null
        }
    }

    // 关闭弹窗
    function closePopup(id) {
        // console.log('关闭 ', id)
        document.getElementById(id).style.display = 'none';
        let iframe = document.getElementById(`pop_iframe_${id}`);
        if (iframe) {
            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.body.style.display = 'none';
        }
    }

    // 设置关闭事件
    function setCloseEvent(id, parentId) {
        // 点击页面其他地方关闭弹窗
        document.addEventListener('click', function () {
            closePopup(id)
        });

        // 防止弹窗内部点击关闭弹窗
        document.getElementById(id).addEventListener('click', function (e) {
            e.stopPropagation();
        });

        if (parentId) {
            // 防止点击父级按钮时关闭弹窗
            document.getElementById(parentId).addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    function getName() {
        let username = document.querySelector("title").innerText;

        let time = document.body.querySelector(".mbsc-card-subtitle").innerText;
        let date = new Date(time)

        let content = document.body.querySelector(".fr-view").innerText;

        let name = `@${username} - (${formatDate(date, 'YYYY年MM月DD日')}) ${content}`

        return name;
    }

    function copyName() {
        let name = getName()

        const clipboardObj = navigator.clipboard;
        clipboardObj.writeText(name)
        Toast(`copyName successfully copied!`)
    }

    function copyPics(useFolder) {
        let name = getName()

        let urls = `#R,${window.location.href}\n`
        if (useFolder) {
            urls += `#O,F:\\Downloads\\Default\\Other\\Kemono\\${name.trim()}\n`
        }

        let gallery = document.querySelector(".galleryWrapper").querySelector('.gallerySmall ')

        let imgs = gallery.querySelectorAll("img");

        console.log(imgs.length);
        for(let img of imgs) {
            let url = img?.src
            if(!url) {
                url = img?.dataset.lazy;
            }
            if(!url)
                continue;
            console.log(url)
            urls += `${url}\n`
        }

        const clipboardObj = navigator.clipboard;
        clipboardObj.writeText(urls)
        Toast(`copyName successfully copied!`)
    }

})();

