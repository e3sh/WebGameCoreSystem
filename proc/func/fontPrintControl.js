/**
 * FontPrintControl
 * Utf16 String Draw Text
 * @example
 * fprint = new fontPrintControl(
 *  screen, 
 *  image"pict/k12x8_jisx0201c.png", 6, 8,
 *  image"pict/k12x8_jisx0208c.png",12, 8
 * );
 * 
 * @description
 * ビットマップ画像として用意されたフォントパターンを用いて、<br>\
 * UTF-16文字列を描画する機能を提供します。<br>\
 * 半角ASCII文字、半角カナ、全角漢字の描画に対応しています。
 */
class fontPrintControl {
    /**
     * @param {GameCore} g GameCore instance
     * @param {Img} asciiPtn ASCII Font Image
     * @param {number} aw ASCII Font width
     * @param {number} ah ASCII Font height
     * @param {Img} KanjiPtn KANJI Font Image
     * @param {number} kw KANJI Font width
     * @param {number} kh KANJI Font height
     */
    constructor(g, asciiPtn, aw, ah, KanjiPtn, kw, kh) {

        var buffer_ = g.screen[0].buffer;

        /**
         * @method
         * @param {number} num DisplayControl (screen) No
         * @description
         * フォント描画に使用するスクリーンバッファを選択します。
         */
        this.useScreen = function (num) {

            buffer_ = g.screen[num].buffer;
        };
        //var p_ch_ptn = fontParam.pattern;
        const pica = asciiPtn; //new Image();

        //pica.src = asciiPtn;
        const pick = KanjiPtn; //new Image();

        //pick.src = KanjiPtn;
        var UTFconv = [];

        const map = utfmap();
        for (let i in map) {
            //map これもglobalで最初に宣言している。変換マップ(横軸:点,縦軸:区で内容がUTF-16の2次元配列/utfmap.js)
            for (let j in map[i]) {
                if (map[i][j] != 0) {
                    UTFconv[map[i][j]] = { x: j, y: i };
                }
            }
        }

        /**
         * @typedef {object} FontLocateImg  
         * @property {img} Img ASCIIFontImage or KANJIFontImage
         * @property {number} x x-position
         * @property {number} y y-position
         * @property {number} w width
         * @property {number} h height
         * @property {number} type 0:ASCII 1:半角カナ 2:漢字(SHIFT-JIS）
        */
        /**
         * フォント画像の文字の切り出し位置算出
         * @param {number} code UTF-16 Moji Code 
         * @returns {FontLocateImg} 切り出し位置指定情報
         * @description
         * 文字コードに対応するフォントパターンの画像内位置を計算します。<br>\
         * ASCII、半角カナ、漢字のそれぞれの文字タイプを判別し、<br>\
         * 適切なフォント画像と切り出し範囲を特定します。
         */
        function charCodeToLoc(code) {

            let kanjif = false;
            let x, y, w, h, t;

            w = 4;
            h = 12;
            t = 0;

            if (code < 128) {
                x = Math.floor(code % 16) * aw;
                y = Math.floor(code / 16) * ah;
                w = aw;
                h = ah;
                //ascii
                t = 0;
            }

            if (code >= parseInt("FF60", 16)
                && code <= parseInt("FF9F", 16)) {

                let wn = code - parseInt("FF60", 16);

                x = Math.floor(wn % 16) * aw;
                y = Math.floor(wn / 16) * ah + (ah * 10);
                w = aw;
                h = ah;
                //半角カナ
                t = 1;
            }

            if (UTFconv[code] !== void 0) {
                //    ws += "(" + UTFconv[n].x + "." + UTFconv[n].y + ")" ;
                //}
                //for (let j in utfkuten ){
                //    let u = utfkuten[j];
                //    if (code == u.U){
                //ws += "(" + u.K + "." + u.T + " " + u.R + ")" ;
                x = UTFconv[code].x * kw;
                y = UTFconv[code].y * kh;
                w = kw;
                h = kh;

                kanjif = true;

                t = 2;
                //    }
            }

            //graphicsPatten to hankaku zennkaku 
            //cursor x,y
            // 
            let r = {};
            r.img = kanjif ? pick : pica;
            r.x = x;
            r.y = y;
            r.w = w;
            r.h = h;
            r.type = t;

            return r;
        }
        /**
         * @method
         * @param {string} str 表示文字列
         * @param {number} x 表示位置x座標
         * @param {number} y 表示位置y座標
         * @description
         * 指定された文字列をフォントパターンを使用して画面に描画します。<br>\
         * 文字列、X座標、Y座標を指定し、<br>\
         * 各文字はフォントパターンから切り出され、順に表示されます。
         */
        this.print = function (str, x, y) {

            for (let i = 0, loopend = str.length; i < loopend; i++) {
                let n = str.charCodeAt(i);

                let d = charCodeToLoc(n);

                //buffer_.fillRect(x, y, 3, 3, "green")
                //buffer_.fillText(d.x, x, y +100);
                //buffer_.fillText(d.y, x, y +116);
                //buffer_.fillText(d.w, x, y +132);
                buffer_.drawImgXYWHXYWH(
                    d.img,
                    d.x, d.y, d.w, d.h,
                    x, y, d.w, d.h
                );
                x = x + d.w;
            }
            //buffer_.drawImgXY(d.img,x, y);
        };
        /**
         * @method
         * @param {string} str 表示文字列
         * @param {number} x 表示位置x座標
         * @param {number} y 表示位置y座標
         * @param {number} z 拡大率
         * @description
         * 指定された文字列の各文字を個別に、拡大率を適用して描画します。<br>\
         * 文字列、X座標、Y座標、そして任意の拡大率（Z）を指定することで、<br>\
         * 文字のサイズを調整して表示できます。
         */
        this.putchr = function (str, x, y, z) {
            //    dummy = function (str, x, y, z) {
            var zflag = false;

            if (!Boolean(z)) {
                z = 1.0;
            } else {
                if (z != 1.0) zflag = true;
            }

            for (var i = 0, loopend = str.length; i < loopend; i++) {
                var n = str.charCodeAt(i);

                let d = charCodeToLoc(n);

                let wx = x;
                let wy = y;
                if (zflag) {
                    //wx += (-d.w / 2) * z;
                    //wy += (-d.h / 2) * z;
                }

                buffer_.drawImgXYWHXYWH(
                    d.img,
                    d.x, d.y, d.w - 1, d.h - 1,
                    wx, wy,
                    Math.floor(d.w * z), Math.floor(d.h * z)
                );
                x = x + (d.w * z);
            }
        };
        // kanji map data UTF-16 -> kuten map (94x94)
        /**
         * 
         * @returns {Uint16Array<ArrayBuffer>} table
         * @description
         * 漢字のUTF-16コードと、フォント画像内の位置（区点コード）を <br>\
         * マッピングするテーブルを生成します。<br>\
         * Base64エンコードされたデータからマッピング情報を復元し、<br>\
         * 漢字の描画を可能にします。
         */
        function utfmap() {

            const map = [];

            const KanjiBase64Table = setTable();

            for (let i in KanjiBase64Table) {
                map.push(Base64toUint16(KanjiBase64Table[i]));
            }
            return map;

            function Base64toUint16(b64str) {

                const encodeBinaryString = binaryString => Uint8Array.from(
                    binaryString,
                    binaryChar => binaryChar.charCodeAt(0)
                );

                const binaryStringB = atob(b64str);
                const uint8ArrayB = encodeBinaryString(binaryStringB);
                //console.log(uint8ArrayB.toString());
                const arrayBuffer = new Uint16Array(uint8ArrayB.buffer);

                return arrayBuffer;
            }

            function setTable() {
                return [
                    ["ADABMAIwDP8O//swGv8b/x//Af+bMJwwtABA/6gAPv/j/z///TD+MJ0wnjADMN1OBTAGMAcw/DAVIBAgD/9cABwwFiBc/yYgJSAYIBkgHCAdIAj/Cf8UMBUwO/89/1v/Xf8IMAkwCjALMAwwDTAOMA8wEDARMAv/EiKxANcA9wAd/2AiHP8e/2YiZyIeIjQiQiZAJrAAMiAzIAMh5f8E/6IAowAF/wP/Bv8K/yD/pwAGJgUmyyXPJc4lxyU="],
                    ["xiWhJaAlsyWyJb0lvCU7IBIwkiGQIZEhkyETMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIIgsihiKHIoIigyIAAAAAAAAAAAAAAAAAAAAAAAAAACciKCKsANIh1CEAIgMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASIwIiByIAAAAAaiJrIgAAPSIdIgAAAAAsIgAAAAAAAAAAAAAAAAAAKyEwIG8mbSZqJiAgISC2AAAAAAAAAAAA7yU="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEP8R/xL/E/8U/xX/Fv8X/xj/Gf8AAAAAAAAAAAAAAAAAACH/Iv8j/yT/Jf8m/yf/KP8p/yr/K/8s/y3/Lv8v/zD/Mf8y/zP/NP81/zb/N/84/zn/Ov8AAAAAAAAAAAAAAABB/0L/Q/9E/0X/Rv9H/0j/Sf9K/0v/TP9N/07/T/9Q/1H/Uv9T/1T/Vf9W/1f/WP9Z/1r/AAAAAAAAAAA="],
                    ["QTBCMEMwRDBFMEYwRzBIMEkwSjBLMEwwTTBOME8wUDBRMFIwUzBUMFUwVjBXMFgwWTBaMFswXDBdMF4wXzBgMGEwYjBjMGQwZTBmMGcwaDBpMGowazBsMG0wbjBvMHAwcTByMHMwdDB1MHYwdzB4MHkwejB7MHwwfTB+MH8wgDCBMIIwgzCEMIUwhjCHMIgwiTCKMIswjDCNMI4wjzCQMJEwkjCTMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["oTCiMKMwpDClMKYwpzCoMKkwqjCrMKwwrTCuMK8wsDCxMLIwszC0MLUwtjC3MLgwuTC6MLswvDC9ML4wvzDAMMEwwjDDMMQwxTDGMMcwyDDJMMowyzDMMM0wzjDPMNAw0TDSMNMw1DDVMNYw1zDYMNkw2jDbMNww3TDeMN8w4DDhMOIw4zDkMOUw5jDnMOgw6TDqMOsw7DDtMO4w7zDwMPEw8jDzMPQw9TD2MAAAAAAAAAAAAAAAAAAAAAA="],
                    ["kQOSA5MDlAOVA5YDlwOYA5kDmgObA5wDnQOeA58DoAOhA6MDpAOlA6YDpwOoA6kDAAAAAAAAAAAAAAAAAAAAALEDsgOzA7QDtQO2A7cDuAO5A7oDuwO8A70DvgO/A8ADwQPDA8QDxQPGA8cDyAPJAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["EAQRBBIEEwQUBBUEAQQWBBcEGAQZBBoEGwQcBB0EHgQfBCAEIQQiBCMEJAQlBCYEJwQoBCkEKgQrBCwELQQuBC8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAQxBDIEMwQ0BDUEUQQ2BDcEOAQ5BDoEOwQ8BD0EPgQ/BEAEQQRCBEMERARFBEYERwRIBEkESgRLBEwETQROBE8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["ACUCJQwlECUYJRQlHCUsJSQlNCU8JQElAyUPJRMlGyUXJSMlMyUrJTslSyUgJS8lKCU3JT8lHSUwJSUlOCVCJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["YCRhJGIkYyRkJGUkZiRnJGgkaSRqJGskbCRtJG4kbyRwJHEkciRzJGAhYSFiIWMhZCFlIWYhZyFoIWkhAABJMxQzIjNNMxgzJzMDMzYzUTNXMw0zJjMjMyszSjM7M5wznTOeM44zjzPEM6EzAAAAAAAAAAAAAAAAAAAAAHszHTAfMBYhzTMhIaQypTKmMqcyqDIxMjIyOTJ+M30zfDNSImEiKyIuIhEiGiKlIiAiHyK/IjUiKSIqIgAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["nE4WVQNaP5bAVBthKGP2WSKQdYQcg1B6qmDhYyVu7WVmhKaC9ZuTaCdXoWVxYptb0Fl7hvSYYn2+fY6bFmKffLeIiVu1Xgljl2ZIaMeVjZdPZ+VOCk9NT51PSVDyVjdZ1FkBWglc32APYXBhE2YFabpwT3Vwdft5rX3vfcOADoRjiAKLVZB6kDtTlU6lTt9XsoDBkO94AE7xWKJuOJAyeiiDi4IvnEFRcFO9VOFU4Fb7WRVf8pjrbeSALYU="],
                    ["YpZwlqCW+5cLVPNTh1vPcL1/wo/olm9TXJ26ehFOk3j8gSZuGFYEVR1rGoU7nOVZqVNmbdx0j5VCVpFOS5Dylk+DDJnhU7ZVMFtxXyBm82YEaDhs82wpbVt0yHZOejSY8YJbiGCK7ZKybat1ynbFmaZgAYuKjbKVjmmtU4ZRElcwWERZtFv2XihgqWP0Y79sFG+OcBRxWXHVcT9zAX52gtGCl4VgkFuSG51pWLxlWmwldflRLlllWYBf3F8="],
                    ["vGL6ZSpqJ2u0a4tzwX9WiSydDp3EnqFclmx7gwRRS1y2YcaBdmhhcllO+k94U2lgKW5PevOXC04WU+5OVU89T6FPc0+gUu9TCVYPWcFatlvhW9F5h2acZ7ZnTGuzbGtwwnONeb55PHqHe7GC24IEg3eD74PTg2aHsoopVqiM5o9OkB6XiobET+hcEWJZcjt15YG9gv6GwIzFlhOZ1ZnLThpP44neVkpYylj7XutfKmCUYGJg0GESYtBiOWU="],
                    ["QZtmZrBod21wcEx1hnZ1faWC+YeLlY6WnYzxUb5SFlmzVLNbFl1oYYJpr22NeMuEV4hyiqeTuJpsbaiZ2YajV/9nzoYOkoNSh1YEVNNe4WK5ZDxoOGi7a3JzunhrepqJ0olrjQOP7ZCjlZSWaZdmW7NcfWlNmE6Ym2Mgeytqf2q2aA2cX29yUp1VcGDsYjttB27RbluEEIlEjxROOZz2UxtpOmqElypoXFHDerKE3JGMk1tWKJ0iaAWDMYQ="],
                    ["pXwIUsWC5nR+ToNPoFHSWwpS2FLnUvtdmlUqWOZZjFuYW9tbcl55XqNgH2FjYb5h22NiZdFnU2j6aD5rU2tXbCJvl29Fb7B0GHXjdgt3/3qheyF86X02f/B/nYBmgp6Ds4nMiquMhJBRlJOVkZWilWWW05comRiCOE4rVLhczF2pc0x2PHepXOt/C43BlhGYVJhYmAFPDk9xU5xVaFb6V0dZCVvEW5BcDF5+Xsxf7mM6Z9dl4mUfZ8toxGg="],
                    ["X2owXsVrF2x9bH91SHljWwB6AH29X4+JGIq0jHeNzI4dj+KYDpo8m4BOfVAAUZNZnFsvYoBi7GQ6a6BykXVHeal/+4e8inCLrGPKg6CXCVQDVKtVVGhYanCKJ3h1Z82edFOiWxqBUIYGkBhORU7HThFPylM4VK5bE18lYFFlPWdCbHJs42x4cAN0dnquegh7Gn3+fGZ952VbcrtTRVzoXdJi4GIZYyBuWoYxit2N+JIBb6Z5WpuoTqtOrE4="],
                    ["m0+gT9FQR1H2enFR9lFUUyFTf1PrU6xVg1jhXDdfSl8vYFBgbWAfY1llS2rBbMJy7XLvd/iABYEIgk6F95Dhk/+XV5lamvBO3VEtXIFmbWlAXPJmdWmJc1BogXzFUORSR1f+XSaTpGUjaz1rNHSBeb15S3vKfbmCzIN/iF+JOYvRj9GRH1SAkl1ONlDlUzpT13KWc+l35oKvjsaZyJnSmXdRGmFehrBVenp2UNNbR5CFljJO22rnkVFcSFw="],
                    ["mGOfepNsdJdhj6p6inGIloJ8F2hwflFobJPyUhtUq4UTiqR/zY7hkGZTiIhBecJPvlARUkRRU1UtV+pzi1dRWWJfhF91YHZhZ2GpYbJjOmRsZW9mQmgTbmZ1PXr7fEx9mX1Lfmt/DoNKg82GCIpjimaL/Y4amI+duILOj+ibh1IfYoNkwG+ZlkFokVAga3psVG90elB9QIgjighn9k45UCZQZVB8UThSY1KnVQ9XBVjMWvpesmH4YfNicmM="],
                    ["HGkpan1yrHIucxR4b3h5fQx3qYCLiRmL4ozSjmOQdZN6llWYE5p4nkNRn1OzU3teJl8bbpBuhHP+c0N9N4IAivqKUJZOTgtQ5FN8VPpW0VlkW/Fdq14nXzhiRWWvZ1Zu0HLKfLSIoYDhgPCDToaHiuiNN5LHlmeYE5+UTpJODU9IU0lUPlQvWoxfoV+fYKdojmpadIF4noqkineLkJFeTsmbpE58T69PGVAWUElRbFGfUrlS/lKaU+NTEVQ="],
                    ["DlSJVVFXold9WVRbXVuPW+Vd5133XXheg16aXrdeGF9SYExhl2LYYqdjO2UCZkNm9GZtZyFol2jLaV9sKm1pbS9unW4ydYd2bHg/euB8BX0YfV59sX0VgAOAr4CxgFSBj4EqglKDTIhhiBuLooz8jMqQdZFxkj94/JKklU2WBZiZmdiaO51bUqtS91MIVNVY92Lgb2qMX4+5nktRO1JKVP1WQHp3kWCd0p5EcwlvcIERdf1f2mComttyvI8="],
                    ["ZGsDmMpO8FZkV75YWlpoYMdhD2YGZjlosWj3bdV1On1ugkKbm05QT8lTBlVvXeZd7l37Z5lsc3QCeFCKlpPfiFBXp14rY7VQrFCNUQBnyVReWLtZsFtpX01ioWM9aHNrCG59cMeRgHIVeCZ4bXmOZTB93IPBiAmPm5ZkUihXUGdqf6GMtFFCVyqWOliKabSAslQOXfxXlXj6nVxPSlKLVD5kKGYUZ/VnhHpWeyJ9L5NcaK2bOXsZU4pRN1I="],
                    ["31v2Yq5k5mQtZ7prqYXRlpB21ptMYwaTq5u/dlJmCU6YUMJTcVzoYJJkY2VfaOZxynMjdZd7gn6VhoOL24x4kRCZrGWrZotr1U7UTjpPf086UvhT8lPjVdtW61jLWclZ/1lQW01cAl4rXtdfHWAHYy9lXFuvZb1l6GWdZ2Jre2sPbEVzSXnBefh8GX0rfaKAAoHzgZaJXoppimaKjIruiseM3IzMlvyYb2uLTjxPjU9QUVdb+ltIYQFjQmY="],
                    ["IWvLbrtsPnK9dNR1wXg6eQyAM4DqgZSEno9QbH+eD19Yiyud+nr4jo1b65YDTvFT91cxWclapFuJYH9uBm++deqMn1sAheB7clD0Z52CYVxKhR5+DoKZUQRcaGNmjZxlbnE+eRd9BYAdi8qObpDHhqqQH1D6UjpcU2d8cDVyTJHIkSuT5YLCWzFf+WA7TtZTiFtLYjFnimvpcuBzLnprgaONUpGWmRJR11NqVP9biGM5aqx9AJfaVs5TaFQ="],
                    ["l1sxXN5d7k8BYf5iMm3Aect5Qn1NftJ/7YEfgpCERohyiZCLdI4vjzGQS5FskcaWnJHATk9PRVFBU5NfDmLUZ0FsC25jcyZ+zZGDktRTGVm/W9FtXXkufpt8flifcfpRU4jwj8pP+1wlZqx343ocgv+ZxlGqX+xlb2mJa/Ntlm5kb/52FH3hXXWQh5EGmOZRHVJAYpFm2WYabrZe0n1yf/hmr4X3hfiKqVLZU3NZj16QX1Vg5JJklrdQH1E="],
                    ["3VIgU0dT7FPoVEZVMVUXVmhZvlk8WrVbBlwPXBFcGlyEXope4F5wX39ihGLbYoxjd2MHZgxmLWZ2Zn5nomgfajVqvGyIbQluWG48cSZxZ3HHdQF3XXgBeWV58HngehF7p3w5fZaA1oOLhEmFXYjziB+KPIpUinOKYYzejKSRZpJ+kxiUnJaYlwpOCE4eTldOl1FwUs5XNFjMWCJbOF7FYP5kYWdWZ0RttnJzdWN6uIRyi7iRIJMxVvRX/pg="],
                    ["7WINaZZr7XFUfneAcoLmid+YVYexjztcOE/hT7VPB1UgWt1b6VvDX05hL2OwZUtm7mibaXht8W0zdbl1H3deeeZ5M33jga+CqoWqiTqKq46bjzKQ3ZEHl7pOwU4DUnVY7FgLXBp1PVxOgQqKxY9jlm2XJXvPigiYYpHzVqhTF5A5VIJXJV6oYzRsinBhd4t84H9wiEKQVJEQkxiTj5ZedMSaB11pXXBlomeojduWbmNJZxlpxYMXmMCW/og="],
                    ["hG96ZPhbFk4scF11L2bEUTZS4lLTWYFfJ2AQYj9ldGUfZnRm8mgWaGNrBW5ych9123a+fFaA8Fj9iH+JoIqTisuKHZCSkVKXWZeJZQ56BoG7li1e3GAaYqVlFGaQZ/N3TXpNfD5+CoGsjGSN4Y1fjql4B1LZYqVjQmSYYi2Kg3rAe6yK6pZ2fQyCSYfZTkhRQ1NgU6NbAlwWXN1dJmJHYrBkE2g0aMlsRW0XbdNnXG9OcX1xy2V/eq172n0="],
                    ["Sn6of3qBG4I5gqaFborOjPWNeJB3kK2SkZKDla6bTVKEVThvNnFoUYV5VX6zgc58TFZRWKhcqmP+Zv1mWmnZco91jnUOeVZ533mXfCB9RH0HhjSKO5ZhkCCf51B1UsxT4lMJUKpV7lhPWT1yi1tkXB1T42DzYFxjg2M/Y7tjzWTpZflm413Naf1pFW/lcYlO6XX4dpN633zPfZx9YYBJg1iDbIS8hPuFxYhwjQGQbZCXkxyXEprPUJdYjmE="],
                    ["04E1hQiNIJDDT3RQR1JzU29gSWNfZyxus40fkNdPXlzKjM9lmn1SU5aIdlHDY1hba1sKXA1kUWdckNZOGlkqWXBsUYo+VRVYpVnwYFNiwWc1glVpQJbEmSiaU08GWP5bEICxXC9ehV8gYEthNGL/ZvBs3m7OgH+B1IKLiLiMAJAukIqW257bm+NO8FMnWSx7jZFMmPmd3W4ncFNTRFWFW1hinmLTYqJs728idBeKOJTBb/6KOIPnUfiG6lM="],
                    ["6VNGT1SQsI9qWTGB/V3qer+P2mg3jPhySJw9arCKOU5YUwZWZlfFYqJj5mVOa+FtW26tcO1373qqe7t9PYDGgMuGlYpbk+NWx1g+X61llmaAarVrN3XHiiRQ5XcwVxtfZWB6ZmBs9HUaem5/9IEYh0WQs5nJe1x1+XpRe8SEEJDpeZJ6NoPhWkB3LU7yTplb4F+9Yjxm8WfobGuGd4g7ik6R85LQmRdqJnAqc+eCV4SvjAFORlHLUYtV9Vs="],
                    ["Fl4zXoFeFF81X2tftF/yYRFjomYdZ25vUnI6dTp3dIA5gXiBdoe/ityKhY3zjZqSd5UCmOWcxVJXY/R2FWeIbM1zw4yuk3OWJW2cWA5pzGn9j5qT23UakFpYAmi0Y/tpQ08sb9hnu48mhbR9VJM/aXBvalf3WCxbLH0qcgpU45G0na1OTk9cUHVQQ1KejEhUJFiaWx1elV6tXvdeH1+MYLViOmPQY69oQGyHeI55C3rgfUeCAormikSOE5A="],
                    ["uJAtkdiRDp/lbFhk4mR1ZfRuhHYbe2mQ0ZO6bvJUuV+kZE2P7Y9EknhRa1gpWVVcl177bY9+HHW8jOKOW5i5cB1Pv2uxbzB1+5ZOURBUNVhXWKxZYFySX5dlXGchbnt234PtjBSQ/ZBNkyV4OniqUqZeH1d0WRJgElBaUaxRzVEAUhBVVFhYWFdZlVv2XItdvGCVYi1kcWdDaLxo32jXdthtb26bbW9wyHFTX9h1d3lJe1R7UnvWfHF9MFI="],
                    ["Y4RpheSFDooEi0aMD44DkA+QGZR2li2YMJrYlc1Q1VIMVAJYDlynYZ5kHm2zd+V69IAEhFOQhZLgXAedP1OXX7NfnG15cmN3v3nke9Jr7HKtigNoYWr4UYF6NGlKXPac64LFW0mRHnB4Vm9cx2BmZYxsWoxBkBOYUVTHZg2SSFmjkIVRTU7qUZmFDotYcHpjS5NiabSZBH53dVdTYGnfjuOWXWyMTjxcEF/pjwJT0YyJgHmG/17lZXNOZVE="],
                    ["glk/XO6X+06KWc1fjYrhb7B5YnnnW3GEK3OxcXRe9V97Y5pkw3GYfENO/F5LTtxXolapYMNvDX39gDOBv4Gyj5eJpIb0XYpirWSHiXdn4mw+bTZ0NHhGWnV/rYKsmfNPw17dYpJjV2VvZ8N2THLMgLqAKY9NkQ1Q+VeSWoVoc2lkcf1yt4zyWOCMapYZkH+H5HnndymEL09lUlpTzWLPZ8psfXaUe5V8NoKEheuP3WYgbwZyG36rg8GZpp4="],
                    ["/VGxe3J4uHuHgEh76GphXoyAUXVgdWtRYpKMbnp2l5HqmhBPcH+cYk97pZXpnHpWWVjkhryWNE8kUkpTzVPbUwZeLGSRZX9nPmxObEhyr3Ltc1R1QX4sgumFqYzEe8aRaXESmO+YPWNpZmp15HbQeEOF7oYqU1FTJlSDWYdefF+yYElieWKrYpBl1GvMbLJ1rnaReNh5y313f6WAq4i5iruMf5Bel9uYC2o4fJlQPlyuX4dn2Gs1dAl3jn8="],
                    ["O5/KZxd6OVOLde2aZl+dgfGDmIA8X8VfYnVGezyQZ2jrWZtaEH1+diyL9U9qXxlqN2wCb+J0aHloiFWKeYzfXs9jxXXSedeCKJPykpyE7YYtnMFUbF+MZVxtFXCnjNOMO5hPZfZ0DU7YTuBXK1lmWsxbqFEDXpxeFmB2Yndlp2VuZm5tNnIme1CBmoGZglyLoIzmjHSNHJZElq5Pq2Rmax6CYYRqheiQAVxTaaiYeoRXhQ9Pb1KpX0VeDWc="],
                    ["j3l5gQeJhon1bRdfVWK4bM9OaXKSmwZSO1R0VrNYpGFuYhpxblmJfN58G33wlodlXoAZTnVPdVFAWGNec14KX8RnJk49hYmVW5ZzfAGY+1DBWFZ2p3glUqV3EYWGe09QCVlHcsd76H26j9SPTZC/T8lSKVoBX62X3U8XguqSA1dVY2lrK3XciBSPQnrfUpNYVWEKYq5mzWs/fOmDI1D4TwVTRlQxWElZnVvwXO9cKV2WXrFiZ2M+ZbllC2c="],
                    ["1WzhbPlwMngrft6As4IMhOyEAocSiSqKSoymkNKS/ZjznGydT06hTo1QVlJKV6hZPV7YX9lfP2K0Zhtn0GfSaJJRIX2qgKiBAIuMjL+MfpIyliBULJgXU9VQXFOoWLJkNGdncmZ3RnrmkcNSoWyGawBYTF5UWSxn+3/hUcZ2aWToeFSbu57LV7lZJ2aaZ85r6VTZaVVenIGVZ6qb/mdSnF1opk7jT8hTuWIrZ6tsxI+tT21+v54HTmJhgG4="],
                    ["K28ThXNUKmdFm/NdlXusXMZbHIdKbtGEFHoIgZlZjXwRbCB32VIiWSFxX3LbdyeXYZ0LaX9aGFqlUQ1UfVQOZt9294+YkvSc6lldcsVuTVHJaL997H1il7qeeGQhagKDhFlfW9trG3PydrJ9F4CZhDJRKGfZnu52Ymf/UgWZJFw7Yn58sIxPVbZgC32AlQFTX062URxZOnI2gM6RJV/id4RTeV8EfayFM4qNjlaX82euhVOUCWEIYblsUnY="],
                    ["7Yo4jy9VUU8qUcdSy1OlW31eoGCCYdZjCWfaZ2dujG02czdzMXVQedWImIpKkJGQ9ZDElo2HFVmITllPDk6Jij+PEJitUHxellm5W7he2mP6Y8Fk3GZKadhpC222bpRxKHWveop/AIBJhMmEgYkhiwqOZZB9lgqZfmGRYjJrg2x0bcx//H/AbYV/uof4iGVnsYM8mPeWG21hfT2EapFxTnVTUF0Ea+tvzYUthqeJKVIPVGVcTmeoaAZ0g3Q="],
                    ["4nXPiOGIzJHilniWi1+Hc8t6ToSgY2V1iVJBbZxuCXRZdWt4knyGltx6jZ+2T25hxWVchoZOrk7aUCFOzFHuW5llgWi8bR9zQnatdxx653xvgtKKfJDPkXWWGJibUtF9K1CYU5dny23QcTN06IEqj6OWV5yfnmB0QViZbS99XpjkTjZPi0+3UbFSul0cYLJzPHnTgjSSt5b2lgqXl55in6ZmdGsXUqNSyHDCiMleS2CQYSNvSXE+fPR9b4A="],
                    ["7oQjkCyTQlRvm9NqiXDCjO+NMpe0UkFayl4EXxdnfGmUaWptD29icvxy7XsBgH6AS4fOkG1Rk56EeYuAMpPWii1QjFRximprxIwHgdFgoGfynZlOmE4QnGuKwYVohQBpfm6XeFWBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["DF8QThVOKk4xTjZOPE4/TkJOVk5YToJOhU5rjIpOEoINX45Onk6fTqBOok6wTrNOtk7OTs1OxE7GTsJO107eTu1O3073TglPWk8wT1tPXU9XT0dPdk+IT49PmE97T2lPcE+RT29Phk+WTxhR1E/fT85P2E/bT9FP2k/QT+RP5U8aUChQFFAqUCVQBVAcT/ZPIVApUCxQ/k/vTxFQBlBDUEdQA2dVUFBQSFBaUFZQbFB4UIBQmlCFULRQslA="],
                    ["yVDKULNQwlDWUN5Q5VDtUONQ7lD5UPVQCVEBUQJRFlEVURRRGlEhUTpRN1E8UTtRP1FAUVJRTFFUUWJR+HppUWpRblGAUYJR2FaMUYlRj1GRUZNRlVGWUaRRplGiUalRqlGrUbNRsVGyUbBRtVG9UcVRyVHbUeBRVYbpUe1R8FH1Uf5RBFILUhRSDlInUipSLlIzUjlST1JEUktSTFJeUlRSalJ0UmlSc1J/Un1SjVKUUpJScVKIUpFSqI8="],
                    ["p4+sUq1SvFK1UsFSzVLXUt5S41LmUu2Y4FLzUvVS+FL5UgZTCFM4dQ1TEFMPUxVTGlMjUy9TMVMzUzhTQFNGU0VTF05JU01T1lFeU2lTblMYWXtTd1OCU5ZToFOmU6VTrlOwU7ZTw1MSfNmW31P8Zu5x7lPoU+1T+lMBVD1UQFQsVC1UPFQuVDZUKVQdVE5Uj1R1VI5UX1RxVHdUcFSSVHtUgFR2VIRUkFSGVMdUolS4VKVUrFTEVMhUqFQ="],
                    ["q1TCVKRUvlS8VNhU5VTmVA9VFFX9VO5U7VT6VOJUOVVAVWNVTFUuVVxVRVVWVVdVOFUzVV1VmVWAVa9UilWfVXtVflWYVZ5VrlV8VYNVqVWHVahV2lXFVd9VxFXcVeRV1FUUVvdVFlb+Vf1VG1b5VU5WUFbfcTRWNlYyVjhWa1ZkVi9WbFZqVoZWgFaKVqBWlFaPVqVWrla2VrRWwla8VsFWw1bAVshWzlbRVtNW11buVvlWAFf/VgRXCVc="],
                    ["CFcLVw1XE1cYVxZXx1UcVyZXN1c4V05XO1dAV09XaVfAV4hXYVd/V4lXk1egV7NXpFeqV7BXw1fGV9RX0lfTVwpY1lfjVwtYGVgdWHJYIVhiWEtYcFjAa1JYPVh5WIVYuVifWKtYuljeWLtYuFiuWMVY01jRWNdY2VjYWOVY3FjkWN9Y71j6WPlY+1j8WP1YAlkKWRBZG1mmaCVZLFktWTJZOFk+WdJ6VVlQWU5ZWllYWWJZYFlnWWxZaVk="],
                    ["eFmBWZ1ZXk+rT6NZslnGWehZ3FmNWdlZ2lklWh9aEVocWglaGlpAWmxaSVo1WjZaYlpqWppavFq+Wstawlq9WuNa11rmWula1lr6WvtaDFsLWxZbMlvQWipbNls+W0NbRVtAW1FbVVtaW1tbZVtpW3Bbc1t1W3hbiGV6W4Bbg1umW7hbw1vHW8lb1FvQW+Rb5lviW95b5VvrW/Bb9lvzWwVcB1wIXA1cE1wgXCJcKFw4XDlcQVxGXE5cU1w="],
                    ["UFxPXHFbbFxuXGJOdlx5XIxckVyUXJtZq1y7XLZcvFy3XMVcvlzHXNlc6Vz9XPpc7VyMXepcC10VXRddXF0fXRtdEV0UXSJdGl0ZXRhdTF1SXU5dS11sXXNddl2HXYRdgl2iXZ1drF2uXb1dkF23XbxdyV3NXdNd0l3WXdtd613yXfVdC14aXhleEV4bXjZeN15EXkNeQF5OXldeVF5fXmJeZF5HXnVedl56Xryef16gXsFewl7IXtBez14="],
                    ["1l7jXt1e2l7bXuJe4V7oXule7F7xXvNe8F70Xvhe/l4DXwlfXV9cXwtfEV8WXylfLV84X0FfSF9MX05fL19RX1ZfV19ZX2FfbV9zX3dfg1+CX39fil+IX5Ffh1+eX5lfmF+gX6hfrV+8X9Zf+1/kX/hf8V/dX7Ng/18hYGBgGWAQYClgDmAxYBtgFWArYCZgD2A6YFpgQWBqYHdgX2BKYEZgTWBjYENgZGBCYGxga2BZYIFgjWDnYINgmmA="],
                    ["hGCbYJZgl2CSYKdgi2DhYLhg4GDTYLRg8F+9YMZgtWDYYE1hFWEGYfZg92AAYfRg+mADYSFh+2DxYA1hDmFHYT5hKGEnYUphP2E8YSxhNGE9YUJhRGFzYXdhWGFZYVpha2F0YW9hZWFxYV9hXWFTYXVhmWGWYYdhrGGUYZphimGRYathrmHMYcphyWH3Ychhw2HGYbphy2F5f81h5mHjYfZh+mH0Yf9h/WH8Yf5hAGIIYgliDWIMYhRiG2I="],
                    ["HmIhYipiLmIwYjJiM2JBYk5iXmJjYltiYGJoYnxigmKJYn5ikmKTYpZi1GKDYpRi12LRYrtiz2L/YsZi1GTIYtxizGLKYsJix2KbYsliDGPuYvFiJ2MCYwhj72L1YlBjPmNNYxxkT2OWY45jgGOrY3Zjo2OPY4ljn2O1Y2tjaWO+Y+ljwGPGY+NjyWPSY/ZjxGMWZDRkBmQTZCZkNmQdZRdkKGQPZGdkb2R2ZE5kKmWVZJNkpWSpZIhkvGQ="],
                    ["2mTSZMVkx2S7ZNhkwmTxZOdkCYLgZOFkrGLjZO9kLGX2ZPRk8mT6ZABl/WQYZRxlBWUkZSNlK2U0ZTVlN2U2ZThlS3VIZVZlVWVNZVhlXmVdZXJleGWCZYNlioubZZ9lq2W3ZcNlxmXBZcRlzGXSZdtl2WXgZeFl8WVyZwpmA2b7ZXNnNWY2ZjRmHGZPZkRmSWZBZl5mXWZkZmdmaGZfZmJmcGaDZohmjmaJZoRmmGadZsFmuWbJZr5mvGY="],
                    ["xGa4ZtZm2mbgZj9m5mbpZvBm9Wb3Zg9nFmceZyZnJ2c4ly5nP2c2Z0FnOGc3Z0ZnXmdgZ1lnY2dkZ4lncGepZ3xnameMZ4tnpmehZ4Vnt2fvZ7Rn7GezZ+lnuGfkZ95n3WfiZ+5nuWfOZ8Zn52ecah5oRmgpaEBoTWgyaE5os2graFloY2h3aH9on2iPaK1olGidaJtog2iuarlodGi1aKBoumgPaY1ofmgBacpoCGnYaCJpJmnhaAxpzWg="],
                    ["1GjnaNVoNmkSaQRp12jjaCVp+WjgaO9oKGkqaRppI2khacZoeWl3aVxpeGlraVRpfmluaTlpdGk9aVlpMGlhaV5pXWmBaWppsmmuadBpv2nBadNpvmnOaehbymndabtpw2mnaS5qkWmgaZxplWm0ad5p6GkCahtq/2kKa/lp8mnnaQVqsWkeau1pFGrraQpqEmrBaiNqE2pEagxqcmo2anhqR2piallqZmpIajhqImqQao1qoGqEaqJqo2o="],
                    ["l2oXhrtqw2rCarhqs2qsat5q0Wrfaqpq2mrqavtqBWsWhvpqEmsWazGbH2s4azdr3HY5a+6YR2tDa0lrUGtZa1RrW2tfa2FreGt5a39rgGuEa4NrjWuYa5Vrnmuka6prq2uva7JrsWuza7drvGvGa8tr02vfa+xr62vza+9rvp4IbBNsFGwbbCRsI2xebFVsYmxqbIJsjWyabIFsm2x+bGhsc2ySbJBsxGzxbNNsvWzXbMVs3WyubLFsvmw="],
                    ["umzbbO9s2WzqbB9tTYg2bSttPW04bRltNW0zbRJtDG1jbZNtZG1abXltWW2ObZVt5G+FbfltFW4KbrVtx23mbbhtxm3sbd5tzG3obdJtxW36bdlt5G3Vbept7m0tbm5uLm4ZbnJuX24+biNua24rbnZuTW4fbkNuOm5ObiRu/24dbjhugm6qbphuyW63btNuvW6vbsRusm7UbtVuj26lbsJun25BbxFvTHDsbvhu/m4/b/JuMW/vbjJvzG4="],
                    ["Pm8Tb/duhm96b3hvgW+Ab29vW2/zb21vgm98b1hvjm+Rb8JvZm+zb6NvoW+kb7lvxm+qb99v1W/sb9Rv2G/xb+5v228JcAtw+m8RcAFwD3D+bxtwGnB0bx1wGHAfcDBwPnAycFFwY3CZcJJwr3DxcKxwuHCzcK5w33DLcN1w2XAJcf1wHHEZcWVxVXGIcWZxYnFMcVZxbHGPcftxhHGVcahxrHHXcblxvnHScclx1HHOceBx7HHncfVx/HE="],
                    ["+XH/cQ1yEHIbcihyLXIscjByMnI7cjxyP3JAckZyS3JYcnRyfnKCcoFyh3KScpZyonKncrlysnLDcsZyxHLOctJy4nLgcuFy+XL3cg9QF3MKcxxzFnMdczRzL3MpcyVzPnNOc09z2J5Xc2pzaHNwc3hzdXN7c3pzyHOzc85zu3PAc+Vz7nPec6J0BXRvdCV0+HMydDp0VXQ/dF90WXRBdFx0aXRwdGN0anR2dH50i3SedKd0ynTPdNR08XM="],
                    ["4HTjdOd06XTudPJ08HTxdPh093QEdQN1BXUMdQ51DXUVdRN1HnUmdSx1PHVEdU11SnVJdVt1RnVadWl1ZHVndWt1bXV4dXZ1hnWHdXR1inWJdYJ1lHWadZ11pXWjdcJ1s3XDdbV1vXW4dbx1sXXNdcp10nXZdeN13nX+df91/HUBdvB1+nXydfN1C3YNdgl2H3YndiB2IXYidiR2NHYwdjt2R3ZIdkZ2XHZYdmF2YnZodml2anZndmx2cHY="],
                    ["cnZ2dnh2fHaAdoN2iHaLdo52lnaTdpl2mnawdrR2uHa5drp2wnbNdtZ20nbeduF25Xbndup2L4b7dgh3B3cEdyl3JHcedyV3Jncbdzd3OHdHd1p3aHdrd1t3ZXd/d353eXeOd4t3kXegd553sHe2d7l3v3e8d713u3fHd81313fad9x343fud/x3DHgSeCZ5IHgqeUV4jnh0eIZ4fHiaeIx4o3i1eKp4r3jReMZ4y3jUeL54vHjFeMp47Hg="],
                    ["53jaeP149HgHeRJ5EXkZeSx5K3lAeWB5V3lfeVp5VXlTeXp5f3mKeZ15p3lLn6p5rnmzebl5unnJedV553nseeF543kIeg16GHoZeiB6H3qAeTF6O3o+ejd6Q3pXekl6YXpieml6nZ9wenl6fXqIepd6lXqYepZ6qXrIerB6tnrFesR6v3qDkMd6ynrNes961XrTetl62nrdeuF64nrmeu168HoCew97CnsGezN7GHsZex57NXsoezZ7UHs="],
                    ["ensEe017C3tMe0V7dXtle3R7Z3twe3F7bHtue517mHufe417nHuae4t7knuPe117mXvLe8F7zHvPe7R7xnvde+l7EXwUfOZ75XtgfAB8B3wTfPN793sXfA189nsjfCd8KnwffDd8K3w9fEx8Q3xUfE98QHxQfFh8X3xkfFZ8ZXxsfHV8g3yQfKR8rXyifKt8oXyofLN8snyxfK58uXy9fMB8xXzCfNh80nzcfOJ8O5vvfPJ89Hz2fPp8Bn0="],
                    ["An0cfRV9Cn1FfUt9Ln0yfT99NX1GfXN9Vn1OfXJ9aH1ufU99Y32TfYl9W32PfX19m326fa59o321fcd9vX2rfT1+on2vfdx9uH2ffbB92H3dfeR93n37ffJ94X0Ffgp+I34hfhJ+MX4ffgl+C34ifkZ+Zn47fjV+OX5Dfjd+Mn46fmd+XX5Wfl5+WX5afnl+an5pfnx+e36DftV9fX6uj39+iH6Jfox+kn6QfpN+lH6Wfo5+m36cfjh/On8="],
                    ["RX9Mf01/Tn9Qf1F/VX9Uf1h/X39gf2h/aX9nf3h/gn+Gf4N/iH+Hf4x/lH+ef51/mn+jf69/sn+5f65/tn+4f3GLxX/Gf8p/1X/Uf+F/5n/pf/N/+X/cmAaABIALgBKAGIAZgByAIYAogD+AO4BKgEaAUoBYgFqAX4BigGiAc4BygHCAdoB5gH2Af4CEgIaAhYCbgJOAmoCtgJBRrIDbgOWA2YDdgMSA2oDWgAmB74DxgBuBKYEjgS+BS4E="],
                    ["i5ZGgT6BU4FRgfyAcYFugWWBZoF0gYOBiIGKgYCBgoGggZWBpIGjgV+Bk4GpgbCBtYG+gbiBvYHAgcKBuoHJgc2B0YHZgdiByIHagd+B4IHngfqB+4H+gQGCAoIFggeCCoINghCCFoIpgiuCOIIzgkCCWYJYgl2CWoJfgmSCYoJogmqCa4IugnGCd4J4gn6CjYKSgquCn4K7gqyC4YLjgt+C0oL0gvOC+oKTgwOD+4L5gt6CBoPcggmD2YI="],
                    ["NYM0gxaDMoMxg0CDOYNQg0WDL4MrgxeDGIOFg5qDqoOfg6KDloMjg46Dh4OKg3yDtYNzg3WDoIOJg6iD9IMThOuDzoP9gwOE2IMLhMGD94MHhOCD8oMNhCKEIIS9gziEBoX7g22EKoQ8hFqFhIR3hGuErYRuhIKEaYRGhCyEb4R5hDWEyoRihLmEv4SfhNmEzYS7hNqE0ITBhMaE1oShhCGF/4T0hBeFGIUshR+FFYUUhfyEQIVjhViFSIU="],
                    ["QYUChkuFVYWAhaSFiIWRhYqFqIVthZSFm4XqhYeFnIV3hX6FkIXJhbqFz4W5hdCF1YXdheWF3IX5hQqGE4YLhv6F+oUGhiKGGoYwhj+GTYZVTlSGX4ZnhnGGk4ajhqmGqoaLhoyGtoavhsSGxoawhsmGI4irhtSG3obphuyG34bbhu+GEocGhwiHAIcDh/uGEYcJhw2H+YYKhzSHP4c3hzuHJYcphxqHYIdfh3iHTIdOh3SHV4doh26HWYc="],
                    ["U4djh2qHBYiih5+Hgoevh8uHvYfAh9CH1parh8SHs4fHh8aHu4fvh/KH4IcPiA2I/of2h/eHDojShxGIFogViCKIIYgxiDaIOYgniDuIRIhCiFKIWYheiGKIa4iBiH6Inoh1iH2ItYhyiIKIl4iSiK6ImYiiiI2IpIiwiL+IsYjDiMSI1IjYiNmI3Yj5iAKJ/Ij0iOiI8ogEiQyJCokTiUOJHokliSqJK4lBiUSJO4k2iTiJTIkdiWCJXok="],
                    ["ZolkiW2JaolviXSJd4l+iYOJiImKiZOJmImhiamJpomsia+Jsom6ib2Jv4nAidqJ3IndieeJ9In4iQOKFooQigyKG4odiiWKNopBiluKUopGikiKfIptimyKYoqFioKKhIqoiqGKkYqliqaKmoqjisSKzYrCitqK64rziueK5IrxihSL4IriiveK3orbigyLB4sai+GKFosQixeLIIszi6uXJosriz6LKItBi0yLT4tOi0mLVotbi1qLa4s="],
                    ["X4tsi2+LdIt9i4CLjIuOi5KLk4uWi5mLmos6jEGMP4xIjEyMToxQjFWMYoxsjHiMeoyCjImMhYyKjI2MjoyUjHyMmIwdYq2Mqoy9jLKMs4yujLaMyIzBjOSM44zajP2M+oz7jASNBY0KjQeND40NjRCNTp8Tjc2MFI0WjWeNbY1xjXONgY2ZjcKNvo26jc+N2o3WjcyN243LjeqN643fjeON/I0IjgmO/40djh6OEI4fjkKONY4wjjSOSo4="],
                    ["R45JjkyOUI5IjlmOZI5gjiqOY45VjnaOco58joGOh46FjoSOi46KjpOOkY6UjpmOqo6hjqyOsI7GjrGOvo7FjsiOy47bjuOO/I77juuO/o4KjwWPFY8SjxmPE48cjx+PG48MjyaPM487jzmPRY9Cjz6PTI9Jj0aPTo9Xj1yPYo9jj2SPnI+fj6OPrY+vj7eP2o/lj+KP6o/vj4eQ9I8FkPmP+o8RkBWQIZANkB6QFpALkCeQNpA1kDmQ+I8="],
                    ["T5BQkFGQUpAOkEmQPpBWkFiQXpBokG+QdpColnKQgpB9kIGQgJCKkImQj5CokK+QsZC1kOKQ5JBIYtuQApESkRmRMpEwkUqRVpFYkWORZZFpkXORcpGLkYmRgpGikauRr5GqkbWRtJG6kcCRwZHJkcuR0JHWkd+R4ZHbkfyR9ZH2kR6S/5EUkiySFZIRkl6SV5JFkkmSZJJIkpWSP5JLklCSnJKWkpOSm5Jaks+SuZK3kumSD5P6kkSTLpM="],
                    ["GZMikxqTI5M6kzWTO5Nck2CTfJNuk1aTsJOsk62TlJO5k9aT15Pok+WT2JPDk92T0JPIk+STGpQUlBOUA5QHlBCUNpQrlDWUIZQ6lEGUUpRElFuUYJRilF6UapQpknCUdZR3lH2UWpR8lH6UgZR/lIKVh5WKlZSVlpWYlZmVoJWolaeVrZW8lbuVuZW+lcqV9m/Dlc2VzJXVldSV1pXcleGV5ZXilSGWKJYuli+WQpZMlk+WS5Z3llyWXpY="],
                    ["XZZflmaWcpZslo2WmJaVlpeWqpanlrGWspawlrSWtpa4lrmWzpbLlsmWzZZNidyWDZfVlvmWBJcGlwiXE5cOlxGXD5cWlxmXJJcqlzCXOZc9lz6XRJdGl0iXQpdJl1yXYJdkl2aXaJfSUmuXcZd5l4WXfJeBl3qXhpeLl4+XkJecl6iXppejl7OXtJfDl8aXyJfLl9yX7ZdPn/KX33r2l/WXD5gMmDiYJJghmDeYPZhGmE+YS5hrmG+YcJg="],
                    ["cZh0mHOYqpivmLGYtpjEmMOYxpjpmOuYA5kJmRKZFJkYmSGZHZkemSSZIJksmS6ZPZk+mUKZSZlFmVCZS5lRmVKZTJlVmZeZmJmlma2Zrpm8md+Z25ndmdiZ0Zntme6Z8ZnymfuZ+JkBmg+aBZrimRmaK5o3mkWaQppAmkOaPppVmk2aW5pXml+aYpplmmSaaZprmmqarZqwmryawJrPmtGa05rUmt6a35rimuOa5prvmuua7pr0mvGa95o="],
                    ["+5oGmxibGpsfmyKbI5slmyebKJspmyqbLpsvmzKbRJtDm0+bTZtOm1GbWJt0m5Obg5uRm5abl5ufm6CbqJu0m8Cbypu5m8abz5vRm9Kb45vim+Sb1Jvhmzqc8pvxm/CbFZwUnAmcE5wMnAacCJwSnAqcBJwunBucJZwknCGcMJxHnDKcRpw+nFqcYJxnnHaceJznnOyc8JwJnQid65wDnQadKp0mna+dI50fnUSdFZ0SnUGdP50+nUadSJ0="],
                    ["XZ1enWSdUZ1QnVmdcp2JnYedq51vnXqdmp2knamdsp3EncGdu524nbqdxp3PncKd2Z3Tnfid5p3tne+d/Z0anhueHp51nnmefZ6Bnoiei56MnpKelZ6Rnp2epZ6pnrieqp6tnmGXzJ7Ons+e0J7Untye3p7dnuCe5Z7onu+e9J72nvee+Z77nvye/Z4Hnwift3YVnyGfLJ8+n0qfUp9Un2OfX59gn2GfZp9nn2yfap93n3Kfdp+Vn5yfoJ8="],
                    ["L1jHaVmQZHTcUZlxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]
                ];
            }
        }
    }
}
