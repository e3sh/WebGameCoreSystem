// GameTaskTemplate
//

function GameTask_Test3( id ) {

    this.id = id;
	//
	//
	this.enable = true; // true : run step  false: pasue step
	this.visible = true; // true: run draw  false: pasue draw

	this.preFlag = false;

	var st;
	//
	//
	//
	this.init = function ( g ) {

		//asset(contents) load
	}

	//
	//
	//
	this.pre = function ( g ) {

	    //paramater reset etc

	    //this.preFlag = true;
	}

	//
	//
	//
	this.step = function ( g ) {

	    st = g.asset.check();
	}

	//
	//
	//
	this.draw = function ( g ) {

	    document.getElementById("console").innerHTML += st;

	}

	//
	//
	//
	this.post = function ( g ) {




	}

}