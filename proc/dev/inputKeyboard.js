
//InputKeyboard
//

function inputKeyboard(){

    // keycode
    //
    // ↑:38, ↓:40, ←:37, →:39
    //
    // shift:16, ctrl :17, alt  :18, space:32
    //
    // q:81, w:87, e:69
    // a:65, s:83, d:68
    // z:90, x:88, c:67

    var keymap = [];

    this.upkey = false;
    this.downkey = false;
    this.leftkey = false;
    this.rightkey = false;

    this.shift = false;
    this.ctrl = false;
    this.alt = false;
    this.space = false;

    this.qkey = false;
    this.wkey = false;
    this.ekey = false;

    this.akey = false;
    this.skey = false;
    this.dkey = false;

    this.zkey = false;
    this.xkey = false;
    this.ckey = false;

    function keyStateReset() {

        this.upkey = false;
        this.downkey = false;
        this.leftkey = false;
        this.rightkey = false;

        this.shift = false;
        this.ctrl = false;
        this.space = false;

        this.qkey = false;
        this.wkey = false;
        this.ekey = false;

        this.akey = false;
        this.skey = false;
        this.dkey = false;

        this.zkey = false;
        this.xkey = false;
        this.ckey = false;
    }
    //windowsフォーカスが外れるとキー入力リセットさせとく(押しっぱなし状態となる為）
    window.addEventListener("blur", function (event) { keymap = []; }, false);

    window.addEventListener("keydown", function (event) { keymap[event.keyCode] = true; }, false);
    window.addEventListener("keyup", function (event) { keymap[event.keyCode] = false; }, false);

    //入力状態確認用
    this.check = function () {

        keyStateReset();

        for (var i in keymap) {

            switch (i) {
                // shift:16, ctrl :17, alt  :18, space:32
                case "16": this.shift = keymap[16]; break;
                case "17": this.ctrl  = keymap[17]; break;
                case "18": this.alt   = keymap[18]; break;
                case "32": this.space = keymap[32]; break;
                // ↑:38, ↓:40, ←:37, →:39
                case "38": this.upkey    = keymap[38]; break;
                case "40": this.downkey  = keymap[40]; break;
                case "37": this.leftkey  = keymap[37]; break;
                case "39": this.rightkey = keymap[39]; break;
                // q:81, w:87, e:69
                // a:65, s:83, d:68
                // z:90, x:88, c:67
                case "65": this.akey = keymap[65]; break;
                case "67": this.ckey = keymap[67]; break;
                case "68": this.dkey = keymap[68]; break;
                case "69": this.ekey = keymap[69]; break;
                case "81": this.qkey = keymap[81]; break;
                case "83": this.skey = keymap[83]; break;
                case "87": this.wkey = keymap[87]; break;
                case "88": this.xkey = keymap[88]; break;
                case "90": this.zkey = keymap[90]; break;
 
                default:
                    break;
            }
        }

        return keymap;
    }

    //入力状態確認用
    this.state = function () {

        return keymap;
    }

    // check;example
    //	if (Boolean(keystate[32])) {
    //    if (keystate[32]) {
    //       push space bar↓
    //    }
    //}

}

