// ==UserScript==
// @name         KemonoAndCommer
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description  KemonoAndCommer
// @author       Sam
// @match        https://kemono.cr/patreon/user/**/post/**
// @match        https://coomer.st/**
// @match        https://kemono.cr/**
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
    "复制附件": {"name": "copyAttachments", "func": "copyAttachments", "color": "blue"},
    // "复制附件（原名）": {"name": "copyAttachments_origin", "func": "copyAttachments_origin", "color": "blue"},
    "复制附件（序号）": {"name": "copyAttachments_serial", "func": "copyAttachments_serial", "color": "blue"},
    "复制附件（文件夹）": {"name": "copyAttachments_folder", "func": "copyAttachments_folder", "color": "blue"},
    "复制所有": {"name": "copyAll", "func": "copyAll"},
    "复制所有（文件夹）": {"name": "copyAll_folder", "func": "copyAll_folder"},
    "下载文本内容": {"name": "downloadContent", "func": "downloadContent", "color": "yellow"},
    "设置": {"name": "config", "func": "config", "color": "black"},
};
console.log(" KemonoAndCommer init ");

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

// 正则匹配
const hrefMatch = /(\w*)?\/user\/(.+)?\/post\/(\w*)?$/;
const userHrefMatch = /(\w*)?\/user\/(\w+)?(\?.+)?$/;

const LIKE_COLOR = "GoldenRod";
const DISLIKE_COLOR = "Maroon";
const VIEWED_COLOR = "LightYellow";
const DEFAULT_COLOR = "GRAY";

