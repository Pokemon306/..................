// 记录页面加载时间
const startTime = new Date();

// 获取DOM元素
const timerElement = document.getElementById('timer');
console.log(timerElement);

// 格式化时间显示
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

// 更新计时器显示
function updateTimer(date) {
    if(!date) {
        date = startTime;
    }
    const now = new Date();
    const elapsedMilliseconds = now - date;
    timerElement.textContent = formatTime(elapsedMilliseconds);
}

// 每秒更新一次
setInterval(updateTimer, 1000);

// 初始化显示
let passTime = document.getElementById('passTime');
let lastReplyTime = document.getElementById('lastReplyTime');
if(lastReplyTime && lastReplyTime) {
    let date = new Date(lastReplyTime.value);

    updateTimer(date);

    passTime.style.display = 'block';
}
