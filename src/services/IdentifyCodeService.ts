/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

/* eslint-disable */
import AuthMe from '../domains/AuthMe';
import IdentifyCodeServiceDto from './dto/IdentifyCodeServiceDto';
/* eslint-enable */
import { Service } from 'typedi';
import AppError from '../common/AppError';
import Config from '../common/Config';
import { connectDatabase } from '../common/Connection';
import { ResponseCode } from '../common/ResponseCode';
import IdentifyCodeEntity from '../repositories/postgres/IdentifyCodeEntity';
import IdentifyCodeRepository from '../repositories/postgres/IdentifyCodeRepository';
import moment = require('moment-timezone');
const message = Config.ReadConfig('./config/message.json');

@Service()
export default class IdentifyCodeService {
    /**
     * 本人性確認コードを登録する
     * @param dto
     */
    public async registerIdentifyCode (dto: IdentifyCodeServiceDto): Promise<any> {
        const operator = dto.getOperator() as AuthMe;
        if (!operator.pxrId) {
            throw new AppError(message.NOT_OPERATION_AUTH, ResponseCode.BAD_REQUEST);
        }

        // 登録
        const identifyCode = new IdentifyCodeEntity();
        identifyCode.code = dto.getIdentifyCode();
        identifyCode.pxrId = operator.pxrId;
        identifyCode.expirationAt = moment(dto.getExpirationAt()).utc().toDate();
        identifyCode.createdBy = operator.loginId;
        identifyCode.updatedBy = operator.loginId;
        const connect = await connectDatabase();
        await connect.transaction(async trans => {
            await new IdentifyCodeRepository().insertIdentifyCode(trans, identifyCode);
        });

        // レスポンスを返す
        return { result: 'success' };
    }
}
