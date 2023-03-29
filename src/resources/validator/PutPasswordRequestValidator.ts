/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { ExpressMiddlewareInterface } from 'routing-controllers';
import express = require('express');
import { transformAndValidate } from 'class-transformer-validator';
import NewPasswordReqDto from '../dto/NewPasswordReqDto';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

export default class PutPasswordRequestValidator implements ExpressMiddlewareInterface {
    async use (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) {
        const dto = await transformAndValidate(NewPasswordReqDto, request.body);
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }

        next();
    }
}
