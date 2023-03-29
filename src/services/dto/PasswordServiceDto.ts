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

export default class PasswordServiceDto {
    /** operatorId */
    private operatorId: number = 0;

    /** 新パスワード */
    private newHpassword: string = null;

    /** 設定ファイル情報 */
    private configure: {} = null;

    /** リクエスト */
    private request: any = null;

    public getOperatorId (): number {
        return this.operatorId;
    }

    public setOperatorId (operatorId: number): void {
        this.operatorId = operatorId;
    }

    public getNewHpassword (): string {
        return this.newHpassword;
    }

    public setNewHpassword (newHpassword: string): void {
        this.newHpassword = newHpassword;
    }

    public getConfigure (): {} {
        return this.configure;
    }

    public setConfigure (configure: {}): void {
        this.configure = configure;
    }

    public getRequest (): any {
        return this.request;
    }

    public setRequest (request: any): void {
        this.request = request;
    }
}
