/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */
import { OperatorType } from '../../common/OperatorType';
const moment = require('moment-timezone');

// SDE-IMPL-REQUIRED 本ファイルをコピーしコントローラーに定義した各 REST API のリクエスト・レスポンスごとにDTOを作成します。

export default class PostSessionResDto {
    /**
     * SessionID
     */
    public sessionId: string = null;

    /**
     * OperatorID
     */
    public operatorId: number = null;

    /**
     * 種別
     */
    public type: number = null;

    /**
     * ログインID
     */
    public loginId: string = null;

    /**
     * pxrId
     */
    public pxrId: string = null;

    /**
     * 表示名
     */
    public name: string = null;

    /**
     * 携帯電話
     */
    public mobilePhone: string = null;

    /**
     * パスワード変更フラグ
     */
    public passwordChangedFlg: boolean = null;

    /**
     * 権限
     */
    public auth: any = null;

    /**
     * 前回ログイン日時
     */
    public lastLoginAt: Date = new Date();

    /**
     * その他属性
     */
    public attributes: any = null;

    /**
     * ロール
     */
    public roles: any = null;

    /**
     * block
     */
    public block: any = null;

    /**
     * actor
     */
    public actor: any = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (opType: number): {} {
        const resData: any = {};
        resData.sessionId = this.sessionId;
        resData.operatorId = this.operatorId;
        resData.type = this.type;
        resData.loginId = this.loginId;

        if (opType === OperatorType.TYPE_IND) {
            resData.pxrId = this.pxrId;
        }
        if (this.name) {
            resData.name = this.name;
        }
        if (this.mobilePhone) {
            resData.mobilePhone = this.mobilePhone;
        }

        if (opType === OperatorType.TYPE_MANAGE_MEMBER && this.auth) {
            resData.auth = this.auth;
        }
        if (this.lastLoginAt) {
            resData.lastLoginAt = moment(this.lastLoginAt).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
        }

        resData.passwordChangedFlg = this.passwordChangedFlg;

        if (this.attributes) {
            resData.attributes = this.attributes;
        }

        if (this.roles.length > 0) {
            resData.roles = this.roles;
        }

        resData.block = this.block;

        resData.actor = this.actor;

        // const res = JSON.parse(resData);
        return resData;
    }
}
