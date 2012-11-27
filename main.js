// main
//

function main() {

	var game = new GameCore();

    //Game Asset Setup
    // assetSetup( game )?

	var fontImg_ = game.asset.imageLoad( "FontGraph","pict/aschr.png" );
	var spImg_ = game.asset.imageLoad( "SPGraph","pict/cha.png" );
	game.asset.imageLoad( "Dummy","dummy.png" );

	game.asset.soundLoad("Effect1", "sound/bomb");
	game.asset.soundLoad("Effect2", "sound/bow");
	game.asset.soundLoad("Effect3", "sound/damage");
	game.asset.soundLoad("Effect4", "sound/swing");
	game.asset.soundLoad("Effect5", "hit");

    //Game Device Setup
    // deviceSetUp( game )?

	game.dsp.spImage( spImg_ );
	game.dsp.fontImage( fontImg_ );
    
    //Game Task Setup
	//var tasktest_ = new GameTask_Test("test");
    
	game.task.add(new GameTask_ClearDisp("cldisp"));

	game.task.add(new GameTask_Test("test"));
	game.task.add(new GameTask_Test2("fps"));
	game.task.add(new GameTask_Test2("fps2"));
	game.task.add(new GameTask_Test2("fps3"));
	game.task.add(new GameTask_Test3("astchk"));

	game.task.add(new GameTask_FlipDisp("fldisp"));

    //

	game.run();

}