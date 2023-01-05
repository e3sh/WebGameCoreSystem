// GameTaskTemplate
//
class GameTask_FlipDisp extends GameTask {
	constructor(id){
		super(id);
	}

	draw( g ) {
	    g.sprite.allDrawSprite();
	    g.dsp.draw();
	    g.screen[1].draw();	
	}
}
