// ==UserScript==
// @name         小说下载
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description
// @updateURL
// @downloadURL
// @author       Sam
// @match        https://jiqinw.com/*/*.html
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// @resource popupCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/popup.css
// ==/UserScript==
const buttonGroup = {
    "下载全文": {"name": "downloadAll", "func": "downloadAll"},
};

// 按钮组到底部的距离
const btnTopPx = 100;
const btnRightPx = 10;

// 表位置
const trHeight = 30;
const tableWidth = 600;
const tableHeight = 800;

(function () {
    const targetNode = document.body;

    const funcs = {
        downloadAll() {
            const alt_page = targetNode.querySelector(".alt_page");
            const a = alt_page.querySelector('a');
            if(a) {
                let matchArray = a.innerText.match(/共(\d*)页:$/);
                const pages_num = matchArray[1]

                const url = window.location.href
                let urlMatchArray = url.match(/(\w*)\/(\d*)(_\d*)?.html$/);
                const category = urlMatchArray[1]
                const nid = urlMatchArray[2]

                Toast(`分类：${category}, 帖子编号：${nid}，分页数量：${pages_num}`, 3000)

                let key = `category_${category}_${nid}`
                let value = {
                    category: category,
                    nid: nid,
                    pages_num: pages_num,
                    current: 0,
                }
                let item = localStorage.getItem(key);
                if(item) {
                    Toast(`已经有一个任务在进行中了~请不要重复下载`, 3000)
                }
            }
        }
    }

    // 检查当前页面是否有下载任务
    function checkDownloadTask() {
        const url = window.location.href
        let urlMatchArray = url.match(/(\w*)\/(\d*)(_\d*)?.html$/);
        const category = urlMatchArray[1]
        const nid = urlMatchArray[2]
        let key = `category_${category}_${nid}`
        let item = localStorage.getItem(key);
        // 如果有下载任务
        if(item) {
            Toast("有下载任务，准备进行下载", 1000)
            // 获取当前页
            let current = urlMatchArray[3] || 1;
            // 获取缓存
            let cache = localStorage.getItem(`${key}_cache`) || {};
            // 下载完了
            if(cache.length == item.pages_num) {
                // 合并
                // TODO
            }

            // 如果缓存中 没有该页的数据，就下载
            if(!cache[current]) {
                // 下载当前页
                const element = document.querySelector('.wznrb');
                const text = element.innerText;

                cache[current] = text
            }

            // 每次加一页 如果该页已经有了，继续+1
            while(cache[current]) {
                current += 1
                // 如果已经大于了最大页数
                if(current > item.pages_num) {
                    if(cache.length == item.pages_num) {
                        // 合并
                    } else {
                        // 从第一页开始检查
                        current = 1;
                    }

                }
            }

            item.current = current
            localStorage.setItem(key, item);
            // 跳转
            window.location.href = `https://jiqinw.com/${category}/${nid}_${current}.html`
        } else {
            console.log("没有下载任务")
        }
    }

    // 初始化按钮
    function init() {
        let body = document.querySelector('body');
        let div = document.createElement('div');
        let stylebutton = `z-index:999;fontsize:14px;position: fixed;cursor: pointer;right:${btnRightPx}px;margin:10px;top:`

        let top = btnTopPx;
        div.style.cssText = stylebutton + top + 'px';

        let i = 1
        for (let buttonName in buttonGroup) {
            let btn = document.createElement('button');
            btn.id = "btn_" + buttonGroup[buttonName].func;
            btn.className = 'my_button ' + (buttonGroup[buttonName].color || 'red')

            btn.style.cssText = stylebutton + (top + (i - 1) * 50) + 'px';

            btn.textContent = buttonName;
            btn.addEventListener('click', () => {
                funcs[buttonGroup[buttonName].func]();
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

    function closePopup(id) {
        document.getElementById(id).style.display = 'none';
        let iframe = document.getElementById(`pop_iframe_${id}`);
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.body.style.display = 'none';
    }
    function setCloseEvent(id) {
        // 点击页面其他地方关闭弹窗
        document.addEventListener('click', function () {
            closePopup(id)
        });

        // 防止弹窗内部点击关闭弹窗
        document.getElementById(id).addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // 如果弹窗按钮存在
    const popup_btnReplyAward_btn = document.getElementById('btn_btnReplyAward');
    const popup_btnReplyAward_id = "popup_ReplyAward"
    if (popup_btnReplyAward_btn) {
        createIFrame(popup_btnReplyAward_id)

        // 增加点击监听 显示弹出窗口
        popup_btnReplyAward_btn.addEventListener('click', function (e) {
            console.log("click")

            // 如果弹窗已显示，则进行关闭
            if (document.getElementById(popup_btnReplyAward_id).style.display != 'none') {
                closePopup(popup_btnReplyAward_id);
                return;
            }

            const popup = document.getElementById(popup_btnReplyAward_id);
            const btn = e.target;

            // 计算弹窗位置（左下角）
            const rect = btn.getBoundingClientRect();
            // popup.style.left = (rect.left - tableWidth) + 'px';
            popup.style.right = (btnRightPx + 20) + 'px';
            popup.style.top = (rect.bottom + 20) + 'px';

            let key = `${key_prefix}${formatDate(new Date(), 'YYYYMMdd')}`
            if (!localStorage.getItem(key)) {
                Toast("没有今天的回复记录！", 3000)
                return;
            }
            let ra = JSON.parse(localStorage.getItem(key) || '[]');
            let html = raToHtml(ra);

            let iframe = document.getElementById(`pop_iframe_${popup_btnReplyAward_id}`);
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

            // 阻止事件冒泡
            e.stopPropagation();
        });

        setCloseEvent(popup_btnReplyAward_id);
    }

    const popup_btnReplyPlate_btn = document.getElementById('btn_btnReplyPlate');
    console.log(popup_btnReplyPlate_btn)
    const popup_btnReplyPlate_id = "popup_ReplyPlate"
    if (popup_btnReplyPlate_btn) {
        createIFrame(popup_btnReplyPlate_id)

        // 增加点击监听 显示弹出窗口
        popup_btnReplyPlate_btn.addEventListener('click', function (e) {
            console.log("click")

            // 如果弹窗已显示，则进行关闭
            if (document.getElementById(popup_btnReplyPlate_id).style.display != 'none') {
                closePopup(popup_btnReplyPlate_id);
                return;
            }

            const popup = document.getElementById(popup_btnReplyPlate_id);
            const btn = e.target;

            // 计算弹窗位置（左下角）
            const rect = btn.getBoundingClientRect();
            // popup.style.left = (rect.left - tableWidth) + 'px';
            popup.style.right = (btnRightPx + 20) + 'px';
            popup.style.top = (rect.bottom + 20) + 'px';

            let rp = JSON.parse(localStorage.getItem(ReplyPlate_key) || '[]');
            let html = rpToHtml(rp);

            let iframe = document.getElementById(`pop_iframe_${popup_btnReplyPlate_id}`);
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

            // 阻止事件冒泡
            e.stopPropagation();
        });

        setCloseEvent(popup_btnReplyPlate_id);
    }

    const buttonCSS = GM_getResourceText("buttonCSS");
    GM_addStyle(buttonCSS);
    const popupCSS = GM_getResourceText("popupCSS");
    GM_addStyle(popupCSS);

})();
