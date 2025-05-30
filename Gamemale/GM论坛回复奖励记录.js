// ==UserScript==
// @name         GM论坛回复奖励记录
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description
// @author       Sam
// @match        https://www.gamemale.com/**
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/datetime.js
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// ==/UserScript==
const buttonGroup = {
    "查看回复奖励": "btnReplyAward",
};

// 按钮组到底部的距离
const topPx = 100;

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

        let text = node.innerText.trim();

        let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`

        let ra = JSON.parse(localStorage.getItem(key) || '[]');

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
                }
            }
        }

        ra.push(map);
        localStorage.setItem(key, JSON.stringify(ra));
    }

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

        let html = []
        html.push('<html>')
        html.push(`
  <head><style>
    table {
      border-collapse: collapse;
      width: auto;
      /*max-width: 800px;*/
      margin: 20px auto;
    }
    th, td {
      /*width: auto;*/
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th:not(:first-child) {
      border-left: 1px solid #73b6e1;
    }
    td:not(:first-child)  {
      border-left: 1px solid #eee;
    }
    th {
      background-color: #589eca;
      color: white;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    caption {
      font-size: 1.2em;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .inner-text{
        text-align: center;
    }
    .ellipsis-column {
        max-width: 200px;         /* 设置最大宽度 */
        white-space: nowrap;      /* 禁止换行 */
        overflow: hidden;         /* 超出内容隐藏 */
        text-overflow: ellipsis;  /* 超出部分显示省略号 */
    }
    .t-text{
        display: none
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
        for (let ra of ras) {
            if(ra.text.indexOf('发表回复') === -1) {
                continue
            }
            html.push('<tr>')
            html.push(`<td>${formatDate(new Date(ra.date), 'HH:mm:SS')}</td>`)
            for(let _th of awardGroup) {
                html.push(`<td class="inner-text">${ra[_th]?ra[_th]:''}</td>`)
            }
            html.push(`<td class="t-text">${ra.text}</td>`)
            html.push('</tr>')
        }

        html.push('</tbody></table></body></html>')

        return html.join('');
    }

    const css = GM_getResourceText("buttonCSS");
    GM_addStyle(css);
})();

