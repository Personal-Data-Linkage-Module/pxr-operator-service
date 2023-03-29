/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export default class PostIndSmsVerificateVerifiyReqDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    smsVerificationCode: string;
}
