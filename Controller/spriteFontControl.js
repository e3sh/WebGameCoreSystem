// GameSpriteFontControl
//

function GameSpriteFontControl( g, fontParam ) {
 
    var buffer_ = g.screen[0].buffer;
    //buffer  (offScreen)
    this.useScreen = function (num) {

        buffer_ = g.screen[num].buffer;
    }

    var tex_c = fontParam.Image
    var sp_ch_ptn = fontParam.pattern;

    //������

    //set/useFont( id )�Ŏg�p����SpriteFont��I���
    //print�ŕ`��Ƃ��邩�Hspprint�H

    //�����̊g��k���͕�

    //systemFont�ŕ`�悾���ł������̂ł�
    //WebFont�ɂ��Ē��ׂ铙
    //systemFont���ƕ`�悪�d������

    //�����\���͕�Canvas�ɂ���
    //�������������Ȃ��悤�ɂ��Ă����ق������ׂ͒Ⴂ

    //-------------------------------------------------------------
    /// �X�v���C�g�𕶎��Ƃ��ĕ\��(�p�^�[���z�u��Space�`[~]��ASCII�z��Ɖ����)
    /// ���� S : ������ X,Y : ���W z:zoom
    //-------------------------------------------------------------
    //�\���ʒu��x,y������ƂȂ�悤�ɕ\������܂��B�g�傷��Ƃ���܂��B

    //    this.putchr = chr8x8put;
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

            if ((n >= 32) && (n < 128)) { // space �` "~" �܂�
                var d = sp_ch_ptn[n - 32];

                var wx = x + i * (d.w * z);
                var wy = y;
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
    }

}

