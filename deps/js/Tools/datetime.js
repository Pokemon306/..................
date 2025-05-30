
// 格式化时间
function formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('SS', seconds)
        .replace('ss', seconds);
}
