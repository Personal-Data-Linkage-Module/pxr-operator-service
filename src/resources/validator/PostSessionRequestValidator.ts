/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { transformAndValidate } from 'class-transformer-validator';
import PostSessionReqDto from '../dto/PostSessionReqDto';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

export default class implements ExpressMiddlewareInterface {
    async use (request: express.Request, response: express.Response, next: express.NextFunction) {
        const dto = await transformAndValidate(
            PostSessionReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }

        next();
    }
}
