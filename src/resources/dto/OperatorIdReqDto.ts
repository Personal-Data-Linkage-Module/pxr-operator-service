/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { IsDefined, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';

export default class {
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    operatorId: number;
}
