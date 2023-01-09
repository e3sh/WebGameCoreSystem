// GameTaskTemplate
//
class GameTask{
	id;
	enable;
	visible;
	
	preFlag;

	constructor(id){
		this.id = id
		this.enable = true; // true : run step  false: pasue step
		this.visible = true; // true: run draw  false: pasue draw

		this.preFlag = false;
	}

	init(g){// task.add時に実行される。TaskControllerから
		//asset(contents) load
		//constuctorで実行で良いのでは？思案中。
	}

	pre(g){// 最初の実行時に実行。TaskControllerから
    	//paramater reset etc
	    //this.preFlag = true;　フラグの変更はTaskControlで実行されるので継承側でも実行する必要なし。
	}

	step(g){// this.enable が true時にループ毎に実行される。

	}

	draw(g){// this.visible が true時にループ毎に実行される。

	}

	post(g){// task.delで終了時に実行される。

	}
}
