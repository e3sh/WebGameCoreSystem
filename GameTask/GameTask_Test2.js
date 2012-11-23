// GameTaskTemplate
//

function GameTask_Test2( id ) {

    this.id = id; //taskid
    
    //
	//
	this.enable = true; // true : run step  false: pasue step
	this.visible = true; // true: run draw  false: pasue draw

	this.preFlag = false;

	var oldtime;
	var newtime = Date.now();
	var cnt = 0;

	var fps_log = [];
	var log_cnt = 0;
	var log_max = 0;

    var interval;

	var fps = 0;
	//
	//
	//
	this.init = function ( g ) {

	    //asset(contents) load
	}

	//
	//
	//
	this.pre = function ( g ) {

	    //paramater reset etc

	    //this.preFlag = true;
	}

	//
	//
	//
	this.step = function ( g ) {

	    oldtime = newtime;
	    newtime = Date.now();

	    interval = newtime - oldtime;

	    if (log_cnt > log_max) log_max = log_cnt;
	    fps_log[log_cnt] = interval;

	    log_cnt++;
	    if (log_cnt > 59) log_cnt = 0;

	    var w = 0;
	    for (var i = 0; i <= log_max; i++) {
	        w += fps_log[i];
	    }

	    cnt++;

	    fps = parseInt(1000 / (w / (log_max + 1)));
	}

	//
	//
	//
	this.draw = function ( g ) {
	    document.getElementById("console").innerHTML += "<br>fps:" + fps;

	}

	//
	//
	//
	this.post = function ( g ) {




	}

}