/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDefined, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { transformToBooleanFromString, transformToNumber } from '../../common/Transform';

export class CodeObject {
    @IsDefined()
    @IsNumber()
    @Transform(transformToNumber)
    _value: number;

    @IsDefined()
    @IsNumber()
    @Transform(transformToNumber)
    _ver: number;
}

export class Item {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDefined()
    @Type(() => CodeObject)
    @ValidateNested()
    @IsNotEmptyObject()
    type: CodeObject;

    @IsDefined()
    content: string | boolean | number;

    @IsOptional()
    @IsBoolean()
    @Transform(transformToBooleanFromString)
    'changable-flag': boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(transformToBooleanFromString)
    'require-sms-verification': boolean;
}

export class ItemGroup {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsDefined()
    @IsArray()
    @Type(() => Item)
    @ValidateNested({ each: true })
    item: Item[]
}

export class Identification {
    @IsDefined()
    @Type(() => CodeObject)
    @ValidateNested()
    @IsNotEmptyObject()
    _code: CodeObject;

    @IsDefined()
    @IsArray()
    @Type(() => ItemGroup)
    @ValidateNested({ each: true })
    'item-group': ItemGroup[];
}

export default class PostIndSmsVerificateReqDto {
    @IsDefined()
    @IsNotEmptyObject()
    @Type(() => Identification)
    @ValidateNested()
    userInformation: Identification;
}
