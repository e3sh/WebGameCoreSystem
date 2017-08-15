GameCore　/Javascript
===
作成中...???


----------------------------------------

**実行方法**

*システムの宣言*

システム初期パラメータ（表示対象のキャンバスと解像度の指定）
	
例： 

     var sysParam = [  
         	{ canvasId: "layer0", resolution: { w: 640, h: 480 } }  
         ]  	
  
(複数キャンバス指定可能、対象指定時、順番にscreen[0～]となる。）

	var game = new GameCore( sysParam );

*ゲームループの開始*

	game.run();

requestAnimationFrameの周期毎にタスクを実行する。

*ゲームタスク*

----------------------------------------
	game.task.add( new gametask( id );
	game.task.del( new gametask( id );
	game.task.read( id );

id：管理用に任意の重複しない文字列や数字を指定する。

*タスクの雛形*
 
	function gametask( id ){};
	this.id = id;	

	this.enable = true; // true : run step  false: pause step
	this.visible = true; // true: run draw  false: pause draw
	this.preFlag = false;

	task.init( g ){}// task.add時に実行される。
	task.pre( g ){} // 最初の実行時に実行。
	task.step( g ){}// this.enable が true時にループ毎に実行される。　
	task.draw( g ){}// this.visible が true時にループ毎に実行される。
	task.post( g ){}// task.delで終了時に実行される。


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


**デバイス管理**

----------------------------------------
*スプライトやイメージ表示*


*スプライトの表示　他*
	
表示するスプライトの設定  

	game.sprite.set( spNumber, PatternID,   
		[bool: colisionEnable],   
		[int: colWidth], [int: colHeight] );  
		

(表示先の変更:  

		game.sprite.useScreen( screen no );  
		
)  

	game.sprite.pos( spNumber, x, y, [r], [zoom] ) //スプライト表示位置指定　	
	(game.sprite.put( spNumber, x, y, [r], [zoom] )　//スプライトの表示(個別))
	game.sprite.allDrawSprite(); //登録中スプライトの表示


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
	
(表示先の変更:  

		game.font[ fontID ].useScreen( screen no );  
		
)  

*スプライトフォント定義* （できれは、game.run()の前に事前セットアップ要。）

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
	
戻り値: {} *.x *.y *.button *.wheel


**サウンド**

	game.sound.play( id ); 
	//id: assetで読み込ませたsoundのID   
	
	game.sound.effect( id );  
	// 最初から再生


**ストレージ**

(未実装)
	game.storage.save( key ,data );とか


**他**

----------------------------------------
追加するjsファイルはincludeで追加しないとロードエラーになります。

