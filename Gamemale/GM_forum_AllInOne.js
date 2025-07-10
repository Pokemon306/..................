// ==UserScript==
// @name         GM论坛必备脚本
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  GM_forum_AllInOne 泥潭！
// @updateURL    https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM_forum_AllInOne.js
// @downloadURL  https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/GM_forum_AllInOne.js
// @author       轶名&轶致&Chr_&1F&源子&Makima$Samuel
// @match        https://www.gamemale.com/wodexunzhang-showxunzhang.html*
// @match        https://www.gamemale.com/plugin.php?id=wodexunzhang%3Ashowxunzhang&fid=*
// @match        https://www.gamemale.com/plugin.php?id=viewui_draw&mod=list&ac=draw
// @match         https://www.gamemale.com/forum.php?*
// @match         https://www.gamemale.com/thread*
// @match        *://*.gamemale.com/blog-*
// @match        *://*.gamemale.com/home.php?mod=*
// @match        https://www.gamemale.com/home.php?mod=spacecp&ac=credit&op=exchange
// @match       https://www.gamemale.com/forum-*
// @icon         https://www.gamemale.com/template/mwt2/extend/img/favicon.ico
// @require      https://raw.githubusercontent.com/SSamuelH/profiles/refs/heads/main/Gamemale/medalMaps.js
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    const currentUrl = window.location.href;
    if (/^https:\/\/www\.gamemale\.com\/wodexunzhang-showxunzhang\.html/.test(currentUrl) || /^https:\/\/www\.gamemale\.com\/plugin\.php\?id=wodexunzhang%3Ashowxunzhang&fid=/.test(currentUrl)) {
        // 对于勋章 的页面，执行这段代码
        console.log('This is running on 勋章');
        let 放大镜显示 = localStorage.getItem('放大镜显示') !== 'false';

        function 创建控制面板() {
            const 控制面板 = document.createElement('div');
            控制面板.id = '控制面板';
            控制面板.style.position = 'fixed';
            控制面板.style.bottom = '20px';
            控制面板.style.right = '20px';
            控制面板.style.zIndex = '1000';
            控制面板.innerHTML = `<button id="切换放大镜按钮" style="font-size: 18px; background: none; border: none; padding: 0; box-shadow: none; line-height: 1;">${放大镜显示 ? "🔎✅" : "🔎🚫"}</button>`;
            document.body.appendChild(控制面板);
            document.getElementById("切换放大镜按钮").addEventListener("click", 切换放大镜显示);
        }

        function 切换放大镜显示() {
            放大镜显示 = !放大镜显示;
            this.innerHTML = 放大镜显示 ? "🔎✅" : "🔎🚫";
            localStorage.setItem('放大镜显示', 放大镜显示);
            if (!放大镜显示) {
                隐藏所有放大镜();
            }
        }

        function 创建放大镜() {
            const 放大镜 = document.createElement('div');
            放大镜.id = '泥潭勋章放大镜';
            放大镜.style.position = 'absolute';
            放大镜.style.padding = '10px';
            放大镜.style.background = 'white';
            放大镜.style.border = '1px solid black';
            放大镜.style.borderRadius = '5px';
            放大镜.style.display = 'none';
            放大镜.style.zIndex = '10000';
            放大镜.style.fontWeight = 'bold';
            放大镜.style.color = '#000516';
            document.body.appendChild(放大镜);
            return 放大镜;
        }

        const 放大镜 = 创建放大镜();

        const 收益权重映射 = {
            '金币': 1,
            '血液': 1,
            '旅程': 30,
            '咒术': 5,
            '知识': 50,
            '灵魂': 1000,
        };

        const 属性映射 = {
            '金币': {颜色: '#ffd700', emoji: '🪙'},
            '血液': {颜色: '#ff0000', emoji: '🩸'},
            '旅程': {颜色: '#008000', emoji: '🌍'},
            '咒术': {颜色: '#a279f4', emoji: '🔮'},
            '知识': {颜色: '#0000ff', emoji: '📖'},
            '灵魂': {颜色: '#add8e6', emoji: '🪞'},
            '堕落': {颜色: '#000000', emoji: '🖤'},
            '总计': {颜色: '#ffa500', emoji: '🈴'}
        };

        function 计算收益(文本) {
            const 行列表 = 文本.split('\n');
            let 收益详情列表 = [];

            for (const 行 of 行列表) {
                let 总收益 = 0;
                let 行收益详情 = '';
                const 触发几率匹配 = 行.match(/】(\d+)%/);
                if (触发几率匹配) {
                    const 触发几率 = parseFloat(触发几率匹配[1]) / 100;
                    const 回帖属性匹配 = 行.match(/回帖(.*?)(,|$|发帖|升级|▕)/);
                    if (回帖属性匹配) {
                        const 属性匹配 = [...回帖属性匹配[1].matchAll(/(金币|血液|旅程|咒术|知识|灵魂|堕落)(\+|-)(\d+)/g)];
                        let 匹配计数 = 0;
                        let 非堕落属性计数 = 0;
                        for (const 匹配 of 属性匹配) {
                            const 属性 = 匹配[1];
                            const 符号 = 匹配[2]; // '+' 或 '-'
                            const 值 = parseInt(匹配[3], 10) * (符号 === '+' ? 1 : -1);
                            if (属性 !== '堕落') {
                                非堕落属性计数++;
                                const 权重 = 收益权重映射[属性] || 0;
                                const 收益 = 触发几率 * 值 * 权重;
                                总收益 += 收益;
                                if (收益 !== 0) {
                                    行收益详情 += `<span style="color:${属性映射[属性].颜色};">${属性映射[属性].emoji}${收益.toFixed(2)}</span> `;
                                }
                            }
                            匹配计数++;
                        }
                        if (非堕落属性计数 > 1) {
                            行收益详情 += ` <span style="color:${属性映射['总计'].颜色};">${属性映射['总计'].emoji}${总收益.toFixed(2)}</span>`;
                        }
                    }
                }
                if (行收益详情 !== '') {
                    收益详情列表.push(行收益详情.trim());
                } else {
                    收益详情列表.push('');
                }
            }
            return 收益详情列表;
        }

        function 显示放大镜(内容, 目标) {
            if (!放大镜显示) return;
            const 收益详情列表 = 计算收益(内容);
            const 行列表 = 内容.split('\n');
            let 新内容 = '';
            for (let i = 0; i < 行列表.length; i++) {
                const 行 = 行列表[i];
                const 收益详情 = 收益详情列表[i];
                if (收益详情) {
                    新内容 += 行.replace(/(】)(\d+%)/, `$1${收益详情} $2`);
                } else {
                    新内容 += 行;
                }
                if (i < 行列表.length - 1) {
                    新内容 += '\n';
                }
            }
            放大镜.innerHTML = 新内容.replace(/\n/g, '<br>');
            放大镜.style.display = 'block';
            放大镜.style.visibility = 'hidden';
            定位放大镜(目标);
            放大镜.style.visibility = 'visible';
        }

        function 定位放大镜(目标) {
            const 放大镜宽度 = 放大镜.offsetWidth;
            const 放大镜高度 = 放大镜.offsetHeight;
            const 目标矩形 = 目标.getBoundingClientRect();
            let 放大镜左边 = window.pageXOffset + 目标矩形.left - (放大镜宽度 / 2) + (目标矩形.width / 2);
            let 放大镜顶部 = window.pageYOffset + 目标矩形.top - 放大镜高度 - 10;
            if (放大镜顶部 < window.pageYOffset) {
                放大镜顶部 = window.pageYOffset + 目标矩形.bottom + 10;
            }
            if (放大镜左边 + 放大镜宽度 > window.pageXOffset + document.documentElement.clientWidth) {
                放大镜左边 = window.pageXOffset + document.documentElement.clientWidth - 放大镜宽度 - 10;
            }
            if (放大镜左边 < window.pageXOffset) {
                放大镜左边 = window.pageXOffset + 10;
            }
            if (放大镜顶部 + 放大镜高度 > window.pageYOffset + window.innerHeight) {
                放大镜顶部 = window.pageYOffset + 目标矩形.top - 放大镜高度 - 10;
            }
            放大镜.style.left = 放大镜左边 + 'px';
            放大镜.style.top = 放大镜顶部 + 'px';
        }

        function 隐藏放大镜() {
            放大镜.style.display = 'none';
        }

        function 隐藏所有放大镜() {
            隐藏放大镜();
        }

        function 添加悬停监听器(目标) {
            目标.addEventListener('mouseover', function () {
                const 替代文本 = 目标.getAttribute('alt');
                const 放大镜内容 = 放大镜内容映射表[替代文本];
                if (放大镜内容) {
                    显示放大镜(放大镜内容, 目标);
                }
            });

            目标.addEventListener('mouseout', 隐藏放大镜);
        }

        function 初始化放大镜() {
            document.querySelectorAll('.myimg img').forEach(function (img) {
                const 替代文本 = img.getAttribute('alt');
                if (放大镜内容映射表.hasOwnProperty(替代文本)) {
                    添加悬停监听器(img);
                }
            });
        }

        function 变化检测() {
            const 观察 = new MutationObserver(function (变化标记) {
                变化标记.forEach(function (变化) {
                    变化.addedNodes.forEach(function (节点) {
                        if (节点.nodeType === Node.ELEMENT_NODE && 节点.matches('.myimg img')) {
                            const 替代文本 = 节点.getAttribute('alt');
                            if (放大镜内容映射表.hasOwnProperty(替代文本)) {
                                添加悬停监听器(节点);
                            }
                        }
                    });
                });
            });
            const 目标容器 = document.querySelector('.my_fenlei');
            if (目标容器) {
                观察.observe(目标容器, {childList: true, subtree: true});
            }
        }

        创建控制面板();
        // 初始化放大镜();
        变化检测();
        // 在这里写针对 example1.com 的代码...
        // 指定要匹配的URL列表
        var urlsToMatch = [
            "https://www.gamemale.com/wodexunzhang-showxunzhang.html?action=my",
            "https://www.gamemale.com/plugin.php?id=wodexunzhang:showxunzhang&action=my"
        ];

        // 检查当前URL是否在列表中
        var isCurrentUrlMatched = urlsToMatch.some(function (url) {
// 去除尾部的 "#hash" 和 "?query" 部分，以防干扰匹配
//var cleanCurrentUrl = currentUrl.split('#')[0].split('?')[0];
//var cleanTargetUrl = url.split('#')[0].split('?')[0];

            return currentUrl === url;
        });

        if (isCurrentUrlMatched) {
            (function () {
                'use strict';
                const medals = [
                    {name: '五谷丰年', id: 652, type: "综合向", note: "24% 回帖（0.24）金币+1、发帖（0.96）金币+4"},
                    {name: '海边的邻居', id: 430, type: "发帖向", note: "30% 发帖（1.5）咒术+1"},
                    {name: '男色诱惑', id: 401, type: "发帖向", note: "33% 发帖（1.65）血液+5"},
                    {name: '四季之歌', id: 287, type: "回帖向", note: "10% 回帖（0.1）金币+1、发帖（5.0）知识+1"},
                    {name: '风雪之家', id: 345, type: "综合向", note: "1% 回帖（0.1）血液+5 金币+5、发帖（10.0）灵魂+1"},
                    {name: '野兽之子', id: 188, type: "回帖向", note: "9% 回帖（4.41）知识+1 血液-1"},
                    {name: '牧羊人', id: 4, type: "发帖向", note: "10% 发帖（3.0）旅程+1"},
                    {name: '森林羊男', id: 27, type: "综合向", note: "5% 回帖（2.5）知识+1、发帖（2.5）知识+1"},
                    {name: '堕落之舞', id: 80, type: "发帖向", note: "35% 发帖（1.05）金币+3"},
                    {name: '黄色就是俏皮', id: 81, type: "综合向", note: "10% 回帖（0.1）血液+1、发帖（0.1）血液+1"},
                    {name: '骑兽之子', id: 82, type: "综合向", note: "20% 回帖（0.2）血液+1、发帖（1.6）血液+3 咒术+1"},
                    {name: '禽兽扒手', id: 107, type: "回帖向", note: ""},
                ];
                // 发帖勋章
                const medals_post = [
                    {name: '男色诱惑', id: 401, type: "发帖向", note: "33% 发帖（1.65）血液+5"},
                    {name: '风雪之家', id: 345, type: "综合向", note: "1% 发帖（10.0）灵魂+1"},
                    {name: '森林羊男', id: 27, type: "综合向", note: "5% 发帖（2.5）知识+1"},
                    {name: '牧羊人', id: 4, type: "发帖向", note: "10% 发帖（3.0）旅程+1"},
                ];
                // 回帖勋章
                const medals_reply = [
                    {name: '野兽之子', id: 188, type: "回帖向", note: "9% 回帖（4.41）知识+1 血液-1"},
                    {name: '森林羊男', id: 27, type: "综合向", note: "5% 回帖（2.5）知识+1"},
                    {name: '骑兽之子', id: 82, type: "综合向", note: "20% 回帖（0.2）血液+1"},
                    {name: '禽兽扒手', id: 107, type: "回帖向", note: ""},
                ];
                let youxi = ["杰夫‧莫罗", "克里斯‧雷德菲尔德", "疾风剑豪", "光之战士", "艾吉奥", "弗图博士", "裸体克里斯", "凯登‧阿兰科", "果体76", "尼克斯·乌尔里克", "岛田半藏", "内森·德雷克", "卡洛斯·奥利维拉", "诺克提斯·路西斯·伽拉姆", "文森特‧瓦伦丁", "炙热的格拉迪欧拉斯", "竹村五郎", "【周年限定】克里斯(8)", "沃特·沙利文", "里昂‧S‧甘乃迪", "亚瑟‧摩根", "萨菲罗斯", "岛田源氏", "BIG BOSS", "【夏日限定】夏日的泰凯斯", "Dante", "库伦 (起源)", "康纳/Connor", "英普瑞斯", "乔纳森·里德", "Doc", "杰克·莫里森/士兵 76", "维吉尔", "皮尔斯‧尼凡斯", "杰西·麦克雷", "泰比里厄斯", "Vergil", "普隆普特·阿金塔姆", "桐生一马", "格拉迪欧拉斯", "亚当‧简森", "铁牛", "黑墙", "安杜因·乌瑞恩", "阿尔伯特·威斯克", "V (DMC5)", "汉克/Hank", "希德‧海温特", "巴尔弗雷亚", "肥皂", "士官长", "豹王", "阿列克西欧斯（Alexios）", "莱因哈特·威尔海姆", "幻象", "加勒特·霍克", "不灭狂雷-沃利贝尔", "泰凯斯·芬得利", "陷阱杀手", "Scott Ryder", "不屈之枪·阿特瑞斯", "詹姆斯‧维加", "阿尔萨斯‧米奈希尔", "盖拉斯‧瓦卡瑞安", "法卡斯", "库伦 (审判)", "【新手友好】昆進", "鬼王酒吞童子", "维克多‧天火", "蛮族战士", "奧倫", "吉姆‧雷诺", "但丁", "威尔卡斯", "亚力斯塔尔", "艾德尔", "桑克瑞德·沃特斯", "天照大神", "百相千面", "虎头怪", "里昂（RE4）", "苇名弦一郎", "克莱夫・罗兹菲尔德", "约书亚・罗兹菲尔德"];
                let zhenren = ["约翰·康斯坦丁","托尼·史塔克", "Joker", "克里斯·埃文斯", "魯杰羅·弗雷迪", "虎克船长", "安德森‧戴维斯", "索尔·奥丁森", "擎天柱（Peterbilt389）", "麦迪文（Medivh）", "西弗勒斯·斯内普", "神灯", "索林·橡木盾", "阿拉贡", "乔治·迈克尔", "魔术师奥斯卡", "杰森‧斯坦森", "小天狼星·布莱克", "阿不思·邓布利多", "甘道夫", "博伊卡", "死神", "马克·史贝特", "史蒂文·格兰特", "亚瑟·库瑞（海王）", "巴基 (猎鹰与冬兵)", "哈尔‧乔丹", "克苏鲁", "异形", "卢西亚诺‧科斯塔", "罗宾·西克", "超人", "丹·雷诺斯", "罗伯‧史塔克", "蓝礼·拜拉席恩", "卡德加（Khadgar）", "吉姆·霍普", "大古", "黑豹", "莱托·厄崔迪", "Drover", "艾利克斯", "三角头", "布莱恩‧欧康纳", "迪恩‧温彻斯特", "山姆‧温彻斯特", "丹尼爾·紐曼", "迈克尔迈尔斯", "金刚狼", "Chris Mazdzer", "瑟兰迪尔", "威克多尔·克鲁姆", "大黄蜂（ChevroletCamaro）", "勒维恩·戴维斯", "安德鲁·库珀", "丹·安博尔", "塞巴斯蒂安·斯坦", "莱戈拉斯", "奥利弗‧奎恩", "盖里", "汤姆·赫兰德", "Frank (LBF)", "詹米·多南", "羅素·托維", "藤田優馬", "康纳‧沃什", "巴特‧贝克", "戴尔‧芭芭拉", "猫化弩哥", "卡斯迪奥", "史蒂夫‧金克斯", "戴蒙‧萨尔瓦托", "尼克·贝特曼", "尤利西斯", "阿齐斯", "纣王·子受", "阿尔瓦罗·索莱尔", "克劳斯·迈克尔森", "尼克‧贝特曼", "尼克·王尔德"];
                let maid = ["莫瑞甘", "贝优妮塔", "莎伦", "绯红女巫", "赫敏·格兰杰", "梅格", "山村贞子", "蒂法·洛克哈特", "九尾妖狐·阿狸", "丹妮莉丝·坦格利安", "希尔瓦娜斯·风行者", "刀锋女王", "维涅斯", "星籁歌姬", "莫甘娜", "凯尔", "露娜弗蕾亚·诺克斯·芙尔雷", "凯特尼斯·伊夫狄恩", "爱丽丝·盖恩斯巴勒", "朱迪·霍普斯", "“米凯拉的锋刃”玛莲妮"];
                let equip = ["圣水瓶", "武士之魂", "布衣", "赫尔墨斯·看守者之杖", "男用贞操带", "圣英灵秘银甲", "石鬼面", "巴啦啦小魔仙棒", "贤者头盔", "符文披风", "星芒戒指", "骑士遗盔", "恩惠护符", "十字叶章", "蔷薇骑士之刃", "狩猎用小刀", "刺杀者匕首", "琉璃玉坠", "月陨戒指", "日荒戒指", "神圣十字章", "艾尔尤因", "冒险专用绳索", "十字军护盾", "力量腕带", "药剂背袋", "物理学圣剑", "眼镜蛇图腾", "海盗弯钩", "钢铁勇士弯刀", "猎鹰图腾", "山猫图腾", "重磅手环", "新月护符", "龙血之斧", "生锈的海盗刀枪", "念念往日士官盔", "超级名贵无用宝剑", "嗜血斩首斧", "变形软泥", "净化手杖", "超级幸运无敌辉石", "守望者徽章", "破旧打火机", "女神之泪", "和谐圣杯", "天使之赐", "棱镜", "射手的火枪"];
                let asset = ["健忘礼物盒","神秘挑战书","雪王的心脏", "沙漠神灯", "SCP-s-1889", "梦中的列车", "婴儿泪之瓶", "幽灵竹筒", "羽毛笔", "老旧怀表", "海潮之歌", "冒险用指南针", "勇者与龙之书", "这是一片丛林", "漂洋小船", "圣甲虫秘典", "充满魔力的种子", "奇怪的紫水晶", "锻造卷轴", "流失之椅", "知识大典", "德拉克魂匣", "宝箱内的球", "暖心小火柴", "神秘的邀请函", "红石", "秘密空瓶", "GHOST", "冒险用面包", "深红矿土", "海螺号角", "冒险用宝箱", "木柴堆", "章鱼小丸子", "种植土豆", "冒险用绷带", "预知水晶球", "发芽的种子", "魔法石碑", "神秘的红茶", "夜灯", "远古石碑", "用过的粪桶", "种植菠菜", "种植菊花", "GM論壇初心者勛章", "箭术卷轴", "种植小草", "One Ring", "超级无敌名贵金卡", "金钱马车", "聚魔花盆", "谜之瓶", "诺曼底号", "社畜专用闹钟", "神秘的漂流瓶", "史莱姆养殖证书", "微笑的面具", "【圣诞限定】心心念念小雪人", "浪潮之歌", "暗红矿土", "老旧的怀表", "双项圣杯", "散佚的文集", "令人不安的契约书", "被尘封之书", "黑暗水晶", "无垠", "冰海钓竿"];
                let pet = ["软泥怪蛋", "洞窟魔蛋", "结晶卵", "五彩斑斓的蛋", "史莱姆蛋", "珊瑚色礁石蛋", "【年中限定】GM村金蛋", "迷のDoge", "黑龙蛋", "电磁卵", "月影蛋", "郁苍卵", "熔岩蛋", "灵鹫蛋", "血鹫蛋", "深渊遗物", "小阿尔的蛋", "幽光彩蛋", "青鸾蛋", "马戏团灰蛋", "万圣彩蛋", "林中之蛋", "沙漠羽蛋", "海边的蛋", "暮色卵", "血红色的蛋", "螺旋纹卵", "红龙蛋", "腐化龙蛋", "漆黑的蝎卵", "新手蛋", "狱炎蛋", "灵藤蛋", "棕色条纹蛋", "长花的蛋", "可疑的肉蛋", "崩朽龙卵", "波纹蓝蛋"];
                let forum = ["达拉然", "时间变异管理局", "美恐：启程", "男巫之歌", "最终幻想XIV", "赛博朋克2077", "龙腾世纪：审判", "荒野大镖客：救赎 II", "奥兹大陆", "五花八门版块", "TRPG版塊", "堕落飨宴", "质量效应三部曲", "上古卷轴V：天际", "雾都血医", "恶魔城", "生化危机：复仇", "街头霸王", "模拟人生4", "寶可夢 Pokémon", "英雄联盟", "辐射：新维加斯", "最终幻想XVI", "雄躯的昇格", "极客的晚宴"];
                let skill = ["五谷丰年", "野兽之子", "森林羊男", "骑兽之子", "禽兽扒手", "黄色就是俏皮", "四季之歌", "风雪之家", "牧羊人", "堕落之舞", "男色诱惑", "海边的邻居"];
                let huishou = {
                    "五谷丰年": 0,
                    "野兽之子": 0,
                    "森林羊男": 0,
                    "骑兽之子": 0,
                    "禽兽扒手": 0,
                    "黄色就是俏皮": 0,
                    "四季之歌": 0,
                    "风雪之家": 0,
                    "牧羊人": 0,
                    "堕落之舞": 0,
                    "男色诱惑": 0,
                    "海边的邻居": 0
                };
                let gift = ["送情书", "丢肥皂", "千杯不醉", "灵光补脑剂", "遗忘之水", "萨赫的蛋糕", "神秘商店贵宾卡", "变骚喷雾", "没有梦想的咸鱼", "闪光糖果盒", "茉香啤酒", "香蕉特饮"];
                let spell = ["太空列车票", "炼金之心", "黑暗交易", "水泡术", "召唤古代战士", "祈祷术", "吞噬魂魄", "咆哮诅咒", "霍格沃茨五日游", "石肤术", "雷霆晶球", "思绪骤聚", "杀意人偶"];
                let plot = ["『厢庭望远』", "『日心说』", "『任天堂Switch』红蓝√", "『任天堂Switch』灰黑√", "『还乡歌』", "『私有海域』", "『钜鲸』", "『召唤好运的角笛』", "『圣洁化身』", "『矩阵谜钥Ⓖ』", "『新居手册Ⓖ』", "『居住证: Lv2-6』", "『户口本: Lv7+』", "『瓶中信』", "『 弗霖的琴』", "『伊黎丝的祝福』", "『灰域来音』", "『迷翳之中』", "『迷翳森林回忆录』", "『星河碎片』", "『列车长』"];
                let decoration = ["勋章空位插槽"];
                let result = {
                    "游戏男从(11)": "",
                    "真人男从(8)": "",
                    "女从(5)": "",
                    "装备(12)": "",
                    "资产(16)": "",
                    "宠物(7)": "",
                    "板块(5)": "",
                    "天赋(4)": "",
                    "装饰(6)": "",
                    "赠礼": "",
                    "咒术": "",
                    "剧情": "",
                    "其他": ""
                };
                let myblok = document.getElementsByClassName("myblok");
                for (let blok of myblok) {
                    let regex = /alt="(.+?)"/;
                    let matches = blok.innerHTML.match(regex);
                    if (youxi.indexOf(matches[1]) >= 0) {
                        result["游戏男从(11)"] += matches[1] + ","
                    } else if (zhenren.indexOf(matches[1]) >= 0) {
                        result["真人男从(8)"] += matches[1] + ","
                    } else if (maid.indexOf(matches[1]) >= 0) {
                        result["女从(5)"] += matches[1] + ","
                    } else if (equip.indexOf(matches[1]) >= 0) {
                        result["装备(12)"] += matches[1] + ","
                    } else if (asset.indexOf(matches[1]) >= 0) {
                        result["资产(16)"] += matches[1] + ","
                    } else if (pet.indexOf(matches[1]) >= 0) {
                        result["宠物(7)"] += matches[1] + ","
                    } else if (forum.indexOf(matches[1]) >= 0) {
                        result["板块(5)"] += matches[1] + ","
                    } else if (skill.indexOf(matches[1]) >= 0) {
                        let r = /my(\d+)/;
                        let m = blok.innerHTML.match(r);
                        huishou[matches[1]] = m[1];
                        console.log(matches[1], m[1]);
                        result["天赋(4)"] += matches[1] + ","
                    } else if (decoration.indexOf(matches[1]) >= 0) {
                        result["装饰(6)"] += matches[1] + ","
                    } else if (gift.indexOf(matches[1]) >= 0) {
                        result["赠礼"] += matches[1] + ","
                    } else if (spell.indexOf(matches[1]) >= 0) {
                        result["咒术"] += matches[1] + ","
                    } else if (plot.indexOf(matches[1]) >= 0) {
                        result["剧情"] += matches[1] + ","
                    } else {
                        result["其他"] += matches[1] + ","
                    }
                }
                let txt = ""
                for (let key in result) {
                    txt += key + " : (" + (result[key].split(",").length - 1) + ") " + result[key].slice(0, -1) + "<br>"
                }

                function qiwang(pattern) {
                    let myblok = document.getElementsByClassName("myblok")
                    let result = {"金币": 0, "血液": 0, "咒术": 0, "知识": 0, "旅程": 0, "堕落": 0, "灵魂": 0};
                    for (let blok of myblok) {
                        if (blok.innerText.indexOf("已寄售") > 0) {
                            continue
                        }
                        let regex = /几率 (\d+)%/i;
                        let matches = blok.innerText.match(regex)

// let nameRegex=/\t(.+?)\n/;
// let nameMatch=blok.innerText.replaceAll(" ","").match(nameRegex)
                        if (matches) {
                            let prob = matches[1]
                            let symbols = Array.from(blok.innerText.matchAll(pattern), m => m[2]);
                            let isSame = symbols.every(function (element) {
                                return element === symbols[0];
                            });
                            // console.log(nameMatch[1]+isSame)
                            matches = blok.innerText.matchAll(pattern);
                            for (let match of matches) {
                                let score = prob / 100 * parseInt(match[2] + match[3])
                                result[match[1]] = Number((result[match[1]] + score).toFixed(4));
                            }
                        }
                    }
                    return result
                }

                function getCoin() {
                    let coin = 0;
                    let myblok = document.getElementsByClassName("myblok")
                    for (let blok of myblok) {
                        let regex = /金币\s+(\d+)寄售/i;
                        let matches = blok.innerText.match(regex)
                        if (matches) {
                            coin += parseInt(matches[1])
                        }
                    }
                    return coin
                }

                let huiPattern = /回帖\s+(.+?) ([+-])(\d+)/gi
                let huiResult = qiwang(huiPattern)
                let hui = "回帖期望 "
                for (let key in huiResult) {
                    hui += key + (属性映射[key]? 属性映射[key].emoji : "") + ":" + huiResult[key] + "&nbsp;&nbsp;"
                }

                let faPattern = /发帖\s+(.+?) ([+-])(\d+)/gi
                let faResult = qiwang(faPattern)
                let fa = "发帖期望 "
                for (let key in faResult) {
                    fa += key + (属性映射[key]? 属性映射[key].emoji : "") + ":" + faResult[key] + "&nbsp;&nbsp;"
                }

                let coin = "寄售最大价格总和：" + getCoin()

                document.head.innerHTML += '<style>.myfldiv {display:flex;flex-wrap:wrap;align-items:flex-start;}</style>';
                // Mjq(".my_tip").html("<br>" + hui + "<br>" + fa + "<br>" + coin + "<br><br>" + txt);
                let htmlDivElement = document.createElement("div");
                htmlDivElement.style.margin = '20px';
                htmlDivElement.style.lineHeight = '1.5';
                htmlDivElement.innerHTML = "<br><span style='font-size: 16px'>" + hui + "</span>" +
                    "<br><span style='font-size: 16px'>" + fa + "</span>" +
                    "<br><span style='font-size: 16px'>" + coin + "</span><br>" +
                    "<br>" + txt;
                document.querySelector('.my_fenlei').parentElement.appendChild(htmlDivElement);

                function showValid() {
                    let myblok = document.getElementsByClassName("myblok")
                    for (let blok of myblok) {
                        let regex = /\s+(.+?分)\d{1,2}秒有效期/i;
                        let matches = blok.innerText.match(regex)
                        if (matches) {
                            let newP = document.createElement("p");
                            let newContent = document.createTextNode(matches[1]);
                            newP.appendChild(newContent);
                            blok.firstElementChild.appendChild(newP)
                        }
                    }
                }

                showValid()

                console.log(huishou)
                // 创建勋章回收相关DOM元素
                let recycleContainer = document.createElement('div');
                recycleContainer.style.marginTop = '20px';
                recycleContainer.style.padding = '20px';
                recycleContainer.innerHTML = `
        <h2>批量回收勋章</h2>
        <form id="recycleForm">
            <div class="myfldiv" style="margin-top: 5px;margin-bottom: 5px;">
            ${Object.entries(huishou).map(([medalName, 回收号]) => `
                <label style="display:block;margin-right: 5px;font-size:14px;">
                    <input type="checkbox" name="${medalName}" value="${回收号}" ${回收号 > 0 ? 'checked="true"': ""}>
                    <span>${medalName}</span>
                </label>
            `).join('')}
            </div>
            <button type="button" id="batchRecycleBtn" class="medal_button">批量回收</button>
        </form>
    `;

                let receiveContainer = document.createElement('div');
                receiveContainer.className = 'receive-form-container'; // 添加类名以便自定义样式
                // receiveContainer.style.marginTop = '20px';
                receiveContainer.style.padding = '20px';
                receiveContainer.innerHTML = `
    <h2>批量领取勋章<p style ="font-family: 'Arial', sans-serif;
          font-size: 15px;
          color: #4A90E2;
          background-color: rgba(0, 0, 0, 0.05);
          padding: 3px;
          border-radius: 5px;">（牧羊人发帖加旅程，森林羊男加知识，风雪之家加灵魂，其他加金币或者血液以及咒术）</p></h2>
    <form id="receiveForm">
        <div class="myfldiv" style="margin-top: 5px;margin-bottom: 5px;margin-right: 5px;">
                ${medals.map(medal => `
        <label style="display:block;font-size:14px;margin-right: 10px;color: ${medal.type == '回帖向'? 'green': (medal.type == '发帖向'? 'blue': 'black')};">
            <input type="checkbox" name="${medal.name}" value="${medal.id}" >
            <span title="${medal.note}">${medal.name}</span>
        </label>
        `).join('')}
        </div>
        <button type="button" id="batchReceiveBtn" class="medal_button">批量领取</button>
    </form>

    <div style="margin-top: 20px"></div>
    <h2>批量领取回帖勋章</h2>
    <form id="receiveForm_reply">
        <div class="myfldiv" style="margin-top: 5px;margin-bottom: 5px;margin-right: 5px;">
        ${medals_reply.map(medal => `
        <label style="display:block;font-size:14px;margin-right: 10px;color: ${medal.type == '回帖向'? 'green': (medal.type == '发帖向'? 'blue': 'black')};">
            <input type="checkbox" name="${medal.name}" value="${medal.id}" >
            <span title="${medal.note}">${medal.name}</span>
        </label>
        `).join('')}
        </div>

        <button type="button" id="check_all_reply" class="check_all">全选</button>
        <button type="button" id="batchReceiveBtn_reply" class="medal_button">批量领取</button>
    </form>

    <div style="margin-top: 20px"></div>
    <h2>批量领取发帖勋章</h2>
    <form id="receiveForm_post">
        <div class="myfldiv" style="margin-top: 5px;margin-bottom: 5px;margin-right: 5px;">
        ${medals_post.map(medal => `
        <label style="display:block;font-size:14px;margin-right: 10px;color: ${medal.type == '回帖向'? 'green': (medal.type == '发帖向'? 'blue': 'black')};">
            <input type="checkbox" name="${medal.name}" value="${medal.id}" >
            <span title="${medal.note}">${medal.name}</span>
        </label>
        `).join('')}
        </div>
        
        <button type="button" id="check_all_post" class="check_all">全选</button>
        <button type="button" id="batchReceiveBtn_post" class="medal_button">批量领取</button>
    </form>`;

                const targetElement = document.querySelector("#medalid_f > div.my_fenlei > div.my_biaoti");
                targetElement.parentNode.appendChild(recycleContainer);
                targetElement.parentNode.appendChild(receiveContainer);

                let elementsByClassName = document.querySelectorAll('.check_all');
                elementsByClassName.forEach(element => {
                    console.log(element)
                    element.addEventListener('click', e => {
                        console.log(element.parentElement)
                        let inputs = element.parentElement.querySelectorAll('input');
                        inputs.forEach(el => {
                            el.checked = !el.checked;
                        })
                    })
                })

                // 批量领取方法
                function receive(btnId, formId) {
                    document.getElementById(btnId).addEventListener('click', () => {
                        const checkboxes = document.querySelectorAll(`#${formId} input[type="checkbox"]:checked`);
                        checkboxes.forEach(checkbox => {
                            const medalName = checkbox.name;
                            const medalId = parseInt(checkbox.value, 10);

                            if (!isNaN(medalId)) {
                                const url = `https://www.gamemale.com/wodexunzhang-showxunzhang.html?action=lingqu&medalid=${medalId}`;
                                // 使用GM_openInTab打开新的标签页，如果在普通环境下则使用window.open
                                // 注意：由于安全策略，window.open可能会被浏览器阻止，除非用户有交互行为
                                // 如果您的环境支持Greasemonkey或Tampermonkey等脚本管理器，请使用GM_openInTab
                                // 否则请注释掉GM_openInTab这一行，并取消注释下面的window.open
                                // GM_openInTab(url);
                                window.open(url, '_blank');
                            }
                        });
                    });
                }

                // 批量领取方法
                receive('batchReceiveBtn', 'receiveForm');
                receive('batchReceiveBtn_reply', 'receiveForm_reply');
                receive('batchReceiveBtn_post', 'receiveForm_post');

                // 注册批量回收按钮点击事件
                document.getElementById('batchRecycleBtn').addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('#recycleForm input[type="checkbox"]:checked');
                    checkboxes.forEach(checkbox => {
                        const medalName = checkbox.name;
                        const 回收号 = parseInt(checkbox.value, 10);

                        if (回收号 !== 0) {
                            const url = `https://www.gamemale.com/wodexunzhang-showxunzhang.html?action=huishou&userMedalid=${回收号}`;
                            // 使用GM_openInTab打开新的标签页，如果在普通环境下则使用window.open
                            // 注意：由于安全策略，window.open可能会被浏览器阻止，除非用户有交互行为
                            // 如果您的环境支持Greasemonkey或Tampermonkey等脚本管理器，请使用GM_openInTab
                            // 否则请注释掉GM_openInTab这一行，并取消注释下面的window.open
                            // GM_openInTab(url);
                            window.open(url, '_blank');
                        }
                    });
                });
            })();

        }
    } else if (/^https:\/\/www\.gamemale\.com\/home\.php\?mod=spacecp&ac=credit&op=exchange$/.test(currentUrl)) {
        console.log('This is running on 血液献祭');
        let tdElement = document.querySelector('#exchangesubmit_btn').parentNode;

        let inputField = document.createElement('input');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('id', 'myinput');
        inputField.setAttribute('placeholder', '兑换次数');
        inputField.classList.add('px');
        tdElement.appendChild(inputField);

        let customButton = document.createElement('button');
        customButton.textContent = '批量兑换';
        customButton.setAttribute('type', 'button');
        customButton.classList.add('pn');
        customButton.addEventListener('click', submitForm);
        tdElement.appendChild(customButton);

        function submitForm() {

            let times = parseInt(inputField.value);
            if (isNaN(times) || times <= 0) {
                showDialog('请输入有效的提交次数', 'notice');
                return;
            } else {
                let exchangeBtn = document.getElementById('exchangesubmit_btn');
                document.getElementById('exchangeamount').value = '1';

                for (let i = 0; i < times; i++) {
                    setTimeout(function () {
                        exchangeBtn.click();
                    }, i * 4000); // 4秒间隔
                }
            }
        }

    } else if (/^https:\/\/www\.gamemale\.com\/plugin\.php\?id=viewui_draw&mod=list&ac=draw/.test(currentUrl)) {
        // 对于 画图 的页面，执行这段代码
        console.log('This is running on 画图');
        window.onload = (function () {
        // Your code here...
            var padding = 30;
            var par = document.getElementsByClassName("btn")[0];
            var ct = document.getElementsByClassName("canvas")[0].childNodes[0];
            var ctx = ct.getContext("2d");
            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio = ctx.webkitBackingStorePixelRatio || 1;
            var ratio = devicePixelRatio / backingStoreRatio;
            ctx.scale(ratio, ratio);
            padding = padding * ratio;
            ct.style.borderWidth = '1px';
            ct.style.borderStyle = 'solid';
            var img = new Image();
            img.onload = function () {
                var sh = 347 * ratio;
                var sw = 500 * ratio;
                var h = img.height;
                var w = img.width;
                var ph = sh - padding * 2;
                var pw = sw - padding * 2;
                ct.height = sh;
                ct.width = sw;
                ct.style.height = sh;
                ct.style.width = sw;
                ctx.clearRect(0, 0, ct.width, ct.height);
                if (w / h >= pw / ph) {
                    h = h * (pw / w);
                    w = pw;
                    ctx.drawImage(img, padding, padding + (ph - h) / 2, w, h)
                } else {
                    w = w * (ph / h);
                    h = ph;
                    ctx.drawImage(img, padding + (pw - w) / 2, padding, w, h)
                }
            };

            function selectImage(file) {
                if (!file.files || !file.files[0]) {
                    return
                }
                ;
                var reader = new FileReader();
                reader.onload = function (evt) {
                    img.src = evt.target.result
                };
                reader.readAsDataURL(file.files[0])
            };
            var inputObj = document.createElement('input');
            inputObj.setAttribute('id', 'imgInput');
            inputObj.setAttribute('type', 'file');
//inputObj.setAttribute('onchange','selectImage(this)');
            inputObj.addEventListener('change', function () {
                selectImage(this);
            });
            par.appendChild(inputObj);
        })();
        // 在这里写针对 example2.com 的代码...
    } else if (/^.*:\/\/.*\.gamemale\.com\/forum-/.test(currentUrl) || /^https:\/\/www\.gamemale\.com\/forum\.php\?mod=forumdisplay/.test(currentUrl)) {
        // 对于 论坛列表 的页面，执行这段代码
        console.log('This is running on 论坛列表');

        function applyReplyStatus(threadElement, replied) {
            switch (replied) {
                case 'replied':
                    threadElement.classList.add('replied-thread');
                    break;
                case 'unreplied':
                    threadElement.classList.add('unreplied-thread');
                    break;
                case 'new-replied':
                    updateStatsDisplay();
                    threadElement.classList.add('new-replied-thread');
                    break;
            }
        }

        console.log('This is running on 论坛列表');
        const isDiscuz = typeof discuz_uid != "undefined";
        const userId = isDiscuz ? discuz_uid : __CURRENT_UID;
        let twentyFourHourRepliesCount = 0;
        let oldestReplyTimestamp = null;
        const statsContainer = document.createElement('div');
        statsContainer.style.position = 'fixed';
        statsContainer.style.bottom = '1rem'; // 已经在底部，保留不变
        statsContainer.style.left = '50%'; // 移至屏幕水平居中
        statsContainer.style.transform = 'translateX(-50%)'; // 水平偏移自身宽度的一半，实现居中
        statsContainer.style.index = '9999';
        statsContainer.style.backgroundColor = '#fff';
        statsContainer.style.padding = '0.5rem';
        statsContainer.style.borderRadius = '5px';
        document.body.appendChild(statsContainer);
        GM_addStyle(`
        .replied-thread {
background-color: #EAF6F6;
        }
        .unreplied-thread {
           background-color: #FFEFD5;
        }
        .new-replied-thread {
background-color: #FFCDD2;
        }
    `);

        const cache = {};
        let isInitialized = false; // 标记是否已完成初始化请求

        function updateStatsDisplay() {
            let latestReplyText = '';
            if (oldestReplyTimestamp) {
                const timeDifference = Math.round((new Date().getTime() - oldestReplyTimestamp.getTime()) / (1000 * 60));
                const hours = Math.floor(timeDifference / 60);
                const minutes = timeDifference % 60;
                latestReplyText = `其中最远距今已有 ${hours} 小时 ${minutes} 分钟`;
            }
            statsContainer.textContent = `过去24小时回复数：${twentyFourHourRepliesCount} 条\n${latestReplyText}`;
        }

        function updateThreadStatuses(allThreadElements) {
            const promises = [];
            allThreadElements.forEach(threadElement => {
                const threadLinkElement = threadElement.querySelector('.xst');
                const threadUrl = threadLinkElement.getAttribute('href');
                const threadId = threadUrl.match(/thread-(\d+)/)[1];

                if (!(threadId in cache)) {
                    const requestUrl = `https://www.gamemale.com/forum.php?mod=viewthread&tid=${threadId}&authorid=${userId}`;
                    promises.push(
                        fetch(requestUrl)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok.');
                                }
                                return response.text();
                            })
                            .then(html => {
                                const replied = (() => {
                                    const postTimeMatch = html.match(/<span title="(\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2})"/);
                                    if (postTimeMatch) {
                                        const postTimeString = postTimeMatch[1];
                                        const postTime = new Date(postTimeString);
                                        const currentTime = new Date();
                                        const isOver24Hours = currentTime.getTime() - postTime.getTime() > 24 * 60 * 60 * 1000;
                                        if (isOver24Hours) {
                                            return 'replied';
                                        } else {
                                            twentyFourHourRepliesCount++;
                                            if (!oldestReplyTimestamp || postTime < oldestReplyTimestamp) {
                                                oldestReplyTimestamp = postTime;
                                            }
                                            return 'new-replied';
                                        }
                                    } else if (html.includes("未定义操作") || html.includes("ERROR:")) {
                                        return 'unreplied';
                                    } else {
                                        return 'replied';
                                    }
                                })();

                                cache[threadId] = replied;
                                applyReplyStatus(threadElement, replied);
                            })
                    );
                } else {
                    applyReplyStatus(threadElement, cache[threadId]);
                }
            });

            if (!isInitialized) {
                isInitialized = true;
                Promise.all(promises)
                    .finally(() => updateStatsDisplay()); // 所有请求完成后更新统计信息
            }
        }

        // 当页面内容变化或刷新时，可以调用此函数
        window.addEventListener('DOMContentLoaded', () => {
            const newThreadElements = document.querySelectorAll('.bm_c tbody[id^="normalthread_"]:not(.processed)');
            newThreadElements.forEach(threadElement => threadElement.classList.add('processed'));

            updateThreadStatuses(newThreadElements);
        });

        document.getElementById('autopbn').addEventListener('click', function (event) {
            event.preventDefault();

            setTimeout(() => {
                const newThreadElements = document.querySelectorAll('.bm_c tbody[id^="normalthread_"]:not(.processed)');
                newThreadElements.forEach(threadElement => threadElement.classList.add('processed'));
                updateThreadStatuses(newThreadElements);
            }, 1500);
        });

        // 初始化显示
        const initialThreadElements = document.querySelectorAll('.bm_c tbody[id^="normalthread_"]:not(.processed)');
        initialThreadElements.forEach(threadElement => threadElement.classList.add('processed'));
        updateThreadStatuses(initialThreadElements);
    } else if (/^https:\/\/www\.gamemale\.com\/forum\.php\?/.test(currentUrl) || /^https:\/\/www\.gamemale\.com\/thread/.test(currentUrl)) {
        // 对于 帖子 的页面，执行这段代码
        console.log('This is running on 帖子');
        // 在这里写针对 example2.com 的代码...
        (async () => {
            document.addEventListener('copy', function (e) {
                var selection = window.getSelection().toString().trim();
                if (selection.match(/https?:\/\/\S+/) && selection.includes('(出处: GameMale)')) {
                    var url = selection.match(/https?:\/\/\S+/)[0];
                    var title = selection.replace(url, '').replace(/\(出处: GameMale\)/g, '').replace(/ +/g, ' ').trim();
                    var formattedText = '[url=' + url + ']' + title + '[/url]';
                    e.clipboardData.setData('text/plain', formattedText);
                    e.preventDefault();
                }
            });

            const inlineMode = window.localStorage.getItem("air_inline") ?? "关";

            GM_registerMenuCommand(`行内显示已回复: 【${inlineMode}】`, () => {
                window.localStorage.setItem(
                    "air_inline",
                    inlineMode === "开" ? "关" : "开"
                );
                window.location.reload();
            });
            if ((location.pathname === "/forum.php" && !location.search.includes("tid")) || location.search.includes("authorid")) {
                return;
            }

            const isDiscuz = typeof discuz_uid != "undefined";

            const userId = isDiscuz ? discuz_uid : __CURRENT_UID;

            const testUrl = location.href.split("#")[0] + (location.search ? `&authorid=${userId}` : `?authorid=${userId}`);

            fetch(testUrl)
                .then((res) => res.text())
                .then((html) => {
                    const replied = !(html.includes("未定义操作") || html.includes("ERROR:"));

                    const text = replied ? "✅已经回过贴了" : "❌还没回过贴子";

                    const tips = document.createElement("a");
                    tips.textContent = text;
                    if (replied) {
                        tips.href = testUrl;
                    } else {
                        tips.addEventListener("click", () => {
                            if (isDiscuz) {
                                showError("❌还没回过贴子");
                            } else {
                                alert("❌还没回过贴子");
                            }
                        });
                    }

                    if (isDiscuz) {
                        const btnArea = inlineMode !== "开" ?
                            document.querySelector("#pgt") :
                            document.querySelector("#postlist td.plc div.authi>span.none") ??
                            document.querySelector("#postlist td.plc div.authi>span.pipe");

                        if (btnArea === null) {
                            return;
                        }

                        if (btnArea.tagName === "SPAN") {
                            const span = document.createElement("span");
                            span.textContent = "|";
                            span.className = "pipe";
                            const bar = btnArea.parentNode;
                            bar.insertBefore(span, btnArea);
                            bar.insertBefore(tips, btnArea);
                        } else {
                            btnArea.appendChild(tips);
                        }
                    } else {
                        const btnArea = document.querySelector("#m_nav>.nav");
                        const anchor = btnArea.querySelector("div.clear");

                        if (btnArea === null || anchor === null) {
                            return;
                        }

                        tips.className = "nav_link";
                        btnArea.insertBefore(tips, anchor);
                    }

                });
        })();
    } else if (/^.*:\/\/.*\.gamemale\.com\/blog-/.test(currentUrl) || /^.*:\/\/.*\.gamemale\.com\/home\.php\?mod=/.test(currentUrl)) {
        // 对于 每日10血 的页面，执行这段代码
        console.log('This is running on 每日10血');
        var refreshIntervalInSeconds = GM_getValue('refreshInterval', 5);
        var autoRefreshEnabled = GM_getValue('autoRefreshEnabled', true);
        var autoClickEnabled = GM_getValue('autoClickEnabled', true);
        var autoCloseIntervalInSeconds = GM_getValue('autoCloseInterval', 2);
        var maxClicksPerDay = GM_getValue('maxClicksPerDay', 10);
        var today = new Date().toDateString();
        var clickCount = GM_getValue('clickCount', 0);
        var lastClickDate = GM_getValue('lastClickDate', '');

        if (lastClickDate !== today) {
            clickCount = 0;
            GM_setValue('clickCount', clickCount);
            GM_setValue('lastClickDate', today);
        }
        GM_registerMenuCommand('设置自动刷新和点击', openSettingsPanel);

        if (autoRefreshEnabled) {
            setTimeout(function () {
                location.reload();
            }, refreshIntervalInSeconds * 300000);
        }

        if (autoClickEnabled && clickCount < maxClicksPerDay && /https:\/\/www\.gamemale\.com\/blog-.*\.html/.test(window.location.href)) {
            window.addEventListener('load', function () {
                var links = document.getElementsByTagName('a');
                var hasClicked = false;
                for (var i = 0; i < links.length; i++) {
                    if (links[i].innerHTML.includes('震惊')) {
                        links[i].click();
                        hasClicked = true;

                        GM_setValue('clickCount', ++clickCount);
                        GM_setValue('lastClickDate', today);
                        break;
                    }
                }
                if (hasClicked) {
                    setTimeout(function () {
                        window.close();
                    }, autoCloseIntervalInSeconds * 1000);
                }
            });
        }


        function openSettingsPanel() {

            if (document.getElementById('settingsPanel')) {
                return;
            }

            var panel = document.createElement('div');
            panel.id = 'settingsPanel';
            panel.style = "position: fixed; top: 20px; left: 20px; z-index: 9999; padding: 20px; background-color: white; border: 1px solid black;";
            panel.innerHTML = `
<label>刷新时间间隔（秒）: <input type="number" id="refreshIntervalInput" value="${refreshIntervalInSeconds}"></label><br>
<label><input type="checkbox" id="autoRefreshCheckbox" ${autoRefreshEnabled ? 'checked' : ''}> 启用自动刷新</label><br>
<label>自动关闭时间间隔（秒）: <input type="number" id="autoCloseIntervalInput" value="${autoCloseIntervalInSeconds}"></
<label><input type="checkbox" id="autoClickCheckbox" ${autoClickEnabled ? 'checked' : ''}> 启用自动点击震惊</label><br>
<label>每天自动点击次数: <input type="number" id="maxClicksPerDayInput" value="${maxClicksPerDay}"></label><br>
<button id="saveSettingsButton">保存设置</button>
<button id="closeSettingsButton">关闭</button>
        `;
            document.body.appendChild(panel);

            document.getElementById('saveSettingsButton').addEventListener('click', function () {
                var newRefreshInterval = parseInt(document.getElementById('refreshIntervalInput').value, 10);
                var newAutoRefreshEnabled = document.getElementById('autoRefreshCheckbox').checked;
                var newAutoCloseInterval = parseInt(document.getElementById('autoCloseIntervalInput').value, 10);
                var newAutoClickEnabled = document.getElementById('autoClickCheckbox').checked;
                var newMaxClicksPerDay = parseInt(document.getElementById('maxClicksPerDayInput').value, 10);

                GM_setValue('refreshInterval', newRefreshInterval);
                GM_setValue('autoRefreshEnabled', newAutoRefreshEnabled);
                GM_setValue('autoCloseInterval', newAutoCloseInterval);
                GM_setValue('autoClickEnabled', newAutoClickEnabled);
                GM_setValue('maxClicksPerDay', newMaxClicksPerDay);

                alert('设置已保存。请手动刷新页面以应用设置。');

                closeSettingsPanel();
            });

            document.getElementById('closeSettingsButton').addEventListener('click', function () {
                closeSettingsPanel();
            });
        }

        function closeSettingsPanel() {
            var panel = document.getElementById('settingsPanel');
            if (panel) {
                document.body.removeChild(panel);
            }
        }

        // 在这里写针对 example2.com 的代码...
    } else {
        console.log('如果不满足以上任何一个条件，可以在这里编写通用代码');
        // 如果不满足以上任何一个条件，可以在这里编写通用代码
    }

})();
