// GameTaskControl
// parent : GameCore
/**
 * @typedef {number | string} TaskId UniqIdentifer
 * @example
 * "main" or "root" or "system" etc
 * @description
 * 同じIDグループ内で重複しない任意の数値や文字列を設定する<br>\
 */

/**
 * @summry GameTaskController　タスク管理
 * 登録されるゲームタスクの状態管理を行う
 * @param {GameCore} game ゲーム本体のインスタンス
 * @example
 *	game.task.add( new gametask( id ));
 *	game.task.del(  id );
 *	game.task.read( id );
 *
 *	//id：管理用に任意の重複しない文字列や数字を指定する。
 *
 *	//*タスクの雛形*
 *
 *	class gametask( id ) extends Gametask {
 *		constructor(id){
 *			super(id);
 *			//new　で実行される。
 *		}
 *		init( g ){}// task.add時に実行される。
 *		pre( g ){} // 最初の実行時に実行。
 *		step( g ){}// this.enable が true時にループ毎に実行される。　
 *		draw( g ){}// this.visible が true時にループ毎に実行される。
 *	}
 *	this.enable = true; // true : run step  false: pause step
 *	this.visible = true; // true: run draw  false: pause draw
 *
 *	//gにはGameCoreオブジェクトが入るので経由でデバイスやアセットにアクセスする。
 * @description
 * ゲーム内の個々のタスク（`GameTask`インスタンス）を管理するコントローラです。<br>\
 * タスクの追加、削除、読み込み、そしてゲームループにおける <br>\
 * `step`（更新）と`draw`（描画）の実行を制御します。
 */
