// ==UserScript==
// @name         bilibili 播放器快捷键
// @namespace    https://tampermonkey.net/
// @version      1.0
// @description  页面聚焦时，按下按键模拟点击页面指定按钮/元素，不干扰原生输入
// @author       自定义
// @icon         https://i0.hdslb.com/bfs/static/jinkela/long/images/favicon.ico
// @match        https://www.bilibili.com/video/**
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== 【核心配置区，修改这里即可】 ==========
    // 1. 要点击的目标元素选择器，改成你需要的！！！
    const targetSelectors = {
        "a": {
            "desc": "宽屏",
            "hotKey": "a",
            "selector": "div.bpx-player-ctrl-wide"
        },
        "s": {
            "desc": "网页全屏",
            "hotKey": "s",
            "selector": "div.bpx-player-ctrl-web"
        }
    }

    // 监听全局键盘按下事件
    document.addEventListener('keydown', function(e) {
        // 核心判断条件（全部满足才触发）
        const isKey = targetSelectors.hasOwnProperty(e.key.toLowerCase()) ;
        const isPageFocused = document.hasFocus(); // 当前页面是否获得焦点 ✅

        // ✅ 新增：判断当前是否在输入框内（输入框按键不触发）
        const isInputing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
        const isEditable = document.activeElement.isContentEditable; // 富文本编辑器

        // 满足条件：按键 + 页面聚焦
        if (isKey && isPageFocused && !isInputing && !isEditable) {
            // 1. 阻止按键的原生行为（不会在输入框打字、不会触发其他快捷键）
            e.preventDefault();
            e.stopPropagation();

            let targetSelector = targetSelectors[e.key.toLowerCase()]["selector"]
            // 2. 获取目标元素并模拟点击
            const targetBtn = document.querySelector(targetSelector);
            if (targetBtn) {
                targetBtn.click(); // 模拟鼠标左键点击 ✅
                console.log(' 成功点击目标元素:', targetBtn);
            } else {
                console.warn(' 未找到目标元素，请检查选择器是否正确！');
            }
        }
    }, true);
})();