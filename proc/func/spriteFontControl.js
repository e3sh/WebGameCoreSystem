// GameSpriteFontControl
//
/**
 * GameSpriteFontControl
 * @description
 * スプライトシートとして用意されたビットマップフォントを利用して<br>\
 * 文字を画面に描画する機能を提供します。<br>\
 * 指定されたフォントパターンと描画先スクリーンを使用して、<br>\
 * テキスト表示を実現します。
 */
class GameSpriteFontControl {
    /**
     * PCGpatternMap
     * @typedef {object} FontParam スプライトフォント設定パラメータ 
     * @property {string} name フォントID
     * @property {ImageAssetId} id 使用するイメージアセットID
     * @property {number} pattern[].x 切り取り開始位置X
     * @property {number} pattern[].y 切り取り開始位置Y
     * @property {number} pattern[].w 文字幅
     * @property {number} pattern[].h 文字高さ
     * @property {boolean} [ucc=false] UseControlCharFlag
     */
    /**
     * @param {GameCore} g GameCoreインスタンス
     * @param {FontParam} fontParam　フォント設定パラメータ 
     * @example
     * //フォント設定パラメータ
     * //(ascii code [space]～[~]まで）
     * //ucc=true指定で　char[0]～char[255]となる
     * const fontParam = {
     * 	name: fontID
     * 	id: 使用するassetImageのID
     *  	pattern: [
     * 		{x: ,y: ,w: ,h: ], //space
     * 			|
     * 		{x: ,y: ,w: ,h: ] //~
     * 	    ]
     * }
     */
    constructor(g, fontParam) {

        let buffer_ = g.screen[0].buffer;
        //buffer  (offScreen)
        /**
         * @method
         * @param {number} num スクリーン番号
         * @description
         * ビットマップフォントの描画に使用するスクリーンバッファを選択します。
         */
        this.useScreen = function (num) {

            buffer_ = g.screen[num].buffer;
        };

        const tex_c = fontParam.Image;
        const sp_ch_ptn = fontParam.pattern;
        const useControlChar = Boolean(fontParam.ucc);

        const STARTNUM = (useControlChar)?0:32; 
        const ENDNUM = (useControlChar)?255:128;

        //表示位置はx,yが左上となるように表示されます。拡大するとずれます。
        //    this.putchr = chr8x8put;
        /**
         * @method
         * @param {string} str 表示文字列(ASCII)
         * @param {number} x 座標
         * @param {number} y 座標
         * @param {number} z 拡大率
         * @description
         * 指定された文字列の各文字を、定義されたスプライトフォントパターンを用いて描画します。<br>\
         * 文字列、X座標、Y座標、そして任意の拡大率を指定することで、<br>\
         * 文字をカスタマイズして表示できます。
         */
        this.putchr = function (str, x, y, z) {
            //    dummy = function (str, x, y, z) {
            let zflag = false;

            if (!Boolean(z)) {
                z = 1.0;

            } else {
                if (z != 1.0) zflag = true;
            }

            for (let i = 0, loopend = str.length; i < loopend; i++) {
                let n = str.charCodeAt(i);

                if ((n >= STARTNUM) && (n < ENDNUM)) { // space ～ "~" まで
                    let d = sp_ch_ptn[n - STARTNUM];

                    let wx = x + i * (d.w * z);
                    let wy = y;
                    if (zflag) {
                        wx += (-d.w / 2) * z;
                        wy += (-d.h / 2) * z;
                    }

                    buffer_.drawImgXYWHXYWH(
                        tex_c,
                        d.x, d.y, d.w, d.h,
                        wx, wy,
                        d.w * z, d.h * z
                    );
                }
            }
            //
        };

    }
}

