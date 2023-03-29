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

/* eslint-disable */
import AuthMe from '../../domains/AuthMe';
/* eslint-enable */
export default class OperatorServiceDto {
    /** operatorId */
    private operatorId: number = 0;

    /** 種別 */
    private type: number = null;

    /** ログインID */
    private loginId: string = null;

    /** パスワード */
    private hpassword: string = null;

    /** pxrId */
    private pxrId: string = null;

    /** 新パスワード */
    private newHpassword: string = null;

    /** 表示名 */
    private name: string = null;

    /** 携帯電話 */
    private mobilePhone: string = null;

    /** 権限 */
    private auth: any = null;

    /** その他属性 */
    private attributes: string = null;

    /** ロール */
    private roles: any = null;

    /** リクエスト情報 */
    private request: any = null;

    /** レスポンス情報 */
    private response: any = null;

    /** 設定ファイル情報 */
    private configure: {} = null;

    /** ログイン不可フラグ */
    private loginProhibitedFlg: boolean | null = null;

    /** セッション */
    private session: AuthMe = null;

    public getOperatorId (): number {
        return this.operatorId;
    }

    public setOperatorId (operatotId: number) {
        this.operatorId = operatotId;
    }

    public getType (): number {
        return this.type;
    }

    public setType (type: number) {
        this.type = type;
    }

    public getLoginId (): string {
        return this.loginId;
    }

    public setLoginId (loginId: string) {
        this.loginId = loginId;
    }

    public getHpassword (): string {
        return this.hpassword;
    }

    public setHpassword (hpassword: string) {
        this.hpassword = hpassword;
    }

    public getPxrId (): string {
        return this.pxrId;
    }

    public setPxrId (pxrId: string) {
        this.pxrId = pxrId;
    }

    public getNewHpassword (): string {
        return this.newHpassword;
    }

    public setNewHpassword (newHpassword: string) {
        this.newHpassword = newHpassword;
    }

    public getName (): string {
        return this.name;
    }

    public setName (name: string) {
        this.name = name;
    }

    public getMobilePhone (): string {
        return this.mobilePhone;
    }

    public setMobilePhone (mobilePhone: string) {
        this.mobilePhone = mobilePhone;
    }

    public getAttributes (): string {
        return this.attributes;
    }

    public setAttributes (attributes: string) {
        this.attributes = attributes;
    }

    public getRoles (): any {
        return this.roles;
    }

    public setRoles (roles: any) {
        this.roles = roles;
    }

    public getRequest (): any {
        return this.request;
    }

    public setRequest (request: any) {
        this.request = request;
    }

    public getResponse (): any {
        return this.response;
    }

    public setResponse (response: any) {
        this.response = response;
    }

    public getConfigure (): any {
        return this.configure;
    }

    public setConfigure (configure: any) {
        this.configure = configure;
    }

    public getAuth (): any {
        return this.auth;
    }

    public setAuth (auth: any) {
        this.auth = auth;
    }

    public getLoginProhibitedFlg (): boolean {
        return this.loginProhibitedFlg;
    }

    public setLoginProhibitedFlg (loginProhibitedFlg: boolean) {
        this.loginProhibitedFlg = loginProhibitedFlg;
    }

    public getSession (): AuthMe {
        return this.session;
    }

    public setSession (session: AuthMe) {
        this.session = session;
    }
}
