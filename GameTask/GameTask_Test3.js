// GameTaskTemplate
//
class GameTask_Test3 extends GameTask{
	
	#st;
	
	constructor(id){
		super(id);	}

	step(g){// this.enable が true時にループ毎に実行される。
	    this.#st = g.asset.check();
	}		

	draw(g){// this.visible が true時にループ毎に実行される。
		document.getElementById("console").innerHTML += this.#st;
	}
}
