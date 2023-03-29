/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
import PutByOperatorIdReqDto from '../dto/PutByOperatorIdReqDto';
import { transformAndValidate } from 'class-transformer-validator';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

export default class PutOperatorRepRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        const dto = await transformAndValidate(
            PutByOperatorIdReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError(Message.REQUEST_IS_ARRAY, 400);
        }

        // loginProhibitedFlgをtrueで設定する場合、hpasswordまたはnewHpasswordが存在したらエラー
        // loginProhibitedFlgをfalseで設定する場合、hpasswordがあるとエラーおよびnewHpasswordが無いとエラー
        // loginProhibitedFlgが無い場合、hpassword、newHpasswordどちらか存在するなら、両方存在する事
        if (dto.loginProhibitedFlg === true) {
            if (dto.hpassword || dto.newHpassword) {
                throw new AppError(Message.NOT_REQUIRED_PASSWORD_FOR_LOGIN_PROHIBITED, ResponseCode.BAD_REQUEST);
            }
        } else if (dto.loginProhibitedFlg === false) {
            if (dto.hpassword) {
                throw new AppError(Message.REQUIRED_PASSWORD_FOR_LOGIN_ALLOWED, ResponseCode.BAD_REQUEST);
            }
        } else {
            if (dto.hpassword || dto.newHpassword) {
                if (!(dto.hpassword && dto.newHpassword)) {
                    throw new AppError(Message.REQUIRED_PASSWORDS_BOTH, ResponseCode.BAD_REQUEST);
                }
            }
        }

        next();
    }
}
