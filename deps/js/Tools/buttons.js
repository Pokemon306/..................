
// 在指定节点 子节点最前创建按钮
function createButtonFirst(tag, text, buttonName, color, margin) {
    insertButtonFirst(tag, createButtonTag(text, buttonName, color, margin))
}
function insertButtonFirst(tag, button) {
    tag.insertBefore(button, tag.firstChild)
}
// 在指定节点 子节点最后创建按钮
function createButtonLast(tag, text, buttonName, color, margin) {
    if(!tag) return;
    tag.appendChild(createButtonTag(text, buttonName, color, margin))
}

// 在指定节点 的前面创建
function createButtonBefore(tag, text, buttonName, color, margin) {
    insertButtonBefore(tag, createButtonTag(text, buttonName, color, margin))
}
function insertButtonBefore(tag, button) {
    tag.parentElement.insertBefore(button, tag)
}

// 在指定节点 的后面创建
function createButtonAfter(tag, text, buttonName, color, margin) {
    insertButtonAfter(tag.nextSibling, createButtonTag(text, buttonName, color, margin), )
}
function insertButtonAfter(tag, button) {
    tag.parentElement.insertBefore(button, tag.nextSibling)
}

// 在指定节点 中的div中创建
function createButtonInDiv(tag, text, buttonName, color, margin) {
    let buttonDiv = getButtonDiv(tag, "after");
    buttonDiv.appendChild(createButtonTag(text, buttonName, color, margin));
}

// 在指定节点 中的div中创建
function createButtonDivBefore(tag, text, buttonName, color, margin) {
    let buttonDiv = getButtonDiv(tag, "before");

    if(buttonDiv) {
        // 检查按钮是否已经存在了
        let button = buttonDiv.querySelector(`#copy_${buttonName}`)
        if(button) {
            button.onclick = function () {
                const clipboardObj = navigator.clipboard;
                clipboardObj.writeText(this.value)
                Toast(`${buttonName} success`)
            }
        } else {
            buttonDiv.appendChild(createButtonTag(text, buttonName, color, margin));
        }
    }
}

// 在指定节点 中的div中创建
function createButtonDivLast(tag, text, buttonName, color, margin) {
    let buttonDiv = getButtonDiv(tag, "last");

    if(buttonDiv) {
        // 检查按钮是否已经存在了
        let button = buttonDiv.querySelector(`#copy_${buttonName}`)
        if(button) {
            button.onclick = function () {
                const clipboardObj = navigator.clipboard;
                clipboardObj.writeText(this.value)
                Toast(`${buttonName} success`)
            }
        } else {
            buttonDiv.appendChild(createButtonTag(text, buttonName, color, margin));
        }
    }
}

function getButtonDiv(tag, type) {
    if(tag.parentElement.querySelector('#buttonDiv')) {
        return tag.parentElement.querySelector('#buttonDiv');
    }

    let div = document.createElement('div');
    div.id = "buttonDiv"
    div.className = "buttonDiv"
    if(type === "after") {
        tag.parentElement.insertBefore(div, tag.nextSibling)
    } else if(type === "before") {
        tag.parentElement.insertBefore(div, tag)
    } else if(type === "last") {
        tag.appendChild(div)
    }

    // window.__BUTTONDIV__ = true

    return div
}

// 创建一个button
function createButtonTag(text, buttonName, color, margin) {
    let button = document.createElement('button');
    if(buttonName == undefined || buttonName == "") {
        buttonName = "copyName"
    }
    if(color == undefined || color == "") {
        color = "white"
    }
    if(margin == undefined || margin == "") {
        margin = "8px 0px"
    }

    button.id = "copy_" + buttonName
    button.className = buttonName;
    button.innerText = buttonName;
    button.style =
        "".concat("color: ", color, ";")
            .concat("margin: ", margin, ";")
            .concat("font-weight: bold;")
            .concat("text-shadow: 0 0 10px rgba(0, 255, 255, 0.7),")
            .concat("0 0 20px rgba(0, 255, 255, 0.7),")
            .concat("0 0 30px rgba(0, 255, 255, 0.7);")
            .concat("background-color: rgba(0,0,0,0);")
            .concat("border: rgba(0,0,0,0);")
            .concat("cursor:pointer;")

    if(text !== undefined && text !== "") {
        button.value = text;
        // 点击按钮，拷贝内容到剪切板
        button.onclick = function () {
            const clipboardObj = navigator.clipboard;
            clipboardObj.writeText(this.value)
            Toast(`${buttonName} success`)
        }
    }

    return button;
}
