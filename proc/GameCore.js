// GameCore
//

function GameCore( sysParam ) {

    //var sysParam = [
    //{ canvasId: "Layer0", resolution: { w: 640, h: 480 } }
    //]

    // requestAnimationFrame
    var fps_ = 60; //fps

    var fnum_ = 0;
    var oldtime_ = Date.now();

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

		    var targettime_ = oldtime_ + Math.round(fnum_ * (1000.0 / fps_));
		    var newtime_ = Date.now();
		    var waittime_ = targettime_ - newtime_;

		    if (waittime_ <= 0) waittime_ = 1;

		    setTimeout(callback, waittime_);
		};
    })();
    //

	//constructor
	var runStatus_ = false;

	var task_ = new GameTaskControl( this );

	//device setup
	var keyboard_ = new inputKeyboard();
	var mouse_ = new inputMouse();
	var joystick_ = new inputGamepad();
	var touchpad_ = new inputTouchPad( sysParam.canvasId );//<=とりあえずにscreen[4-]のキャンバス指定
	var vGpad_ = new inputVirtualPad(mouse_, touchpad_);

	var screen_ = [];

	var canvas = document.getElementById(sysParam.canvasId);
    canvas.width = sysParam.screen[0].resolution.w;
    canvas.height = sysParam.screen[0].resolution.h;

	this.systemCanvas = canvas;

	var ctx = canvas.getContext("2d");

	for (var i in sysParam.screen) {
	    var wsysp = sysParam.screen[i];
	    screen_[i] = new DisplayControl(ctx, 
			wsysp.resolution.w, wsysp.resolution.h,
			wsysp.resolution.x, wsysp.resolution.y,
			sysParam.offscreen
			);
	}
	if (sysParam.length > 0) { var dsp_ = screen_[0]; }

    //
	var sprite_ = new GameSpriteControl(this);
    
    //
	var font_ = [];

	this.setSpFont = function (fontParam) {

	    var fprm = {
	        Image : asset_.image[ fontParam.id ].img,
	        pattern: fontParam.pattern
	    }
	    var wf = new GameSpriteFontControl(this, fprm);

	    font_[fontParam.name] = wf;
	}

	//assetsetup
	var asset_ = new GameAssetManager();

    // soundはassetを参照するので↑の後で宣言する。
    var sound_ = new soundControl( asset_ );

	//document.getElementById("console").innerHTML = "START GAME CORE";
	// mainloop

	var sysp_cnt = sysParam.screen.length;

	//var blinkCounter = 0;
	//const BLINK_ITVL = 21500;
	//const BLINK_TIME = 500;

	var tc = new bench();
	var sintcnt = []; //screenIntervalCounter
	for (var i = 0; i < sysp_cnt; i++) sintcnt[ i ] = 0;

	function loop(t) {
	    if (runStatus_) {
			//t = performance.now(); //フレームレート変動テスト用
			tc.setTime(t);
			tc.start();

			//blinkCounter = blinkCounter  + t;
			//if (blinkCounter > BLINK_ITVL) blinkCounter = 0; 	

			task_.step();

			//document.getElementById("manual_1").innerHTML = "";
			//ctx.clearRect(0,0,1024,800);

			for (var i = 0; i < sysp_cnt; i++){
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
			for (var i = 0; i < sysp_cnt; i++){
				//if (screen_[i].getInterval() - sintcnt[i] == 1){
				//if (screen_[i].view()) screen_[i].draw(); //<=これはoffscreen側で処理
				screen_[i].draw();
				//これで全画面がCanvasに反映される。
				//}
			}

			tc.end();

			for (var i = 0; i < sysp_cnt; i++) {
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

	this.dsp = dsp_;
	this.screen = screen_;

	this.sound = sound_;
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

		var oldtime; var newtime;// = Date.now();
		var cnt = 0; 
	
		var fps_log = []; var load_log = [];
		var log_cnt = 0;
		var log_max = 0;
	
		var workload; var interval;
	
		var fps = 0;

		var dt = 0;
		var ot = 0;

		var blinkCounter = 0;
		const BLINK_ITVL = 1500;
		const BLINK_TIME = 500;
	
		//var ypos = 412;
	
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
	
			var w = 0;
			for (var i = 0; i <= log_max; i++) {
				w += fps_log[i];
			}
	
			cnt++;
	
			//fps = parseInt(1000 / (w / (log_max + 1)));
			fps = 1000 / (w / (log_max + 1));
		}
	
		this.result = function () {

			var int_max = 0;
			var int_min = 999;
			var int_ave = 0;
	
			var load_max = 0;
			var load_min = 999;
			var load_ave = 0;
	
			var wlod = 0;
			var wint = 0;
			for (var i = 0; i <= log_max; i++) {
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

			var r = {};
	
			r.fps = fps;

			var wl = {};
			wl.log =  fps_log;
			wl.max = load_max;
			wl.min = load_min;
			wl.ave = load_ave;

			var iv = {};
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

