// 记录页面加载时间
var _startTime = new Date();

// 获取DOM元素
var timerElement = document.getElementById('timer');

// 格式化时间显示
function formatTime(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

// 更新计时器显示
function updateTimer(date) {
    if (!date) {
        date = _startTime;
    }
    let now = new Date();
    let elapsedMilliseconds = now - date;
    timerElement.textContent = formatTime(elapsedMilliseconds);
}

// 初始化显示
var lastReplyTime = document.getElementById('lastReplyTime');
if (lastReplyTime) {
    let date = new Date(lastReplyTime.value);
    updateTimer(date);

    // 每秒更新一次
    let timer = setInterval(function (date) {
            if(document.body.style.display == 'none') {
                console.log("停止更新计时器")
                clearInterval(timer)
                return;
            }
            updateTimer(date);
        }, 1000,
        date
    );
}