/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsString, IsNotEmpty, IsNumber, IsDefined, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

export default class PostIndLoginOneTimeReqDto {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    loginCode: string;

    @IsString()
    @IsNotEmpty()
    loginId: string;

    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    type: number;
}
