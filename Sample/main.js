// main  ==================================================================
//

function main() {
	var sysParam = [
        { canvasId: "layer0", resolution: { w: 640, h: 480 } }
        ]

	var game = new GameCore( sysParam );

    //Game Asset Setup

	var fontImg_ = game.asset.imageLoad( "FontGraph","pict/aschr.png" );
	var spImg_ = game.asset.imageLoad( "SPGraph","pict/cha.png" );

    //Game Device Setup

	game.dsp.spImage( spImg_ );
	//game.dsp.fontImage( fontImg_ );

	var spfd = SpriteFontData();
	for (var i in spfd) {
	    game.setSpFont(spfd[i]);
	}
    
    //Game Task Setup
	game.task.add(new GameTask_Test("test"));
	game.task.add(new GameTask_Test2("fps"));
    //

	game.run();

}

// task ==================================================================

function GameTask_Test(id) {
    this.id = id;

    this.enable = true;
    this.visible = true;

    this.preFlag = false;


    var i = 0;

    var x = 0;
    var y = 0;

    var sk = "";
    var sm = "";

    this.init = function (g) { }
    this.pre = function (g) { }

    this.step = function (g) {
        i++;

        sk = g.keyboard.state();
        var mstate = g.mouse.check();

        sm = mstate.x + " " + mstate.y + " " + mstate.button + " " + mstate.wheel;

        x = mstate.x;
        y = mstate.y;
    }

    this.draw = function (g) {
        var st = "running " + i + "<br>" + sk + "<br>" + sm + "<br>"
            + g.task.count() + "<br>" + g.task.namelist() + "<br>" + g.dsp.count();

        document.getElementById("console").innerHTML
            = st;

        g.dsp.reset();
        g.dsp.clear("black");

        g.dsp.print(st, 0, 50);

        g.font["std"].putchr(st, 0, 100);

        g.font["8x8white"].putchr(st, 0, 200);

        g.font["8x8red"].putchr(st, 0, 220, 1.5);
        g.font["8x8green"].putchr(st, 0, 230, 2);
        g.font["8x8blue"].putchr(st, 0, 240);

        g.dsp.put("Ship", 100, 480 - (i % 480));
        g.dsp.put("Ship", 640 - (i % 640), 480 - (i % 480), 0, -45, 255, 1.5);

        g.dsp.put("Boss", x, y);

        g.dsp.put("Enemy1", 640 - (i % 640), 200);

        g.dsp.draw();
    }

    this.post = function (g) { }
}

// task ==================================================================

function GameTask_Test2(id) {

    this.id = id; //taskid

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

    this.init = function (g) { }
    this.pre = function (g) { }
    this.step = function (g) {

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

    this.draw = function (g) {
        document.getElementById("console").innerHTML += "<br>fps:" + fps;
    }

    this.post = function (g) { }
}

// asset ==================================================================
function spdata() {

    var sp_ptn = [];

    sp_ptn["Ship"] = { x: 0, y: 0, w: 31, h: 31 };
    sp_ptn["Enemy1"] = { x: 64, y: 0, w: 31, h: 31 };
    sp_ptn["Boss"] = { x: 0, y: 64, w: 31, h: 31 };

    return sp_ptn;
}

// SpriteFontData
//

function SpriteFontData() {

    var sp_ch_ptn = [];

    for (i = 0; i < 7; i++) {
        for (j = 0; j < 16; j++) {
            ptn = {
                x: 12 * j,
                y: 16 * i,
                w: 12,
                h: 16
            }

            sp_ch_ptn.push(ptn);
        }
    }
    //12_16_font

    var sp8 = []; //spchrptn8(color)
    var cname = ["white", "red", "green", "blue"];

    for (var t = 0; t <= 3; t++) {

        var ch = [];

        for (i = 0; i < 7; i++) {
            for (j = 0; j < 16; j++) {
                ptn = {
                    x: 8 * j + ((t % 2 == 0) ? 0 : 128),
                    y: 8 * i + 128 + ((t >= 2) ? 64 : 0),
                    w: 8,
                    h: 8
                };
                ch.push(ptn);
            }
        }
        sp8[ cname[t] ] = ch;
    }
    //Å™Å™

    return [
        { name: "std"     , id: "FontGraph", pattern: sp_ch_ptn },
        { name: "8x8white", id: "FontGraph", pattern: sp8["white"] },
        { name: "8x8red"  , id: "FontGraph", pattern: sp8["red"] },
        { name: "8x8green", id: "FontGraph", pattern: sp8["green"] },
        { name: "8x8blue" , id: "FontGraph", pattern: sp8["blue"] }
    ]
}

