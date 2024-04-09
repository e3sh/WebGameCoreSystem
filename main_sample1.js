// main
// Sample1 Sprite and Mouse Input Sample(and Debug)
//　実績がないので、Sampleと動作確認を兼ねる。
//----------------------------------------------------------------------
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
//----------------------------------------------------------------------
function SpriteFontData() {

	let sp_ch_ptn = [];

    for (let i = 0; i < 7; i++) {
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

        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 16; j++) {
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
        { name: "std"     , id: "FontGraph", pattern: sp_ch_ptn }
        ,{ name: "8x8red"  , id: "FontGraph", pattern: sp8["red"] }
        ,{ name: "8x8green", id: "FontGraph", pattern: sp8["green"] }
        ,{ name: "8x8blue" , id: "FontGraph", pattern: sp8["blue"] }
		,{ name: "8x8white", id: "FontGraph", pattern: sp8["white"] }

    ]
}

// GameTaskTemplate//----------------------------------------------------------------------
//
class GameTask_Test extends GameTask {

	#i = 0;
	#x = 0;	#y = 0;
	#sk = ""; #sm = ""; #sc = ""; //KEYBOARD TEXT,MOUSE TEXT, COLISION TEXT
	#tc = 0; #dt = ""; #dc = 0;   //DELAYTIME ,DELTATIME TEXT/ DESTROYBLOCKCOUNT
	#dtt = 0;//DELAYTRIGGER
	#sp = []; //SPRITETABLE
	#block; #bbam; #bhtm; //BLOCK,BLOCKBREAKAFTERMAP,BLOCKHITMAP
	
	constructor(id){
		super(id);
	}
//----------------------------------------------------------------------
	pre(g){// 最初の実行時に実行。
 	    //g.font["8x8white"].useScreen(1);

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

	    g.sprite.setPattern("block", {
	        image: "SPGraph",
	        wait: 0,
	        pattern: [
                { x: 0, y: 0, w: 2, h: 2, r: 0, fv: false, fh: false }
	            ]
	        }
        )

	    g.sprite.set(0, "Player", true, 32, 32);
	    g.sprite.set(1, "dummy", true, 32, 32);
	    g.sprite.set(2, "dummy", true, 32, 32);
	    g.sprite.set(3, "dummy", true, 32, 32);
	    g.sprite.set(4, "dummy", true, 32, 32);

		this.#sp = new Array(0);		
		for (let i=0; i <= 4; i++){
			g.sprite.pos(i, 100, 100);//posしないとVisibleにならない(仕様)
			let s = g.sprite.get(i);
			this.#sp.push(s);
		}

	    //this.preFlag = true;

		g.screen[0].setBackgroundcolor("black");

		this.#block = this.#resetblock(true);
		this.#bbam = this.#resetblock(false);
		this.#bbam[24].fill(true);
		this.#bhtm = this.#resetblock(false);
	
		this.#i = 0;
	}

	#resetblock(sw){
		const ROW = 32;
		const COL = 25;

		let blk = new Array(COL);
		for (let j=0; j<COL; j++){
			blk[j] = new Array(ROW);
			blk[j].fill(sw);
		}
		return blk;
	}	
