/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AuthMe from '../../domains/AuthMe';
import { Identification } from '../../resources/dto/PostIndSmsVerificateReqDto';
/* eslint-enable */
/**
 * SMS検証サービスDTO
 */
export default class SmsVerificateServiceDto {
    /**
     * オペレーター
     */
    private operator: AuthMe;

    /**
     * SMS検証コードID
     */
    private smsVerificationCode: string;

    /**
     * 利用者管理情報
     */
    private userInformation: Identification;

    // /**
    //  * SMS検証コード
    //  */
    // private smsVerificationCodeId: string;

    public getOperator (): AuthMe {
        return this.operator;
    }

    public setOperator (value: AuthMe) {
        this.operator = value;
    }

    public getSmsVerificationCode (): string {
        return this.smsVerificationCode;
    }

    public setSmsVerificationCode (value: string) {
        this.smsVerificationCode = value;
    }

    public getUserInformation (): Identification {
        return this.userInformation;
    }

    public setUserInformation (value: Identification) {
        this.userInformation = value;
    }
}
