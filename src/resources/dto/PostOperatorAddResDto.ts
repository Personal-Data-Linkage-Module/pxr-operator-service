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
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

export default class PostOperatorAddResDto {
    /**
     * OperatorID
     */
    public id: number = 0;

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
     * 利用者ID
     */
    public userId: string = null;

    /**
     * Regionカタログコード
     */
    public regionCatalogCode: number = null;

    /**
     * APPカタログコード
     */
    public appCatalogCode: number = null;

    /**
     * WFカタログコード
     */
    public wfCatalogCode: number = null;

    /**
     * クライアントID
     */
    public clientId: string = null;

    /**
     * クライアントシークレット
     */
    public clientSecret: string = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (opType: number): {} {
        const resData: any = {};
        resData.id = this.id;
        resData.type = this.type;
        resData.loginId = this.loginId;

        if (opType === OperatorType.TYPE_IND &&
            this.loginProhibitedFlg !== true
        ) {
            resData.pxrId = this.pxrId;
        }
        if (opType !== OperatorType.TYPE_IND && this.name) {
            resData.name = this.name;
        }

        if (opType === OperatorType.TYPE_IND && this.loginProhibitedFlg) {
            resData.userId = this.userId;

            if (this.regionCatalogCode) {
                resData.regionCatalogCode = this.regionCatalogCode;
            } else if (this.appCatalogCode) {
                resData.appCatalogCode = this.appCatalogCode;
            } else {
                resData.wfCatalogCode = this.wfCatalogCode;
            }
        }

        if (opType === OperatorType.TYPE_IND && this.mobilePhone) {
            resData.mobilePhone = this.mobilePhone;
        }

        if (opType === OperatorType.TYPE_MANAGE_MEMBER && this.auth) {
            resData.auth = this.auth;
        }

        resData.passwordChangedFlg = this.passwordChangedFlg;

        if (opType === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }
        if (opType === OperatorType.TYPE_IND) {
            resData.loginProhibitedFlg = this.loginProhibitedFlg;
        }
        resData.attributes = this.attributes;
        if (opType !== OperatorType.TYPE_IND) {
            if ((this.roles) && (this.roles.length > 0)) {
                resData.roles = this.roles;
            }
        }
        if (this.clientId && this.clientSecret) {
            resData.clientId = this.clientId;
            resData.clientSecret = this.clientSecret;
        }
        return resData;
    }
}
