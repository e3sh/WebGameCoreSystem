// include
//

var w = [
    //SystemControl
    "Controller/GameAssetManager.js",
    "Controller/GameTaskControl.js",
    "Controller/GameCore.js",

    //deviceControls
    "Controller/inputKeyboard.js",
    "Controller/inputMouse.js",
    "Controller/DisplayControl.js",
    "Controller/soundControl.js",
    "Controller/offScreen.js",
    "Controller/offScreenTypeB.js",
    "Controller/spriteControl.js",
    "Controller/spriteFontControl.js",

    //UserGameTasks
    "GameTask/GameTask_ClearDisp.js",
    "GameTask/GameTask_FlipDisp.js",

    "GameTask/GameTask_Test.js",
    "GameTask/GameTask_Test2.js",
    "GameTask/GameTask_Test3.js",

    //GameData
    "Asset/spdata.js",
    "Asset/spriteFontData.js",

    //main
    "main.js" 
];

for (var i in w) {
    //alert('<script type="text/javascript" src="' + w[i] + '"></script>');
    document.write('<script type="text/javascript" src="' + w[i] + '"></script>');
};

