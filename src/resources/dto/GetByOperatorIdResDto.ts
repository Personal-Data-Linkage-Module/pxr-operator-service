/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { OperatorType } from '../../common/OperatorType';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
const moment = require('moment-timezone');
const Message = Config.ReadConfig('./config/message.json');

export default class GetByOperatorIdResDto {
    /**
     * OperatorID
     */
    public operatorId: number = 0;

    /**
     * 種別
     */
    public type: number = 0;

    /**
     * ログインID
     */
    public loginId: string = '';

    /**
     * pxrId
     */
    public pxrId: string = '';

    /**
     * 表示名
     */
    public name: string = '';

    /**
     * 携帯電話
     */
    public mobilePhone: string = '';

    /**
     * 権限
     */
    public auth: any = null;

    /**
     * 前回ログイン日時
     */
    public lastLoginAt: Date | null = null;

    /**
     * パスワード変更フラグ
     */
    public passwordChangedFlg: boolean = false;

    /**
     * ログイン不可フラグ
     */
    public loginProhibitedFlg: boolean = false;

    /**
     * その他属性
     */
    public attributes: string = '';

    /**
     * ロール
     */
    public roles: any = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (opType: number): {} {
        const resData: any = {};
        resData.operatorId = this.operatorId;
        resData.type = this.type;
        resData.loginId = this.loginId;

        if (opType === OperatorType.TYPE_IND) {
            resData.pxrId = this.pxrId;
        }
        if (opType !== OperatorType.TYPE_IND && this.name) {
            resData.name = this.name;
        }
        if (opType === OperatorType.TYPE_IND && this.mobilePhone) {
            resData.mobilePhone = this.mobilePhone;
        }

        if (opType === OperatorType.TYPE_MANAGE_MEMBER && this.auth) {
            resData.auth = this.auth;
        }
        if (this.lastLoginAt) {
            resData.lastLoginAt = moment(this.lastLoginAt).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
        }

        resData.passwordChangedFlg = this.passwordChangedFlg;

        if (opType === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }

        if (this.attributes) {
            resData.attributes = this.attributes;
        }
        if (opType !== OperatorType.TYPE_IND) {
            if ((this.roles) && (this.roles.length > 0)) {
                resData.roles = this.roles;
            }
        }

        resData.loginProhibitedFlg = this.loginProhibitedFlg;
        return resData;
    }
}
