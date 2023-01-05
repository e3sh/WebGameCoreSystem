// GameTaskTemplate
//
class GameTask_Test2 extends GameTask{
	
	#oldtime;
	#newtime = Date.now();
	#cnt = 0;

	#fps_log = [];
	#log_cnt = 0;
	#log_max = 0;

    #interval;

	#fps = 0;
	
	constructor(id){
		super(id);
	}

	step(g){// this.enable が true時にループ毎に実行される。
	    this.#oldtime = this.#newtime;
	    this.#newtime = Date.now();

	    this.#interval = this.#newtime - this.#oldtime;

	    if (this.#log_cnt > this.#log_max) this.#log_max = this.#log_cnt;
	    this.#fps_log[this.#log_cnt] = this.#interval;

	    this.#log_cnt++;
	    if (this.#log_cnt > 59) this.#log_cnt = 0;

	    var w = 0;
	    for (var i = 0; i <= this.#log_max; i++) {
	        w += this.#fps_log[i];
	    }

	    this.#cnt++;

	    this.#fps = parseInt(1000 / (w / (this.#log_max + 1)));
	}

	draw(g){// this.visible が true時にループ毎に実行される。
	    document.getElementById("console").innerHTML += "<br>fps:" + this.#fps;
	}
}
