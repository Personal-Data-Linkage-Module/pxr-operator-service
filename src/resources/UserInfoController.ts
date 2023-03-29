/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request } from 'express';
import UserInformationDto from './dto/UserInformationDto';
import PostAddUserInformationReqDto from './dto/PostAddUserInformationReqDto';
import IdAAsOperatorOrUserReqDto from './dto/IdAAsOperatorOrUserReqDto';
/* eslint-enable */
import {
    JsonController, Get, Post, Delete, Body, Header, Req, UseBefore, Put, QueryParams
} from 'routing-controllers';
import UserInfoService from '../services/UserInfoService';
import UserInfoServiceDto from '../services/dto/UserInfoServiceDto';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostUserInfoRequestValidator from './validator/PostUserInfoRequestValidator';
import OperatorService from '../services/OperatorService';
import UserInformationRequestValidator from './validator/UserInformationRequestValidator';
import IdAsOperatorOrUserValidator from './validator/IdAsOperatorOrUserValidator';
import { getConnection } from 'typeorm';
import PostUserInfoSearchRequestValidator from './validator/PostUserInfoSearchRequestValidator';
import PostUserInfoListRequestValidator from './validator/PostUserInfoListRequestValidator';
import { transformAndValidate } from 'class-transformer-validator';
import PostUserInfoSearchReqDto from './dto/PostUserInfoSearchReqDto';
import PostUserInfoListReqDto from './dto/PostUserInfoListReqDto';
import { OperatorType } from '../common/OperatorType';
import { ResponseCode } from '../common/ResponseCode';
import AppError from '../common/AppError';
import Config from '../common/Config';
const message = Config.ReadConfig('./config/message.json');

@JsonController('/operator')
export default class UserInfoController {
    /**
     * 利用者管理情報の登録
     * @param req
     * @param dto
     */
    @Post('/user/info')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostUserInfoRequestValidator)
    async addOperator (@Req() req: Request, @Body() dto: PostAddUserInformationReqDto) {
        const operator = await OperatorService.getSession(req);
        const serviceDto = new UserInfoServiceDto();
        serviceDto.setPxrId(dto.pxrId);
        serviceDto.setUserId(dto.userId);
        serviceDto.setUserInfo(dto.userInfo);
        serviceDto.setRequest(req);
        return new UserInfoService().postUserInfo(getConnection('postgres'), serviceDto, operator);
    }

    /**
     * 利用者管理情報の削除
     * @param params
     * @param req
     */
    @Delete('/user/info')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(IdAsOperatorOrUserValidator)
    async deleteOperator (@QueryParams() params: IdAAsOperatorOrUserReqDto, @Req() req: Request) {
        const operator = await OperatorService.getSession(req);

        const serviceDto = new UserInfoServiceDto();
        serviceDto.setPxrId(params.pxrId);
        serviceDto.setUserId(params.userId);
        serviceDto.setRequest(req);

        return new UserInfoService().deleteUserInfo(getConnection('postgres'), serviceDto, operator);
    }

    /**
     * 個人による利用者管理情報修正
     * @param req
     * @param dto
     */
    @Put('/ind/user/info')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(UserInformationRequestValidator)
    async put (@Req() req: Request, @Body() dto: UserInformationDto) {
        const operator = await OperatorService.getSession(req);
        await UserInfoService.updateUserInfo(operator, dto);
        return {
            status: 'success'
        };
    }

    /**
     * 利用者管理情報の取得
     * @param params
     * @param req
     */
    @Get('/user/info')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(IdAsOperatorOrUserValidator)
    async get (@QueryParams() params: IdAAsOperatorOrUserReqDto, @Req() req: Request) {
        const operator = await OperatorService.getSession(req);
        return UserInfoService.getUserInfo(
            params.pxrId,
            params.userId,
            operator
        );
    }

    /**
     * 個人用利用者管理情報の取得
     * @param params
     * @param req
     */
    @Get('/ind/user/info')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(IdAsOperatorOrUserValidator)
    async getInd (@QueryParams() params: IdAAsOperatorOrUserReqDto, @Req() req: Request) {
        const operator = await OperatorService.getSession(req);
        if (operator.type !== OperatorType.TYPE_IND) {
            throw new AppError(message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }
        return UserInfoService.getUserInfo(
            params.pxrId,
            params.userId,
            operator
        );
    }

    /**
     * 利用者管理情報の取得
     * @param params
     * @param req
     */
    @Post('/user/info/list')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostUserInfoListRequestValidator)
    async getList (@Req() req: Request) {
        // リクエストバリデーション
        let dto = await transformAndValidate(PostUserInfoListReqDto, req.body);
        dto = <PostUserInfoListReqDto>dto;
        // セッション情報を取得
        await OperatorService.getSession(req);
        // サービス層の処理を実行
        return UserInfoService.getUserInfoList(dto);
    }

    /**
     * 利用者管理情報によるPXR-ID取得
     * @param req
     */
    @Post('/user/info/search')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostUserInfoSearchRequestValidator)
    async postUserInfoSearch (@Req() req: Request) {
        // リクエストバリデーション
        let dto = await transformAndValidate(PostUserInfoSearchReqDto, req.body);
        dto = <PostUserInfoSearchReqDto[]>dto;

        // セッション情報を取得
        const operator = await OperatorService.getSession(req);

        // サービス層のデータオブジェクトを生成
        const serviceDto = new UserInfoServiceDto();
        serviceDto.setRequest<PostUserInfoSearchReqDto[]>(dto);

        // サービス層の処理を実行
        const result = await UserInfoService.getUserInfoSearch(operator, serviceDto);
        return result.getAsJson();
    }
}
