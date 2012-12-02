// SpriteFontData
//

function SpriteFontData() {

    //fontid
    //

    //" "～"~"

    //
    /*
    var spf = {
        name: "fontname",
        id: "imageid",
        pattern:[
            {x:0,y:0,w:0,h:0},


            {x:0,y:0,w:0,h:0}
        ]
    }
    */

    //未着手
    var sp_ch_ptn = [];

    for (i = 0; i < 7; i++) {
        for (j = 0; j < 16; j++) {
            ptn = {
                x: 12 * j,
                y: 16 * i,
                w: 12,
                h: 16
            }

            sp_ch_ptn.push(ptn);
        }
    }
    //12_16_font

    var sp8 = []; //spchrptn8(color)
    var cname = ["white", "red", "green", "blue"];

    for (var t = 0; t <= 3; t++) {

        var ch = [];

        for (i = 0; i < 7; i++) {
            for (j = 0; j < 16; j++) {
                ptn = {
                    x: 8 * j + ((t % 2 == 0) ? 0 : 128),
                    y: 8 * i + 128 + ((t >= 2) ? 64 : 0),
                    w: 8,
                    h: 8
                };
                ch.push(ptn);
            }
        }
        sp8[ cname[t] ] = ch;
    }
    //↑↑

    return [
        { name: "std"     , id: "FontGraph", pattern: sp_ch_ptn },
        { name: "8x8white", id: "FontGraph", pattern: sp8["white"] },
        { name: "8x8red"  , id: "FontGraph", pattern: sp8["red"] },
        { name: "8x8green", id: "FontGraph", pattern: sp8["green"] },
        { name: "8x8blue" , id: "FontGraph", pattern: sp8["blue"] }
    ]
}
