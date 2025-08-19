/**
 * システム初期パラメータ（表示対象のキャンバスと解像度の指定）
 * @typedef {object} GameCoreSysParam システム初期設定用パラメータ
 * @property {string} canvasId canvasDOM Id
 * @property {number} screen[].resolution.w screen width pixelsize
 * @property {number} screen[].resolution.h screen height pixelsize
 * @property {number} screen[].resolution.x screen offset x
 * @property {number} screen[].resolution.y screen offset y
 * @example
const GameCoreSysParam = {
	CanvasId:"canvas",
	screen: [
		{resolution: {w:1024, h:768, x:0, y:0}},
		{resolution: {w:1024, h:768, x:0, y:0}}
	]
}
 * @description
 * -複数のScreenを設定可能、
 * -対象指定時、順番にgame.screen[0], game.screen[1] ...　となる
 * -定数値にして名前を付けた方が管理が判りやすくなります
 * 
 */
/**
 * ゲームエンジン本体
 * @summary ゲームエンジン本体/インスタンス化して実行
 * 実行時のエントリーポイント
 * @param {GameCoreSysParam} sysParam システム初期設定パラメータ
 * @example 
 * //宣言：
 * const game = new GameCore( sysParam );
 * //game.screen[0]のパラメータが実際の使用Canvasの解像度となる。 
 * //offsetパラメータはscreen[0]を基準位置としての表示位置offset。(screen[1以降]で有効)　
 * //ScreenはoffscreenBufferとして処理され、指定した解像度で作成される。 
 * 
 * //ゲームループの開始：
 * game.run();
 * //requestAnimationFrameの周期毎にタスクを実行する。
 * 
 * @description
 * ゲームエンジンの主要なインスタンスであり、実行時のエントリーポイントです。.<br>\
 * ゲームタスク、アセット管理、描画レイヤー、入力デバイス、<br>\
 * サウンドシステムなど、全てのコア機能を統合し制御します。
 */ 
