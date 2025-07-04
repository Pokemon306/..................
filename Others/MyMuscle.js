// ==UserScript==
// @name         mymusclevideo
// @namespace    http://tampermonkey.net/
// @version      V1.0
// @description
// @updateURL
// @downloadURL
// @author       Sam
// @grant        GM_addStyle
// @match        https://mymusclevideo.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAWlBMVEUfHh7////5+fkzMjJEQ0PX19esq6vs7Ozm5uZubW0rKio8OzsmJSW4uLdfXl7y8vLg39+Yl5fOzs3DwsKHhoZLSkqhoKBXV1d7e3rIyMiRkZCMjIt2dXVSUlHrlbybAAABAUlEQVQ4y92S2a7DIAxEGTBbCISsbbb//80bS6iKEqXvt/MC0hyNwbb4Wam0tr569mmWgJweidCDZV9P+RFNHIxJ94T6Ne1CGVh/3FVQ9dVvG5hqkNAjbUa7bOhCrECXvIR0VoLVq09dH/h1OcdJzWBJlw/SF3/TcuXzHRs7jr212njiz7QFmADNEd4Ck6iIOHrUwFKA8TAGIZID4EgIIkqtO7fCAFrtGQDHemedZPb9ef+rQTNoSN0BOSxg5YVOLYgyatm91c7FyB3oEMRZKXYwqhQL7YFeB3AYfVWK+UrdpkBbaUttIk/pBtTVXCLU0xrwDNLXNetcG8Q3jST+r/4AvW8KgFIEhZIAAAAASUVORK5CYII=
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/js/Tools/tools.js
// @resource buttonCSS https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/deps/css/button.css
// ==/UserScript==
(function () {
    const direct_num = 100000;
    const baseUrl = "https://video314.mymusclevideo.com/mmv/media/videos/mp4/";

    function init() {
        // 获取所有的标题
        let x = document.getElementsByClassName("title");

        console.log(x.length)

        for (let i = 0; i < x.length; i++) {
            if (x[i].getAttribute("copied")) continue;

            let outerHTML = x[i].children[0].outerHTML;

            var regex = /<a href="(.+)?\/(\d+)\/.+\/" title="(.+)">.+<\/a>/;
            regex.test(outerHTML);
            var num = RegExp.$2;
            var title = RegExp.$3;

            // 生成内容
            var text = title + " (" + num + ") - MyMusclevideo.com \n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + ".mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_240p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_360p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_480p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_720p.mp4\n" +
                "https://video314.mymusclevideo.com/mmv//media/videos/mp4/" + num + "_1080p.mp4\n"

            // 生成复制按钮样式
            let copy = document.createElement('button');
            copy.className = "t_button";
            copy.innerText = "copy";
            copy.setAttribute("num", num);
            copy.setAttribute("title", title);
            copy.value = text;
            // 点击按钮，拷贝内容到剪切板
            copy.onclick = function () {
                navigator.clipboard.writeText(this.value)
            }

            // copy.addEventListener('click', function (e) {
            //     copying(this.getAttribute("title"), this.getAttribute("num"))
            // });

            // 在标题前面插入一个空格 和复制按钮
            let span = document.createElement('span');
            span.innerText = " ";

            x[i].insertBefore(span, x[i].children[0]);
            x[i].insertBefore(copy, x[i].children[0]);

            x[i].setAttribute("copied", true)
        }
    }

    init();

    const rs = [
        '1080p',
        '720p',
        '480p',
        '360p',
        '240p',
    ]

    async function copying(title, num) {

        let text = `#O,F:\\Downloads\\Default\\Other\\phvideo\\\n`
        let filename = title + " (" + num + ") - MyMusclevideo.com";
        let url = "";
        Toast(`正在复制中…… (${num}) [${title}]`)

        // 如果是旧的
        if(num < direct_num) {
            url = `${baseUrl}${num}.mp4`
            text += `${filename}.mp4,${url}`
        }
        for(let r of rs) {
            url = `${baseUrl}${num}_${r}.mp4`;
            console.log(`${filename} ${r}.mp4,${url}`)

            await fetch(url, {
                method: "HEAD",
            }).then(res => {
                console.log(res.status)
            })
        }

        // 写入剪切板
        navigator.clipboard.writeText(text)
    }

    GM_addStyle(`
.t_button {
    border-radius: 1em;
    color: #ecf0f1;
    font-color: #ecf0f1;
    font-family: "微软雅黑";
    text-decoration: none;
    text-align: center;
    margin: 0;
    display: inline-block;
    appearance: none;
    cursor: pointer;
    border: none;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition-property: all;
    transition-property: all;
    -webkit-transition-duration: .3s;
    transition-duration: .3s;
    background: linear-gradient(to right, #3e3e3e, #878787);
}
.t_button:hover::after {
    -webkit-box-shadow: 0 0 16px #000000;
    box-shadow: 0 0 16px #000000
}
`)

})();
