/**
 * includeファイル
 * @todo ESModule化するとシンプルになる予定
 */
"use strict";

// 使用するjsファイルはこの配列にファイルパスを追加すること
const w = [
    //WebGameCoreSystem Files
    //SystemControl

    "proc/func/GameAssetManager.js"
    ,"proc/func/GameTaskControl.js"
    ,"proc/GameCore.js"
    ,"proc/dev/inputKeyboard.js"
    ,"proc/dev/inputMouse.js"
    ,"proc/dev/inputGamepad2.js"
    ,"proc/dev/inputTouchPad.js"
    ,"proc/dev/inputVPad.js"
    ,"proc/func/DisplayControl.js"
    ,"proc/dev/soundControl.js"
//    ,"proc/dev/offScreen.js"
    ,"proc/dev/offScreenTypeC.js"
    ,"proc/dev/beepcore.js"         //2024/04/27新規追加
    ,"proc/func/spriteControl.js"
    ,"proc/func/spriteFontControl.js"
    ,"proc/func/fontPrintControl.js"
    ,"proc/func/viewport.js"
    ,"proc/task/GameTaskClass.js"

    //"main_sample1.js" //ここに実行ファイルを記載する。 
];

for (let i in w) {
    document.write('<script type="text/javascript" src="' + w[i] + '"></script>');
};

