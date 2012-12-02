// GameTaskTemplate
//

function GameTask_Test( id) {

    this.id = id; //taskid
    
    //
	//
	this.enable = true; // true : run step  false: pasue step
	this.visible = true; // true: run draw  false: pasue draw

	this.preFlag = false;


	var i = 0;

	var x = 0;
	var y = 0;

	var sk = "";
	var sm = "";
	//
	//
	//
	this.init = function ( g ) {

	    //asset(contents) load
	    //alert("init");
	    //this.enable = false;
	    //this.visible = false;
	}

	//
	//
	//
	this.pre = function ( g ) {

	    g.font["8x8white"].useScreen(1);


	    g.sprite.setPattern( "dummy",  {
	        image: "SPGraph",
	        wait: 10,
	        pattern: [
                { x: 0, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false },
                { x: 32, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false },
                { x: 0, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false },
                { x: 32, y: 0, w: 32, h: 32, r: 0, fv: false, fh: true }
 	        ]
	    }
	    )


	    g.sprite.set(0, "dummy");

	    //g.dsp.clear("black");
	    //paramater reset etc
	    //alert("pre");
	    //this.preFlag = true;
	}

	//
	//
	//
	this.step = function ( g ) {
	    i++;

	    sk = g.keyboard.state();
	    var mstate = g.mouse.check();

	    sm = mstate.x + " " + mstate.y + " " + mstate.button + " " + mstate.wheel;

	    x = mstate.x;
	    y = mstate.y;
	}

	//
	//
	//
	this.draw = function (g) {
	    var st = "running " + i + "<br>" + sk + "<br>" + sm + "<br>"
            + g.task.count() + "<br>" + g.task.namelist() + "<br>" + g.dsp.count() + " " + g.screen.length;

	    document.getElementById("console").innerHTML
            = st;

	    //g.dsp.reset();
	    //g.dsp.clear("black");
	    g.sprite.put(0, 100, 100);

	    g.dsp.print(st, 0, 50);

	    //g.dsp.putchr(st, 0, 100);

        /*
	    g.dsp.putchr8(st, 0, 200);

	    g.dsp.putchr8c(st, 0, 220, 1, 1.5);
	    g.dsp.putchr8c(st, 0, 230, 2, 2);
	    g.dsp.putchr8c(st, 0, 240, 3);
        */


	    g.font["std"].putchr(st, 0, 300);
	    g.font["8x8white"].putchr(st, 0, 320, 1.5);
	    g.font["8x8red"].putchr(st, 0, 330, 2);
	    g.font["8x8green"].putchr(st, 0, 340);

	    g.dsp.put("Ship", 100, 480 - (i % 480));
	    g.dsp.put("Ship", 640 - (i % 640), 480 - (i % 480), 0, -45, 255, 1.5);

	    g.dsp.put("Boss", x, y);

	    g.dsp.put("Enemy1", 640 - (i % 640), 200);

	    g.screen[1].put("Boss", x, y);

	    //g.dsp.draw();


	}



	//
	//
	//
	this.post = function ( g ) {




	}

}