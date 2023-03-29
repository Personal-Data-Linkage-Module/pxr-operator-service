/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

// SDE-IMPL-REQUIRED 本ファイルをコピーしコントローラーに定義した各 REST API のリクエスト・レスポンスごとにDTOを作成します。

/* eslint-disable */
import {
    IsDefined,
    IsNumber,
    ValidateNested,
    IsOptional,
    IsNotEmpty,
    IsArray
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';
/* eslint-enable */

export class CodeVersionObject {
    /**
     * コード
     */
    @Transform(transformToNumber)
    @IsNumber()
    @IsNotEmpty()
    @IsDefined()
    _value: number;

    /**
     * バージョン
     */
    @Transform(transformToNumber)
    @IsNumber()
    @IsDefined()
    _ver: number;
}

export class Condition {
    /**
     * 対象個人属性カタログコード
     */
    @IsDefined()
    @IsNotEmpty()
    @Type(() => CodeVersionObject)
    @ValidateNested()
    type: CodeVersionObject;

    /**
     * 対象データカタログコード
     */
    @IsOptional()
    @Type(() => CodeVersionObject)
    @ValidateNested()
    target: CodeVersionObject;

    /**
     * 最小値
     */
    @IsOptional()
    @Transform(transformToNumber)
    @IsNumber()
    min: number;

    /**
     * 最大値
     */
    @IsOptional()
    @Transform(transformToNumber)
    @IsNumber()
    max: number;
}

export default class PostUserInfoSearchReqDto {
    /**
     * 検索条件
     */
    @IsDefined()
    @IsNotEmpty()
    @IsArray()
    @Type(() => Condition)
    @ValidateNested({ each: true })
    condition: Condition[];

    /**
     * 最小対象人数
     */
    @IsDefined()
    @IsNotEmpty()
    @Transform(transformToNumber)
    @IsNumber()
    min: number;

    /**
     * 最大対象人数
     */
    @IsOptional()
    @Transform(transformToNumber)
    @IsNumber()
    max: number;
}