class GameTaskControl {
	/**
	 * @param {GameCore} game GameCoreインスタンス 
	 * @description
	 * GameTaskControlのインスタンスを初期化します。<br>\
	 * 内部でタスクリストを管理するための配列と、<br>\
	 * タスク数やタスク名リストを追跡する変数を設定します。
	 */
	constructor(game) {

		let task_ = []; //taskObject array
	
		let taskCount_ = 0;
		let taskNamelist_ = "";

		let signal_ = []; //signal_stack

		const taskCheck =()=> {

			task_.sort((a, b)=>{b.priority - a.priority}); //Fast LevelHi -LevelLow defalut:0 

			taskCount_ = 0;
			taskNamelist_ = "";

			for (let n in task_) {
				taskNamelist_ += n + " ";
				taskCount_++;
			}
		}

		const taskExistence = (taskid)=>{

			let result = false;
			for (let n in task_){
				if (taskid == n){
					result = true;
				}
			}
			return result;
		}

		/**
		 * 指定したIDのGameTask objectを返す
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {GameTaskClass} GameTask instance object
		 * @description
		 * 指定されたIDを持つ`GameTask`オブジェクトをタスクリストから取得して返します。<br>\
		 * これにより、特定のタスクに直接アクセスし、<br>\
		 * その状態やプロパティを参照・操作できます。
		 */
		this.read = function (taskid) {

			return taskExistence(taskid)?task_[taskid]: null;
		};

		/**
		 * GameTaskを実行リストに追加
		 * @method
		 * @param {GameTaskClass} GameTask instance object
		 * @return {void}
		 * @description
		 * 新しい`GameTask`インスタンスを実行リストに追加します。<br>\
		 * タスクの`init`メソッドを呼び出して初期化を行い<br>\
		 * タスク数とタスク名リストを更新します。
		 */
		this.add = function (task) {
			//task init process
			task_[task.id] = task;

			task.init(game);

			taskCheck();
		};

		/**
		 * 指定したIDのGameTask objectを実行リストから削除
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {void}
		 * @description
		 * 指定されたIDを持つ`GameTask`オブジェクトを実行リストから削除します。<br>\
		 * 削除前にタスクの`post`メソッドを呼び出して終了処理を行い、<br>\
		 * その後、リストからタスクを破棄します。
		 */
		this.del = function (taskid) {

			let result = false;
			if (taskExistence(taskid)){
				//task post process
				task_[taskid].post(); //deconstract

				//task delete
				delete task_[taskid];
				result = true;
			}
			taskCheck();

			return result;//削除に成功でtrue/なかったらfalse
		};

		/**
		 * 指定したIDのGameTaskObject.init()を実行
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {void}
		 * @description
		 * 指定されたIDの`GameTask`オブジェクトの`init`メソッドを明示的に実行します。<br>\
		 * これは、タスクの追加時だけでなく、<br>\
		 * 必要なタイミングでタスクの初期化を再度行いたい場合に利用できます。
		 */
		this.init = function (taskid) {

			if (taskExistence(taskid)) task_[taskid].init(game);

			taskCheck();
		};

		/**
		 * set signal
		 * @method 
		 * @param {taskId} target 対象(送信先)のタスクID
		 * @param {taskId} from 送信元のタスクID　
		 * @param {number | string} id シグナルID(処理側で決定)
		 * @param {*} desc (何を入れる/どう使うかなどは処理側で決定)　
		 * @description
		 * メッセージシグナルを登録します。 <br>\
		 * 次のステップが処理される際に対象のタスクの<br>\
		 * signalメソッドが呼び出されます。
		 * @todo broadcastメッセージの実装（必要な場合)
		*/
		this.signal = function( target, from, id, desc){
			signal_.push({target:target, from:from, id:id, desc:desc});
		}

		this.flash_signalstack = function(){signal_ = [];
		}

		this.get_signalstack = function(){return signal_;
		}

		/**
		 * 実行リストにあるGameTaskのstepを呼ぶ(処理Op)
		 * （初回実行の場合はpre+step）
		 * @method
		 * @return {void}
		 * @description
		 * 実行リストに登録されている全ての`GameTask`の`step`メソッドを呼び出します。<br>\
		 * 各タスクが`enable`状態であれば、ゲームの更新ロジックが実行され、<br>\
		 * 初回実行時には`pre`メソッドも呼び出されます。
		 */
		this.step = function () {

			//signal check
			while (signal_.length > 0){
				let s = signal_.pop();
				if (taskExistence(s.target)){
					task_[s.target].signal(game, s.from, s.id, s.desc);
				}
			}

			//step
			for (let i in task_) {
				let w_ = task_[i];

				if (!w_.preFlag) {
					w_.pre(game);
					w_.preFlag = true;
				}
				if (w_.enable) {
					w_.step(game);
				}
			}
		};

		/**
		 * 実行リストにあるGameTaskのdrawを呼ぶ(描画Op)
		 * @method
		 * @return {void}
		 * @description
		 * 実行リストに登録されている全ての`GameTask`の`draw`メソッドを呼び出します。 <br>\
		 * 各タスクが`visible`状態であれば、画面への描画ロジックが実行され、<br>\
		 * ゲームのグラフィックが更新されます。
		 */
		this.draw = function () {
			// reset and Clear Operation.
			//

			for (let i in task_) {
				let w_ = task_[i];

				if (w_.visible) {
					w_.draw(game);
				}
			}
			// draw Operation.
		};

		/**
		 * 実行リストにあるGameTaskの数を返す
		 * @method
		 * @return {number} タスク数
		 * @description
		 * 現在実行リストに登録されている`GameTask`の総数を返します。<br>\
		 * これにより、アクティブなタスクの数を把握できます。<br>\
		 */
		this.count = function () {
			return taskCount_;
		};
		/**
		 * 実行リストにあるGameTaskのId一覧を返す
		 * @method
		 * @return {string} Id一覧の文字列
		 * @description
		 * 現在実行リストに登録されている全ての`GameTask`のIDを <br>\
		 * 文字列リストとして返します。<br>\
		 * これにより、どのタスクが現在管理されているかを一覧で確認できます。
		 */
		this.namelist = function () {
			return taskNamelist_;
		};

	}
}