//----------------------------------------------------------------------
	step(g){// this.enable が true時にループ毎に実行される。
		const ROW = 32;
		const COL = 25;

		//i++;
		this.#i++; //= i;
		//this.#i+=3; //= i;

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
			if (this.#dtt < g.time()) {
				this.#dtt = g.time()+250;

				let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
				g.sprite.set(n, "Enemy", true, 32, 32);
				g.sprite.pos(n, mstate.x, mstate.y);
				g.sprite.setMove(n, this.#i % 360, 8, 320);// number, r, speed, lifetime
				this.#sp.push(g.sprite.get(n));
			}
		}
	  
		if (this.#tc < g.time()) {

			this.#tc = g.time()+500;
			this.#sc = "";
			this.#dt = "";
			
			this.#sp = flashsp(this.#sp);

			if (this.#dc <=0){
				this.#block = this.#resetblock(true);
				this.#bbam = this.#resetblock(false);
				this.#bhtm = this.#resetblock(false);
				this.#bbam[23].fill(true);
			}
		}
		for (let i=0; i<=4; i++){
			let c = g.sprite.check(i);//対象のSpriteに衝突しているSpriteNoを返す

			for (let lp in c) {
				this.#sc += c[lp] + ",";
				let spitem = g.sprite.get(c[lp]);//SpNo指定の場合は、SpriteItem
				spitem.vx = spitem.vx*-1.05;
				spitem.vy = spitem.vy*-1.05;
				//spItemのrは更新されない(undefined):2024/04/08時点のバグ) 
			}
		}

		this.#sp = flashsp(this.#sp);
		function flashsp(s){
			let ar = new Array(0);
			for (let i in s){
				let p = s[i];
				if ((p.x < 0)||(p.x > 1024)||(p.y < 0)||(p.y>768)) p.visible = false;
				if (p.visible) ar.push(s[i]);
			}
			return ar;
		}
		//---------------------breakcheck(block sprite hit check
		for (let i in this.#sp){
			let p = this.#sp[i];
			let cx = Math.trunc(p.x/32);
			let cy = Math.trunc(p.y/32);
			if (cy < this.#block.length){
				if (cx < this.#block[cy].length){
					if (this.#block[cy][cx]){
						if (p.id == "Enemy"){
							this.#block[cy][cx] = false;
							//this.#bbam[cy][cx] = true;
							this.#bhtm[cy][cx] = true;
							p.vx = p.vx*-1.05;
							p.vy = p.vy*-1.05;
						}else{
							if (p.id == "block"){
								if (cy>=1){
								this.#block[cy-1][cx] = true;
								this.#bbam[cy-1][cx] = false;
								//this.#bhtm[cy-1][cx] = false;
								p.visible = false;
								}
							}
							//p.vx = p.vx*-1.1;
							//p.vy = p.vy*-1.1;
						}
					}
				}
			}
		}
		//-scan
		
		let f = false;
		let c = []; 
		for (let i=0; i<=ROW; i++){
			for (let j=COL-1; j>=0; j--){
				if (this.#block[j][i]){
						if (!f){
							c.push({x:i,y:j});
						}
						f = true;
					}else{
						//this.#bbam[j][i] = true;		
						f = false;
					continue;
				}	
			}
		}
		/*
		for (let i in c){
			if (!this.#bbam[c[i].y][c[i].x]){
				this.#bbam[c[i].y][c[i].x] = true;
			}else{
				delete c[i];
			}
		}
		*/
		for (let i in c){
			if (!this.#bbam[c[i].y][c[i].x]){
				this.#bbam[c[i].y][c[i].x] = true;
				this.#block[c[i].y][c[i].x] = false;
				let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
				g.sprite.set(n, "block", true, 32, 32);
				g.sprite.pos(n, c[i].x*32, c[i].y*32+32);
				g.sprite.setMove(n, 180, 6, 500);// number, r, speed, lifetime
				this.#sp.push(g.sprite.get(n));
			}
		}
		
	}
