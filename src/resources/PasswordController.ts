/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request } from 'express';
import {
    JsonController, Put, Body, Param, Header, Req, UseBefore, Params
} from 'routing-controllers';
import NewPasswordReqDto from './dto/NewPasswordReqDto';
import PasswordServiceDto from '../services/dto/PasswordServiceDto';
import PasswordService from '../services/PasswordService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PutPasswordRequestValidator from './validator/PutPasswordRequestValidator';
import Config from '../common/Config';
import OperatorIdReqDto from './dto/OperatorIdReqDto';
import OperatorIdParamsValidator from './validator/OperatorIdParamsValidator';
import { getConnection } from 'typeorm';
/* eslint-enable */

@JsonController('/operator')
export default class PasswordController {
    /** 設定ファイル読込 */
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Put('/password/:operatorId')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(OperatorIdParamsValidator)
    @UseBefore(PutPasswordRequestValidator)
    async putPasswordByOperatorId (
        @Params() params: OperatorIdReqDto,
        @Body() dto: NewPasswordReqDto,
        @Req() req: Request
    ) {
        const serviceDto = new PasswordServiceDto();
        serviceDto.setOperatorId(params.operatorId);
        serviceDto.setNewHpassword(dto.newHpassword);
        serviceDto.setRequest(req);
        serviceDto.setConfigure(this.configure);
        // サービス層のセッション確認処理を実行
        return new PasswordService().passwordReset(getConnection('postgres'), serviceDto);
    }
}
