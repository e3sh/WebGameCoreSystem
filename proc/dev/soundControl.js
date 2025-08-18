//soundControl
//
/**
 * soundControl
 * @description
 * `GameAssetManager`によってロードされた音声アセットの再生を制御します。\
 * アセットIDを介して、音声の再生、停止、ボリューム調整、\
 * そして再生状態の確認といった基本的な操作を提供します。
 */
class soundControl {
    /**
     * @param {GameAssetManager} gameAsset GameAssetManagerインスタンス
     */
    constructor(gameAsset) {

        let sd = gameAsset.sound;

        /**
         * @method
         * @param {string} id AssetId
         * @description
         * 指定されたIDの音声アセットを再生します。\
         * もし音声がすでに終了している場合、再生位置を最初に戻してから再生を開始し、\
         * 音楽などのループ再生に適しています。
         */
        this.play = function (id) {

            let p = sd[id].sound;

            if (p.ended) p.currentTime = 0;

            p.play();
        };

        /**
         * @method
         * @param {string} id AssetId
         * @description
         * 指定されたIDの音声アセットを効果音として再生します。\
         * 常に再生位置を最初に戻してから再生を開始するため、\
         * 複数の効果音を連続して鳴らすのに適しています。
         */
        this.effect = function (id) {

            if (Boolean(sd[id])) {

                sd[id].sound.currentTime = 0;
                sd[id].sound.play();
            }
        };

        /**
         * @method
         * @param {string} id AssetId
         * @returns {boolean} nowPlaying?
         * @description
         * 指定されたIDの音声アセットが現在再生中であるかどうかを返します。\
         * 音声が終了していない場合に`true`を返し、\
         * 再生状態の確認に利用できます。
         */
        this.running = function (id) {
            return (!sd[id].ended);
        };

        /**
         * @method
         * @param {string} id AssetId
         * @returns {number} playing%
         * @description
         * 指定されたIDの音声アセットの現在の再生進行度をパーセンテージで返します。\
         * 現在の再生位置と音声全体の長さから計算され、\
         * 再生バーの表示などに利用できます。
         */
        this.info = function (id) {

            let p = sd[id];

            return (p.currentTime / p.duration) * 100;
        };
        /**
         * @method
         * @param {string} id AssetId
         * @description
         * 指定されたIDの音声アセットの再生位置を最初に戻します。\
         * 再生中の音声を最初からやり直したい場合や、\
         * 次に再生する準備として利用できます。
        */
        this.restart = function (id) {

            sd[id].currentTime = 0;

        };

        /**
         * @method
         * @param {string} id AssetId
         * @param {number} vol Volume
         * @description
         * 指定されたIDの音声アセットのボリュームを設定します。\
         * 0.0（無音）から1.0（最大）の範囲で音量を調整し、\
         * 個々の音声の音量バランスを制御します。
         */
        this.volume = function (id, vol) {

            sd[id].volume = vol;
        };
    }
}












