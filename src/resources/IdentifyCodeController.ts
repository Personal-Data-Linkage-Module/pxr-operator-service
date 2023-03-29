/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, UseBefore, Req
} from 'routing-controllers';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostIdentifyCodeReqDto from './dto/PostIdentifyCodeReqDto';
import PostIdentifyCodeRequestValidator from './validator/PostIdentifyCodeRequestValidator';
import IdentifyCodeServiceDto from '../services/dto/IdentifyCodeServiceDto';
import IdentifyCodeService from '../services/IdentifyCodeService';
import OperatorService from '../services/OperatorService'

@JsonController('/operator')
export default class IdentifyCodeController {
    /**
     * 本人性確認コードを登録する
     * @param req リクエスト
     * @param dto リクエストボディ
     * @param res レスポンス
     * @deprecated use /ind/identifyCode
     */
    @Post('/identifyCode')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIdentifyCodeRequestValidator)
    async postIdentifyCode (@Req() req: Request, @Body() dto: PostIdentifyCodeReqDto, @Res() res: Response) {
        // セッション取得
        const authMe = await OperatorService.getSession(req);

        // dto設定
        const serviceDto = new IdentifyCodeServiceDto();
        serviceDto.setOperator(authMe);
        serviceDto.setIdentifyCode(dto.identifyCode);
        serviceDto.setExpirationAt(dto.expirationAt);

        // サービス層のログイン処理を実行
        return new IdentifyCodeService().registerIdentifyCode(serviceDto);
    }

    /**
     * 本人性確認コードを登録する
     * @param req リクエスト
     * @param dto リクエストボディ
     * @param res レスポンス
     */
    @Post('/ind/identifyCode')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIdentifyCodeRequestValidator)
    async postIndIdentifyCode (@Req() req: Request, @Body() dto: PostIdentifyCodeReqDto, @Res() res: Response) {
        // セッション取得
        const authMe = await OperatorService.getSession(req);

        // dto設定
        const serviceDto = new IdentifyCodeServiceDto();
        serviceDto.setOperator(authMe);
        serviceDto.setIdentifyCode(dto.identifyCode);
        serviceDto.setExpirationAt(dto.expirationAt);

        // サービス層のログイン処理を実行
        return new IdentifyCodeService().registerIdentifyCode(serviceDto);
    }
}
