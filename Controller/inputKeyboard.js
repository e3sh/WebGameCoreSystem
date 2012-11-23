//InputKeyboard
//

function inputKeyboard() {

    var keymap = [];

    //windowsフォーカスが外れるとキー入力リセットさせとく(押しっぱなし状態となる為）
    window.addEventListener("blur", function (event) { keymap = []; }, false);

    window.addEventListener("keydown", function (event) { keymap[event.keyCode] = true; }, false);
    window.addEventListener("keyup", function (event) { keymap[event.keyCode] = false; }, false);

    this.check = function () {

        return keymap;
    }

    //入力状態確認用
    this.state = function () {

        var st = "";

        for (var i in keymap) {

            st += "[" + i + "]" + ((keymap[i]) ? "*" : ".");
        }
        return st;
    }
}

