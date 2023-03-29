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
import AppError from '../../common/AppError';
import Config from '../../common/Config';
import PostAddUserInformationReqDto from '../../resources/dto/PostAddUserInformationReqDto';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

@Middleware({ type: 'before' })
export default class PostUserInfoRequestValidator implements ExpressMiddlewareInterface {
    async use (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
        const dto = await transformAndValidate(
            PostAddUserInformationReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }

        if (!dto.userId && !dto.pxrId) {
            throw new AppError(Message.MISSING_ID, 400);
        }

        if (dto.userId && dto.pxrId) {
            throw new AppError(Message.DO_NOT_SET_BOTH_IDS, 400);
        }

        next();
    }
}
