// main
//

function main() {

    var sysParam = [
        { canvasId: "layer0", resolution: { w: 640, h: 480 } },
        { canvasId: "Canvas1", resolution: { w: 320, h: 240 } },
        { canvasId: "layer0", resolution: { w: 640, h: 480 } }
        ]

	var game = new GameCore( sysParam );

    //Game Asset Setup
    // assetSetup( game )?

	game.asset.imageLoad( "FontGraph","pict/aschr.png" );
	game.asset.imageLoad( "SPGraph","pict/cha.png" );
	game.asset.imageLoad( "Dummy","dummy.png" );

	game.asset.soundLoad("Effect1", "sound/bomb");
	game.asset.soundLoad("Effect2", "sound/bow");
	game.asset.soundLoad("Effect3", "sound/damage");
	game.asset.soundLoad("Effect4", "sound/swing");
	game.asset.soundLoad("Effect5", "hit");

    //Game Device Setup
    // deviceSetUp( game )?

	var spfd = SpriteFontData();
	for (var i in spfd) {
	    game.setSpFont(spfd[i]);
	}
    
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