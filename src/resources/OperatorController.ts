/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    JsonController, Get, Post, Put, Delete, Body, Header, Res, Req, UseBefore, Params, QueryParams
} from 'routing-controllers';
import { Request, Response } from 'express';
import PostOperatorAddReqDto from './dto/PostOperatorAddReqDto';
import PutByOperatorIdReqDto from './dto/PutByOperatorIdReqDto';
import OperatorService from '../services/OperatorService';
import OperatorServiceDto from '../services/dto/OperatorServiceDto';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import GetByOperatorTypeRequestValidator from './validator/GetByOperatorTypeRequestValidator';
import PostOperatorAddRequestValidator from './validator/PostOperatorAddRequestValidator';
import PutOperatorRepRequestValidator from './validator/PutOperatorRepRequestValidator';
import Config from '../common/Config';
import OperatorIdReqDto from './dto/OperatorIdReqDto';
import OperatorIdParamsValidator from './validator/OperatorIdParamsValidator';
import GetOperatorWithTypeReqDto from './dto/GetOperatorWithTypeReqDto';
import { getConnection } from 'typeorm';
/* eslint-enable */
// import { sprintf } from 'sprintf-js';
// import * as log4js from 'log4js';
// import uuid = require('uuid');
// export const applicationLogger: log4js.Logger = log4js.getLogger('application');
// const performance = require('perf_hooks').performance;
// const contextService = require('request-context');

@JsonController('/operator')
export default class OperatorController {
    // 設定ファイル読込
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Get('/:operatorId')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(OperatorIdParamsValidator)
    async getByOperatorId (@Params() params: OperatorIdReqDto, @Req() req: Request) {
        const session = await OperatorService.getSession(req);
        const serviceDto = new OperatorServiceDto();
        serviceDto.setOperatorId(params.operatorId);
        serviceDto.setType(-1);
        serviceDto.setSession(session);
        return new OperatorService().getOperator(getConnection('postgres'), serviceDto);
    }

    @Get()
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(GetByOperatorTypeRequestValidator)
    async getByOperatorIds (@QueryParams() query: GetOperatorWithTypeReqDto, @Req() req: Request) {
        const session = await OperatorService.getSession(req);
        const serviceDto = new OperatorServiceDto();
        serviceDto.setType(query.type);
        serviceDto.setLoginId(query.loginId);
        serviceDto.setPxrId(query.pxrId);
        serviceDto.setSession(session);
        return new OperatorService().getOperator(getConnection('postgres'), serviceDto);
    }

    @Post()
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostOperatorAddRequestValidator)
    async addOperator (@Req() req: Request, @Body() dto: PostOperatorAddReqDto) {
        // UUIDを発行
        // const uid = uuid();

        // リクエスト時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] controller addOperator start', contextService.get('request:requestId'), uid));

        // 開始時間を取得
        // const startTime = performance.now();

        const serviceDto = new OperatorServiceDto();
        serviceDto.setType(dto.type);
        serviceDto.setLoginId(dto.loginId);
        serviceDto.setHpassword(dto.hpassword);
        serviceDto.setAuth(dto.auth);
        serviceDto.setLoginProhibitedFlg(dto.loginProhibitedFlg || false);
        serviceDto.setConfigure(this.configure);
        serviceDto.setRequest(req);
        const result = await new OperatorService().postOpetatorAdd(getConnection('postgres'), serviceDto);

        // 終了時間を取得
        // const endTime = performance.now();

        // 処理時間を取得
        // const duration = endTime - startTime;

        // レスポンス時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] controller addOperator finish time:%dmsec', contextService.get('request:requestId'), uid, duration));
        return result;
    }

    @Put('/:operatorId')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PutOperatorRepRequestValidator)
    @UseBefore(OperatorIdParamsValidator)
    async repOperator (@Params() params: OperatorIdReqDto, @Req() req: Request, @Body() dto: PutByOperatorIdReqDto) {
        const serviceDto = new OperatorServiceDto();
        serviceDto.setOperatorId(params.operatorId);
        serviceDto.setLoginId(dto.loginId);
        serviceDto.setHpassword(dto.hpassword);
        serviceDto.setNewHpassword(dto.newHpassword);
        serviceDto.setName(dto.name);
        serviceDto.setMobilePhone(dto.mobilePhone);
        serviceDto.setAuth(dto.auth);
        serviceDto.setLoginProhibitedFlg(dto.loginProhibitedFlg);
        serviceDto.setAttributes(dto.attributes);
        serviceDto.setRoles(dto.roles);
        serviceDto.setConfigure(this.configure);
        serviceDto.setRequest(req);
        return new OperatorService().putOpetator(getConnection('postgres'), serviceDto);
    }

    @Delete('/:operatorId')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(OperatorIdParamsValidator)
    async deleteOperator (@Params() params: OperatorIdReqDto, @Req() req: Request, @Res() res: Response) {
        const serviceDto = new OperatorServiceDto();
        serviceDto.setOperatorId(params.operatorId);
        serviceDto.setConfigure(this.configure);
        serviceDto.setRequest(req);
        serviceDto.setResponse(res);
        return new OperatorService().deleteOpetator(getConnection('postgres'), serviceDto);
    }

    @Put('/cancelDelete/:operatorId')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(OperatorIdParamsValidator)
    async cancelDeleteOperator (@Params() params: OperatorIdReqDto, @QueryParams() register: string, @Req() req: Request) {
        const serviceDto = new OperatorServiceDto();
        serviceDto.setOperatorId(params.operatorId);
        serviceDto.setLoginId(register);
        return new OperatorService().cancelDeleteOpetator(getConnection('postgres'), serviceDto);
    }
}
