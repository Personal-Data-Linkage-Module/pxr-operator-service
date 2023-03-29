/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { transformToBooleanFromString } from '../../common/Transform';

export default class PostSessionReqDto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsBoolean()
    @IsOptional()
    @Transform(transformToBooleanFromString)
    extendFlg: boolean = false;
}