class GameCore {
	/**
	 * @param {GameCoreSysParam} sysParam システム初期設定パラメータ
	 * @description
	 * GameCoreインスタンスを初期化し、ゲームの基盤となるコンポーネントを設定します。<br>\
	 * 入力デバイス、サウンド、描画システム、アセットマネージャーなどを生成し、<br>\
	 * メインループが動作するための準備を整えます。
	 */
	constructor(sysParam) {

		/**
		 * FPSや負荷の計測用(内部関数)
		 * @class GameCore.bench
		 * @classdesc
		 * ゲームのFPS（フレームレート）とワークロード（処理負荷）を計測するユーティリティです。<br>\
		 * フレームごとの時間間隔と処理時間を記録し<br>\
		 * 平均、最大、最小値として結果を提供します。
		 */
		class bench {
			/**
			 * 
			 */
			constructor() {

				let oldtime; let newtime; // = Date.now();
				let cnt = 0;

				let fps_log = []; let load_log = [];
				let log_cnt = 0;
				let log_max = 0;

				let workload; let interval;

				let fps = 0;

				let dt = 0;
				let ot = 0;

				let blinkCounter = 0;
				const BLINK_ITVL = 1500;
				const BLINK_TIME = 500;

				//let ypos = 412;
				/**
				 * 負荷計測区間開始指示
				 * @method
				 * @description
				 * 処理負荷計測区間の開始を指示します。<br>\
				 * このメソッドが呼ばれた時点のパフォーマンスタイムスタンプを記録し、<br>\
				 * 次の`end`メソッドまでの時間を測定します。
				 */
				this.start = function () {

					oldtime = newtime;
					newtime = performance.now(); //Date.now();
				};

				/**
				 * 負荷計測区間終了指示
				 * @method
				 * @description
				 * 処理負荷計測区間の終了を指示し、計測データを記録します。<br>\
				 * `start`からの処理時間（ワークロード）とフレーム間隔を計算し、<br>\
				 * パフォーマンスログに追加します。
				 */
				this.end = function () {

					workload = performance.now() - newtime; //Date.now() - newtime;
					interval = newtime - oldtime;

					if (log_cnt > log_max) log_max = log_cnt;
					fps_log[log_cnt] = interval;
					load_log[log_cnt] = workload;

					log_cnt++;
					if (log_cnt > 59) log_cnt = 0;

					let w = 0;
					for (let i = 0; i <= log_max; i++) {
						w += fps_log[i];
					}

					cnt++;

					//fps = parseInt(1000 / (w / (log_max + 1)));
					fps = 1000 / (w / (log_max + 1));
				};

				/**
				 * @typedef {object} resultLog 計測結果
				 * @property {number} FPS FPS
				 * @property {number[]} interval.log フレーム時間ログ
				 * @property {number} interval.max　最大値
				 * @property {number} interval.min　最小値
				 * @property {number} interval.ave　平均値
				 * @property {number[]} workload.log 負荷ログ
				 * @property {number} workload.max　最大値
				 * @property {number} workload.min　最小値
				 * @property {number} workload.ave　平均値
				 */
				/**
				 * @method
				 * @return {resultLog}　計測結果(.interval　.workload)
				 * @description
				 * FPSとワークロードの計測結果をオブジェクトで返します。<br>\
				 * 各ログの平均、最大、最小値を含む詳細なパフォーマンスデータを提供し、<br>\
				 * ゲームの最適化に役立ちます。
				 */
				this.result = function () {

					let int_max = 0;
					let int_min = 999;
					let int_ave = 0;

					let load_max = 0;
					let load_min = 999;
					let load_ave = 0;

					let wlod = 0;
					let wint = 0;
					for (let i = 0; i <= log_max; i++) {
						//fstr += fps_log[i] + " ";
						//lstr += load_log[i] + " ";
						if (int_max < fps_log[i]) int_max = fps_log[i];
						if (int_min > fps_log[i]) int_min = fps_log[i];

						if (load_max < load_log[i]) load_max = load_log[i];
						if (load_min > load_log[i]) load_min = load_log[i];

						wlod += load_log[i];
						wint += fps_log[i];
					}

					//int_ave = parseInt(wint / (log_max + 1));
					//load_ave = parseInt(wlod / (log_max + 1));
					int_ave = wint / (log_max + 1);
					load_ave = wlod / (log_max + 1);

					let r = {};

					r.fps = fps;

					let wl = {};
					wl.log = fps_log;
					wl.max = load_max;
					wl.min = load_min;
					wl.ave = load_ave;

					let iv = {};
					iv.log = fps_log;
					iv.max = int_max;
					iv.min = int_min;
					iv.ave = int_ave;

					r.interval = iv;
					r.workload = wl;

					return r;
				};

				/**
				 * blink用の基準時間を呼び出し元からもらう
				 * @method
				 * @param {number} t now time(ms)
				 * @description
				 * 点滅（blink）機能の基準となる現在のシステム時刻を受け取ります。<br>\
				 * この時刻情報を使って、点滅カウンターを更新し<br>\
				 * 点滅状態の判定に利用します。
				 */
				this.setTime = function (t) {
					ot = dt;
					dt = t;

					blinkCounter = blinkCounter + (dt - ot);
					if (blinkCounter > BLINK_ITVL) blinkCounter = 0.0;
				};

				/**
				 * @method
				 * @return {number} 1フレームの時間を返す(ms)
				 * @description
				 * 直前のフレームに要した時間（デルタタイム）をミリ秒単位で返します。<br>\
				 * この値は、フレームレートが変動する環境での<br>\
				 * ゲームロジックの調整に利用できます。
				 */
				this.readTime = function () {
					return dt - ot; //deltaTimeを返す(ms) 実績　Chrome PC:float/iOS,iPadOS:Integer
				};

				/**
				 * @method
				 * @return {number} エンジンが起動してからの経過時間を返す(ms)
				 * @description
				 * ゲームエンジンが起動してからの経過時間（ライフタイム）をミリ秒単位で返します。<br>\
				 * これは、ゲーム全体を通じた時間の管理や <br>\
				 * 特定のイベントのタイミング制御に利用できます。
				 */
				this.nowTime = function () {
					return dt; //lifeTimeを返す(ms)
				};

				/**
				 * @method
				 * @return {boolean} 一定間隔(1.5s/0.5s)でtrue/falseを返す
				 * @description
				 * 一定の間隔（1.5秒`true`、0.5秒`false`）で`true`/`false`を繰り返すブール値を返します。<br>\
				 * UI要素の点滅表示や、周期的なイベントのトリガーなど <br>\
				 * 視覚的な合図や時間制御に利用できます。
				 */
				this.blink = function () {
					//return blinkCounter + ":" + BLINK_ITVL + ":" + dt;//(parseInt(blinkCounter) < BLINK_TIME)?true:false;
					return (blinkCounter < BLINK_TIME) ? true : false;
				};
			}
		}

		let runStatus_ = false;

		const task_ = new GameTaskControl(this);

		//device setup
		const keyboard_ = new inputKeyboard();
		const mouse_ = new inputMouse(sysParam.canvasId);
		const joystick_ = new inputGamepad();
		const touchpad_ = new inputTouchPad(sysParam.canvasId);
		const vGpad_ = new inputVirtualPad(mouse_, touchpad_);

		const beep_ = new Beepcore();

		const screen_ = [];

		const w = sysParam.screen[0].resolution.w;
		const h = sysParam.screen[0].resolution.h;

		const canvas = document.getElementById(sysParam.canvasId);
		canvas.width = w; canvas.height = h;

		this.systemCanvas = canvas;

		const ctx = canvas.getContext("2d");

		for (let i in sysParam.screen) {
			let wsysp = sysParam.screen[i];
			screen_[i] = new DisplayControl(ctx,
				wsysp.resolution.w, wsysp.resolution.h,
				wsysp.resolution.x, wsysp.resolution.y,
				sysParam.offscreen
			);
		}
		const viewport_ = new viewport();
		viewport_.size(w, h); viewport_.border(w / 2, h / 2);
		viewport_.setPos(0, 0); viewport_.repeat(false);

		//
		const sprite_ = new GameSpriteControl(this);

		//
		const font_ = [];

		this.setSpFont = function (fontParam) {

			let fprm = {
				Image: asset_.image[fontParam.id].img,
				pattern: fontParam.pattern
			};
			let wf = new GameSpriteFontControl(this, fprm);

			font_[fontParam.name] = wf;
		};

		//assetsetup
		const asset_ = new GameAssetManager();

		// soundはassetを参照するので↑の後で宣言する。
		const sound_ = new soundControl(asset_);

		// mainloop
		let sysp_cnt = sysParam.screen.length;

		const tc = new bench();
		let sintcnt = []; //screenIntervalCounter
		for (let i = 0; i < sysp_cnt; i++) sintcnt[i] = 0;

		/**
		 * game main roop (requestAnimationFrame callback function)
		 * @param {number} t calltime/performance.now()
		 * @description
		 * ゲームのメインループとして機能する`requestAnimationFrame`のコールバック関数です。<br>\
		 * 毎フレーム、タスクの更新、ビープ音の再生、描画バッファのクリア、<br>\
		 * スプライトの描画、最終的な画面反映といった一連の処理を実行します。
		 */
		function loop(t) {
			if (runStatus_) {

				tc.setTime(t);
				tc.start();

				task_.step();
				beep_.step(t); //beep play再生用

				for (let i = 0; i < sysp_cnt; i++) {
					if (screen_[i].getInterval() - sintcnt[i] == 1) {
						screen_[i].reflash();
						screen_[i].clear();
						//これで表示Bufferがクリアされ、先頭に全画面消去が登録される。
					}
				}

				task_.draw();
				sprite_.allDrawSprite(); //スプライトをBufferに反映する。

				for (let i = 0; i < sysp_cnt; i++) {
					screen_[i].draw();
					//これで全画面がCanvasに反映される。
				}

				tc.end();

				for (let i = 0; i < sysp_cnt; i++) {
					sintcnt[i]++;
					if (sintcnt[i] >= screen_[i].getInterval()) sintcnt[i] = 0;
				}
				//run
				requestAnimationFrame(loop); //"use strict"対応

			} else {
				//pause
			}
		}

		//public propaty and method
		/**
		 * @type {GameTaskControl}
		 */
		this.task = task_;
		/**
 		 * @type {GameAssetManager}
		 */
		this.asset = asset_;

		/**
		 * @type {inputKeyboard}
		 */
		this.keyboard = keyboard_;
		/**
		 * @type {inputMouse}
		 */
		this.mouse = mouse_;
		/**
		 * @type {inputGamepad}
		 */
		this.gamepad = joystick_;
		/**
		 * @type {inputGamepad}
		 */
		this.joystick = joystick_;
		/**
		 * @type {inputTouchPad}
		 */
		this.touchpad = touchpad_;
		/**
		 * @type {inputVirtualPad}
		 */
		this.vgamepad = vGpad_;

		/**
		 * @type {DisplayControl[]}
		 */
		this.dsp = screen_[0];
		/**
		 * @type {DisplayControl[]}
		 */
		this.screen = screen_;
		/**
		 * @type {viewport}
		 */
		this.viewport = viewport_;

		/**
		 * @type {soundControl}
		 */
		this.sound = sound_;
		/**
		 * @type {Beepcore}
		 */
		this.beep = beep_;
		//
		/**
		 * @type {GameSpriteControl}
		 */
		this.sprite = sprite_;
		/**
		 * @type {GameSpriteFontControl}
		 */
		this.font = font_;

		this.state = {};

		/**
		 * FPS/workload count Utility
		 * @type {bench}
		 */
		this.fpsload = tc;

		/**
		 * @method
		 * @return {number} 1フレームの時間を返す(ms)
		 * @description
		 * 直前のフレームに要した時間（デルタタイム）をミリ秒単位で返します。<br>\
		 * この値は、フレームレートが変動する環境での<br>\
		 * ゲームロジックの調整に利用できます。
		 */
		this.deltaTime = tc.readTime; //

		/**
		 * @method
		 * @return {number} エンジンが起動してからの経過時間を返す(ms)
		 * @description
		 * ゲームエンジンが起動してからの経過時間（ライフタイム）をミリ秒単位で返します。<br>\
		 * これは、ゲーム全体を通じた時間の管理や <br>\
		 * 特定のイベントのタイミング制御に利用できます。
		*/
		this.time = tc.nowTime; //

		/**
		 * @method
		 *　@return {boolean} 一定間隔(1.5s/0.5s)でtrue/falseを返す
		 * @description
		 * 一定の間隔（1.5秒`true`、0.5秒`false`）で`true`/`false`を繰り返すブール値を返します。<br>\
		 * UI要素の点滅表示や、周期的なイベントのトリガーなど <br>\
		 * 視覚的な合図や時間制御に利用できます。
		 */
		this.blink = tc.blink; //function return bool

		// init
		sprite_.useScreen(0);

		/**
		 * ゲームループの開始
		 * requestAnimationFrameの周期毎にタスクを実行する。
		 * @method
		 * @description
		 * ゲームループの実行を開始します。<br>\
		 * `requestAnimationFrame`を介して`loop`関数が周期的に呼び出され<br>\
		 * ゲームの全ての処理が動き始めます。
		 */
		this.run = function () {
			runStatus_ = true;

			requestAnimationFrame(loop);
		};

		/**
		 * ゲームループの停止
		 * @method
		 * @description
		 * ゲームループの実行を一時停止します。<br>\
		 * これにより`requestAnimationFrame`の呼び出しが止まり、<br>\
		 * ゲームの更新や描画が中断されます。
		 */
		this.pause = function () {
			runStatus_ = false;
		};
	}
}

