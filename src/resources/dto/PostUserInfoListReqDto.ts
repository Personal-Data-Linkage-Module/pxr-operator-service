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
    IsNotEmpty,
    IsArray,
    IsString
} from 'class-validator';

/* eslint-enable */
export default class PostUserInfoListReqDto {
    /**
     * 検索条件
     */
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    @IsArray()
    @IsDefined()
    pxrId: string[];
}
