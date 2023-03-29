/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsString } from 'class-validator';

export default class PostLogoutReqDto {
    @IsString()
    sessionId: string = '';
}
