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

    //assetsetup (assetLoad)
	var asset_ = new GameAssetManager();

	//device setup
	var keyboard_ = new inputKeyboard();
	var mouse_ = new inputMouse();

    //
	var screen_ = [];

	for (var i in sysParam) {
	    var wsysp = sysParam[i];
	    screen_[i] = new DisplayControl(wsysp.canvasId, wsysp.resolution.w, wsysp.resolution.h);
	}
	if (sysParam.length > 0) { var dsp_ = screen_[0]; }

    //
	var sprite_ = new GameSpriteControl(this);
    
    //
	var font_ = [];

	this.setSpFont = function (fontParam) {

	    var fprm = {
	        Image : asset_.image[ fontParam.id ],
	        pattern: fontParam.pattern
	    }
	    var wf = new GameSpriteFontControl(this, fprm);

	    font_[fontParam.name] = wf;
	}

    //var BG

	//assetsetup
	var asset_ = new GameAssetManager();

    // soundはassetを参照するので↑の後で宣言する。
    var sound_ = new soundControl( asset_ );

	document.getElementById("console").innerHTML = "START GAME CORE";
	// mainloop

	function loop() {
	    if (runStatus_) {

	        task_.step();

	        task_.draw();
	        //run
	        requestAnimationFrame(arguments.callee);
	    } else {
	        //pause
	    }
	}


	//public propaty and method
	this.task = task_;
	this.asset = asset_;

	this.keyboard = keyboard_;
	this.mouse = mouse_;
	this.dsp = dsp_;
	this.screen = screen_;

	this.sound = sound_;
    //
	this.sprite = sprite_;
	this.font = font_;

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
}

