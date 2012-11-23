// include
//
/*
document.write('<script type="text/javascript" src="GameAssetManager.js"></script>');
document.write('<script type="text/javascript" src="GameTaskControl.js"></script>');
document.write('<script type="text/javascript" src="GameCore.js"></script>');

document.write('<script type="text/javascript" src="inputKeyboard.js"></script>');
document.write('<script type="text/javascript" src="inputMouse.js"></script>');
//document.write('<script type="text/javascript" src="screen.js"></script>');
document.write('<script type="text/javascript" src="DisplayControl.js"></script>');
document.write('<script type="text/javascript" src="offScreen.js"></script>');

document.write('<script type="text/javascript" src="GameTask_Test.js"></script>');
document.write('<script type="text/javascript" src="GameTask_Test2.js"></script>');

document.write('<script type="text/javascript" src="main.js"></script>');
*/

var w = [
    //SystemControl
    "GameAssetManager.js",
    "Controller/GameTaskControl.js",
    "Controller/GameCore.js",

    //deviceControls
    "Controller/inputKeyboard.js",
    "Controller/inputMouse.js",
    "Controller/DisplayControl.js",
    "Controller/offScreen.js",

    //UserGameTasks
    "GameTask/GameTask_ClearDisp.js",
    "GameTask/GameTask_FlipDisp.js",

    "GameTask/GameTask_Test.js",
    "GameTask/GameTask_Test2.js",
    
    "Asset/spdata.js",

    "main.js" 
];

for (var i in w) {
    //alert('<script type="text/javascript" src="' + w[i] + '"></script>');
    document.write('<script type="text/javascript" src="' + w[i] + '"></script>');
};

