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
 * @param {GameCoreSysParam} sysParam
 * @example 
 * //宣言：
 * const game = new GameCore( sysParam );
 * //ゲームループの開始：
 * game.run();
 * @description
 * - ゲームタスク: .task
 * - アセット管理: .asset
 * - 描画/表示レイヤー: .screen[n]
 * - 描画/スプライト: .sprite .font
 * - 入力/キーボード: .keyboard
 * - 入力/マウス: .mouse
 * - 入力/タッチパネル: .touchpad
 * - 入力/ゲームパッド: .gamepad (alias).joystick
 * - サウンド/オーディオ再生: .sound .effect
 * - サウンド/シンセシス: .beep
 * - システム状態管理/.fpsload .time .delta 
 */ 
class GameCore {

	/**
	 * @type {GameTaskControl}
	 */
	task;
	/**
	 * @type {GameAssetManager}
	 */
	asset;
	/**
	 * @type {DisplayControl[]}
	 */
	screen;
	/**
	 * @type {GameSpriteControl}
	 */
	sprite;
	/**
	 * @type {GameSpriteFontControl}
	 */
	font;
	/**
	 * @type {inputKeyboard}
	 */
	keyboard;
	/**
	 * @type {inputMouse}
	 */
	mouse;
	/**
	 * @type {inputTouchPad}
	 */
	touchpad;
	/**
	 * @type {inputGamepad}
	 */
	gamepad;
	/**
	 * @type {soundControl}
	 */
	sound;
	/**
	 * @type {soundControl}
	 */
	effect;
	/**
	 * @type {Beepcore}
	 */
	beep;
	/**
	 * @returns {result} fps/workload result 
	 * @example
	 * .fpsload.result() 
	 * result -> {
	 * 	fps: number,
	 * 	interval:{log:[],max:number, min:number, ave:number},
	 * 	workload:{log:[],max:number, min:number, ave:number}
	 * }
	 */
	fpsload;
	/**
	 * @returns {number} gameCore running time(ms)
	 */
	time;
	/**@method
	 * @returns {number} deltatime(ms)
	 */
	delta;
	/**@method
	 * @return {boolean} 1.5s true 0.5s false cycles pulse
	 */
	blink;

	/**
	 * @param {GameCoreSysParam} sysParam システム初期設定パラメータ
	 */
	constructor(sysParam) {

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
		this.task = task_;
		this.asset = asset_;

		this.keyboard = keyboard_;
		this.mouse = mouse_;

		this.gamepad = joystick_;
		this.joystick = joystick_;

		this.touchpad = touchpad_;

		this.vgamepad = vGpad_;

		this.dsp = screen_[0];
		this.screen = screen_;

		this.viewport = viewport_;

		this.sound = sound_;
		this.beep = beep_;
		//
		this.sprite = sprite_;
		this.font = font_;

		this.state = {};

		/**
		 * FPS/workload count Utility
		 * @method
		 */
		this.fpsload = tc;

		/**
		 * @method
		 * @return {number} 1フレームの時間を返す(ms)
		 */
		this.deltaTime = tc.readTime; //

		/**
		 * @method
		 * @return {number} エンジンが起動してからの経過時間を返す(ms)
		 */
		this.time = tc.nowTime; //

		/**
		 * @method
		 *　@return {boolean} 一定間隔(1.5s/0.5s)でtrue/falseを返す
		 */
		this.blink = tc.blink; //function return bool


		// init
		sprite_.useScreen(0);

		/**
		 * ゲームループの開始
		 * requestAnimationFrameの周期毎にタスクを実行する。
		 * @method
		 */
		this.run = function () {
			runStatus_ = true;

			requestAnimationFrame(loop);
		};

		/**
		 * 
		 * ゲームループの停止
		 * @method
		 */
		this.pause = function () {
			runStatus_ = false;
		};

		/**
		 *　FPSや負荷の計測用
		 */
		function bench() {

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
			 */
			this.start = function () {

				oldtime = newtime;
				newtime = performance.now(); //Date.now();
			};

			/**
			 * 負荷計測区間終了指示
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
			 * @return {object}　計測結果(.interval　.workload)
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
			 * @param {number} t now time(ms)
			 */ 
			this.setTime = function (t) {
				ot = dt;
				dt = t;

				blinkCounter = blinkCounter + (dt - ot);
				if (blinkCounter > BLINK_ITVL) blinkCounter = 0.0;
			};

			/**
			 * @return {number} 1フレームの時間を返す(ms)
			 */
			this.readTime = function () {
				return dt - ot; //deltaTimeを返す(ms) 実績　Chrome PC:float/iOS,iPadOS:Integer
			};

			/**
			 * @return {number} エンジンが起動してからの経過時間を返す(ms)
			 */
			this.nowTime = function () {
				return dt; //lifeTimeを返す(ms)
			};

			/**
			 *　@return {boolean} 一定間隔(1.5s/0.5s)でtrue/falseを返す
			*/
			this.blink = function () {
				//return blinkCounter + ":" + BLINK_ITVL + ":" + dt;//(parseInt(blinkCounter) < BLINK_TIME)?true:false;
				return (blinkCounter < BLINK_TIME) ? true : false;
			};
		}
	}
}

