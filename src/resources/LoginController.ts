/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Get, Post, Body, Header, Req, Res, UseBefore
} from 'routing-controllers';
import { getConnection } from 'typeorm';
import Config from '../common/Config';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostLoginReqDto from './dto/PostLoginReqDto';
import PostIndLoginSsoReqDto from './dto/PostIndLoginSsoReqDto';
import PostIndLoginOneTimeReqDto from './dto/PostIndLoginOneTimeReqDto';
import LoginRequestValidator from './validator/LoginRequestValidator';
import PostLoginSsoRequestValidator from './validator/PostLoginSsoRequestValidator';
import PostIndLoginSsoRequestValidator from './validator/PostIndLoginSsoRequestValidator';
import PostIndLoginRequestValidator from './validator/PostIndLoginRequestValidator';
import PostLoginOneTimeRequestValidator from './validator/PostLoginOneTimeRequestValidator';
import PostIndLoginOneTimeRequestValidator from './validator/PostIndLoginOneTimeRequestValidator';
import LoginServiceDto from '../services/dto/LoginServiceDto';
import LoginService from '../services/LoginService';
import { applicationLogger } from '../common/logging';
/* eslint-enable */
const config = Config.ReadConfig('./config/config.json');

@JsonController('/operator')
export default class LoginController {
    @Post('/login')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(LoginRequestValidator)
    async postLogin (@Body() dto: PostLoginReqDto, @Res() res: Response) {
        const serviceDto = new LoginServiceDto();
        serviceDto.setType(dto.type);
        serviceDto.setLoginId(dto.loginId);
        serviceDto.setHpassword(dto.hpassword);
        serviceDto.setConfigure(config);
        serviceDto.setResponse(res);
        // サービス層のログイン処理を実行
        return new LoginService().login(getConnection('postgres'), serviceDto);
    }

    @Post('/login/onetime')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostLoginOneTimeRequestValidator)
    async postLoginOneTime (@Body() dto: PostIndLoginOneTimeReqDto, @Res() res: Response): Promise<any> {
        const serviceDto = new LoginServiceDto();
        serviceDto.setType(dto.type);
        serviceDto.setLoginId(dto.loginId);
        serviceDto.setLoginCode(dto.loginCode);
        serviceDto.setConfigure(config);
        serviceDto.setResponse(res);
        // サービス層のログイン処理を実行
        return new LoginService().oneTimeloginCheck(getConnection('postgres'), serviceDto);
    }

    @Post('/login/sso')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostLoginSsoRequestValidator)
    async postLoginSso (@Req() req: Request, @Res() res: Response) {
        const serviceDto = new LoginServiceDto();
        serviceDto.setAccessToken(req.headers['access-token'] as string);
        serviceDto.setConfigure(config);
        serviceDto.setResponse(res);
        // サービス層のログイン処理を実行
        return new LoginService().loginSso(getConnection('postgres'), serviceDto);
    }

    @Post('/ind/login')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIndLoginRequestValidator)
    async postIndLogin (@Body() dto: PostLoginReqDto, @Res() res: Response) {
        const serviceDto = new LoginServiceDto();
        serviceDto.setType(dto.type);
        serviceDto.setLoginId(dto.loginId);
        serviceDto.setHpassword(dto.hpassword);
        serviceDto.setConfigure(config);
        serviceDto.setResponse(res);
        // サービス層のログイン処理を実行
        return new LoginService().login(getConnection('postgres'), serviceDto);
    }

    @Post('/ind/login/onetime')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIndLoginOneTimeRequestValidator)
    async postIndLoginOneTime (@Body() dto: PostIndLoginOneTimeReqDto, @Res() res: Response): Promise<any> {
        const serviceDto = new LoginServiceDto();
        serviceDto.setType(dto.type);
        serviceDto.setLoginId(dto.loginId);
        serviceDto.setLoginCode(dto.loginCode);
        serviceDto.setConfigure(config);
        serviceDto.setResponse(res);
        // サービス層のログイン処理を実行
        return new LoginService().oneTimeloginCheck(getConnection('postgres'), serviceDto);
    }

    // 未使用APIのため削除
    // @Get('/ind/login/sso/preparation')
    // @Header('X-Content-Type-Options', 'nosniff')
    // @Header('X-XSS-Protection', '1; mode=block')
    // @Header('X-Frame-Options', 'deny')
    // @EnableSimpleBackPressure()
    // async getIndLoginSsoPreparation (@Res() res: Response) {
    //     const serviceDto = new LoginServiceDto();
    //     serviceDto.setResponse(res);
    //     // サービス層のログイン処理を実行
    //     return new LoginService().indLoginSsoPreparation(serviceDto);
    // }

    @Post('/ind/login/sso')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIndLoginSsoRequestValidator)
    async postIndLoginSso (@Body() dto: PostIndLoginSsoReqDto, @Req() req: Request, @Res() res: Response) {
        // applicationLogger.info(JSON.stringify(req.headers));
        const serviceDto = new LoginServiceDto();
        serviceDto.setAuthorizationCode(dto.authorizationCode);
        serviceDto.setCodeVerifier(req.headers['code-verifier'] as string);
        serviceDto.setConfigure(config);
        serviceDto.setResponse(res);
        // サービス層のログイン処理を実行
        return new LoginService().indLoginSso(getConnection('postgres'), serviceDto);
    }
}
