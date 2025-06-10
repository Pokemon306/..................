// ==UserScript==
// @name         GM论坛回复记录
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description  GM_forum_Reply_Record
// @updateURL    https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM%E8%AE%BA%E5%9D%9B%E5%9B%9E%E5%A4%8D%E5%A5%96%E5%8A%B1%E8%AE%B0%E5%BD%95.js
// @downloadURL  https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM%E8%AE%BA%E5%9D%9B%E5%9B%9E%E5%A4%8D%E5%A5%96%E5%8A%B1%E8%AE%B0%E5%BD%95.js
// @author       Sam
// @match        https://www.gamemale.com/**
// @exclude      https://www.gamemale.com/search.php*
// @exclude      https://www.gamemale.com/home.php?mod=editor*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_getResourceText
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// @resource tableCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/table.css
// @resource popupCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/popup.css
// @resource timerJS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/test/updateTimer.js
// ==/UserScript==
const btnSwitchName = "btnSwitch"
const btnSizeName = "btnSize"

const buttonGroup = {
    "查看回复奖励": {"name": "ReplyAward", "func": "ReplyAward"},
    "今天还未回复过": {"name": "NotReplied", "func": "NotReplied", "color": "gray"},
    "查看回复板块": {"name": "ReplyPlate", "func": "ReplyPlate"},
    "看看系统奖励": {"name": "SystemAward", "func": "SystemAward", "color": "blue"},
    // "测试": {"name": "test", "func": "test", "color": "green"},
    "测试2": {"name": "test2", "func": "test2", "color": "gray"},
    // "清除": {"name": "clean", "func": "clean", "color": "gray"},
    "设置": {"name": "config", "func": "config", "color": "black"},
    "显示位置": {"name": "showPosition", "func": "showPosition"},
};

const configButGroup = {
    // "显示位置": {"name": "showPosition", "func": "showPosition"},
    "按钮大小": {"name": "changeSize", "func": "changeSize"},
}
const configBtnGroupId = 'my_configBtnGroup'

// 按钮组到底部的距离
const btnTBPx = 100;
const btnLRPx = 10;

// 表位置
const trHeight = 30;
const tableWidth = 600;
const tableHeight = 800;

const key_prefix = 'replyAward_';
const awardGroup = {
    '金币': {color: '#ffd700', emoji: '🪙'},
    '血液': {color: '#ff0000', emoji: '🩸'},
    '旅程': {color: '#008000', emoji: '🌍'},
    '咒术': {color: '#a279f4', emoji: '🔮'},
    '知识': {color: '#0000ff', emoji: '📖'},
    '堕落': {color: '#000000', emoji: '🖤'},
};

const ReplyPlate_key = 'ReplyPlate';
const ReplyPlate_limit = {
    "五花八门": {"limit_type": "24H", "times": 10},
    "C O D E": {"limit_type": "24H", "times": 10},
    "男色图影": {"limit_type": "24H", "times": 15},
    "ALL": {"limit_type": "1H", "times": 99},
};

