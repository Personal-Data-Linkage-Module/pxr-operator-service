/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsOptional, IsNotEmpty, IsString, IsNumber, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

export default class {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    pxrId: string;

    @IsNumber()
    @IsOptional()
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(transformToNumber)
    appCode: number;

    @IsNumber()
    @IsOptional()
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(transformToNumber)
    regionCode: number;
}
