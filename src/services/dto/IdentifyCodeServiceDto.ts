/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
export default class IdentifyCodeServiceDto {
    /** operator */
    private operator: any = null;

    /** コード */
    private identifyCode: string = null;

    /** 有効期限 */
    private expirationAt: string = null;

    public getOperator (): any {
        return this.operator;
    }

    public setOperator (operator: any) {
        this.operator = operator;
    }

    public getIdentifyCode (): string {
        return this.identifyCode;
    }

    public setIdentifyCode (identifyCode: string) {
        this.identifyCode = identifyCode;
    }

    public getExpirationAt (): string {
        return this.expirationAt;
    }

    public setExpirationAt (expirationAt: string) {
        this.expirationAt = expirationAt;
    }
}
