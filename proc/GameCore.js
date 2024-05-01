// GameCore
//

function GameCore( sysParam ) {

    //let sysParam = [
    //{ canvasId: "Layer0", resolution: { w: 640, h: 480 } }
    //]

    // requestAnimationFrame
    let fps_ = 60; //fps

    let fnum_ = 0;
    let oldtime_ = Date.now();

    // 各ブラウザ対応

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback, element) {

		    fnum_++;
		    if (fnum_ > fps_) {
		        fnum_ = 1;
		        oldtime_ = Date.now();
		    }

		    let targettime_ = oldtime_ + Math.round(fnum_ * (1000.0 / fps_));
		    let newtime_ = Date.now();
		    let waittime_ = targettime_ - newtime_;

		    if (waittime_ <= 0) waittime_ = 1;

		    setTimeout(callback, waittime_);
		};
    })();
    //

	//constructor
	let runStatus_ = false;

	let task_ = new GameTaskControl( this );

	//device setup
	let keyboard_ = new inputKeyboard();
	let mouse_ = new inputMouse();
	let joystick_ = new inputGamepad();
	let touchpad_ = new inputTouchPad( sysParam.canvasId );//<=とりあえずにscreen[4-]のキャンバス指定
	let vGpad_ = new inputVirtualPad(mouse_, touchpad_);

	let beep_ = new Beepcore();

	let screen_ = [];

	let w = sysParam.screen[0].resolution.w;
	let h = sysParam.screen[0].resolution.h;

	let canvas = document.getElementById(sysParam.canvasId);
    canvas.width = w; canvas.height = h;

	this.systemCanvas = canvas;

	let ctx = canvas.getContext("2d");

	for (let i in sysParam.screen) {
	    let wsysp = sysParam.screen[i];
	    screen_[i] = new DisplayControl(ctx, 
			wsysp.resolution.w, wsysp.resolution.h,
			wsysp.resolution.x, wsysp.resolution.y,
			sysParam.offscreen
			);
	}
	//if (sysParam.length > 0) { let dsp_ = screen_[0]; }
	let viewport_ = new viewport();
    viewport_.size(w, h); viewport_.border(w/2,h/2); 
	viewport_.setPos(0,0); viewport_.repeat(false);

    //
	let sprite_ = new GameSpriteControl(this);
    
    //
	let font_ = [];

	this.setSpFont = function (fontParam) {

	    let fprm = {
	        Image : asset_.image[ fontParam.id ].img,
	        pattern: fontParam.pattern
	    }
	    let wf = new GameSpriteFontControl(this, fprm);

	    font_[fontParam.name] = wf;
	}

	//assetsetup
	let asset_ = new GameAssetManager();

    // soundはassetを参照するので↑の後で宣言する。
    let sound_ = new soundControl( asset_ );

	//document.getElementById("console").innerHTML = "START GAME CORE";
	// mainloop

	let sysp_cnt = sysParam.screen.length;

	//let blinkCounter = 0;
	//const BLINK_ITVL = 21500;
	//const BLINK_TIME = 500;

	let tc = new bench();
	let sintcnt = []; //screenIntervalCounter
	for (let i = 0; i < sysp_cnt; i++) sintcnt[ i ] = 0;

	function loop(t) {
	    if (runStatus_) {
			//t = performance.now(); //フレームレート変動テスト用
			tc.setTime(t);
			tc.start();

			//blinkCounter = blinkCounter  + t;
			//if (blinkCounter > BLINK_ITVL) blinkCounter = 0; 	

			task_.step();
			beep_.step(t);//beep play再生用

			//document.getElementById("manual_1").innerHTML = "";
			//ctx.clearRect(0,0,1024,800);

			for (let i = 0; i < sysp_cnt; i++){
				if (screen_[i].getInterval() - sintcnt[i] == 1){
					screen_[i].reflash();
					//debug:document.getElementById("manual_1").innerHTML +=( i + ":" + screen_[i].getBackgroundcolor());
					screen_[i].clear();
	        		//これで表示Bufferがクリアされ、先頭に全画面消去が登録される。
				}
			}
			
			//task_.step();
	        task_.draw();

			sprite_.allDrawSprite();//スプライトをBufferに反映する。
			//screen_[4].draw();
			for (let i = 0; i < sysp_cnt; i++){
				//if (screen_[i].getInterval() - sintcnt[i] == 1){
				//if (screen_[i].view()) screen_[i].draw(); //<=これはoffscreen側で処理
				screen_[i].draw();
				//これで全画面がCanvasに反映される。
				//}
			}

			tc.end();

			for (let i = 0; i < sysp_cnt; i++) {
				sintcnt[ i ]++;
				if (sintcnt[ i ] >= screen_[ i ].getInterval()) sintcnt[ i ] = 0;
			}
			//run
	        requestAnimationFrame(arguments.callee);
			//setTimeout(arguments.callee, 0);//フレームレート変動テスト用
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

	this.fpsload = tc;

	this.deltaTime = tc.readTime;//
	this.time = tc.nowTime;//
	
	this.blink = tc.blink; //function return bool

    // init
	sprite_.useScreen(0);
    //
	//
	this.run = function () {
	    runStatus_ = true;

	    requestAnimationFrame(loop);
 	}

	//
	//
	//
	this.pause = function(){
		runStatus_ = false;
	}

	//
	//
	//
	function bench() {

		let oldtime; let newtime;// = Date.now();
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
	
		this.start = function () {
	
			oldtime = newtime;
			newtime = performance.now();//Date.now();
		}
	
		this.end = function () {
	
			workload = performance.now() - newtime;//Date.now() - newtime;
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
		}
	
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
			wl.log =  fps_log;
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
		}

		this.setTime = function(t){
			ot = dt;
			dt = t;
			
			blinkCounter = blinkCounter  + (dt - ot);
			if (blinkCounter > BLINK_ITVL) blinkCounter = 0.0; 	

		}

		this.readTime = function(){
			return dt - ot; //deltaTimeを返す(ms) 実績　Chrome PC:float/iOS,iPadOS:Integer
		}

		this.nowTime = function()
		{
			return dt; //lifeTimeを返す(ms)
		}

		this.blink = function(){
			//return blinkCounter + ":" + BLINK_ITVL + ":" + dt;//(parseInt(blinkCounter) < BLINK_TIME)?true:false;
			return (blinkCounter < BLINK_TIME)? true: false;  
		}

	}

}

