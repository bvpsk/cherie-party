let roomId;
let hwpExtensionId; // = 'jbopohiiakkkpkepnmkjkjpcfnhgigpf'
window.onload = async function(){
    let createBtn = document.querySelector("#create-room-btn");
    let nameField = document.querySelector("#user-name")
    let roomData = {};
    let extensionInstalled = false;
    roomId = window.location.href.split("/").pop();
    console.log({roomId})

    setTimeout(() => {
        let extIdDiv = document.querySelector("#extension-present");
        extensionInstalled = extIdDiv != undefined;
        hwpExtensionId = extIdDiv.innerHTML;
        console.log(hwpExtensionId);
    }, 2000)

    // checkExtension(hwpExtensionId, 'app/icon.png', (ok) => {
    //     extensionInstalled = ok;
    // })

    let roomDataCookie = getCookie('roomData');
    deleteCookie('roomData');

    if (roomDataCookie) {
        roomData = parseObjectFromCookie(roomDataCookie);
        console.log({roomData})

    } else {
        // handle data not found
    }

    createBtn.addEventListener("click", (e) => {
        roomData['userName'] = nameField.value;
        let sampleDiv = document.querySelector("#extension-present");
        console.log(sampleDiv, "hi", sampleDiv.innerHTML)
        if(extensionInstalled){
            // setCookie("hwpRoomData", JSON.stringify(roomData), 1);
            chrome.runtime.sendMessage(hwpExtensionId, { roomData },
                function (response) {
                    console.log({response})
                });

            window.location.href = roomData['partyUrl'];
        }else{

        }
    });

}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const checkExtension = (id, src, callback) => {
    let e = new Image()
    e.src = 'chrome-extension://' + id + '/' + src
    e.onload = () => callback(1), e.onerror = () => callback(0)
}

const getCookie = (name) => {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
};

const deleteCookie = (name) => {
    document.cookie = name + '=; max-age=0;';
};

const parseObjectFromCookie = (cookie) => {
    const decodedCookie = decodeURIComponent(cookie);
    return JSON.parse(decodedCookie);
};