(function () {
    console.log(" KemonoAndCommer init ");

    const targetNode = document.body;

    const config = {childList: true, subtree: true};
    const callback = function (mutationsList) {

        let href = window.location.href

        if (href.match(hrefMatch)) {
            console.log(" 当前在内容页面 ");
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if ((node.nodeName == "DIV" || node.nodeName == "SECTION")
                            && node.querySelector('.post__actions')) {
                            let matchArray = window.location.href.match(hrefMatch);
                            const platform = matchArray?.[1] || '';
                            const userId = matchArray?.[2] || '';
                            const postId = matchArray?.[3] || '';

                            let buttons = node.querySelector('.post__actions')

                            // 数据
                            let like = getUserPostLike(userId, postId);

                            let likeColor = DEFAULT_COLOR
                            if (like["liked"] === true) {
                                likeColor = LIKE_COLOR
                            } else if (like["liked"] === false) {
                                likeColor = DISLIKE_COLOR
                            }

                            // 创建按钮
                            let likeButton = createButtonTag("", "LIKE", likeColor, "8px 4px");
                            buttons.appendChild(likeButton)
                            if(like["liked"] === false) {
                                likeButton.innerText = "DISLIKE"
                            }

                            // 创建按钮
                            let viewButton = createButtonTag("", "VIEWED", like["viewed"] ? VIEWED_COLOR : DEFAULT_COLOR, "8px 4px");
                            buttons.appendChild(viewButton)

                            // likeButton
                            likeButton.onclick = function () {
                                // 修改数值
                                like["liked"] = !like["liked"]
                                setUserPostLike(userId, postId, like["liked"]);
                                // 修改颜色
                                likeButton.style.color = like["liked"] ? LIKE_COLOR : DISLIKE_COLOR;
                                viewButton.style.color = VIEWED_COLOR;

                                // 修改文字
                                likeButton.innerText = like["liked"] ? "LIKE" : "DISLIKE";
                            }
                            // likeButton
                            viewButton.onclick = function () {
                                if (!like["viewed"]) {
                                    like["viewed"] = true;
                                    // 修改颜色
                                    viewButton.style.color = VIEWED_COLOR;
                                    setUserPostLike(userId, postId, undefined, true)
                                }
                                // 看过时，点击不处理
                            }
                        } else if (node.nodeName == "IFRAME" && node.querySelector('.post__actions')) {
                            console.log("IFRAME")
                        } else if (node.nodeName == "SECTION" && node.querySelector('.post__actions')) {
                            console.log("SECTION")
                        } else {
                            // console.log(node.nodeName)
                        }
                    }
                }
            }
        } else if (href.match(userHrefMatch)) {
            console.log(" 当前在用户页面 ");
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if ((node.nodeName == "DIV" || node.nodeName == "SECTION")
                            && node.querySelector('.card-list__items')) {
                            let matchArray = window.location.href.match(userHrefMatch);
                            const platform = matchArray?.[1] || '';
                            const userId = matchArray?.[2] || '';
                            console.log(platform, userId)

                            let items = node.querySelector('.card-list__items').children;
                            console.log(items)
                            let likes = getUserLikes(userId);
                            for (let item of items) {
                                let color = undefined;
                                let postId = item.getAttribute('data-id');
                                // console.log(postId)

                                let like = likes[postId]
                                if (like == undefined) {
                                    continue
                                } else {
                                    // 仅看过
                                    if (like["viewed"]) {
                                        color = VIEWED_COLOR
                                    }
                                    if (like["liked"] != undefined) {
                                        if (like["liked"]) {
                                            color = LIKE_COLOR
                                        } else {
                                            color = DISLIKE_COLOR
                                        }
                                    }
                                }

                                item.querySelector('footer').style.backgroundColor = color;
                            }
                        } else {
                            // console.log(node.nodeName)
                        }
                    }
                }
            }
        } else {
            console.log(" 不知道在哪 ");

        }

    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const likesPrefix = "LIKES_"

    // 获取喜欢的列表
    function getUserLikes(userId) {
        let likes = JSON.parse(localStorage.getItem(likesPrefix + userId) || "{}")
        return likes
    }

    function getUserPostLike(userId, postId) {
        let likes = getUserLikes(userId)
        let ob = likes[postId] || {
            viewed: false
        }

        return ob
    }

    // 设置是否喜欢
    function setUserPostLike(userId, postId, like, viewed) {
        console.log(userId, postId, like);

        let likes = getUserLikes(userId)
        let ob = likes[postId] || {
            viewed: true
        }

        // 设置是否喜欢
        ob.liked = like
        if (viewed) {
            ob.viewed = viewed
        }
        likes[postId] = ob
        localStorage.setItem(likesPrefix + userId, JSON.stringify(likes))
    }

    // 方法组
    const funcs = {
        copyName() {
            copyName();
        },
        copyPics() {
            copyAll('NoFolder', 'pic');
        },
        copyPics_folder() {
            copyAll('', 'pic');
        },
        copyAttachments() {
            copyAll('NoFolder', 'attachment');
        },
        copyAttachments_serial() {
            copyAll('NoFolder', 'attachment_serial');
        },
        copyAttachments_folder() {
            copyAll('', 'attachment');
        },
        copyAll() {
            copyAll('NoFolder', 'all');
        },
        copyAll_folder() {
            copyAll('', 'all');
        },
        downloadContent() {
            downloadContent();
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
        console.log(" KemonoAndCommer init ");
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

    function createPopup(e, popupId, HTMLFunc, iframeFunc, endFunc) {
        const popup = document.getElementById(popupId);
        const btn = e.target;

        // 计算弹窗位置（左下角）
        const rect = btn.getBoundingClientRect();
        const lr = GM_getValue("lr") || "r"
        if (lr == 'l') {
            popup.style.left = (btnLRPx + 20) + 'px';
        } else {
            popup.style.right = (btnLRPx + 20) + 'px';
        }
        popup.style.top = (rect.bottom + 20) + 'px';

        let html = HTMLFunc()

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

        // 对iFram做特殊处理
        if (iframeFunc) {
            iframeFunc(iframe, popup)
        }

        if (endFunc) {
            endFunc(iframe);
        }
    }

    // 发布内容
    function postApi() {
        let matchArray = window.location.href.match(hrefMatch);
        const platform = matchArray?.[1] || '';
        const userId = matchArray?.[2] || '';
        const postId = matchArray?.[3] || '';

        // 判断是否已有作品id(兼容按左右方向键翻页的情况)
        const key = `kc_data_${postId}`
        let postData = JSON.parse(localStorage.getItem(key) || '{}');
        if (!postData || String(postData?.illustId) !== String(postId)) {
            $.ajax({
                url: `/api/v1/${platform}/user/${userId}/post/${postId}`,
                header: {
                    Accept: 'text/css'
                },
                dataType: 'json',
                async: false,
                success: (body) => {
                    if (body) {
                        localStorage.setItem(key, JSON.stringify(body));
                        Toast(`GET ${postId} of ${userId}`)
                        postData = body
                    }
                },
            });
        }
        return postData;
    }

    // 个人信息
    function profileApi() {

        let matchArray = window.location.href.match(hrefMatch);
        const platform = matchArray?.[1] || '';
        const userId = matchArray?.[2] || '';

        // 判断是否已有作者id
        const key = `kc_user_${platform}_${userId}`
        let profileData = JSON.parse(localStorage.getItem(key) || '{}');
        if (!profileData || String(profileData?.id) !== String(userId)) {
            $.ajax({
                url: `/api/v1/${platform}/user/${userId}/profile`,
                header: {
                    Accept: 'text/css'
                },
                dataType: 'json',
                async: false,
                success: (body) => {
                    if (body) {
                        Toast(`GET profile of ${userId}`)
                        profileData = body
                        localStorage.setItem(key, JSON.stringify(body));
                    }
                },
            });
        }
        return profileData;
    }

    const buttonCSS = GM_getResourceText("buttonCSS");
    GM_addStyle(buttonCSS);
    const popupCSS = GM_getResourceText("popupCSS");
    GM_addStyle(popupCSS);

    function getPostname() {
        let profileData = profileApi()
        let postData = postApi();

        if (profileData && postData && postData.post) {
            // 文件标题
            let username = profileData.name;
            let platform = postData.post.service;
            let title = postData.post.title;
            let id = postData.post.id;

            // 判断是否已有作品id(兼容按左右方向键翻页的情况)
            const key = `kc_post_name_${id}`
            let postname = localStorage.getItem(key);
            if (postname) {
                return postname;
            }
            let datetime = postData.post.published;
            let _date = new Date(datetime)

            // 转换时间格式
            let date = formatDate(_date, 'YYYY年MM月DD日');

            let name =
                "@".concat(username, " ", "[", platform, "]", " - ", "(", date, ")", " ", "(", id, ")", " ", transfer(title));
            localStorage.setItem(key, name);

            return name;
        }
    }

    function copyName() {
        let name = getPostname();

        const clipboardObj = navigator.clipboard;
        clipboardObj.writeText(name)
        Toast(`copyName successfully copied!`)
    }

    function copyAll(mode, type) {
        console.log("copyAll")
        let profileData = profileApi()
        let postData = postApi();
        console.log(postData);
        console.log(JSON.stringify(postData));

        if (profileData && postData && postData.post) {
            let name = getPostname();

            let urls = `#R,${window.location.href}\n`

            // 处理附件 视频/ZIP
            if ((type == 'all' || type == 'attachment' || type == 'attachment_origin' || type == 'attachment_serial')
                && ((postData.attachments && postData.attachments.length > 0) || (postData.post.attachments && postData.post.attachments.length > 0))) {
                let attachments = postData.attachments.length > 0 ? postData.attachments : postData.post.attachments
                let postAttachs = postData.attachments.length > 0 ? false : true

                let num = 1

                if (attachments.length == 1) {
                    let attach = attachments[0]

                    let url = postAttachs ? `${window.location.origin}/data${attach.path}` : `${attach.server}/data${attach.path}`

                    let fileSuffix = getFileSuffix(attach.name);

                    let filename = `${name.trim()}.${fileSuffix}`
                    if (attach.name.length <= 50) {
                        filename = `${name.trim()} ${attach.name}`
                    }

                    urls += `${filename},${url}\n`
                } else {
                    if (mode != 'NoFolder') {
                        urls += `#O,F:\\Downloads\\Default\\Other\\Kemono\\${name.trim()}\n`
                    }

                    for (let attach of attachments) {
                        let filename = ''
                        let url = postAttachs ? `${window.location.origin}/data${attach.path}` : `${attach.server}/data${attach.path}`

                        if (attach.extension === ".mp4" || attach.extension === ".m4v" || attach.extension === ".mov") {

                            let twoDigitText = num.toString().padStart(2, '0');
                            filename = name.trim().concat(' ', twoDigitText, attach.extension)

                            if (type != 'attachment_serial' && attach.name.length <= 50) {
                                if (type == 'attachment_origin') {
                                    filename = `${attach.name}`
                                } else {
                                    filename = name.trim().concat(' ', twoDigitText, ' ', attach.name)
                                }
                            }

                            num += 1
                        } else {
                            filename = name.trim().concat(' ', attach.name)
                            if (type != 'attachment_serial' && attach.name.length <= 50) {
                                filename = `${attach.name}`
                            }
                        }
                        urls += `${filename},${url}\n`
                    }
                }
            } else {
                console.log("not found attachments")
            }

            // 处理图片
            if ((type == 'all' || type == 'pic') && postData.previews && postData.previews.length > 0) {
                urls += ""
                let num = 0

                if (postData.previews.length == 1) {
                    // 如果只有一张图片
                    let pic = postData.previews[0]
                    let url = `${pic.server}/data${pic.path}`

                    let fileSuffix = getFileSuffix(pic.name);
                    let filename = `${name.trim()}.${fileSuffix}`

                    urls += `${filename},${url}\n`
                } else {
                    if (mode != 'NoFolder') {
                        urls += `#O,F:\\Downloads\\Default\\Other\\Kemono\\${name.trim()}\n`
                    }

                    // 先循环一遍，看看有没有和第一个重复的文件，如果有，就删除第一条
                    let _index = 0
                    let _pic = postData.previews[0]
                    // _pic.path
                    let repeated = false;

                    while (postData.previews.length - 1 > _index) {
                        _index += 1
                        if (postData.previews[_index].path == _pic.path) {
                            repeated = true;
                            break
                        }
                    }
                    // console.log(repeated)

                    for (let pic of postData.previews) {
                        let twoDigitText = num.toString().padStart(2, '0');
                        num += 1;
                        if (repeated && num == 1) {
                            console.log("repeated")
                            continue;
                        }

                        let url = `${pic.server}/data${pic.path}`

                        let fileSuffix = getFileSuffix(pic.name);
                        let filename = `${twoDigitText}.${fileSuffix}`
                        if (mode == 'NoFolder') {
                            filename = name.trim().concat(' ', twoDigitText, '.', fileSuffix)

                            if (pic.name.length <= 10) {
                                if (type == 'pic_origin') {
                                    filename = `${pic.name}`
                                } else {
                                    filename = name.trim().concat(' ', twoDigitText, ' ', pic.name)
                                }
                            }
                        }

                        urls += `${filename},${url}\n`
                    }
                }
            }

            if (urls) {
                const clipboardObj = navigator.clipboard;
                clipboardObj.writeText(urls)
                Toast(`copyAll successfully copied!`)
            } else {
                Toast(`copyAll failed!`)
            }
        }
    }

    function downloadContent() {
        let node = document.body.querySelector('.post__content');
        if (node) {
            let name = getPostname();
            let text = node.innerText;
            console.log(node.innerText)

            saveAs(
                new Blob([name + '\n\n' + text], {type: "text/plain;charset=UTF-8"}),
                name + ".txt"
            );

        } else {
            Toast(`copyContent failed!`)
        }
    }
})();

