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

// SDE-IMPL-REQUIRED 本ファイルをコピーしコントローラーに定義した各 REST API のリクエスト・レスポンスごとにDTOを作成します。
import { OperatorType } from '../../common/OperatorType';
const moment = require('moment-timezone');

export class CodeVersion {
    /**
     * コード
     */
    _value: number | null = null;

    /**
     * バージョン
     */
    _ver: number | null = null;

    /**
     * コンストラクタ
     * @param code
     * @param version
     */
    public constructor (code: number, version: number) {
        this._value = code;
        this._ver = version;
    }
}

export default class PostLoginResDto {
    /**
     * セッションID
     */
    sessionId: string = '';

    /**
     * オペレータID
     */
    operatorId: number = 0;

    /**
     * オペレータタイプ
     */
    type: number = 0;

    /**
     * ログインID
     */
    loginId: string = '';

    /**
     * 表示名
     */
    name: string = '';

    /**
     * pxrId
     */
    pxrId: string = '';

    /**
     * 携帯電話番号
     */
    mobilePhone: string = '';

    /**
     * パスワード変更フラグ
     */
    passwordChangeFlg: boolean = false;

    /**
     * 権限
     */
    auth: any = null;

    /**
     * 前回ログイン日時
     */
    lastLoginAt: Date;

    /**
     * その他属性
     */
    attributes: string = '';

    /**
     * 権限
     */
    roles: CodeVersion[] = null;

    /**
     * ブロック
     */
    block: CodeVersion = null;

    /**
     * アクター
     */
    actor: CodeVersion = null;

    /**
     * ログイン不可フラグ
     */
    loginProhibitedFlg: boolean = null;

    userInformation: null | string = null;

    public setSessionId (sessionId: string): void {
        this.sessionId = sessionId;
    }

    public setOperatorId (operatorId: number): void {
        this.operatorId = operatorId;
    }

    public setType (type: number): void {
        this.type = type;
    }

    public setLoginId (loginId: string): void {
        this.loginId = loginId;
    }

    public setPxrId (pxrId: string): void {
        this.pxrId = pxrId;
    }

    public setPasswordChangeFlg (passwordChangeFlg: boolean): void {
        this.passwordChangeFlg = passwordChangeFlg;
    }

    public setLoginProhibitedFlg (flag: boolean) {
        this.loginProhibitedFlg = flag;
    }

    public setName (name: string): void {
        this.name = name;
    }

    public setMobilePhone (mobilePhone: string): void {
        this.mobilePhone = mobilePhone;
    }

    public setAuth (auth: any): void {
        this.auth = auth;
    }

    public setLastLoginAt (lastLoginAt: Date): void {
        this.lastLoginAt = lastLoginAt;
    }

    public setAttributes (attributes: string): void {
        this.attributes = attributes;
    }

    public setRoles (roles: CodeVersion[]): void {
        this.roles = roles;
    }

    public setBlock (block: CodeVersion): void {
        this.block = block;
    }

    public setActor (actor: CodeVersion): void {
        this.actor = actor;
    }

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        const responseData:any = {};
        responseData.sessionId = this.sessionId;
        responseData.operatorId = this.operatorId;
        responseData.type = this.type;
        responseData.loginId = this.loginId;
        if (this.type === OperatorType.TYPE_IND) {
            responseData.pxrId = this.pxrId;
            responseData.userInformation = this.userInformation;
        }
        if (this.name != null) {
            responseData.name = this.name;
        }
        if (this.mobilePhone != null) {
            responseData.mobilePhone = this.mobilePhone;
        }
        if (this.type === OperatorType.TYPE_MANAGE_MEMBER && this.auth) {
            responseData.auth = this.auth;
        }
        responseData.lastLoginAt = this.lastLoginAt ? moment(this.lastLoginAt).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ss.SSSZZ') : null;
        responseData.passwordChangedFlg = this.passwordChangeFlg;
        responseData.loginProhibitedFlg = this.loginProhibitedFlg;
        if (this.attributes) {
            responseData.attributes = this.attributes;
        }
        if (this.roles) {
            responseData.roles = this.roles;
        }

        responseData.block = this.block;
        responseData.actor = this.actor;

        return responseData;
    }
}
