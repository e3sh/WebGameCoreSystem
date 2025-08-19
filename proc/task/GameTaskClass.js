/**
 * GameTaskTemplate
 * @class
 * @example
 * class GameTask_Foo extends GameTask {
 * 	constractor(){ super(id) }
 * }
 * @classdesc
 * ゲームのロジックや描画処理をカプセル化するための基底タスククラスです。<br>\
 * `GameTaskControl`によって管理され、`init`、`pre`、`step`、`draw`、`post`などの <br>\
 * ライフサイクルメソッドを提供します。
*/
class GameTask{

	/**
	 * Task　Unique Identifier
	 * @type {TaskId}
	 */ 
	id;
	/**
	 * task step status/
	 * true: step execute 
	 * @type {boolean}
	 */
	enable;
	/**
	 * task draw status/
	 * true: draw execute　 
	 * @type {boolean}
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
	 * @param {TaskId} id  Unique Identifier
	 * @description
	 * GameTaskインスタンスを初期化します。<br>\
	 * タスクの一意な識別子（ID）を設定し、実行（enable）、描画（visible） <br>\
	 * 実行中（running）、生存（living）などの初期状態を定義します。
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
	 * @method
	 * @description
	 * タスクのステップ処理と描画処理の両方を停止します。<br>\
	 * タスクの状態を`enable: false`、`visible: false`、`running: false`に設定し <br>\
	 * 一時的にタスクの活動を中断させます。
	 */
	pause(){
		this.enable = false; // true : run step  false: pasue step
		this.visible = false; // true: run draw  false: pasue draw

		this.running = false;
	}

	/**
	 * task step and draw resume execute  
	 * @method
	 * @description
	 * 一時停止中のタスクのステップ処理と描画処理を再開します。<br>\
	 * タスクの状態を`enable: true`、`visible: true`、`running: true`に設定し、<br>\
	 * タスクの活動を復帰させます。
	 */
	resume(){
		this.enable = true; // true : run step  false: pasue step
		this.visible = true; // true: run draw  false: pasue draw

		this.running = true;
	}
	/**
	 * @method
	 * @param {number} num sortorder 
	 * @todo priority control function Not implemented(2025/08/15) 
	 * @description
	 * タスクの実行優先順位を設定します。<br>\
	 * ただし、この機能は現在未実装であり、<br>\
	 * 将来の拡張のために予約されています。
	 */
	setPriority(num){ this.proirity = num;}

	/**
	 * user implementation
	 * @method
	 * @description
	 * ユーザーがタスク固有のパラメータや状態をリセットするためのプレースホルダーメソッドです。<br>\
	 * このメソッドは継承クラスでオーバーライドすることで、<br>\
	 * タスクの初期状態への復帰処理を実装できます。
	 */
	reset(){}

	/**
	 * task dispose
	 * @method
	 * @description
	 * タスクを「生存していない」（living: false）状態に設定し、破棄のマークを付けます。<br>\
	 * これにより、`GameTaskControl`がタスクリストからこのタスクを<br>\
	 * 安全に削除できるようになります。
	 */
	kill(){ this.living = false;}

	/**
	 * TaskControllerからtask.add時に実行される。
	 * @method
	 * @param {GameCore} g GameCoreインスタンス
	 * @description
	 * タスクが`GameTaskControl`に追加された際に一度だけ実行されます<br>\
	 * 主に、タスク内で使用するアセットのロードや、<br>\
	 * 初期設定（コンストラクタで設定できないもの）を行うのに適しています。
	 */ 
	init(g){
		//asset(contents) load
		//呼び出しタイミングによってはconstuctorで設定してもよい。
	}

	/**
	 * TaskControllerから初回の呼び出し時に実行される。
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * タスクが`GameTaskControl`によって最初に実行される直前に一度だけ呼び出されます。<br>\
	 * パラメータのリセットや、タスクが本格的に動き出す前の<br>\
	 * 最終的な準備を行うのに適しています。
	 */ 
	pre(g){
    	//paramater reset etc
	    //this.preFlag = true;　フラグの変更はTaskControlで実行されるので継承側でも実行する必要なし。
	}

	/**
	 * TaskControlでループ毎に実行される。(enable :true)
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * `GameTaskControl`によってゲームループ毎に呼び出される、タスクの主要な更新ロジックです。<br>\
	 * `this.enable`が`true`の場合に実行され、<br>\
	 * ゲームの進行に関わる計算や状態更新を行います。
	 */ 
	step(g){// this.enable が true時にループ毎に実行される。

	}

	/**
	 * TaskControlでループ毎に実行される。(visible :true)
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * `GameTaskControl`によってゲームループ毎に呼び出される、タスクの描画ロジックです。<br>\
	 * `this.visible`が`true`の場合に実行され、 <br>\
	 * 画面へのグラフィック要素の描画を行います。
	 */ 
	draw(g){// this.visible が true時にループ毎に実行される。

	}

	/**
	 * destructor(TaskControllerからtask終了時に呼ばれる)
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * タスクが`GameTaskControl`から削除される際に一度だけ呼び出されるデストラクタです。<br>\
	 * リソースの解放や、タスク終了時に必要なクリーンアップ処理を <br>\
	 * 実装するのに適しています。
	 */
	post(g){// task.delで終了時に実行される。

	}
}
