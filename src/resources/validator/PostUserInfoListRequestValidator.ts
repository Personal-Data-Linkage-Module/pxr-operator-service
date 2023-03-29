/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    Middleware,
    ExpressMiddlewareInterface
} from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
/* eslint-enable */
import { transformAndValidate } from 'class-transformer-validator';
import PostUserInfoListReqDto from '../dto/PostUserInfoListReqDto';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

@Middleware({ type: 'before' })
export default class PostUserInfoListRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction): Promise<void> {
        // リクエストバリデーション
        const dto = await transformAndValidate(PostUserInfoListReqDto, request.body);
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }
        next();
    }
}
