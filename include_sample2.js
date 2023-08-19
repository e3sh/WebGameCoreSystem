// include
//

var w = [
    //WebGameCoreSystem Files
    //SystemControl
    "proc/func/GameAssetManager.js",
    "proc/func/GameTaskControl.js",
    "proc/GameCore.js",
    "proc/dev/inputKeyboard.js",
    "proc/dev/inputMouse.js",
    "proc/dev/inputGamepad.js",
    "proc/dev/inputTouchPad.js",
    "proc/dev/inputVPad.js",
    "proc/func/DisplayControl.js",
    "proc/dev/soundControl.js",
    "proc/dev/offScreen.js",
    "proc/dev/offScreenTypeC.js",
    "proc/func/spriteControl.js",
    "proc/func/spriteFontControl.js",
    "proc/func/fontPrintControl.js",
    "proc/task/GameTaskClass.js",

    //"coremin.js",
    "main_sample2.js" 
];

for (var i in w) {
    //alert('<script type="text/javascript" src="' + w[i] + '"></script>');
    document.write('<script type="text/javascript" src="' + w[i] + '"></script>');
};

