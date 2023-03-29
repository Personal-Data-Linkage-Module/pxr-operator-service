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
 * OneTimeLoginCodeテーブルドメイン
 */
export default class OneTimeLoginCodeDomain {
    /** id */
    id: string = '';

    /** operatorId */
    operatorId: number = 0;

    /** 有効期限 */
    expireAt: Date = new Date();

    /** 登録者 */
    createdBy: string = '';

    /** 登録日時 */
    createdAt: Date = new Date();

    /** 更新者 */
    updatedBy: string = '';

    /** 更新日時 */
    updatedAt: Date = new Date();

    public getId (): string {
        return this.id;
    }

    public setId (id: string): void {
        this.id = id;
    }

    public getOperatorId (): number {
        return this.operatorId;
    }

    public setOperatorId (operatorId: number): void {
        this.operatorId = operatorId;
    }

    public getexpireAt (): Date {
        return this.expireAt;
    }

    public setexpireAt (expireAt: Date): void {
        this.expireAt = expireAt;
    }

    public getCreatedBy (): string {
        return this.createdBy;
    }

    public setCreatedBy (createdBy: string): void {
        this.createdBy = createdBy;
    }

    public getCreatedAt (): Date {
        return this.createdAt;
    }

    public setCreatedAt (createdAt: Date): void {
        this.createdAt = createdAt;
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

    public setUpdatedAt (updatedAt: Date): void {
        this.updatedAt = updatedAt;
    }
}
