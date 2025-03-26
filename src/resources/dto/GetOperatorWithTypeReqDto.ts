/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    IsString,
    IsNumber,
    IsOptional,
    Max
} from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

/**
 * GET: オペレータ取得のリクエストDTO
 */
export default class {
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => { return transformToNumber(value) })
    type: number;

    @IsString()
    @IsOptional()
    loginId: string;

    @IsString()
    @IsOptional()
    pxrId: string;

//削除
//    @IsNumber()
//    @IsOptional()
//    @Max(Number.MAX_SAFE_INTEGER)
//    @Transform(transformToNumber)
//    wfCode: number;
    
    @IsNumber()
    @IsOptional()
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => { return transformToNumber(value) })
    appCode: number;

    @IsNumber()
    @IsOptional()
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => { return transformToNumber(value) })
    regionCode: number;
}
