/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import UserInformationDto from './UserInformationDto';
import { IsString, IsOptional, ValidateNested, IsNotEmptyObject, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

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
}
