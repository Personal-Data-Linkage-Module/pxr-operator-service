/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsNotEmpty, IsHash } from 'class-validator';

export default class NewPasswordReqDto {
    @IsNotEmpty()
    @IsHash('sha256')
    newHpassword: string;
}
