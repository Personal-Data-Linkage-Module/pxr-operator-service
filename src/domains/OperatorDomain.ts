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

// SDE-IMPL-REQUIRED 本ファイルをコピーし適切なファイル名、クラス名に変更したうえで実際の業務処理を実装してください。
/**
 * Operatorテーブルドメイン
 */
export default class OperatorDomain {
    /** 個人メンバーのセッションキー */
    public static readonly TYPE_PERSONAL_KEY = 'operator_type0_session';

    /** アプリケーションメンバーのセッションキー */
    public static readonly TYPE_APPLICATION_KEY = 'operator_type2_session';

    /** 運営メンバーのセッションキー */
    public static readonly TYPE_MANAGER_KEY = 'operator_type3_session';

    /** operatorId */
    operatorId: number = 0;

    /** 種別 */
    type: number = 0;

    /** ログインID */
    loginId: string = '';

    /** ハッシュパスワード */
    hpassword: string = '';

    /** pxrId */
    pxrId: string | null = null;

    /** 表示名 */
    name: string | null = null;

    /** 携帯電話番号 */
    mobilePhone: string | null = null;

    /** メールアドレス */
    mail: string | null = null;

    /** パスワード変更フラグ */
    passwordChangedFlg: boolean = false;

    /** 権限 */
    auth: any = null;

    /** 前回ログイン日時 */
    lastLoginAt: Date | null = null;

    /** その他属性 */
    attributes: any = null;

    /** ログイン不可フラグ */
    loginProhibitedFlg: boolean;

    /** 削除フラグ */
    isDisabled: boolean = false;

    /** 登録者 */
    createdBy: string = '';

    /** 登録日時 */
    createdAt: Date = new Date();

    /** 更新者 */
    updatedBy: string = '';

    /** 更新日時 */
    updatedAt: Date = new Date();

    /** 一意性制約チェック列：login_id */
    uniqueCheckLoginId: string = '';

    public getOperatotId (): number {
        return this.operatorId;
    }

    public setOperatotId (operatorId: number): void {
        this.operatorId = operatorId;
    }

    public getType (): number {
        return this.type;
    }

    public setType (type: number): void {
        this.type = type;
    }

    public getLoginId (): string {
        return this.loginId;
    }

    public setLoginId (loginId: string): void {
        this.loginId = loginId;
    }

    public getHPassword (): string {
        return this.hpassword;
    }

    public setHPassword (hpassword: string): void {
        this.hpassword = hpassword;
    }

    public getPxrId (): string | null {
        return this.pxrId;
    }

    public setPxrId (pxrId: string): void {
        this.pxrId = pxrId;
    }

    public getName (): string | null {
        return this.name;
    }

    public setName (name: string | null): void {
        this.name = name;
    }

    public getMobilePhone (): string | null {
        return this.mobilePhone;
    }

    public setMobilePhone (mobilePhone: string | null): void {
        this.mobilePhone = mobilePhone;
    }

    public getAuth (): any {
        return this.auth;
    }

    public setAuth (auth: any): void {
        this.auth = auth;
    }

    public getLastLoginAt (): Date | null {
        return this.lastLoginAt;
    }

    public setLastLoginAt (lastLoginAt: Date): void {
        this.lastLoginAt = lastLoginAt;
    }

    public getPasswordChangedFlg (): boolean {
        return this.passwordChangedFlg;
    }

    public setPasswordChangedFlg (passwordChangedFlg: boolean): void {
        this.passwordChangedFlg = passwordChangedFlg;
    }

    public getAttributes (): any {
        return this.attributes;
    }

    public setAttributes (attributes: any): void {
        this.attributes = attributes;
    }

    public getCreatedAt (): Date {
        return this.createdAt;
    }

    public setCreatedAt (createdAt: Date): void {
        this.createdAt = createdAt;
    }

    public getCreatedBy (): string {
        return this.createdBy;
    }

    public setCreatedBy (createdBy: string): void {
        this.createdBy = createdBy;
    }

    public getUpdatedBy (): string {
        return this.updatedBy;
    }

    public setUpdatedBy (updatedBy: string): void {
        this.updatedBy = updatedBy;
    }

    public getUpdatedAt (): Date {
        return this.updatedAt;
    }

    public setUpdatedAt (updatedAt: Date):void {
        this.updatedAt = updatedAt;
    }

    public getUniqueCheckLoginId (): string {
        return this.uniqueCheckLoginId;
    }

    public setUniqueCheckLoginId (uniqueCheckLoginId: string): void {
        this.uniqueCheckLoginId = uniqueCheckLoginId;
    }
}
