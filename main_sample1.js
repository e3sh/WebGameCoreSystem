// main
// Sample1 Sprite and Mouse Input Sample

function main() {

    let sysParam = {
		canvasId: "layer0",
        screen: [
        { resolution: { w: 1024, h: 768 , x:0, y:0 } }
		,{ resolution: { w: 320, h: 240 , x:0, y:0 } }
        ,{ resolution: { w: 640, h: 480 , x:0, y:0 } }
        ]
	}

	let game = new GameCore( sysParam );

    //Game Asset Setup
    // assetSetup( game )?

	game.asset.imageLoad( "FontGraph","pict/aschr.png" );
	game.asset.imageLoad( "SPGraph","pict/cha.png" );

	//Game Device Setup
    // deviceSetUp( game )?

	let spfd = SpriteFontData();
	for (let i in spfd) {
	    game.setSpFont(spfd[i]);
	}
    
    //Game Task Setup
	game.task.add(new GameTask_Test("test"));

	//
	game.screen[0].setBackgroundcolor("black"); 
    game.screen[0].setInterval(1); 
    game.screen[1].setInterval(1); 
	game.screen[2].setInterval(1); 
    
	game.run();
}

// SpriteFontData
//

function SpriteFontData() {

	let sp_ch_ptn = [];

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

    let sp8 = []; //spchrptn8(color)
    let cname = ["white", "red", "green", "blue"];

    for (let t = 0; t <= 3; t++) {

        let ch = [];

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
    //↑↑

    return [
        { name: "std"     , id: "FontGraph", pattern: sp_ch_ptn },
        { name: "8x8white", id: "FontGraph", pattern: sp8["white"] },
        { name: "8x8red"  , id: "FontGraph", pattern: sp8["red"] },
        { name: "8x8green", id: "FontGraph", pattern: sp8["green"] },
        { name: "8x8blue" , id: "FontGraph", pattern: sp8["blue"] }
    ]
}

// GameTaskTemplate
//
class GameTask_Test extends GameTask {

	#i = 0;

	#x = 0;	#y = 0;

	#sk = ""; #sm = ""; #sc = "";
	
	constructor(id){
		super(id);
	}

	pre(g){// 最初の実行時に実行。
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
	    g.sprite.set(1, "dummy", true, 32, 32);
	    g.sprite.set(2, "dummy", true, 32, 32);
	    g.sprite.set(3, "dummy", true, 32, 32);
	    g.sprite.set(4, "dummy", true, 32, 32);

	    //this.preFlag = true;
	    g.sprite.pos(2, 100, 100);

		g.screen[0].setBackgroundcolor("black");
	}

	step(g){// this.enable が true時にループ毎に実行される。
	    i++;
		this.#i = i;

	    let w = g.keyboard.check();

	    this.#sk = "";

	    for (let li in w) {
	        this.#sk += "[" + li + "]" + ((w[li]) ? "*" : ".");
	    }

	    let mstate = g.mouse.check();

	    this.#sm = "x" + mstate.x + " y" + mstate.y + " b" + mstate.button + " w" + mstate.wheel;

	    this.#x = mstate.x;
	    this.#y = mstate.y;

	    if (mstate.button == 0) {
	        let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
	        g.sprite.set(n, "Enemy", true, 32, 32);
	        g.sprite.pos(n, mstate.x, mstate.y);
	        g.sprite.setMove(n, i % 360, 8, 320);// number, r, speed, lifetime
		}
	  
		for (let i=1; i<=4; i++){
			let c = g.sprite.check(i);//対象のSpriteに衝突しているSpriteNoを返す

			this.#sc = "";
			for (let lp in c) {
				this.#sc += c[lp] + ",";
				let spitem = g.sprite.get(c[lp]);//SpNo指定の場合は、SpriteItem
				spitem.vx = spitem.vx*-1;
				spitem.vy = spitem.vy*-1;
				//spItemのrは更新されない(undefined):2024/04/08時点のバグ) 
			}
		}
	}

	draw(g){// this.visible が true時にループ毎に実行される。

		let r = g.fpsload.result(); 

	    let st = "FPS:" + Math.trunc(r.fps) + " Time:" 
			+ Math.trunc(g.time()) + ", " 
			+ "KEYCODE:"+ this.#sk + ", " 
			+ "MOUSE:" + this.#sm + ", ";
        //    + ":" + g.task.count() + "<br>" 
		//	+ ":" + g.task.namelist() + "<br>"; 

	    //document.getElementById("console").innerHTML = st;

	    g.screen[0].print(st, 0, 50);
	    g.screen[0].print(this.#sc, 0, 76);

	    g.screen[0].print(g.keyboard.space + " ", 0, 96);

	    g.font["std"].putchr(st, 0, 300);
	    g.font["8x8white"].putchr(st, 0, 160, 1.5);
	    g.font["8x8red"].putchr(st, 0, 330, 2);
	    g.font["8x8green"].putchr(st, 0, 340);

        //g.sprite.put(0, 100, 480 - (i % 480));
	    //g.sprite.pos(0, 640 - (i % 640), 480 - (i % 480), -45, 1.5);

	    g.sprite.pos(0, 640 - (i % 640), 200, i % 360, 1.5);

	    if (i % 10 == 0) {
	        let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
	        g.sprite.set(n, "Enemy", true, 32, 32);
	        g.sprite.pos(n, 640 - (i % 640), 200);
	        g.sprite.setMove(n, i % 360, 4, 320);// number, r, speed, lifetime
	    }
	    //g.sprite.pos(1, x, y);
		
	    g.sprite.pos(1, 320 + Math.cos((Math.PI/ 320)*i)*180, 200 + Math.sin((Math.PI/ 320)*i)*180);
	    g.sprite.pos(2, 320 - Math.cos((Math.PI/ 320)*i)*180, 200 - Math.sin((Math.PI/ 320)*i)*180);
		g.sprite.pos(3, (i % 640), 16);
		g.sprite.pos(4, 640 - (i % 640), 368);
		//    g.sprite.allDrawSprite();
		//    g.screen[0].draw();
		//    g.screen[1].draw();
		//    g.screen[2].draw();

		//let r = g.fpsload.result(); 

	    //document.getElementById("console").innerHTML += "<br>fps:" + r.fps;
		//document.getElementById("console").innerHTML += "<br>" + g.asset.check();
	}
}
