/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsDefined, IsNumber, ValidateNested, IsArray, IsOptional, IsString, IsNotEmpty, IsBoolean, IsObject, IsHash } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { transformToNumber, transformToBooleanFromString } from '../../common/Transform';

export class CodeObject {
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    _value: number;

    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    _ver: number;
}

export default class PutByOperatorIdReqDto {
    @IsOptional()
    @IsHash('sha256')
    @IsNotEmpty()
    hpassword: string;

    @IsOptional()
    @IsHash('sha256')
    @IsNotEmpty()
    newHpassword: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    loginId: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    mobilePhone: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsOptional()
    @Transform(transformToBooleanFromString)
    loginProhibitedFlg: boolean = null;

    @IsObject()
    @IsOptional()
    attributes: any;

    @IsObject()
    @IsOptional()
    auth: any;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(type => CodeObject)
    @IsArray()
    roles: CodeObject[];
}
