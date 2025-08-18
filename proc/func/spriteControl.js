/**
 * @summary スプライト制御 スプライトの表示
 * @param {GameCore} g GameCoreInstance
 * @example
 *  //表示するスプライトの定義
 *  game.sprite.set( spNumber, PatternID,   
 *  [bool: colisionEnable],   
 *  [int: colWidth], [int: colHeight] );  
 *
 *	//スプライトアイテム登録/生成
 *  game.sprite.s.itemCreate = function(Ptn_id, col=false, w=0, h=0 ) 
 *	//return item	
 *
 * @description
 * ゲーム内のスプライトオブジェクトの表示と管理を制御します。\
 * スプライトの生成、移動、アニメーション、衝突判定\
 * そして描画優先順位の管理を行います。
 */
class GameSpriteControl {
    /**
     * 
     * @param {GameCore} g GameCoreインスタンス 
     */
    constructor(g) {
        //
        //let MAXSPRITE = 1000;
        //screen size (colision check)
        let sprite_ = [];
        let pattern_ = [];

        let buffer_;
        let activeScreen;

        let autoDrawMode = true;

        /**
         * classスプライトアイテム
         * @description
         * 個々のスプライトオブジェクトの属性を定義する内部クラスです。\
         * 位置、速度、回転、拡大率、表示優先順位、衝突判定設定、\
         * そして生存状態などのプロパティを保持します。
         */
        class SpItem {
            /**
             * @description
             * `SpItem`インスタンスを初期化します。\
             * スプライトの位置、速度、回転、優先順位、衝突判定有効/無効、\
             * そして生存状態などの初期プロパティを設定します。
             */
            constructor() {

                this.x = 0;
                this.y = 0;
                /**
                 * 方向　Radian(0-359）
                 * @type {number}
                 */
                this.r = 0;
                /**
                 * 拡大率(default1.0)//reserb
                 * @type {number}
                 */
                this.z = 0;
                this.vx = 0;
                this.vy = 0;
                /**
                 * 表示優先順位(大きいほど手前に表示(後から書き込み))
                 * @type {number}
                 */
                this.priority = 0;
                /**
                 * 衝突処理の有効(実施対象にする)
                 * @type {boolean}
                 */
                this.collisionEnable = true;
                /**
                 * 衝突処理用のサイズ
                 * @type {object}
                 */
                this.collision = { w: 0, h: 0 };
                this.id = "";
                this.count = 0;
                this.pcnt = 0;
                this.visible = false;
                /**
                 * 衝突相手のSpItem(複数の場合は複数)
                 * CollisionCheckで衝突しているitemのオブジェクトが入る
                 * 衝突相手のSpItem(複数の場合は複数)
                 * @member
                 * @type {SpItem[]}
                 */
                this.hit = [];
                this.alive = 0;
                this.index = 0;
                this.living = true;
                /**
                 * 通常のスプライトを表示する
                 * @type {boolean}
                 */
                this.normalDrawEnable = true;
                /**
                 * customDrawがnormalDraw実施前後どちらで呼ばれるか(後によばれたら手前に表示される。Default:後(手前)
                 * @type {boolean}
                 */
                this.beforeCustomDraw = false;

                /**
                 * カスタム表示のエントリポイント/通常は空/内容あるものに変えると処理される
                 * @method
                 * @param {GameCore} g GameCoreインスタンス
                 * @param {DisplayControl} screen　表示スクリーン
                 * @description
                 * スプライト固有のカスタム描画ロジックを実装するためのエントリポイントです。\
                 * 通常のスプライト描画の前後どちらかで呼び出されるように設定でき、\
                 * 複雑な視覚効果をスプライトに適用できます。
                 */
                this.customDraw = function (g, screen) { };

                /**
                 * 移動処理で呼ばれる関数のエントリポイント
                 * @method
                 * @param {number} delta
                 * @description
                 * スプライトの移動処理を担う関数を設定するためのエントリポイントです。\
                 * デフォルトでは直線移動関数が設定されていますが、\
                 * カスタムの移動ロジックを割り当てて多様な動きを実現できます。
                 */
                this.moveFunc;

                /**
                 * 表示する
                 * @method
                 * @description
                 * スプライトを表示状態に設定します。\
                 * これにより、スプライトがゲームループの描画フェーズで処理され、\
                 * 画面に表示されるようになります。
                 */
                this.view = function () { this.visible = true; };
                /**
                 * 表示しない
                 * @method
                 * @description
                 * スプライトを非表示状態に設定します。\
                 * これにより、スプライトはゲームループの描画フェーズではスキップされ、\
                 * 画面には表示されなくなります。
                 */
                this.hide = function () { this.visible = false; };
                /**
                 * 表示位置指定
                 * @method
                 * @param {number} x x座標）
                 * @param {number} y y座標
                 * @param {number} r 方向(0-359)(省略可)
                 * @param {number} z 拡大率(省略可)
                 * @description
                 * スプライトの表示位置、回転角度、拡大率を直接設定します。\
                 * X座標、Y座標、回転角度（0-359度）、拡大率をパラメータとして受け取り、\
                 * スプライトを即座に指定された状態に配置します。
                 */
                this.pos = function (x, y, r = 0, z = 0) {
                    this.x = x; this.y = y; this.r = r; this.z = z;
                };
                /**
                 * 移動指定
                 * frame毎に.moveFuncが呼ばれる(通常は直線移動)
                 * @method
                 * @param {number} dir 方向(0-359）
                 * @param {number} speed 1f当たりの移動pixel（1/60基準)
                 * @param {number} aliveTime 動作させるフレーム数
                 * @description
                 * スプライトに移動の指示を与えます。\
                 * 移動方向（0-359度）、1フレームあたりの速度、動作させるフレーム数を指定し\
                 * スプライトが自動的に移動し、設定された時間後に停止します。
                 */
                this.move = function (dir, speed, aliveTime) {
                    this.visible = true;
                    let wr = ((dir - 90) * (Math.PI / 180.0));
                    this.vx = Math.cos(wr) * speed;
                    this.vy = Math.sin(wr) * speed;
                    this.r = dir;
                    this.alive = aliveTime;
                };

                this.moveFunc = normal_move; //normal_move;

                /**
                 * 移動処理で呼ばれる関数(default)
                 * @param {number} delta
                 * @description
                 * `SpItem.moveFunc`のデフォルトとして使用される移動処理関数です。\
                 * スプライトの速度（`vx`, `vy`）に基づいて位置を更新し,\
                 *  `alive`カウンタがゼロになると非表示になります。
                 */
                function normal_move(delta) {
                    this.alive--;

                    this.x += this.vx * (delta / (1000 / 60));
                    this.y += this.vy * (delta / (1000 / 60));

                    if (this.alive <= 0) {
                        this.visible = false;
                    } else {
                        this.visible = true;
                    }
                }
                /**
                 * 移動停止
                 * @method
                 * @description
                 * スプライトの現在の移動を停止させます。\
                 * `alive`カウンタをゼロに、`vx`と`vy`をゼロに設定することで、\
                 * スプライトは現在の位置で静止します。
                 */
                this.stop = function () {
                    this.alive = 0;
                    this.vx = 0; this.vy = 0;
                };
                /**
                 * 廃棄
                 * @method
                 * @description
                 * スプライトを破棄状態に設定します。\
                 * `alive`カウンタをゼロ、`visible`を`false`、`living`を`false`に設定することで、\
                 * スプライトは表示も処理もされなくなり、最終的にリストから削除されます。
                 */
                this.dispose = function () {
                    this.alive = 0;
                    this.visible = false;
                    //上の2つで表示も処理もされなくなる
                    this.living = false;
                };
                /**
                 * 表示処理(内部処理用)
                 * @method
                 * @param {number} x x座標
                 * @param {number} y y座標
                 * @param {number} r 方向(0-359)(省略可)
                 * @param {number} z 拡大率(省略可)
                 * @description
                 * スプライトをオフスクリーンバッファに描画するための内部処理関数です。\
                 * スプライトの位置、パターン、回転、拡大率に基づいて\
                 * 最終的な描画を実行します。
                 */
                this.put = function (x, y, r = 0, z = 1) {

                    let rf = true;
                    if (Boolean(g.viewport)) {
                        let rs = g.viewport.viewtoReal(x, y);
                        x = rs.x;
                        y = rs.y;
                        rf = rs.in;
                    }
                    if (rf) {
                        if (!Boolean(pattern_[this.id])) {
                            buffer_.fillText(this.index + " " + this.count, x, y);
                        } else {
                            spPut(pattern_[this.id].image, pattern_[this.id].pattern[this.pcnt], x, y, r, z);
                            this.count++;
                            if (this.count > pattern_[this.id].wait) { this.count = 0; this.pcnt++; }
                            if (this.pcnt > pattern_[this.id].pattern.length - 1) { this.pcnt = 0; }
                        }
                    }
                };
                //内部処理用
                /**
                 * @method
                 * @description
                 * `SpItem`インスタンスの全てのプロパティを初期状態にリセットします。\
                 * これにより、一度使用されたスプライトオブジェクトを再利用する際に\
                 * クリーンな状態から始めることができます。
                 */
                this.reset = function () {

                    this.x = 0;
                    this.y = 0;
                    this.r = 0;
                    this.z = 0;
                    this.vx = 0;
                    this.vy = 0;
                    this.priority = 0;
                    this.collisionEnable = true;
                    this.collision = { w: 0, h: 0 };
                    this.id = "";
                    this.count = 0;
                    this.pcnt = 0;
                    this.visible = false;
                    this.hit = [];
                    this.alive = 0;
                    this.index = 0;
                    this.living = true;
                    this.normalDrawEnable = true;
                    this.customDraw = function (g, screen) { };
                    this.beforeCustomDraw = false;
                    this.moveFunc = normal_move;
                };

                /**
                 * @method
                 * @returns {string[]} propertyListText
                 * @description
                 * `SpItem`インスタンスのプロパティとその値をデバッグ用に文字列配列として返します。\
                 * スプライトの現在の状態を詳細に確認することができ、\
                 * 開発中のデバッグ作業に役立ちます。
                 */
                this.debug = function () {

                    let st = [];
                    const o = Object.entries(this);

                    o.forEach(function (element) {
                        let w = String(element).split(",");

                        let s = w[0];
                        if (s.length < 13) {
                            s = s + " ".repeat(13);
                            s = s.substring(0, 13);
                        }
                        let s2 = w[1].substring(0, 15);
                        st.push("." + s + ":" + s2);
                    });
                    st.push("");
                    st.push("Object.entries end.");

                    return st;
                };
            }
        }

        /**
         * スプライトアイテム登録/生成
         * @method
         * @param {number | string} Ptn_id UniqID
         * @param {boolean} col 衝突有効無効(省略時：無効)
         * @param {number} w 衝突サイズ幅(省略時：0)
         * @param {number} h 衝突サイズ高さ(省略時：0)
         * @returns {SpItem} SpriteItemObject
         * @description
         * 新しいスプライトアイテム（`SpItem`）を生成し、リストに登録します。\
         * パターンID、衝突判定の有効/無効、衝突判定の幅と高さを指定し、\
         * 新しいスプライトオブジェクトを返します。
         */
        this.itemCreate = function (Ptn_id, col = false, w = 0, h = 0) {
            const item = new SpItem();
            let n = sprite_.length;
            sprite_.push(item);

            item.reset();
            item.index = n;

            item.id = Ptn_id;
            item.count = 0;
            item.pcnt = 0;

            item.collisionEnable = col;
            item.collision = { w: w, h: h };

            //let st = item.debug();
            //for (let s of st) console.log(s);
            //default visible:false alive:0
            return item;
        };

        /**
         * スプライトアイテムリスト取得
         * @method
         * @returns {SpItem[]} スプライトアイテムオブジェクトの配列
         * @description
         * 現在管理されている全てのスプライトアイテムの配列を返します。\
         * これにより、ゲーム内の全てのスプライトにアクセスし、\
         * 一括で操作や状態確認を行うことができます。
         */
        this.itemList = function () {
            return sprite_;
            //基本Index＝配列番号のはず      
        };
        /**
         * スプライトアイテムリストリセット
         * @method
         * @description
         * 現在管理されている全てのスプライトアイテムをリストから削除し、リセットします。\
         * これにより、ゲーム内のスプライトを全てクリアし、\
         * スプライト管理システムを初期状態に戻します。
         */
        this.itemFlash = function () {
            sprite_ = [];
        };
        /**
         * リストから廃棄済みのスプライトを削除して再インデックス
         * @method
         * @returns {SpItem[]} スプライトアイテムオブジェクトの配列
         * @description
         * リストから破棄済みのスプライトを削除し、残ったスプライトのインデックスを振り直します。\
         * これにより、スプライトリストを整理し、\
         * メモリ効率を向上させることができます。
         */
        this.itemIndexRefresh = function () {
            //disposeしたSpItemを削除してIndexを振り直す
            let ar = [];
            for (let i in sprite_) if (sprite_[i].living) ar.push(sprite_[i]);
            for (let i in ar) ar[i].index = i;

            sprite_ = ar;
            return sprite_;
        };
        //----
        /**
         * 手動更新モードに変更する
         * @method
         * @param {boolean} bool　true:手動 /false:自動更新に戻す
         * @returns {void}
         * @description
         * スプライトの描画モードを自動更新から手動更新に切り替えます。\
         * `true`を指定すると手動モードになり、開発者が`allDrawSprite`を明示的に呼び出す必要があります。
         */
        this.manualDraw = function (bool = true) {

            if (bool) {
                autoDrawMode = false;
            } else {
                autoDrawMode = true;
            }
        };
        /**
         * 表示先SCREENの選択
         * @method
         * @param {number} screenNo（Layer番号の定数値）TYPE未定の為number
         * @returns {void}
         * @description
         * スプライトを描画する対象のスクリーン（レイヤー）を選択します。\
         * 指定されたスクリーン番号のオフスクリーンバッファにスプライトが描画され、\
         * レイヤー構造での表示が可能になります。
         */
        this.useScreen = function (num) {
            //buffer_ = g.screen[num].buffer;
            activeScreen = g.screen[num];
            buffer_ = activeScreen.buffer;
        };

        /**
         * スプライトパターン定義パラメータ
         * 
         *　@param {number | string} image ImageId
         *　@param {number} wait アニメーション変更間隔（フレーム数）
         *　@param {number} x イメージ範囲指定x
         *　@param {number} y イメージ範囲指定y
         *　@param {number} w イメージ範囲指定w
         *　@param {number} h イメージ範囲指定h
         *　@param {number} r 向き(0-359)上基準
         *　@param {boolean} fv trueで上下反転
         *　@param {boolean} fh trueで左右反転
         */
        const SpPatternParam = {
            image: "dummy",
            wait: 0,
            pattern: [
                { x: 0, y: 0, w: 0, h: 0, r: 0, fv: false, fh: false },
                { x: 0, y: 0, w: 0, h: 0, r: 0, fv: false, fh: false }
            ]
        };
        /**
         * スプライトパターン定義
         * @method
         *　@param {number | string} anim_id animationUniqID
         *　@param {SpPatternParam} Param パターン定義パラメータ  
         * @description
         * スプライトのアニメーションパターンを定義し、IDと紐づけて登録します。\
         * 使用する画像アセット、アニメーション間隔、そして各フレームのパターン定義を\
         * 指定することで、複雑なアニメーションを表現できます。
         */
        this.setPattern = function (id, Param) {
            pattern_[id] = { image: g.asset.image[Param.image].img, wait: Param.wait, pattern: Param.pattern };
        };
        //FullCheck return spitem[].hit(array)<-obj
        /**
         * @method
         * @description
         * 現在アクティブなスプライトアイテム間の衝突判定を実行します。\
         * 全ての衝突有効なスプライトに対して総当たりでチェックを行い\
         * 衝突している相手を`hit`プロパティに格納します。
         */
        this.CollisionCheck = function () {
            //総当たりなのでパフォーマンス不足の場合は書き換える必要有。
            let checklist = [];
            for (let i in sprite_) {
                let sp = sprite_[i];
                if (sp.living) { //visibleではない場合での当たり判定有の場合がある可能性を考えて処理
                    if (sp.collisionEnable) {
                        checklist.push(sp);
                    }
                }
            }
            for (let i in checklist) {
                let ssp = checklist[i];
                ssp.hit = [];
                for (let j in checklist) {
                    if (!(i == j)) {
                        let dsp = checklist[j];

                        if ((Math.abs(ssp.x - dsp.x) < ((ssp.collision.w / 2) + (dsp.collision.w / 2)))
                            && (Math.abs(ssp.y - dsp.y) < ((ssp.collision.h / 2) + (dsp.collision.h / 2)))) {
                            ssp.hit.push(dsp);
                        }
                    }
                }
            }
        };

        //Inner Draw Control Functions
        /**
         * 
         * @param {Img} img 画像データ
         * @param {object} d パターン情報{x: y: w: h: r: fv: fh}
         * @param {number} x 位置x
         * @param {number} y 位置y
         * @param {number} r 回転r
         * @param {number} z 拡大率
         * @param {number} alpha アルファ値
         * @description
         * スプライトパターンをオフスクリーンバッファに描画するための内部ユーティリティ関数です。\
         * 画像データ、パターン情報、位置、回転、拡大率、アルファ値を受け取り、\
         * 複雑な変換を適用して描画します。
         */
        function spPut(img, d, x, y, r, z, alpha) {
            //let simple = true;

            if (!Boolean(r)) { r = d.r; }
            if (!Boolean(alpha)) { alpha = 255; }
            if (!Boolean(z)) { z = 1.0; }

            let simple = ((!d.fv) && (!d.fh) && (r == 0) && (alpha == 255));
            //simple = true;
            //let simple = false;
            if (simple) {
                buffer_.drawImgXYWHXYWH(
                    img,
                    d.x, d.y, d.w, d.h,
                    x + (-d.w / 2) * z,
                    y + (-d.h / 2) * z,
                    d.w * z,
                    d.h * z
                );

            } else {

                let FlipV = d.fv ? -1.0 : 1.0;
                let FlipH = d.fh ? -1.0 : 1.0;

                buffer_.spPut(
                    img,
                    d.x, d.y, d.w, d.h,
                    (-d.w / 2) * z,
                    (-d.h / 2) * z,
                    d.w * z,
                    d.h * z,
                    FlipH, 0, 0, FlipV,
                    x, y,
                    alpha, r
                );

                //buffer_.fillText(r+" ", x, y);
            }
        }

        //Game System inner Draw Call Function
        const pbuf = new priorityBuffer();

        //game.sprite.allDrawSprite(); //登録中スプライトの表示　システムが自動的に呼びます。
        //↑moveFuncも自動更新の場合に処理される。　manualDrawモードにする場合は自前で処理の事
        /**
         * @method
         * @description
         * 管理されている全てのスプライトを、設定された優先順位に基づいて描画します。\
         * スプライトの生存状態、可視性、移動ロジック（自動更新モード時）\
         * カスタム描画などを処理し、バッファに反映させます。
         */
        this.allDrawSprite = function () {

            if (autoDrawMode) {
                pbuf.reset();
                for (let i in sprite_) {
                    let o = sprite_[i];
                    if (o.living) {
                        pbuf.add(o);
                    }
                }
                pbuf.sort();
                let wo = pbuf.buffer();

                for (let i in wo) {
                    let sw = wo[i];

                    if (sw.alive > 0) {
                        sw.moveFunc(g.deltaTime());
                    }
                    if (sw.visible) {
                        if (sw.beforeCustomDraw) sw.customDraw(g, activeScreen);
                        if (sw.normalDrawEnable) {
                            let rx = sw.x;
                            let ry = sw.y;
                            let rf = true;
                            if (Boolean(g.viewport)) {
                                let rs = g.viewport.viewtoReal(rx, ry);
                                rx = rs.x;
                                ry = rs.y;
                                rf = rs.in;
                            }
                            if (rf) {
                                if (!Boolean(pattern_[sw.id])) {
                                    buffer_.fillText(i + " " + sw.count, rx, ry);
                                } else {
                                    spPut(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], rx, ry, sw.r, sw.z);
                                    sw.count++;
                                    if (sw.count > pattern_[sw.id].wait) { sw.count = 0; sw.pcnt++; }
                                    if (sw.pcnt > pattern_[sw.id].pattern.length - 1) { sw.pcnt = 0; }
                                }
                            }
                        }
                        if (!sw.beforeCustomDraw) sw.customDraw(g, activeScreen);
                    }
                }
            }
        };
        //priorityBufferControl
        //表示プライオリティ制御
        /**
         * @description
         * スプライトの描画優先順位を制御するための内部ユーティリティです。\
         * 登録されたスプライトを`priority`プロパティに基づいてソートし、\
         * 奥から手前への正しい順序で描画できるようにします。
         */
        function priorityBuffer() {
            // .Priorityでソートして表示
            // 0が一番奥で大きい方が手前に表示される(allDrawSpriteにて有効)
            let inbuf = [];
            this.add = (obj) => { inbuf.push(obj); };
            this.sort = () => { inbuf.sort((a, b) => a.priority - b.priority); };
            this.buffer = () => { return inbuf; };
            this.reset = () => { inbuf = []; };
        }
    }
}