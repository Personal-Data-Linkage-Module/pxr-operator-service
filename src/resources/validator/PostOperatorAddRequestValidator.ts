/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import { OperatorType } from '../../common/OperatorType';
import Config from '../../common/Config';
import PostOperatorAddReqDto from '../dto/PostOperatorAddReqDto';
import { transformAndValidate } from 'class-transformer-validator';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

@Middleware({ type: 'before' })
export default class PostOperatorAddRequestValidator implements ExpressMiddlewareInterface {
    async use (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) {
        const dto = await transformAndValidate(
            PostOperatorAddReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }

        // リクエストデータをチェック
        // type0の場合
        if (dto.type === OperatorType.TYPE_IND || !dto.type) {
            // nameが存在する場合
            if (dto.name) {
                throw new AppError(Message.NO_REQUIRE_NAME, ResponseCode.BAD_REQUEST);
            }

            // ログイン不可フラグが無いまたはfalseの場合
            if (!dto.loginProhibitedFlg) {
                // attributes内にinitialPasswordExpireが存在しない場合
                if (!dto.attributes || !dto.attributes.initialPasswordExpire) {
                    throw new AppError(Message.REQUIRE_INITIAL_PASSWORD_EXPIRE, ResponseCode.BAD_REQUEST);
                }
            }
        }

        // loginProhibitedFlgがある場合
        if (typeof dto.loginProhibitedFlg === 'boolean') {
            // 個人以外の場合エラー
            if (dto.type !== OperatorType.TYPE_IND) {
                throw new AppError(Message.NOT_SET_LOGIN_PROHIBITED_FLAG_IF_NOT_IND, ResponseCode.BAD_REQUEST);
            }
            // trueの場合、hpasswordが存在する場合エラー
            if (dto.loginProhibitedFlg === true && dto.hpassword) {
                throw new AppError(Message.NOT_SET_PASSWORD_WHEN_LOGIN_PROHIBITED, ResponseCode.BAD_REQUEST);
            }
        } else {
            // loginProhibitedFlgが無い場合はhpasswordは必須
            // hpasswordが存在しない場合
            if (!dto.hpassword || dto.hpassword.length === 0) {
                throw new AppError(Message.REQUIRE_PASSWORD, ResponseCode.BAD_REQUEST);
            }
        }

        // pxrIdのチェック
        if (dto.type === OperatorType.TYPE_IND) {
            // ログイン不可フラグが無いまたはfalseの場合
            if (!dto.loginProhibitedFlg && !dto.pxrId) {
                throw new AppError(Message.REQUIRE_PXR_ID, ResponseCode.BAD_REQUEST);
            }
        } else {
            // それ以外の場合は存在したらエラー
            if (dto.pxrId) {
                throw new AppError(Message.NO_REQUIRE_PXR_ID, ResponseCode.BAD_REQUEST);
            }
        }

        // ログイン不可個人の場合
        if (dto.type === OperatorType.TYPE_IND &&
            dto.loginProhibitedFlg
        ) {
            // 利用者IDは必須
            if (!dto.userId) {
                throw new AppError(Message.REQUIRE_USER_ID, ResponseCode.BAD_REQUEST);
            }

            // RegionカタログコードまたはAPPカタログコードが必須
            if (!dto.regionCatalogCode && !dto.appCatalogCode) {
                throw new AppError(Message.REQUIRE_CATALOG_CODES, ResponseCode.BAD_REQUEST);
            }
        } else {
            // ログイン不可個人以外で利用者IDがある場合エラー
            if (dto.userId) {
                throw new AppError(Message.NO_REQUIRE_USER_ID, ResponseCode.BAD_REQUEST);
            }

            // ログイン不可個人以外でAPPカタログコードまたはWFカタログコードがある場合エラー
            if (dto.appCatalogCode || dto.wfCatalogCode) {
                throw new AppError(Message.NO_REQUIRE_CATALOG_CODES, ResponseCode.BAD_REQUEST);
            }
        }

        next();
    }
}
