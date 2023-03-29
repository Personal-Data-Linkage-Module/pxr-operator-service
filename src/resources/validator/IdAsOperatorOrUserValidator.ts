/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { transformAndValidate } from 'class-transformer-validator';
import IdAAsOperatorOrUserReqDto from '../../resources/dto/IdAAsOperatorOrUserReqDto';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
import { OperatorType } from '../../common/OperatorType';
import OperatorService from '../../services/OperatorService';
/* eslint-enable */

@Middleware({ type: 'before' })
export default class implements ExpressMiddlewareInterface {
    constructor (
        readonly message = Config.ReadConfig('./config/message.json')
    ) {}

    async use (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) {
        const operator = await OperatorService.getSession(request);
        const dto = await transformAndValidate(
            IdAAsOperatorOrUserReqDto,
            request.query
        ) as IdAAsOperatorOrUserReqDto;

        if (Number(operator.type) === OperatorType.TYPE_IND) {
            if (dto.userId || dto.pxrId) {
                throw new AppError(this.message.DO_NOT_SET_IDS_FOR_IND, 400);
            }
        } else {
            if (!dto.userId && !dto.pxrId) {
                throw new AppError(this.message.MISSING_ID, 400);
            }
            if (dto.userId && dto.pxrId) {
                throw new AppError(this.message.DO_NOT_SET_BOTH_IDS, 400);
            }
        }

        next();
    }
}
