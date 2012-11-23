// main
//

function main() {

	var game = new GameCore();

    //Game Device Setup
    // deviceSetUp( game )?

    //Game Asset Setup
    // assetSetup( game )?

    //Game Task Setup
	//var tasktest_ = new GameTask_Test("test");
    
	game.task.add(new GameTask_ClearDisp("cldisp"));

	game.task.add(new GameTask_Test("test"));
	game.task.add(new GameTask_Test2("fps"));
	game.task.add(new GameTask_Test2("fps2"));
	game.task.add(new GameTask_Test2("fps3"));

	game.task.add(new GameTask_FlipDisp("fldisp"));

    //

	game.run();

}