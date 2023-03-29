/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request } from 'express';
import { Body, Header, JsonController, Post, Req, UseBefore } from 'routing-controllers';
import AppError from '../common/AppError';
import AuthMe from '../domains/AuthMe';
import SmsVerificateServiceDto from '../services/dto/SmsVerificateServiceDto';
import OperatorService from '../services/OperatorService';
import SmsVerificateService from '../services/SmsVerificateService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostIndSmsVerificateReqDto from './dto/PostIndSmsVerificateReqDto';
import PostIndSmsVerificateVerifiyReqDto from './dto/PostIndSmsVerificateVerifiyReqDto';
import Config from '../common/Config';
import { ResponseCode } from '../common/ResponseCode';
import PostIndSmsVerificateRequestValidator from './validator/PostIndSmsVerificateRequestValidator';
import PostIndSmsVerificateVerifiyRequestValidator from './validator/PostIndSmsVerificateVerifiyRequestValidator';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

@JsonController('/operator')
export default class SmsVerificateController {
    /**
     * SMS検証コード発行
     */
    @Post('/ind/sms-verificate')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIndSmsVerificateRequestValidator)
    async postIndSmsVerificate (@Req() req: Request, @Body() body: PostIndSmsVerificateReqDto) {
        // オペレーター種別が個人以外の場合エラー
        const operator = await OperatorService.getSession(req);
        if (operator.type !== AuthMe.TYPE_PERSONAL_NUMBER) {
            throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
        }

        const serviceDto = new SmsVerificateServiceDto();
        serviceDto.setOperator(operator);
        serviceDto.setUserInformation(body.userInformation);

        // サービスの呼び出し
        const response = await new SmsVerificateService().postIndSmsVerificate(serviceDto);
        return response;
    }

    /**
     * SMS検証コード検証
     */
    @Post('/ind/sms-verificate/verifiy')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostIndSmsVerificateVerifiyRequestValidator)
    async postIndSmsVerificateVerifiy (@Req() req: Request, @Body() body: PostIndSmsVerificateVerifiyReqDto) {
        // オペレーター種別が個人以外の場合エラー
        const operator = await OperatorService.getSession(req);
        if (operator.type !== AuthMe.TYPE_PERSONAL_NUMBER) {
            throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
        }

        const serviceDto = new SmsVerificateServiceDto();
        serviceDto.setOperator(operator);
        serviceDto.setSmsVerificationCode(body.smsVerificationCode);

        // サービスの呼び出し
        const response = await new SmsVerificateService().postIndSmsVerificateVerifiy(serviceDto);
        return response;
    }
}
