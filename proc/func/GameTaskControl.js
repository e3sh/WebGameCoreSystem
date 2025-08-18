// GameTaskControl
// parent : GameCore
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
 * ゲーム内の個々のタスク（`GameTask`インスタンス）を管理するコントローラです。\
 * タスクの追加、削除、読み込み、そしてゲームループにおける \
 * `step`（更新）と`draw`（描画）の実行を制御します。
 * @todo priorityControl 実行は登録順で行われる。priorityプロパティによる実行順序制御は未実装
 * @todo 時間指定実行、一時実行タスクや割り込み制御なども標準機能である方がよいかもしれない
 */
class GameTaskControl {
	/**
	 * @param {GameCore} game GameCoreインスタンス 
	 * @description
	 * GameTaskControlのインスタンスを初期化します。\
	 * 内部でタスクリストを管理するための配列と、\
	 * タスク数やタスク名リストを追跡する変数を設定します。
	 */
	constructor(game) {

		let task_ = [];

		let taskCount_ = 0;
		let taskNamelist_ = "";

		const taskCheck =()=> {
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
		 * @description
		 * 指定されたIDを持つ`GameTask`オブジェクトをタスクリストから取得して返します。\
		 * これにより、特定のタスクに直接アクセスし、\
		 * その状態やプロパティを参照・操作できます。
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
		 * @description
		 * 新しい`GameTask`インスタンスを実行リストに追加します。\
		 * タスクの`init`メソッドを呼び出して初期化を行い\
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
		 * 指定されたIDを持つ`GameTask`オブジェクトを実行リストから削除します。\
		 * 削除前にタスクの`post`メソッドを呼び出して終了処理を行い、\
		 * その後、リストからタスクを破棄します。
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
		 * @description
		 * 指定されたIDの`GameTask`オブジェクトの`init`メソッドを明示的に実行します。\
		 * これは、タスクの追加時だけでなく、\
		 * 必要なタイミングでタスクの初期化を再度行いたい場合に利用できます。
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
		 * @description
		 * 実行リストに登録されている全ての`GameTask`の`step`メソッドを呼び出します。\
		 * 各タスクが`enable`状態であれば、ゲームの更新ロジックが実行され、\
		 * 初回実行時には`pre`メソッドも呼び出されます。
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
		 * @description
		 * 実行リストに登録されている全ての`GameTask`の`draw`メソッドを呼び出します。 \
		 * 各タスクが`visible`状態であれば、画面への描画ロジックが実行され、\
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
		 * 現在実行リストに登録されている`GameTask`の総数を返します。\
		 * これにより、アクティブなタスクの数を把握できます。\
		 */
		this.count = function () {
			return taskCount_;
		};
		/**
		 * 実行リストにあるGameTaskのId一覧を返す
		 * @method
		 * @return {string} Id一覧の文字列
		 * @description
		 * 現在実行リストに登録されている全ての`GameTask`のIDを \
		 * 文字列リストとして返します。\
		 * これにより、どのタスクが現在管理されているかを一覧で確認できます。
		 */
		this.namelist = function () {
			return taskNamelist_;
		};

	}
}
