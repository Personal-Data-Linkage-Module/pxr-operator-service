/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsDefined, IsString, IsNotEmpty } from 'class-validator';

export default class PostIdentifyCodeReqDto {
    @IsString()
    @IsNotEmpty()
    @IsDefined()
    identifyCode: string;

    @IsString()
    @IsNotEmpty()
    @IsDefined()
    expirationAt: string;
}
