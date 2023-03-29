/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { transformAndValidate } from 'class-transformer-validator';
import PostIndLoginOneTimeReqDto from '../dto/PostIndLoginOneTimeReqDto';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
import { OperatorType } from '../../common/OperatorType';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

@Middleware({ type: 'before' })
export default class PostIndLoginOneTimeRequestValidator implements ExpressMiddlewareInterface {
    async use (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) {
        const dto = await transformAndValidate(
            PostIndLoginOneTimeReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }

        // 個人以外ならエラー
        if (dto.type !== OperatorType.TYPE_IND) {
            throw new AppError(Message.NOT_OPERATION_AUTH, 400);
        }

        next();
    }
}
