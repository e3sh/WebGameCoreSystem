// GameTaskTemplate
//

function GameTaskTemplate( id ) {

    this.id = id;
	//
	//
	this.enable = true; // true : run step  false: pasue step
	this.visible = true; // true: run draw  false: pasue draw

	this.preFlag = false;

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


	}

	//
	//
	//
	this.draw = function ( g ) {


	}

	//
	//
	//
	this.post = function ( g ) {




	}

}