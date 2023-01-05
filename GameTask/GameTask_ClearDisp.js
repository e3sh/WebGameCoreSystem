// GameTaskTemplate
//
class GameTask_ClearDisp extends GameTask {
	constructor(id){
		super(id);
	}

	draw( g ) {
	    g.dsp.reset();
	    g.dsp.clear("black");
	    //g.dsp.clear();
	    g.screen[1].reset();
	    g.screen[1].clear();
	}
}
