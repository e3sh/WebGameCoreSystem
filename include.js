// include
// update 2024/04/13
// . inputGamepad   - inputGamepad()    0番-Standard以外での動作不具合対策（そのまま動くはず）        
// . spriteControl  - GameSpriteControl() 使いにくかったので使用方法変更（sample書換要
//                    2024/04/22-23 customMove/Draw機能追加、DeltaTime補正追加

const w = [
    //WebGameCoreSystem Files
    //SystemControl

    "proc/func/GameAssetManager.js"
    ,"proc/func/GameTaskControl.js"
    ,"proc/GameCore.js"
    ,"proc/dev/inputKeyboard.js"
    ,"proc/dev/inputMouse.js"
    ,"proc/dev/inputGamepad2.js"    //2024/04/13更新
    ,"proc/dev/inputTouchPad.js"
    ,"proc/dev/inputVPad.js"
    ,"proc/func/DisplayControl.js"
    ,"proc/dev/soundControl.js"
    ,"proc/dev/offScreen.js"
    ,"proc/dev/offScreenTypeC.js"   //2024/04/30更新
    ,"proc/dev/beepcore.js"         //2024/04/27新規追加
    ,"proc/func/spriteControl2.js"  //2024/04/23更新
    ,"proc/func/spriteFontControl.js"
    ,"proc/func/fontPrintControl.js"
    ,"proc/func/viewport.js"        //2024/04/30新規追加
    ,"proc/task/GameTaskClass.js"

    //"main_sample1.js" //ここに実行ファイルを記載する。 
];

for (let i in w) {
    document.write('<script type="text/javascript" src="' + w[i] + '"></script>');
};

