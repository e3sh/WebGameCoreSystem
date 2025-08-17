// GameTaskControl
// parent : GameCore
/**
 * @summry GameTaskController　タスク管理
 * 登録されるゲームタスクの状態管理を行う
 * @param {GameCore} game ゲーム本体のインスタンス
 * @example
  	game.task.add( new gametask( id ));
	game.task.del(  id );
	game.task.read( id );

	id：管理用に任意の重複しない文字列や数字を指定する。

	*タスクの雛形*

	class gametask( id ) extends Gametask {
		constructor(id){
			super(id);
			//new　で実行される。
		}
		init( g ){}// task.add時に実行される。
		pre( g ){} // 最初の実行時に実行。
		step( g ){}// this.enable が true時にループ毎に実行される。　
		draw( g ){}// this.visible が true時にループ毎に実行される。
		post( g ){}// task.delで終了時に実行される。
	}

	this.enable = true; // true : run step  false: pause step
	this.visible = true; // true: run draw  false: pause draw

	gにはGameCoreオブジェクトが入るので、
	経由でデバイスやアセットにアクセスする。  
 * @description
 * .read .add .del .init .step .draw .count .namelist
 * @todo priorityControl 実行は登録順で行われる。priorityプロパティによる実行順序制御は未実装
 * @todo 時間指定実行、一時実行タスクや割り込み制御など
 */
class GameTaskControl {
	/**
	 * 
	 * @param {GameCore} game GameCoreインスタンス 
	 */
	constructor(game) {

		let task_ = [];

		let taskCount_ = 0;
		let taskNamelist_ = "";

		function taskCheck() {
			taskCount_ = 0;
			taskNamelist_ = "";

			for (let n in task_) {
				taskNamelist_ += n + " ";
				taskCount_++;
			}
		}

		/**
		 * 指定したIDのGameTask objectを返す
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {GameTaskClass} GameTask instance object
		 * @todo 結果可否報告とエラーチェック
		 */
		this.read = function (taskid) {

			return task_[taskid];
		};

		/**
		 * GameTaskを実行リストに追加
		 * @method
		 * @param {GameTaskClass} GameTask instance object
		 * @return {void}
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
		 * @todo 結果可否報告とエラーチェック(無いtaskを削除した場合)
		 */
		this.del = function (taskid) {
			//task post process
			task_[taskid].post(); //deconstract

			//task delete
			delete task_[taskid];

			taskCheck();
		};

		/**
		 * 指定したIDのGameTaskObject.init()を実行
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {void}
		 * @todo 結果可否報告とエラーチェック
		 */
		this.init = function (taskid) {

			task_[taskid].init(game);
		};

		/**
		 * 実行リストにあるGameTaskのstepを呼ぶ(処理Op)
		 * （初回実行の場合はpre+step）
		 * @method
		 * @return {void}
		 */
		this.step = function () {

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
		 */
		this.count = function () {
			return taskCount_;
		};
		/**
		 * 実行リストにあるGameTaskのId一覧を返す
		 * @method
		 * @return {string} Id一覧の文字列
		 */
		this.namelist = function () {
			return taskNamelist_;
		};

	}
}
