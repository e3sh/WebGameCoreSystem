GameCore　/Javascript
===
**Personal Web Game Library.**

UPDATE 2024.04.13. スプライト周りを変更したのでサンプルが動作しなくなっています。

https://e3sh.github.io/WebGameCoreSystem/sample/sample1.html

https://e3sh.github.io/WebGameCoreSystem/sample/sample2.html


 UPDATE 2024.02.21. ↑↑↑ 動作サンプルのリンクを追加 ↑↑↑ 　
 
 UPDATE 2023.08.19. フォルダ構成の変更など。

 FirstCommit [committed on Nov 23, 2012] ...← 注)現時点でも10年以上前からほとんど変わってません

----------------------------------------
特徴
---
- ローカルで動作する(サーバが必要になるようなimport/exportを使ってない）
- WebGL未使用(使用方法が難しくて理解できない為）
- ライブラリ未使用(ローカルで動かなかったり、複数環境で試したときにライブラリ要因になると判らん為
- (↑他のライブラリの理解が面倒で....）

8bitPCでBASICでプログラムしてた頃のように、

書き換え即実行で試しながらWebブラウザでゲームを作る為の

自分用プログラムライブラリです。
かなり色々足りてませんが、必要時はアプリケーション側で作成して取り込み予定

----------------------------------------

**実行方法**

*システムの宣言*

システム初期パラメータ（表示対象のキャンバスと解像度の指定）
	
例：

	const sysParam = {
	 	canvasId: "Canvas",//キャンバス名指定
	     	screen: [
			{ resolution: { w: 1024, h: 768 , x:0, y:0 }}
		]
	}

	(複数Screenで指定可能、対象指定時、順番にscreen[0～]となる。）

宣言：

	const game = new GameCore( sysParam );

パラメータの説明：

	{
	canvasId: "Canvas",//ページのCanvas名称を指定。
    	screen: [
		{
		resolution: {
			w: 1024,
			h: 768 ,
			x:0,//offset X
			y:0 //offset Y
		}
		},
		{resolution: { w: 1024, h: 768 , x:0, y:0 } },
		{resolution: { w: 640, h: 480 , x:0, y:0 } }
		],
	}
 
セットするパラメータから、
game.screen[0]のパラメータで解像度が決定(実際の使用Canvasの解像度となる。

offsetパラメータはscreen[0]を基準位置としての表示位置offset。(screen[1以降]で有効)

他のScreenはoffscreenBufferとして処理され、指定した解像度で作成される。


*ゲームループの開始*

	game.run();

requestAnimationFrameの周期毎にタスクを実行する。

	game.screen[n].setInterval(数字)	設定画面更新間隔(frame)　0の場合、画面の自動書き換えを行わない。
	game.screen[0].backgroundColor(色名)	塗りつぶし背景色を指定（指定しなければ透過色でクリア）

*ゲームタスク*

----------------------------------------
	game.task.add( new gametask( id ));
	game.task.del(  id );
	game.task.read( id );

id：管理用に任意の重複しない文字列や数字を指定する。

*タスクの雛形*

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

gにはGameCoreオブジェクトが入るので、
これ経由でデバイスやアセットにアクセスする。  
（他タスクのコントロールをして階層制御なども考えられる）

**アセット管理**

----------------------------------------
Imageやaudioオブジェクトを管理

	game.asset.imageLoad( id , url ); 戻り値 Imageオブジェクト
	game.asset.soundLoad( id , url ); 戻り値 audioオブジェクト(拡張子なしで）

	game.asset.image[ id ];
	game.asset.sound[ id ];

	game.asset.*.ready //true:ロード完了　false:ロード未完了または失敗

各種データも管理(未実装)
遅延ロード(未実装)

**デバイス管理**

----------------------------------------
*スプライトやイメージ表示*


*スプライトの表示　他*
	
	表示するスプライトの設定  
	(2024/04/12-)//New Function Method
	game.sprite.set( spNumber, PatternID,   
		[bool: colisionEnable],   
		[int: colWidth], [int: colHeight] );  
	
 	.itemCreate = function(Ptn_id, col=false, w=0, h=0 ) return item	

	.spriteItem
    		.view()/Hide() visible true/false
    		.pos = function(x, y, r=0, z=0)
    		.move = function(dir, speed, aliveTime)
    		.stop = function()
    		.dispose = function()
    		.put = function (x, y, r, z) 
    		//.reset = function()

	(2024/04/12-)
	//New Function Method
	.itemCreate = function(Ptn_id, col=false, w=0, h=0 ) return item
	.itemList = function() return SpriteTable
	.itemFlash = function()
	.itemIndexRefresh = function()
	.CollisionCheck = function()

	 (表示先の変更:  

		game.sprite.useScreen( screen no );  
		
	)	  

	game.sprite.pos( spNumber, x, y, [r], [zoom] ) //スプライト表示位置指定　	
	(game.sprite.put( spNumber, x, y, [r], [zoom] )　//スプライトの表示(個別))


 
 	.manualDraw = function (bool) (modeChange)
 	//game.sprite.allDrawSprite(); //登録中スプライトの表示　システムが自動的に呼びます。


	簡易移動  

	game.sprite.setMove( spNumber, 方向(0-359),
		 1フレームの移動量, 消えるまでのフレーム数(0:消えない));

	衝突判定  

	game.sprite.check( spNumber ); return 衝突しているSpNumberの配列[]

	状態確認  

	game.sprite.get( spNumber ); return spState
	game.sprite.get(); return 表示していない(空きの）SpNumber

*スプライトパターン定義*

	game.sprite.setPattern( PatternID ,{
		image: ImageId,
		wait: アニメーション変更間隔（フレーム数）
		pattern: [
		{ x:  , y:  , w:  , h:  , r:  , fv:(bool), fh:(bool) },
		{ x:  , y:  , w:  , h:  , r:  , fv:(bool), fh:(bool) },
		
		{ x:  , y:  , w:  , h:  , r:  , fv:(bool), fh:(bool) }
			]
		}
	)
	x,y,w,h : イメージ範囲指定　r:向き(0-359)上基準 putでr指定しない場合に有効
	fv:trueで上下反転　fh:trueで左右反転


*スプライトフォント*  

	game.font[ fontID ].putchr( text, x, y, [zoom] );
	
	表示先の変更:  

	game.font[ fontID ].useScreen( screen no );  
  

*スプライトフォント定義* 

	(ascii code [space]～[~]まで）
	var fontParam = {
		name: fontID
		id: 使用するassetImageのID
		pattern: [
			{x: ,y: ,w: ,h: ], //space
				|
			{x: ,y: ,w: ,h: ] //~
		]
	}
	
	game.setSpFont( fontParam );


**入力**  
*キーボード*

	game.keyboard.check();  
	
	戻り値: 配列[キーコード]がtureで押下/falseまたは値が無い場合は押していない状態

	Boolean(戻り値配列[キーコード])　が偽の場合も押していない状態。

	注意点として入力チェックするときは 値の有無チェック後実行しないとエラーになる。

例：

	var keystate = game.keyboard.check();
	if (Boolean(keystate[32])) {
		if (keystate[32]) {
			//push space bar↓
		}
	}

主要キーはBoolで返すプロパティあり。

	game.keyboard
		.upkey; .downkey; .leftkey; .rightkey;
		.shift; .ctrl; .alt; .space;
		.qkey; .wkey; .ekey;
		.akey; .skey; .dkey;
		.zkey; .xkey; .ckey;

*マウス*

	game.mouse.check();  
	game.mouse.check_last(); 最後に実行したcheckの戻り値を返す。  
	
	(戻り値) 
 	.x
  	.y
   	.button
	.wheel

*タッチパネル*

	game.touchpad.check();

*ゲームパッド*

	game.gamepad.check();
	game.joystick.check();

**サウンド**

	game.sound.play( id ); 
	//id: assetで読み込ませたsoundのID   
	
	game.sound.effect( id );  
	// 最初から再生

**ストレージ**

(未実装)
	game.storage.save( key ,data );とか

**他**

*システムステータス等*

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

----------------------------------------
追加するjsファイルはincludeで追加しないとロードエラーになります。

