// main  ==================================================================
//

function main() {

    var sysParam = {
        canvasId: "layer0",
        screen: [
            { resolution: { w: 256, h: 240, x:0, y:0 } }
            ] //,
        //offscreen: "notuse"
        }

	var game = new GameCore( sysParam );

    //Game Asset Setup

	game.asset.imageLoad( "FontGraph","pict/font.png" );
	game.asset.imageLoad( "SPGraph","pict/Char.png" );

	var ad = game.asset.soundLoad("jump", "sound/jump");
	//ad.volume=0;
	//ad.currentTime = 0;
        //ad.play();
    //Game Device Setup
	var sp8 = [];

	for (i = 0; i < 7; i++) {
	    for (j = 0; j < 16; j++) {
	        ptn = {
	            x: 8 * j, 
	            y: 8 * i,
	            w: 8,
	            h: 8
	        };
	        sp8.push(ptn);
	    }
	}

	game.setSpFont( { name: "8x8white", id: "FontGraph", pattern: sp8 } );
   
    //Game Task Setup
	game.task.add(new GameTask_Test3("mario"));
	game.task.add(new GameTask_Test("test"));
	//game.task.add(new GameTask_Test2("fps"));
    //
    //document.getElementById("console").innerHTML = game.asset.check();
    //ad.volume = 0.5;
    //ad.play();
    game.screen[0].setBackgroundcolor("black"); 
    game.screen[0].setInterval(1); 

	game.run();
}

// task ==================================================================

class GameTask_Test extends GameTask {
    constructor(id){
        super(id);
    }

    //i = 0;
    //fpstask;

    pre = function (g) {
        //this.fpstask = g.task.read("fps");
    }

    step = function (g) {
        //this.i++;

        var w = g.keyboard.check();

        document.getElementById("console").innerHTML = g.asset.check() + g.sound.info("jump");
    }

    draw = function (g) {

        var st = "run " + g.time(); //this.i;// + "("
          //  + g.task.count() + " " + g.task.namelist() + ") " + g.dsp.count();

        //g.screen[0].reset();
        //g.screen[0].clear("black");
        //g.screen[1].clear();
        //g.screen[2].clear();

        var keyst = "up:" + ((g.keyboard.upkey) ? "o" : "_")
            + " dw:" + ((g.keyboard.downkey) ? "o" : "_")
            + " <-:" + ((g.keyboard.leftkey) ? "o" : "_")
            + " ->:" + ((g.keyboard.rightkey) ? "o" : "_");

        g.font["8x8white"].putchr(keyst, 0, 208);

        var keyst = "W :" + ((g.keyboard.wkey) ? "o" : "_")
            + " S :" + ((g.keyboard.skey) ? "o" : "_")
            + " A :" + ((g.keyboard.akey) ? "o" : "_")
            + " D :" + ((g.keyboard.dkey) ? "o" : "_");

        g.font["8x8white"].putchr(keyst, 0, 216);

        let r = g.fpsload.result();

        g.font["8x8white"].putchr("FPS:" + r.fps, 0, 232);
        g.font["8x8white"].putchr(st, 0, 200);

        //g.sprite.allDrawSprite();

        //g.screen[0].draw();
        //g.screen[1].draw();
        //g.screen[2].draw();
    }
}

// task ==================================================================

class GameTask_Test3 extends GameTask {

    constructor(id){
        super(id);
    }

    x = 128;
    y = 0;
    vx = 0;
    vy = 0;

    jflag = false;
    ukeyf = false;
    jcount = 0;

    c = 0;
    
    m = 0;
    k = 0;
    old_k = 0;
        
    pre = function (g) {
        g.sprite.setPattern("sRight", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 0, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false }
            ]
        })

        g.sprite.setPattern("sLeft", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 0, y: 0, w: 16, h: 16, r: 0, fv: false, fh: true }
            ]
        })

        g.sprite.setPattern("mRight", {
            image: "SPGraph", wait: 10, pattern: [
                { x: 16, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false },
                { x: 32, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false },
                { x: 48, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false }
            ]
        })

        g.sprite.setPattern("mLeft", {
            image: "SPGraph", wait: 10, pattern: [
                { x: 16, y: 0, w: 16, h: 16, r: 0, fv: false, fh: true },
                { x: 32, y: 0, w: 16, h: 16, r: 0, fv: false, fh: true },
                { x: 48, y: 0, w: 16, h: 16, r: 0, fv: false, fh: true }
            ]
        })

        g.sprite.setPattern("jRight", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 80, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false }
            ]
        })

        g.sprite.setPattern("jLeft", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 80, y: 0, w: 16, h: 16, r: 0, fv: false, fh: true }
            ]
        })

        g.sprite.setPattern("tRight", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 64, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false }
            ]
        })

        g.sprite.setPattern("tLeft", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 64, y: 0, w: 16, h: 16, r: 0, fv: false, fh: true }
            ]
        })

        g.sprite.setPattern("sDead", {
            image: "SPGraph", wait: 0, pattern: [
                { x: 96, y: 0, w: 16, h: 16, r: 0, fv: false, fh: false }
            ]
        })

        g.sprite.set(0, "sRight");

        this.ad = g.asset.soundLoad("jump", "sound/jump");
    }

    step = function (g) {

        var cw = g.screen[0].cw;
        var ch = g.screen[0].ch;

        this.c++;

        var w = g.keyboard.check();

        if (!this.jflag) {
            this.old_k = this.k;
            this.k = 0;

            //x = cw - (c % cw);
            if (g.keyboard.leftkey || g.keyboard.akey) { this.k = 1; }
            if (g.keyboard.rightkey || g.keyboard.dkey) { this.k = 2; }
            if (g.keyboard.upkey || g.keyboard.wkey) {
                if (!this.uketf) {
                    this.k = 3; this.uketf = true;
                }
            }
            if (!g.keyboard.upkey && !g.keyboard.wkey) { this.uketf = false; }


            if (this.k != this.old_k) {
                switch (this.k) {
                    case 1:
                        g.sprite.set(0, "mLeft");
                        this.vx = -1;
                        this.m = 1;
                        break;
                    case 2:
                        g.sprite.set(0, "mRight");
                        this.vx = 1;
                        this.m = 0;
                        break;
                    case 3:
                        if (this.m == 1) {
                            g.sprite.set(0, "jLeft");
                        } else {
                            g.sprite.set(0, "jRight");
                        }
                        this.jflag = true;
                        this.jcount = 40;
                        this.vy = -8;
                        g.sound.effect("jump");
                        //g.asset.sound["jump"].sound.play();
                        //this.ad.play();
                        break;
                    default:
                        if (this.m == 1) {
                            g.sprite.set(0, "sLeft");
                        } else {
                            g.sprite.set(0, "sRight");
                        }
                        this.vx = 0;
                        break;
                }
            }
            this.y = 186;
        } else {
            this.y += this.vy;

            this.vy += 0.4;

            this.jcount--;
            if (this.jcount <= 0) {
                this.jflag = false;
                this.old_k = -1;
            }
        }

        this.x += this.vx;
        if (this.x > cw) { this.x = 0; }
        if (this.x < 0) { this.x = cw; }
        //y = 186;
    }

    draw = function (g) {

        g.sprite.pos(0, this.x, this.y);
    }

}
