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
	var sc = "";
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

	    g.sprite.setPattern("Player", {
	        image: "SPGraph",
	        wait: 0,
	        pattern: [
                { x: 0, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false }
	            ]
	        }
        )

	    g.sprite.setPattern("Enemy", {
	        image: "SPGraph",
	        wait: 10,
	        pattern: [
                { x:  64, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false },
                { x:  96, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false },
                { x: 128, y: 0, w: 32, h: 32, r: 0, fv: false, fh: false }
	            ]
    	    }
        )

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

	    g.sprite.set(0, "Player", true, 32, 32);
	    g.sprite.set(1, "Enemy", true, 32, 32);
	    g.sprite.set(2, "dummy", true, 32, 32);

	    //this.preFlag = true;
	    g.sprite.pos(2, 100, 100);
	}

	//
	//
	//
	this.step = function ( g ) {
	    i++;

	    var w = g.keyboard.check();

	    sk = "";

	    for (var li in w) {
	        sk += "[" + li + "]" + ((w[li]) ? "*" : ".");
	    }

	    var mstate = g.mouse.check();

	    sm = mstate.x + " " + mstate.y + " " + mstate.button + " " + mstate.wheel;

	    x = mstate.x;
	    y = mstate.y;

	    if (mstate.button == 1) {
	        g.sound.effect("Effect1");
	    }

	    var c = g.sprite.check(2);

	    sc = "";
	    for (var lp in c) {
	        sc += c[lp] + ",";
	    }

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
	    //g.sprite.pos(2, 100, 100);

	    g.screen[0].print(st, 0, 50);
	    g.screen[0].print(sc, 0, 76);

	    g.screen[0].print(g.keyboard.space + " ", 0, 96);

	    g.font["std"].putchr(st, 0, 300);
	    g.font["8x8white"].putchr(st, 0, 160, 1.5);
	    g.font["8x8red"].putchr(st, 0, 330, 2);
	    g.font["8x8green"].putchr(st, 0, 340);

        //g.sprite.put(0, 100, 480 - (i % 480));
	    //g.sprite.pos(0, 640 - (i % 640), 480 - (i % 480), -45, 1.5);

	    g.sprite.pos(0, 640 - (i % 640), 200, i % 360, 1.5);

	    if (i % 10 == 0) {
	        var n = g.sprite.get();
	        g.sprite.set(n, "Enemy", true, 32, 32);
	        g.sprite.pos(n, 640 - (i % 640), 200);
	        g.sprite.setMove(n, i % 360, 2, 220);
	    }
	    //g.sprite.pos(1, x, y);

	    g.sprite.pos(1, 640 - (i % 640), 300);
        

	    //g.dsp.draw();


	}

    //
	//
	//
	this.post = function ( g ) {




	}

}