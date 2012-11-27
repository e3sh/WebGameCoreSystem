// GameCore
//

function GameCore() {

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
	//var dsp_ = new Screen("layer0", 640, 480);
    var dsp_ = new DisplayControl("layer0", 640, 480);
	//var canvas = document.getElementById("layer0");
	//canvas.width = 640;
	//canvas.height = 480;
	//var device = canvas.getContext("2d");
    
    //var dsp_ = new offScreen("layer0", 640, 480);


	//assetsetup
	var asset_ = new GameAssetManager();

	//
	document.getElementById("console").innerHTML = "START GAME CORE";
	// mainloop

	function loop() {
	    if (runStatus_) {

	        task_.step();

	        task_.draw();
	        //dsp_.flip(device);
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
	//
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

