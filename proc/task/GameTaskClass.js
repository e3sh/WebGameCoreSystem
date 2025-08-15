/** GameTaskTemplate
* @example
class GameTask_Foo extends GameTask {
	constractor(){ super(id) }
}
*/
class GameTask{

	/**
	 * Task　Unique Identifier
	 * @type {number | string}
	 */ 
	id;
	/**
	 * task step status/ 
	 * @type {boolean}
	 * true: step execute　 
	 */
	enable;
	/**
	 * task draw status/
	 * @type {boolean}
	 * true: draw execute　 
	 */
	visible;
	/**
	 * task running status  
	 * @type {boolean}
	*/
	running;
	/**
	 * task using status
	 * @type {boolean}
	 */
	living;
	/**
	 * task running proirity
	 * @type {number}
	 * @todo function Not implemented
	*/
	proirity;
	/**
	 * new 1st execute check flag
	 * @type {boolean}
	 */
	preFlag;

	/**
	 * @param {number | string} id  Unique Identifier 
	 */ 
	constructor(id){
		this.id = id
		this.enable = true; // true : run step  false: pasue step
		this.visible = true; // true: run draw  false: pasue draw

		this.preFlag = false;

		this.running = true;
		this.living = true;
	}

	/**
	 * task step and draw stop execute 
	 */
	pause(){
		this.enable = false; // true : run step  false: pasue step
		this.visible = false; // true: run draw  false: pasue draw

		this.running = false;
	}

	/**
	 * task step and draw resume execute  
	 */
	resume(){
		this.enable = true; // true : run step  false: pasue step
		this.visible = true; // true: run draw  false: pasue draw

		this.running = true;
	}
	/**
	 * @param {number} num sortorder / @todo priority control function Not implemented(2025/08/15) 
	 */
	setPriority(num){ this.proirity = num;}

	/**
	 * user implementation
	 */
	reset(){}

	/**
	 * task dispose
	 */
	kill(){ this.living = false;}

	/**
	 * TaskControllerからtask.add時に実行される。
	 * @param {GameCore} g
	 */ 
	init(g){
		//asset(contents) load
		//呼び出しタイミングによってはconstuctorで設定してもよい。
	}

	/**
	 * TaskControllerから初回の呼び出し時に実行される。
	 * @param {GameCore} g
	 */ 
	pre(g){
    	//paramater reset etc
	    //this.preFlag = true;　フラグの変更はTaskControlで実行されるので継承側でも実行する必要なし。
	}

	/**
	 * TaskControlでループ毎に実行される。(enable :true)
	 * @param {GameCore} g
	 */ 
	step(g){// this.enable が true時にループ毎に実行される。

	}

	/**
	 * TaskControlでループ毎に実行される。(visible :true)
	 * @param {GameCore} g
	 */ 
	draw(g){// this.visible が true時にループ毎に実行される。

	}

	/**
	 * destructor(TaskControllerからtask終了時に呼ばれる)
	 * @param {GameCore} g
	 */
	post(g){// task.delで終了時に実行される。

	}
}
