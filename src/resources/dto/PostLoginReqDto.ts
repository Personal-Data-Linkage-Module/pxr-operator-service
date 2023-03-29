/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsDefined, IsNumber, IsString, IsNotEmpty, IsHash } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

export default class PostLoginReqDto {
    @IsHash('sha256')
    @IsNotEmpty()
    hpassword: string;

    @IsString()
    @IsNotEmpty()
    loginId: string;

    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    type: number;
}
