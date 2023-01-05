// GameTaskControl
// parent : GameCore

function GameTaskControl( game ) {

	//
	//
	var task_ = [];

	var taskCount_ = 0;
	var taskNamelist_ = "";
	//

	function taskCheck() {
	    taskCount_ = 0;
	    taskNamelist_ = "";

	    for (var n in task_) {
	        taskNamelist_ += n + " ";
	        taskCount_++;
	    }
	}

    //
    //
	this.read = function (taskid) {

	    return task_[taskid];
	}

	//
	//
	//
	this.add = function( task ){
		//task init process
	    task_[task.id] = task;

	    task.init(game);

	    taskCheck();
	}

	//
	//
	//
	this.del = function( taskid  ){
		//task post process
		task_[task.id].post(); //deconstract
		//task delete
		delete task_[task.id];

		taskCheck();
	}

	//
	//
	//
	this.init = function( taskid){

		task_[ taskid ].init( game );
	}


	//
	//
	//
	this.step = function () {

		for (var i in task_){
			var w_ = task_[i];

			if (!w_.preFlag){
			    w_.pre( game ) ;
			    w_.preFlag = true;
			}

			if (w_.enable){
				w_.step( game );
			}
		}
	}

	//
	//
	//
	this.draw = function () {

	    // reset and Clear Operation.
        //

		for (var i in task_){
			var w_ = task_[i];
			
			if (w_.visible){
				w_.draw( game );
			}
		}

	    // draw Operation.
        //

	}

	this.count = function () {
	    return taskCount_;
	}

	this.namelist = function () {
	    return taskNamelist_;
	}

}
