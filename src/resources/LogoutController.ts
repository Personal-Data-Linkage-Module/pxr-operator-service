/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import PostLogoutReqDto from './dto/PostLogoutReqDto';
import LogoutServiceDto from '../services/dto/LogoutServiceDto';
import LogoutService from '../services/LogoutService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostSessionRequestValidator from './validator/PostSessionRequestValidator';
import Config from '../common/Config';
import { getConnection } from 'typeorm';
/* eslint-enable */
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
const Message = Config.ReadConfig('./config/message.json');

@JsonController('/operator')
export default class LogoutController {
    /** 設定ファイル読込 */
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Post('/logout')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostSessionRequestValidator)
    async postLogout (@Body() dto: PostLogoutReqDto, @Req() req: Request, @Res() res: Response) {
        const serviceDto = new LogoutServiceDto();
        serviceDto.setSessionId(dto.sessionId);
        serviceDto.setConfigure(this.configure);
        serviceDto.setRequest(req);
        serviceDto.setResponse(res);
        // サービス層のログアウト処理を実行
        return new LogoutService().logout(getConnection('postgres'), serviceDto);
    }

    @Post('/ind/logout')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostSessionRequestValidator)
    async postIndLogout (@Body() dto: PostLogoutReqDto, @Req() req: Request, @Res() res: Response) {
        // cookieのセッションIDが存在しない、あるいはリクエストのセッションIDと一致しない場合エラー
        if (!req.cookies.operator_type0_session || req.cookies.operator_type0_session !== dto.sessionId) {
            throw new AppError(Message.UNAUTHORIZED, ResponseCode.UNAUTHORIZED);
        }
        const serviceDto = new LogoutServiceDto();
        serviceDto.setSessionId(dto.sessionId);
        serviceDto.setConfigure(this.configure);
        serviceDto.setRequest(req);
        serviceDto.setResponse(res);
        serviceDto.setCaller(0);
        // サービス層のログアウト処理を実行
        return new LogoutService().logout(getConnection('postgres'), serviceDto);
    }
}
