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

export default class PutByOperatorIdResDto {
    /**
     * OperatorID
     */
    public operatorId: number | null = null;

    /**
     * 種別
     */
    public type: number | null = null;

    /**
     * ログインID
     */
    public loginId: string | null = null;

    /**
     * pxrId
     */
    public pxrId: string | null = null;

    /**
     * 表示名
     */
    public name: string | null = null;

    /**
     * 携帯電話
     */
    public mobilePhone: string | null = null;

    /**
     * パスワード変更フラグ
     */
    public pcFlg: boolean | null= null;

    /**
     * ログイン不可フラグ
     */
    public lpFlg: boolean | null= null;

    /**
     * 権限
     */
    public auth: any = null;

    /**
     * 前回ログイン日時
     */
    public lastLoginAt: Date | null = null;

    /**
     * その他属性
     */
    public attributes: any = null;

    /**
     * ロール
     */
    public roles: any = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (type: number): {} {
        const responseData:any = {};
        responseData.id = this.operatorId;
        responseData.type = type;
        responseData.loginId = this.loginId;
        if (type === OperatorType.TYPE_IND) {
            responseData.pxrId = this.pxrId;
        }
        if (type !== OperatorType.TYPE_IND && this.name) {
            responseData.name = this.name;
        }
        if (type === OperatorType.TYPE_IND && this.mobilePhone) {
            responseData.mobilePhone = this.mobilePhone;
        }
        if (type === OperatorType.TYPE_MANAGE_MEMBER && this.auth) {
            responseData.auth = this.auth;
        }
        responseData.passwordChangedFlg = this.pcFlg;

        if (this.attributes) {
            responseData.attributes = this.attributes;
        }
        if (type !== OperatorType.TYPE_IND && this.roles.length > 0) {
            responseData.roles = this.roles;
        }
        return responseData;
    }
}