(function () {
    const targetNode = document.body;

    // 监听页面变化
    const config = {childList: true, subtree: true};
    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeName === "DIV" || node.nodeName === "SECTION") {
                        console.log('全局 DOM 发生变化');
                        if (!node) {
                            continue;
                        }

                        // 回复奖励
                        if (node.id == "ntcwin" || node.className == "ntcwin") {
                            console.log("检测到回复奖励触发~")
                            save(node)
                        }
                    }
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // 方法组
    const funcs = {
        ReplyAward() {
            let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
            if (!localStorage.getItem(key)) {
                Toast("没有今天的回复记录！", 3000)
                return;
            }
        },
        NotReplied() {
            Toast("别点了，快去回复吧~", 1000)
        },
        ReplyPlate() {
        },
        SystemAward() {
            myWindow = window.open('/home.php?mod=spacecp&ac=credit&op=log&suboperation=creditrulelog');
        },
        test() {
            test()
        },
        test2() {
            test2()
        },
        clean() {
            clean()
        },
        config(event) {
            // 生成一套按钮组
            console.log(`点击的位置是 X=${event.clientX},Y=${event.clientY}`)
            const configBtnGroup = document.getElementById(configBtnGroupId);
            if(configBtnGroup) {
                showDiv(configBtnGroup, event.clientX, event.clientY)
            }
        },
        showPosition(event) {
            let positionDiv = document.getElementById('my_positionDiv');

            // 如果没有这个div 就生成一个
            if(!positionDiv) {
                positionDiv = document.createElement('div');
                positionDiv.id = 'my_positionDiv'
                let divStyle = `z-index:1001;position:fixed;margin:5px;padding:10px;border-radius:1em;` +
                    `background-color: rgba(128, 128, 128, 0.5);` + `display:none;`
                positionDiv.style.cssText = divStyle;
                positionDiv.style.display = 'none';
                positionDiv.className = 'my_position_container'
                positionDiv.innerHTML = `
<div class="my_position_square ul">↖</div>
<div class="my_position_square ur">↗</div>
<div class="my_position_square dl">↙</div>
<div class="my_position_square dr">↘</div>
`
                // 添加样式
                GM_addStyle(`
.my_position_container {
    z-index: 1001;
    position: sticky;
    margin: 5px;
    padding: 10px;
    border-radius: 1em;
    background-color: rgba(128, 128, 128, 0.5);
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    width: fit-content;
}
.my_position_square {
    width: 50px;
    height: 50px;
    background-color: #9a9a9a;
    border-radius: 5px;
    margin: 1px;
    cursor: pointer;
    text-align: center;
    line-height: 50px;
    
}
.my_position_square.active {
    background-color: #3498db;
}
.my_position_square:hover::after {
    content: " ";
    position: sticky;
    top: 0;
    left: 0;
    width: 50px;
    height: 50px;
    border-radius: 1em;
    /* -webkit-transition:-webkit-box-shadow .4s ease-in-out; */
    transition: -webkit-box-shadow .4s ease-in-out;
    transition: box-shadow .4s ease-in-out;
    transition: box-shadow .4s ease-in-out,-webkit-box-shadow .4s ease-in-out;
    -webkit-box-shadow: 0 0 8px #5e5e5e;
    box-shadow: 0 0 8px #5e5e5e
}
`)

                // 加到页面上
                document.body.appendChild(positionDiv)

                // 添加关闭事件
                setCloseEvent("my_positionDiv", "btn_showPosition")

                // 添加点击事件
                document.body.querySelectorAll('.my_position_square').forEach((item) => {
                    item.addEventListener('click', (event) => {
                        console.log(item.className)
                        document.body.querySelectorAll('.my_position_square').forEach((item) => {
                            item.classList.remove('active');
                        })

                        item.classList.add('active');

                        // 切换位置
                        // changePosition('', '');
                    });
                });
            }

            positionDiv.style.display = 'grid'; // 临时显示以应用网格
            if(positionDiv) {
                // 在指定位置显示
                showDiv(positionDiv, event.clientX, event.clientY)

                // left or right
                const lr = GM_getValue("lr") || "r"
                // up or down
                const ud = GM_getValue("ud") || "u"

                let name = `.my_position_square.${ud}${lr}`
                console.log(name)
                // 指定的亮起来
                document.body.querySelector(name).classList.add("active")
            }

        },
        changeSize() {
            document.querySelectorAll('.my_button').forEach(el => {
                if(el.classList.contains('small')) {
                    el.classList.remove('small')
                    el.classList.add('large')
                    GM_setValue(btnSizeName, 'large')
                    localStorage.setItem(btnSizeName, 'large')
                } else {
                    el.classList.remove('large')
                    el.classList.add('small')
                    GM_setValue(btnSizeName, 'small')
                    localStorage.setItem(btnSizeName, 'small')
                }
            })
        }
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
        if(lr == 'r') {

            div.style.left = null
            div.style.right = window.innerWidth - x + 'px';
        } else {
            div.style.left = x + 'px';
            div.style.right = null
        }

        // 整体在上面，就向下面显示
        if(ud == 'u') {
            div.style.top = y + 'px';
            div.style.bottom = null
        } else {
            div.style.top = null
            div.style.bottom = window.innerHeight - y + 'px';
        }

        // 显示配置按钮组
        if(div.style.display != 'grid') {
            div.style.display = 'block';
        }
    }

    // 保存奖励收益到本地缓存空间
    function save(node) {
        const now = new Date();
        let today_str = formatDate(now, 'YYYYMMdd');

        let text = node.innerText.trim();
        if (text.indexOf('发表回复') === -1) {
            return
        }
        let key = `${key_prefix}${today_str}`
        let sum_key = `${key}_sum`
        let keys_key = `${key_prefix}keys`

        // 从浏览器缓存中获取
        let ra = JSON.parse(localStorage.getItem(key) || '[]');
        let ra_sum = JSON.parse(localStorage.getItem(sum_key) || '{}');
        let ra_keys = JSON.parse(localStorage.getItem(keys_key) || '{}');

        let map = {
            "text": text,
            "date": now
        }

        // 计算当天每个资源点的合计数量
        let spans = node.querySelectorAll('span')
        if (spans.length > 0) {
            for (const span of spans) {
                if (span && span.childNodes && span.childNodes.length >= 2) {
                    let name = span.childNodes[0].textContent
                    let value = span.childNodes[1].textContent

                    map[name] = value

                    // 合计
                    if (value) {
                        let _value = (ra_sum[name] ? ra_sum[name] : 0)
                        _value += Number(value)
                        ra_sum[name] = _value
                    }
                }
            }
        }

        ra.push(map);

        // 保存到浏览器缓存中
        localStorage.setItem(key, JSON.stringify(ra));
        localStorage.setItem(sum_key, JSON.stringify(ra_sum));

        // 如果没有当天的记录，就新增一条，方便后面遍历删除
        if (!ra_keys[today_str]) {
            ra_keys[today_str] = now;
            localStorage.setItem(keys_key, JSON.stringify(ra_keys));
        }

        saveReplyPlate(now)
    }

    // 保存回复的板块积累数量
    function saveReplyPlate(date) {
        if(!date) {
           date = new Date();
        }
        const keywords = document.querySelector('meta[name="keywords"]')
        const contentValue = keywords?.content; // 使用可选链避免空值报错

        if (contentValue) {
            // 板块名
            const plateName = contentValue.split(',')[0]
            console.log(plateName);

            // https://www.gamemale.com/thread-${tid}-1-1.html
            let matchArray = window.location.href.match(/(\w*)?\/thread-(\d*)-(\d*)-(\d*).html(.+)?$/);
            // 帖子id
            let tid = matchArray[2];
            console.log(tid)

            // 主题
            const subject = targetNode.querySelector('#thread_subject');

            let ReplyPlateObj = JSON.parse(localStorage.getItem(ReplyPlate_key) || '{}');
            let reply = {
                "plateName": plateName,
                "tid": tid,
                "subject": subject.innerText,
                "date": date
            }

            // 如果有限制，就加入相应的列表中
            if(ReplyPlate_limit[plateName]) {
                let plateReplies = ReplyPlateObj[plateName] || []

                plateReplies.push(reply)
                plateReplies = clearExpiredData(ReplyPlate_limit[plateName].limit_type, ReplyPlate_limit[plateName].times, plateReplies);

                ReplyPlateObj[plateName] = plateReplies;
            }

            // 加入全部回复列表
            let allReplies = ReplyPlateObj['ALL'] || [];
            allReplies.push(reply)
            allReplies = clearExpiredData(ReplyPlate_limit['ALL'].limit_type, ReplyPlate_limit['ALL'].times, allReplies);
            ReplyPlateObj['ALL'] = allReplies;
            localStorage.setItem(ReplyPlate_key, JSON.stringify(ReplyPlateObj))
            console.log(ReplyPlateObj)
        }
    }

    function clearExpiredData(limit_type, limit_times, list) {
        // 如果限制次数是24H的话，那就清除24H前的数据
        if(limit_type == '24H') {
            // 时间戳
            const ts = Date.now();
            const onedayms = 24*60*60*1000;
            const y_ts = ts - onedayms;

            const newList = list.filter(item => {
                return (new Date(item.date)).getTime() > y_ts
            });
            return newList;
        } else if (limit_type == '1H') {
            // 时间戳
            const ts = Date.now();
            const onedayms = 1*60*60*1000;
            const y_ts = ts - onedayms;

            const newList = list.filter(item => {
                return (new Date(item.date)).getTime() > y_ts
            });
            return newList;
        }

        return list
    }

    function test() {
        saveReplyPlate()
    }

    function test2() {
        const rp = JSON.parse(localStorage.getItem(ReplyPlate_key) || '{}');
        for (let name in ReplyPlate_limit) {
            if(rp[name]) {
                let data = clearExpiredData(ReplyPlate_limit[name].limit_type, ReplyPlate_limit[name].times, rp[name]);
                console.log("清除前：", rp[name].length,"清除后：", data.length)
                console.log(data)
            }
        }
    }

    // 初始化按钮
    function init() {
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
            `${lr=="l"?"left":"right"}:${btnLRPx}px;${ud=="d"?"bottom":"top"}:${btnTBPx}px;` +
            `text-align:${lr=="l"?"left":"right"}`

        // 不显示
        const btnSwitch = GM_getValue(btnSwitchName);
        if(!btnSwitch) {
            div.style.display = "none";
        }

        let btnStyle = `z-index:999;position:sticky;margin:5px;`

        let i = 1
        for (let buttonName in buttonGroup) {
            let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
            if (buttonName === "查看回复奖励") {
                // 需要有数据才显示按钮
                if (!localStorage.getItem(key)) {
                    continue
                }
            }
            if (buttonName === "今天还未回复过") {
                // 需要无数据才显示按钮
                if (localStorage.getItem(key)) {
                    continue
                }
            }
            let btn = document.createElement('button');
            btn.id = "btn_" + buttonGroup[buttonName].func;
            btn.className = `my_button ${(buttonGroup[buttonName].color || 'red')} ${(size=="small"?"small":"large")}`

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
            btn.className = `my_button ${(configButGroup[buttonName].color || 'red')} ${(size=="small"?"small":"large")}`

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
    }

    GM_registerMenuCommand("左右切换", ()=> {
        const lrSwitch = GM_getValue("lr");
        console.log(lrSwitch);
        GM_setValue("lr", lrSwitch!="l"?"l":"r")

        if(lrSwitch == 'l') {
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
    }, "l");
    GM_registerMenuCommand("上下切换", ()=> {
        const udSwitch = GM_getValue("ud");
        console.log(udSwitch);
        GM_setValue("ud", udSwitch!="u"?"d":"u")

        if(udSwitch != 'u') {
            console.log("换到下边")
            document.querySelector('#my_buttonGroup').style.top = null
            document.querySelector('#my_buttonGroup').style.bottom = btnTBPx + 'px'
        } else {
            console.log("换到上边")
            document.querySelector('#my_buttonGroup').style.top = btnTBPx + 'px';
            document.querySelector('#my_buttonGroup').style.bottom = null
        }
    }, "u");
    GM_registerMenuCommand("显隐切换", ()=> {
        const btnSwitch = GM_getValue(btnSwitchName);
        GM_setValue(btnSwitchName, !btnSwitch)

        if(btnSwitch) {
            document.querySelector('#my_buttonGroup').style.display = 'none';
        } else {
            document.querySelector('#my_buttonGroup').style.display = 'block';
        }
    }, "h");
    init();

    // 把收益json 转换成 html table
    function raToHtml(_ras) {
        let ras = _ras.reverse();
        let sum = {}
        let lastReplyTime = new Date();
        if (ras[0]) {
            lastReplyTime = new Date(ras[0].date);
        }

        let html = []
        html.push('<html>')

        const tableCSS = GM_getResourceText("tableCSS");
        html.push(`
  <head><style>${tableCSS}
  tr {
    height: ${trHeight}px;
  }
  </style></head>`)
        html.push(
            `<body>
<input style="display: none;" id="lastReplyTime" value="${lastReplyTime}"/>
<table><caption>${formatDate(new Date(), 'YYYY年MM月DD日')} 共计回复 <span class="emphasis">${ras.length}</span> 次</caption>
<caption id="passTime">距离上次回复已过去： <span id="timer" class="emphasis">00:00:00</span> </caption>
<tbody>`)

        // 表头
        html.push('<tr><th>回复时间</th>')
        for (let _th in awardGroup) {
            html.push(`<th style="color:${awardGroup[_th]["color"]};">${_th}${awardGroup[_th]["emoji"]}</th>`)
        }
        html.push('<th class="ellipsis-column t-text">文本</th></tr>')

        // awardGroup
        let last = undefined
        ras.forEach((ra, index) => {
            if (ra.text.indexOf('发表回复') === -1) {
                return
            }

            let className = "tr ";
            if (last) {
                if ((new Date(ra.date)).getHours() != (new Date(last.date)).getHours()) {
                    className += "separator"
                }
            }
            html.push(`<tr class="${className}">`)
            html.push(`<td>${formatDate(new Date(ra.date), 'HH:mm:SS')}</td>`)
            for (let _th in awardGroup) {
                html.push(`<td class="inner-text">${ra[_th] ? ra[_th] : ''}</td>`)
                if (ra[_th]) {
                    let value = sum[_th] ? sum[_th] : 0;
                    value += Number(ra[_th])
                    sum[_th] = value
                }
            }
            html.push(`<td class="t-text">${ra.text}</td>`)
            html.push('</tr>')
            last = ra
        })
        // console.log(sum)
        html.push('</tbody>')

        let foot = '<tr><td>合计</td>'
        for (let name in awardGroup) {
            foot += `<td class="inner-text">${sum[name] ? sum[name] : '0'}</td>`
        }
        foot += '</tr>'
        html.push(`<tfoot>${foot}</tfoot>`)

        html.push('</table></body></html>')

        return html.join('');
    }

    // 把回复json 转换成 html table
    function rpToHtml(_rps) {
        let html = []
        html.push('<html>')

        const tableCSS = GM_getResourceText("tableCSS");
        html.push(`<head><style>${tableCSS}</style></head><body>`)

        for (let name in ReplyPlate_limit) {
            if(_rps[name]) {
                html.push(
                    `<div style="margin: 20px;text-align: center;">` +
                        `<div class="important-text">${name} 板块下 共计回复 <span class="emphasis">${_rps[name].length}</span> 次` +
                            `<button id="toggleBtn" class="toggle-btn t_button" onclick="let table = document.getElementById(\'table_${name}\');table.style.display == 'none'?table.style.display = 'block':table.style.display = 'none'">显隐表格</button>` +
                        `</div>` +
                        `<div class="">该板块下 限制 <span class="emphasis">${ReplyPlate_limit[name].limit_type}</span> 期间 回复 <span class="emphasis">${ReplyPlate_limit[name].times}</span> 次</div>` +
                    `<div id="table_${name}" style="display: none;"><table><caption>${name} 板块</caption><tbody>`
                )
                html.push('<tr><th>回复时间</th><th>标题</th><th>跳转</th></tr>')
                for (const rp of _rps[name]) {
                    html.push(`<tr><td>${formatDate(new Date(rp.date), 'DD日 HH:mm:SS')}</td><td class="title ellipsis-column">${rp.subject}</td><td><button class="t_button" onclick="window.open('https://www.gamemale.com/thread-${rp.tid}-1-1.html', '_blank')">查看</button></td></tr>`)
                }
                html.push('</tbody></table></div></div><hr/>')
            } else {
                html.push(
                    `<div style="margin: 20px;text-align: center;">` +
                        `<div class="important-text">${name} 板块下 共计回复 <span class="emphasis">0</span> 次` +
                        `</div>` +
                        (name == 'ALL'?'':`<div class="">该板块下 限制 <span class="emphasis">${ReplyPlate_limit[name].limit_type}</span> 期间 回复 <span class="emphasis">${ReplyPlate_limit[name].times}</span> 次</div>`) +
                    '</div><hr/>'
                );
            }
        }

        html.push('</body></html>')

        return html.join('');
    }

    // 创建弹窗
    function createIFrame(id) {
        // 添加弹窗
        let htmlDivElement = document.createElement("div");
        htmlDivElement.id = id;
        htmlDivElement.className = "my_popup";
        htmlDivElement.style.display = "none";
        htmlDivElement.innerHTML = `
    <div class="popup-arrow" style="">
        <iframe id="pop_iframe_${id}" frameborder="no" scrolling="auto"  style="overflow-y：auto"></iframe>
    </div>`
        targetNode.appendChild(htmlDivElement);
    }

    // 关闭弹窗
    function closePopup(id) {
        console.log('关闭 ', id)
        document.getElementById(id).style.display = 'none';
        let iframe = document.getElementById(`pop_iframe_${id}`);
        if(iframe) {
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

        if(parentId) {
            // 防止点击父级按钮时关闭弹窗
            document.getElementById(parentId).addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    function popupEvent(buttonId, popupId, callback) {
        // 如果弹窗按钮存在
        const button = document.getElementById(buttonId);
        if (button) {
            createIFrame(popupId)

            // 增加点击监听 显示弹出窗口
            button.addEventListener('click', function (e) {
                // 如果弹窗已显示，则进行关闭
                if (document.getElementById(popupId).style.display != 'none') {
                    closePopup(popupId);
                    return;
                }

                callback(e, popupId);

                // 阻止事件冒泡
                e.stopPropagation();
            });

            setCloseEvent(popupId);
        }
    }

    // 回复奖励的弹窗
    popupEvent("btn_ReplyAward", "popup_ReplyAward", function (e, popupId) {
        const popup = document.getElementById(popupId);
        const btn = e.target;

        // 计算弹窗位置（左下角）
        const rect = btn.getBoundingClientRect();
        // popup.style.left = (rect.left - tableWidth) + 'px';
        // left or right
        const lr = GM_getValue("lr") || "r"
        if(lr == 'l') {
            popup.style.left = (btnLRPx + 20) + 'px';
        } else {
            popup.style.right = (btnLRPx + 20) + 'px';
        }
        popup.style.top = (rect.bottom + 20) + 'px';

        let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
        if (!localStorage.getItem(key)) {
            Toast("没有今天的回复记录！", 3000)
            return;
        }
        let ra = JSON.parse(localStorage.getItem(key) || '[]');
        let html = raToHtml(ra);

        let iframe = document.getElementById(`pop_iframe_${popupId}`);
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.body.innerHTML = html;
        iframeDoc.body.style.display = 'block';

        // 显示弹窗
        popup.style.display = 'block';
        popup.style.width = tableWidth + 'px';
        popup.style.minHeight = tableHeight - 10 + 'px';
        iframe.style.width = tableWidth + 'px';
        iframe.style.minHeight = tableHeight + 'px';

        const timerJS = GM_getResourceText("timerJS");
        let scriptElement = iframeDoc.createElement("script");
        scriptElement.append(timerJS);
        iframeDoc.body.appendChild(scriptElement);
    });

    // 回复板块的弹窗
    popupEvent("btn_ReplyPlate", "popup_ReplyPlate", function (e, popupId) {
        const popup = document.getElementById(popupId);
        const btn = e.target;

        // 计算弹窗位置（左下角）
        const rect = btn.getBoundingClientRect();
        const lr = GM_getValue("lr") || "r"
        if(lr == 'l') {
            popup.style.left = (btnLRPx + 20) + 'px';
        } else {
            popup.style.right = (btnLRPx + 20) + 'px';
        }
        popup.style.top = (rect.bottom + 20) + 'px';

        let rp = JSON.parse(localStorage.getItem(ReplyPlate_key) || '[]');
        let html = rpToHtml(rp);

        let iframe = document.getElementById(`pop_iframe_${popupId}`);
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.body.innerHTML = html;
        iframeDoc.body.style.display = 'block';

        // 显示弹窗
        popup.style.display = 'block';
        popup.style.width = tableWidth + 'px';
        popup.style.height = 'auto';
        popup.style.minHeight = '600px';
        iframe.style.width = tableWidth + 'px';
        iframe.style.minHeight = '600px';
        iframe.style.height = 'auto';
    });

    const buttonCSS = GM_getResourceText("buttonCSS");
    GM_addStyle(buttonCSS);
    const popupCSS = GM_getResourceText("popupCSS");
    GM_addStyle(popupCSS);
/*    GM_addStyle(`.my_button.gray {
    background: linear-gradient(to right, rgba(62, 62, 62, 0.9), #878787);
    }
    .my_button.blue {
    background: linear-gradient(to right, #2e6183, #589eca, #6bc0ff);
    }
    `);*/

    function changePosition(ud, lr) {

    }

})();

