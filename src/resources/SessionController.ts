/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    JsonController, Post, Body, Req, Header, UseBefore
} from 'routing-controllers';
import { Request} from 'express';
import PostSessionReqDto from './dto/PostSessionReqDto';
import SessionServiceDto from '../services/dto/SessionServiceDto';
import SessionService from '../services/SessionService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostSessionRequestValidator from './validator/PostSessionRequestValidator';
import Config from '../common/Config';
import { getConnection } from 'typeorm';
/* eslint-enable */
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
const Message = Config.ReadConfig('./config/message.json');

@JsonController('/operator')
export default class SessionController {
    /** 設定ファイル読込 */
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Post('/session')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostSessionRequestValidator)
    async postSession (@Body() dto: PostSessionReqDto) {
        const serviceDto = new SessionServiceDto();
        serviceDto.setSessionId(dto.sessionId);
        serviceDto.setExtendFlg(dto.extendFlg);
        // サービス層のセッション確認処理を実行
        return new SessionService().sessionCheck(getConnection('postgres'), serviceDto);
    }

    @Post('/ind/session')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostSessionRequestValidator)
    async postIndSession (@Body() dto: PostSessionReqDto, @Req() req: Request) {
        // cookieのセッションIDが存在しない、あるいはリクエストのセッションIDと一致しない場合エラー
        if (!req.cookies.operator_type0_session || req.cookies.operator_type0_session !== dto.sessionId) {
            throw new AppError(Message.UNAUTHORIZED, ResponseCode.UNAUTHORIZED);
        }
        const serviceDto = new SessionServiceDto();
        serviceDto.setSessionId(dto.sessionId);
        serviceDto.setExtendFlg(dto.extendFlg);
        // サービス層のセッション確認処理を実行
        return new SessionService().sessionCheck(getConnection('postgres'), serviceDto);
    }
}
