/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    IsString,
    IsNumber,
    IsOptional
} from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

/**
 * GET: オペレータ取得のリクエストDTO
 */
export default class {
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    type: number;

    @IsString()
    @IsOptional()
    loginId: string;

    @IsString()
    @IsOptional()
    pxrId: string;
}
