// 一个倒计时计时器
const timer = function (_milliseconds, _callback) {
    setTimeout(() => {
        _callback()
    }, _milliseconds);
}

// 转义不能作为文件名的字符
function transfer(text) {
    return text
        .replace(/\n/g, ' ')
        // .replace(/\!/g, '%21')
        .replace(/\?/g, '%3F')
        // .replace(/:/g, '%3A')
        .replace(/:/g, '：')
        .replace(/"/g, '%22')
        // .replace(/\//g, '%2F')
        // .replace(/\|/g, '%7C')
        .replace(/\//g, '／')
        .replace(/\|/g, '｜')
        .replace(/\*/g, '＊')
        .replace(/&amp;/g, '&')
        // .replace(/</g, '(')
        // .replace(/>/g, ')')
        .replace(/</g, '‹')
        .replace(/>/g, '›')
}

//提示信息 封装
function Toast(msg, duration, movedown) {
    duration = isNaN(duration) ? 1000 : duration;
    movedown = isNaN(movedown) ? 0 : movedown;
    let top = '20%';
    if(movedown > 0) {
        top = (window.innerHeight + movedown) + 'px';
    }
    var m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText = "font-size: 15px;" +
        "color: rgb(255, 255, 255);" +
        "text-shadow: 0 0 10px rgba(0, 255, 255, 0.7)," +
        "0 0 20px rgba(0, 255, 255, 0.7)," +
        "0 0 30px rgba(0, 255, 255, 0.7);" +
        "background-color: rgba(0, 0, 0, 0.6);" +
        "padding: 10px 15px;" +
        "margin: 0 0 0 -60px;" +
        "border-radius: 4px;" +
        "position: fixed;" +
        `top: ${top};` +
        "left: 50%;" +
        "width: auto;" +
        "z-index:1001;" +
        "text-align: center;";
    document.body.appendChild(m);
    setTimeout(function () {
        var d = 1;
        m.style.opacity = '0';
        setTimeout(function () {
            document.body.removeChild(m)
        }, d * 1000);
    }, duration);
}

// 根据url获取文件名
function getFilename(src) {
    let baseUrl = src;

    const questionMarkIndex = src.indexOf('?');
    if (questionMarkIndex!== -1) {
        // 提取 ? 之前的部分
        baseUrl = src.slice(0, questionMarkIndex);
    }

    const slashMarkIndex = src.lastIndexOf('/');
    return baseUrl.substring(slashMarkIndex+1);
}

function getFilePrefix(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex !== -1) {
        let file_prefix = filename.substring(0, lastDotIndex);
        return file_prefix;
    }

    return filename
}

// 根据文件名获取后缀
function getFileSuffix(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex !== -1) {
        let file_suffix = filename.substring(lastDotIndex + 1);
        return file_suffix;
    }

    return ""
}