/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import {
    IsNumber,
    IsDefined,
    IsString,
    ValidateNested,
    IsNotEmptyObject,
    IsArray,
    IsNotEmpty,
    IsBoolean,
    IsOptional
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { transformToNumber, transformToBooleanFromString } from '../../common/Transform';

export class CodeObject {
    @IsDefined()
    @IsNumber()
    @Transform(({ value }) => { return transformToNumber(value); })
        _value: number;

    @IsDefined()
    @IsNumber()
    @Transform(({ value }) => { return transformToNumber(value); })
        _ver: number;
}

export class Item {
    @IsNotEmpty()
    @IsString()
        title: string;

    @IsDefined()
    @Type(() => CodeObject)
    @ValidateNested()
    @IsNotEmptyObject()
        type: CodeObject;

    @IsOptional()
        content: string | boolean | number | undefined | null;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => { return transformToBooleanFromString(value); })
        'changeable-flag': boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => { return transformToBooleanFromString(value); })
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
        item: Item[];
}

export default class {
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
