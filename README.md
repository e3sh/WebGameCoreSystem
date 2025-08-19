GameCore　/Javascript
===
**Personal Web Game Library.**

動作確認用

https://e3sh.github.io/WebGameCoreSystem/testConsole.html

本エンジンの使用サンプル

- https://e3sh.github.io/BBD/BLOCKDROPdnc.html

- https://e3sh.github.io/ERA-T/ERATANKdnc.html

- https://e3sh.github.io/OvalRun/OVALRUN.html 

----------------------------------------
`webGameCoreSystem`は、Webブラウザ向けに開発された**JavaScriptベースのゲームエンジン**です。Web標準のAPI（Web Audio API、HTML Canvas API、Web Gamepad APIなど）を活用し、グラフィック描画、サウンド生成、入力処理、スプライト管理、タスク管理といった機能を提供します。

　　　Javascript/HTML5理解の為の習作

JSDOC Document:
[Index](https://e3sh.github.io/WebGameCoreSystem/documents/) 

----------------------------------------

**システムの宣言**
```Javascript

//システム初期パラメータ（表示対象のキャンバスと解像度の指定）
//例：
	const sysParam = {
	 	canvasId: "Canvas",//描画対象のcanvas DOM ElementIdを指定
	     	screen: [
			{ resolution: { w: 1024, h: 768 , x:0, y:0 }}
		]
	}
//(screenで複数Layerを設定可能、対象指定時は順番にscreen[0][1][2]...となる。）

//宣言：

	const game = new GameCore( sysParam );

//パラメータの説明：

	{
	canvasId: "Canvas", //ページのCanvas名称(ElementId)を指定
    	screen: [
		{
		resolution: {
			w: 1024, //Canvas解像度幅　　ページでの実際の大きさはCSSで指定する
			h: 768 , //Canvas解像度高さ
			x:0,//表示位置水平方向オフセット　
			y:0 //表示位置垂直方向オフセット
		}　//screen[0]設定値　このパラメータで解像度が決定(実際の使用Canvasの解像度となる)
		},
		{resolution: { w: 1024, h: 768 , x:0, y:0 } }, //screen[1]設定値
		{resolution: { w: 640, h: 480 , x:0, y:0 } }   //screen[2]設定値
		],
	}
//セットするパラメータのうち、
//オフセットパラメータはscreen[0]を基準位置としての表示位置オフセット(screen[1以降]で有効)

//ゲームループの開始

	game.run();

//requestAnimationFrameの周期毎にタスクを実行する。

	game.screen[n].setInterval(数字)	//設定画面更新間隔(frame)　0の場合、画面の自動書き換えを行わない。
	game.screen[0].backgroundColor(色名)	//塗りつぶし背景色を指定（指定しなければ透過色でクリア）

``` 

JSDOC Document:
[GameCore](https://e3sh.github.io/WebGameCoreSystem/documents/GameCore.html)

*ゲームタスク*

----------------------------------------
```Javascript
	game.task.add( new gametask( id ));
	game.task.del(  id );
	game.task.read( id );

	//id：管理用に任意の重複しない文字列や数字を指定する。

	//*タスクの雛形*

	class gametask( id ) extends Gametask {
		constructor(id){
			super(id);
			//new　で実行される。
		}
		init( g ){}// task.add時に実行される。
		pre( g ){} // 最初の実行時に実行。
		step( g ){}// this.enable が true時にループ毎に実行される。　
		draw( g ){}// this.visible が true時にループ毎に実行される。
		post( g ){}// task.delで終了時に実行される。
	}

	this.enable = true; // true : run step  false: pause step
	this.visible = true; // true: run draw  false: pause draw

//gにはGameCoreオブジェクトが入るので、
//これ経由でデバイスやアセットにアクセスする。  
```
JSDOC Document:
[GameTaskControl](https://e3sh.github.io/WebGameCoreSystem/documents/GameTaskControl.html)

**アセット管理**

----------------------------------------

Imageやaudioオブジェクトを管理
```Javascript
	game.asset.imageLoad( id , url ); //戻り値 Imageオブジェクト
	game.asset.soundLoad( id , url ); //戻り値 audioオブジェクト(拡張子なしで）

	game.asset.image[ id ];
	game.asset.sound[ id ];

	game.asset.*.ready //true:ロード完了　false:ロード未完了または失敗
```
JSDOC Document:
[GameAssetManager](https://e3sh.github.io/WebGameCoreSystem/documents/GameAssetManager.html)

**デバイス管理**

----------------------------------------
**表示関係**

JSDOC Document:
[DisplayControl](https://e3sh.github.io/WebGameCoreSystem/documents/DisplayControl.html)

- JSDOC Document:スプライト
[GameSpriteControl](https://e3sh.github.io/WebGameCoreSystem/documents/GameSpriteControl.html)

- JSDOC Document:スプライトフォント(タイルパターン表示）
[GameSpriteFontControl](https://e3sh.github.io/WebGameCoreSystem/documents/GameSpriteFontControl.html)

- JSDOC Document:スプライトフォント(ASCII/UTF-16文字テーブル固定サイズフォント表示）
[fontPrintControl](https://e3sh.github.io/WebGameCoreSystem/documents/fontPrintControl.html)

**入力**  
*キーボード*
```Javascript

	game.keyboard.check();  
	
    //戻り値: 配列[キーコード]がtureで押下/falseまたは値が無い場合は押していない状態
    // Boolean(戻り値配列[キーコード])　が偽の場合も押していない状態。

	//[SPACE]が押されている場合
	let keystate = game.keyboard.check();
	//結果:keystate = {32:true};

//キーコード直接指定で状態確認する場合は以下のようにしてください
	//Example:[SPACE]が押されている場合　(将来的に指定値は変更されます　keyCode:32　code:”Space”）
	let keydown = game.keyboard.inquiryKey(32);
	//結果:keydown = true;
    //注意：keyCodeの使用がMDNで非推奨となっているので、指定値変更の可能性あり。(codeモード)（現在はKeyCodeで参照）

主要キーはBoolで返すプロパティがあるのでそれらを使用すること。.check()毎に状態の更新チェックがされます

	game.keyboard
		.upkey; .downkey; .leftkey; .rightkey;
		.shift; .ctrl; .alt; .space;
		.qkey; .wkey; .ekey;
		.akey; .skey; .dkey;
		.zkey; .xkey; .ckey;
```
JSDOC Document:
[inputKeyboard](https://e3sh.github.io/WebGameCoreSystem/documents/inputKeyboard.html)

*マウス*
```Javascript

	game.mouse.check();  
	game.mouse.check_last(); 最後に実行したcheckの戻り値を返す。  
	
	(戻り値) 
 	.x
  	.y
   	.button
	.wheel
```
JSDOC Document:
[inputMouse](https://e3sh.github.io/WebGameCoreSystem/documents/inputMouse.html)

*タッチパネル*
```Javascript

	game.touchpad.check();
```
JSDOC Document:
[inputTouchPad](https://e3sh.github.io/WebGameCoreSystem/documents/inputTouchPad.html)

*ゲームパッド*
```Javascript

	game.gamepad.check();
	game.joystick.check();
```
JSDOC Document:
[inputGamepad](https://e3sh.github.io/WebGameCoreSystem/documents/inputGamepad.html)

**サウンド**  
*オーディオ再生*
```Javascript

	game.sound.play( id ); 
	//id: assetで読み込ませたsoundのID   
	
	game.sound.effect( id );  
	// 最初から再生
```
JSDOC Document:
[soundControl](https://e3sh.github.io/WebGameCoreSystem/documents/soundControl.html)

[*BEEP/SoundGenerator*](https://e3sh.github.io/BeepFunction)
```Javascript

	note = game.beep.noteCreate();
	//score [{[name.],Freq:,Vol;,time:,use:false},..]

	note.play(score, starttime(game.time();));
```
JSDOC Document:
[Beepcore](https://e3sh.github.io/WebGameCoreSystem/documents/Beepcore.html)

**他**

*システムステータス等*
```Javascript

	game.fpsload.result()
	(戻り値)
	.fps
	.interval
	.workload

	game.time()
	(戻り値)game.runしてからの累積時間(ms)

	game.deltaTime()
	(戻り値)フレーム間隔(ms)

	game.blink()
	(戻り値)bool　1.5秒間隔で1秒true/0.5秒falseを戻す。
```
JSDOC Document:
[GameCore](https://e3sh.github.io/WebGameCoreSystem/documents/GameCore.html)

----------------------------------------
## 技術スタック

*   **JavaScript**: エンジン全体のプログラミング言語。
*   **Web Audio API**: サウンド合成（シンセサイザー）機能に利用。
*   **HTML Canvas API**: グラフィック描画の中核技術。
*   **Web Gamepad API**: ゲームパッド入力の取得に利用。
*   **DOM API**: HTML要素の操作、イベントリスニングに使用。

## 動作環境

*   **最新のWebブラウザ**: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edgeなど、Web Audio API、HTML Canvas API、Web Gamepad APIをサポートする環境で動作します。
    *   特に、`OffscreenCanvas`などの機能は比較的新しいAPIであるため、最新のブラウザでの動作を推奨します。

## ライセンス
[MIT License]





