GameCore　/Javascript

作成中...

----------------------------------------

実行方法

システムの宣言

	システム初期パラメータ（表示対象のキャンバスと解像度の指定）
	
	例：
	var sysParam = [
        	{ canvasId: "layer0", resolution: { w: 640, h: 480 } }
        ]	

	(複数キャンバス指定可能、対象指定時、順番にscreen[0～]となる。）

	var game = new GameCore( sysParam );

ゲームループの開始

	game.run();

	requestAnimationFrameの周期毎にタスクを実行する。

ゲームタスク

----------------------------------------
	game.task.add( new gametask( id );
	game.task.del( new gametask( id );
	game.task.read( id );

id：管理用に任意の重複しない文字列や数字を指定する。

タスクの雛形
 
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

アセット管理

----------------------------------------
Imageやaudioオブジェクトを管理

	game.asset.imageLoad( id , url ); 戻り値 Imageオブジェクト
	game.asset.soundLoad( id , url ); 戻り値 audioオブジェクト(拡張子なしで）

	game.asset.image[ id ];
	game.asset.sound[ id ];

	game.asset.*.ready //true:ロード完了　false:ロード未完了または失敗

各種データも管理(未実装)


デバイス管理

----------------------------------------
スプライトやイメージ表示

今の所、仮で今まで作成したシステム流用で仮表示。

	game.dsp.put( SpriteID, x, y, r, alpha, zoom);
	game.dsp.print(text, x, y); 

(調整中）
	game.sprite.set( spNumber, PatternID )
	game.sprite.put
	game.sprite.setPattern(

など

スプライトフォント

	game.font[ fontID ].putchr( text, x, y, zoom );
	
	(表示先の変更:
		game.font[ fontID ].useScreen( screen no );
	)

	game.run()の前に事前セットアップ要。

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


入力
キーボード

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

現状だと面倒なので、主要キーはBoolで返すプロパティを用意することも検討中
(game.keyboard,upkey とか　game.keyboard,zkey とか)


マウス

	game.mouse.check();
	game.mouse.check_last(); 最後に実行したcheckの戻り値を返す。
	戻り値: {} *.x *.y *.button *.wheel


サウンド

(未実装)
	game.sound.play( id );とか

ストレージ

(未実装)
	game.storage.save( key ,data );とか


他

----------------------------------------
追加するjsファイルはincludeで追加しないとロードエラーになります。
自分でもソース確認しないとわからなくなってます。
