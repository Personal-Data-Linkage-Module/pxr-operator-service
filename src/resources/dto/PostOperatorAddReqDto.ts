/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsDefined, IsNumber, IsString, IsNotEmpty, IsBoolean, IsOptional, IsObject, IsArray, ValidateNested, IsHash, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { transformToNumber, transformToBooleanFromString } from '../../common/Transform';
import { CodeObject } from './PutByOperatorIdReqDto';
import { OperatorType } from '../../common/OperatorType';

export default class PostOperatorAddReqDto {
    @IsNumber()
    @IsDefined()
    @IsIn([OperatorType.TYPE_IND, OperatorType.TYPE_APP, OperatorType.TYPE_MANAGE_MEMBER])
    @Transform(transformToNumber)
    type: number;

    @IsString()
    @IsNotEmpty()
    loginId: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    pxrId: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    userId: string;

    @IsHash('sha256')
    @IsOptional()
    @IsNotEmpty()
    hpassword: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    mobilePhone: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    name: string;

    @IsObject()
    @IsOptional()
    auth: any = {};

    @IsObject()
    @IsOptional()
    attributes: any = {};

    @IsBoolean()
    @IsOptional()
    @Transform(transformToBooleanFromString)
    loginProhibitedFlg: boolean = null;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(type => CodeObject)
    @IsArray()
    roles: CodeObject[] = [];

    @IsNumber()
    @IsOptional()
    regionCatalogCode: number;

    @IsNumber()
    @IsOptional()
    appCatalogCode: number;

    @IsNumber()
    @IsOptional()
    wfCatalogCode: number;
}
