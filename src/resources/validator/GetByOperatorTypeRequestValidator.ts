/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import {
    Middleware,
    ExpressMiddlewareInterface
} from 'routing-controllers';
import { transformAndValidate } from 'class-transformer-validator';
import GetOperatorWithTypeReqDto from '../dto/GetOperatorWithTypeReqDto';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
import { OperatorType } from '../../common/OperatorType';
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

/**
 * オペレータ取得API(type指定)のバリデーションチェッククラス
 */
@Middleware({ type: 'before' })
export default class GetByOperatorTypeRequestValidator implements ExpressMiddlewareInterface {
    async use (request: express.Request, response: express.Response, next: express.NextFunction) {
        const dto = await transformAndValidate(
            GetOperatorWithTypeReqDto,
            request.query
        ) as GetOperatorWithTypeReqDto;
        if (!dto.type && dto.type !== 0 && !dto.loginId && !dto.pxrId) {
            throw new AppError(Message.MISSING_ALL_QUERY_PARAMETERS, 400);
        }
        if (!dto.type && dto.type !== 0 && dto.loginId) {
            throw new AppError(Message.REQUIRE_TYPE_LOGIN_ID, 400);
        }
        if (dto.type && ![OperatorType.TYPE_IND, OperatorType.TYPE_APP, OperatorType.TYPE_MANAGE_MEMBER].includes(dto.type)) {
            throw new AppError(Message.OUT_OF_SCOPE, 400);
        }

        next();
    }
}