//----------------------------------------------------------------------
	draw(g){// this.visible が true時にループ毎に実行される。

		let r = g.fpsload.result(); 

	    let st = "FPS:" + Math.trunc(r.fps) + " Time:" 
			+ Math.trunc(g.time()) + ", " 
			+ "KEYCODE:"+ this.#sk + ", " 
			+ "MOUSE:" + this.#sm + ", ";
        //    + ":" + g.task.count() + "<br>" 
		//	+ ":" + g.task.namelist() + "<br>"; 

	    //document.getElementById("console").innerHTML = st;

	    //g.screen[0].print(st, 0, 50);
	    //g.screen[0].print(this.#sc, 0, 76);

	    //g.screen[0].print("SPACE KEY:" + g.keyboard.space + " ", 0, 96);

		let s=""; for (let i in this.#sp){s+= i+"."}

	    g.font["std"].putchr("" + st, 0, 300);
	    g.font["8x8green"].putchr("Col:" + this.#sc.length*2 + "/s", 0, 324);
	    //g.font["8x8red"].putchr("SPACE KEY:" + g.keyboard.space + ", Sprite:" + this.#sp.length + "/" +s, 0, 340);
	    g.font["8x8red"].putchr("Sprite:" + this.#sp.length, 0, 340);
		g.font["8x8white"].putchr("DeltaT:" + g.deltaTime().toString().substring(0, 5), 0, 356);
		this.#dt += Math.round(60/1000*g.deltaTime()).toString().substring(0, 5) + ",";
		g.font["8x8white"].putchr("block:" + this.#dc, 0, 364);
//		g.font["8x8white"].putchr("block:" + this.#dc + " 1/60  :" + this.#dt, 0, 364);
		//g.font["std"].putchr(st, 0, 300);


		//g.font["8x8white"].putchr(st, 0, 160, 1.5);
	    //g.font["8x8red"].putchr(st, 0, 330, 2);
	    //g.font["8x8green"].putchr(st, 0, 340);

        //g.sprite.put(0, 100, 480 - (i % 480));
	    //g.sprite.pos(0, 640 - (i % 640), 480 - (i % 480), -45, 1.5);

	    g.sprite.pos(0, 640 - (this.#i % 640), 200, this.#i % 360, 1);

		this.#x = 640 - (this.#i % 640);

	    if (this.#i % 20 == 0) {
	        let n = g.sprite.get();//空値の場合は未使用スプライトの番号を返す。
	        g.sprite.set(n, "Enemy", true, 32, 32);
			g.sprite.pos(n, 640 - ( this.#i % 640) + Math.cos((Math.PI/ 320)*this.#i)*64, 200 + Math.sin((Math.PI/ 320)*i)*64);
			g.sprite.setMove(n, this.#i % 360, 4, 800);// number, r, speed, lifetime
			this.#sp.push(g.sprite.get(n));
	    }
	    //g.sprite.pos(1, x, y);
		
	    g.sprite.pos(1, this.#x + Math.cos((Math.PI/320)*this.#i)*180, 200 + Math.sin((Math.PI/320)*this.#i)*180);
	    g.sprite.pos(2, this.#x + Math.cos((Math.PI/320)*-this.#i)*180, 200 + Math.sin((Math.PI/320)*-this.#i)*180);
	    g.sprite.pos(3, this.#x - Math.cos((Math.PI/320)*this.#i)*180, 200 - Math.sin((Math.PI/320)*this.#i)*180);
	    g.sprite.pos(4, this.#x - Math.cos((Math.PI/320)*-this.#i)*180, 200 - Math.sin((Math.PI/320)*-this.#i)*180);
		//g.sprite.pos(3, (this.#i % 640), 16);
		//g.sprite.pos(4, 640 - (this.#i % 640), 368);
		//    g.sprite.allDrawSprite();
		//    g.screen[0].draw();
		//    g.screen[1].draw();
		//    g.screen[2].draw();

		//let r = g.fpsload.result(); 

	    //document.getElementById("console").innerHTML += "<br>fps:" + r.fps;
		//document.getElementById("console").innerHTML += "<br>" + g.asset.check();

		this.#dc = 0;
		for (let i=0; i<32; i++){
			for (let j=0; j<24; j++){
				if (this.#block[j][i]){
					g.screen[0].fill(i*32,j*32+8,31,23,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					this.#dc++;
				}
				if ((!this.#bbam[j][i])&&(!this.#bhtm[j][i])){
					g.screen[0].fill(i*32+8,j*32,16,7,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
					//g.screen[0].fill(i*32,j*32,15,15,"rgb(" + (i*8)%64 + "," + (j*8)%64 + ",127)");
				}
				if (this.#bhtm[j][i]){
					g.screen[0].fill(i*32+2,j*32+2,4,2,"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
				}
			}
		}

		for (let i in this.#sp){
			let p = this.#sp[i];
			if (p.id == "block"){
				g.screen[0].fill(p.x,p.y-32,31,23,"rgb(" + (Math.trunc(p.x/32)*8)%256 + "," + (Math.trunc((p.y-32)/32)*8)%256 + ",255)");
			}
		}
		//g.screen[0].fill(0,768-350,1024,768-350,"blue");
	}
}
//----------------------------------------------------------------------