// ==UserScript==
// @name         GM论坛回复奖励记录
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description
// @updateURL    https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM%E8%AE%BA%E5%9D%9B%E5%9B%9E%E5%A4%8D%E5%A5%96%E5%8A%B1%E8%AE%B0%E5%BD%95.js
// @downloadURL  https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM%E8%AE%BA%E5%9D%9B%E5%9B%9E%E5%A4%8D%E5%A5%96%E5%8A%B1%E8%AE%B0%E5%BD%95.js
// @author       Sam
// @match        https://www.gamemale.com/**
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// @resource tableCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/table.css
// ==/UserScript==
const buttonGroup = {
    "查看回复奖励": "btnReplyAward",
};

// 按钮组到底部的距离
const topPx = 100;
const trHeight = 30;

const key_prefix = 'replyAward_';
const awardGroup = ['金币', '旅程', '血液', '咒术', '知识', '堕落'];

(function () {
    const targetNode = document.body;

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

    // 保存到本地缓存空间
    function save(node) {
        let today_str = formatDate(new Date(), 'YYYYMMdd');

        let text = node.innerText.trim();
        if(text.indexOf('发表回复') === -1) {
            return
        }
        let key = `${key_prefix}${today_str}`
        let sum_key = `${key}_sum`
        let keys_key = `${key_prefix}keys`

        let ra = JSON.parse(localStorage.getItem(key) || '[]');
        let ra_sum = JSON.parse(localStorage.getItem(sum_key) || '{}');
        let ra_keys = JSON.parse(localStorage.getItem(keys_key) || '{}');

        let map = {}
        map.text = text
        map.date = new Date()

        let spans = node.querySelectorAll('span')
        if (spans.length > 0) {
            for (const span of spans) {
                if (span && span.childNodes && span.childNodes.length >= 2) {
                    let name = span.childNodes[0].textContent
                    let value = span.childNodes[1].textContent

                    map[name] = value

                    // 合计
                    if(value) {
                        let _value = (ra_sum[name] ? ra_sum[name] : 0)
                        _value += Number(value)
                        ra_sum[name] = _value
                    }
                }
            }
        }

        ra.push(map);
        localStorage.setItem(key, JSON.stringify(ra));
        localStorage.setItem(sum_key, JSON.stringify(ra_sum));

        // 如果没有当天的记录，就新增一条，方便后面遍历删除
        if(!ra_keys[today_str]) {
            ra_keys[today_str] = new Date();
            localStorage.setItem(keys_key, JSON.stringify(ra_keys));
        }
    }

    // 初始化按钮
    function init() {
        let body = document.querySelector('body');
        let div = document.createElement('div');
        let stylebutton = 'z-index:999;fontsize:14px;position: fixed;cursor: pointer;right:10px;margin:10px;top:'
        let top = topPx;
        div.style.cssText = stylebutton + top + 'px';

        let i = 1
        for (let buttonName in buttonGroup) {
            if (buttonName === "查看回复奖励") {
                // 需要有数据才显示按钮
                let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
                if (!localStorage.getItem(key)) {
                    continue
                }
            }
            let btn = document.createElement('button');
            btn.className = 'my_button red'
            btn.style.cssText = stylebutton + (top + (i - 1) * 50) + 'px';

            btn.textContent = buttonName;
            btn.addEventListener('click', () => {
                funcs[buttonGroup[buttonName]]();
            });

            if (!btn.textContent) {
                continue
            }
            div.appendChild(btn);
            i += 1
        }

        body.appendChild(div);
    }

    init();

    const funcs = {
        btnReplyAward() {
            let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
            if (!localStorage.getItem(key)) {
                Toast("没有今天的回复记录！", 3000)
                return;
            }
            Toast(localStorage.getItem(key))
            let ra = JSON.parse(localStorage.getItem(key) || '[]');

            myWindow = window.open('', '_blank');
            let html = raToHtml(ra);
            myWindow.document.write(html);
            myWindow.document.close()
            myWindow.focus();
        }
    }

    function raToHtml(_ras) {
        let ras = _ras.reverse();
        let sum = {}

        let html = []
        html.push('<html>')

        const tableCSS = GM_getResourceText("tableCSS");
        html.push(`
  <head><style>${tableCSS}
  tr {
    height: ${trHeight}px;
  }
  </style></head>`)
        html.push(`<body><table><caption>${formatDate(new Date(), 'YYYY年MM月DD日')}</caption>
<caption>共计回复 <span style="color: #9f0404">${ras.length}</span> 次</caption><tbody>`)

        // 表头
        html.push('<tr><th>回复时间</th>')
        for(let _th of awardGroup) {
            html.push(`<th>${_th}</th>`)
        }
        html.push('<th class="ellipsis-column t-text">文本</th></tr>')

        // awardGroup
        let last = undefined
        ras.forEach((ra, index) => {
            if(ra.text.indexOf('发表回复') === -1) {
                return
            }

            let className = "tr ";
            if(last) {
                if((new Date(ra.date)).getHours() != (new Date(last.date)).getHours()) {
                    className += "separator"
                }
            }
            html.push(`<tr class="${className}">`)
            html.push(`<td>${formatDate(new Date(ra.date), 'HH:mm:SS')}</td>`)
            for(let _th of awardGroup) {
                html.push(`<td class="inner-text">${ra[_th]?ra[_th]:''}</td>`)
                if(ra[_th]) {
                    let value = sum[_th]?sum[_th]:0;
                    value+=Number(ra[_th])
                    sum[_th]=value
                }
            }
            html.push(`<td class="t-text">${ra.text}</td>`)
            html.push('</tr>')
            last = ra
        })
        console.log(sum)
        html.push('</tbody>')

        let foot = '<tr><td>合计</td>'
        for(let name of awardGroup) {
            foot += `<td class="inner-text">${sum[name]?sum[name]:'0'}</td>`
        }
        foot += '</tr>'
        html.push(`<tfoot>${foot}</tfoot>`)

        html.push('</table></body></html>')

        return html.join('');
    }

    const css = GM_getResourceText("buttonCSS");
    GM_addStyle(css);
})();

