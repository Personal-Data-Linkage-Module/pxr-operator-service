/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsOptional, IsNotEmpty, IsString } from 'class-validator';

export default class {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    pxrId: string;
}
