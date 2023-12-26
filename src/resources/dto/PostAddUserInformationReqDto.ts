/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import UserInformationDto from './UserInformationDto';
import { IsNumber, IsString, IsOptional, ValidateNested, IsNotEmptyObject, IsDefined, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

export default class {
    @IsString()
    @IsOptional()
        pxrId: string;

    @IsString()
    @IsOptional()
        userId: string;

    @IsDefined()
    @Type(() => UserInformationDto)
    @ValidateNested()
    @IsNotEmptyObject()
        userInfo: UserInformationDto;

    @IsNumber()
    @IsOptional()
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => { return transformToNumber(value); })
        appCode: number;

    @IsNumber()
    @IsOptional()
    @Max(Number.MAX_SAFE_INTEGER)
    @Transform(({ value }) => { return transformToNumber(value); })
        regionCode: number;
}
