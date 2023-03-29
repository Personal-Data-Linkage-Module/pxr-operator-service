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

import { Service } from 'typedi';
/* eslint-disable */
import { Connection } from 'typeorm';
import SessionServiceDto from './dto/SessionServiceDto';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
/* eslint-enable */
import PostSessionResDto from '../resources/dto/PostSessionResDto';
import SessionRepository from '../repositories/postgres/SessionRepository';
import RoleSettingRepository from '../repositories/postgres/RoleSettingRepository';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
import { applicationLogger } from '../common/logging';
import { sprintf } from 'sprintf-js';
import { OperatorType } from '../common/OperatorType';
import moment = require('moment-timezone');
const Message = Config.ReadConfig('./config/message.json');
const config = Config.ReadConfig('./config/config.json');

@Service()
export default class SessionService {
    /**
     * セッション確認
     * @param connection
     * @param serviceDto
     */
    public async sessionCheck (connection: Connection, serviceDto: SessionServiceDto): Promise<PostSessionResDto> {
        // セッションIDの存在確認とオペレータID取得
        const sessionRepository: SessionRepository = new SessionRepository(connection);
        const session = await sessionRepository.getSessionAndOperatorFromSessionId(serviceDto.getSessionId());
        if (!session) {
            throw new AppError(Message.UNAUTHORIZED, ResponseCode.UNAUTHORIZED);
        }
        const expireAt = new Date(session.expireAt).getTime();
        const now = new Date().getTime();
        if (expireAt < now) {
            applicationLogger.error(sprintf('expireAt => %03d expireAtTime => %s now => %03d nowTime => %s', expireAt, moment(expireAt).format('YYYY-MM-DDTHH:mm:ss.SSSZZ'), now, moment(now).format('YYYY-MM-DDTHH:mm:ss.SSSZZ')));
            throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
        }

        // レスポンスデータを作成
        const operatorData = new OperatorEntity(session);
        const response = await SessionService.createRes(serviceDto.getSessionId(), operatorData, connection);
        const res: any = response.getAsJson(operatorData.type);
        const type = config['session']['timeLeft']['type'];
        const value = config['session']['timeLeft']['value'];
        const updateTime = moment(new Date(session.expireAt)).subtract(value, type).toDate().getTime();
        if (serviceDto.getExtendFlg() && (now > updateTime)) {
            // 現在時刻の3時間分の追加を行う
            const authMe: any = { encoded: encodeURIComponent(JSON.stringify(res)) };
            await sessionRepository.updateExpire(session.sessionId, authMe);
        }
        return res;
    }

    static async createRes (sessionId: string, operatorData: OperatorEntity, connection: Connection) {
        // ロールを取得
        const roles: any[] = [];
        if (operatorData.type === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }
        if (operatorData.type === OperatorType.TYPE_APP) {
            const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);
            const roleDataList = await roleSettingRepository.getRoleSetting(operatorData.id);
            if (roleDataList.length > 0) {
                for (let index = 0; index < roleDataList.length; index++) {
                    // レスポンス用データを作成
                    const role = {
                        _value: roleDataList[index].roleCatalogCode,
                        _ver: roleDataList[index].roleCatalogVersion
                    };
                    roles.push(role);
                }
            }
        }

        // レスポンスデータを作成
        const response = new PostSessionResDto();
        response.sessionId = sessionId;
        response.operatorId = operatorData.id;
        response.type = operatorData.type;
        response.loginId = operatorData.loginId;
        response.name = operatorData.name;
        response.pxrId = operatorData.pxrId;
        response.mobilePhone = operatorData.mobilePhone;
        response.auth = operatorData.auth;
        response.lastLoginAt = operatorData.lastLoginAt;
        response.passwordChangedFlg = operatorData.passwordChangedFlg;
        response.attributes = operatorData.attributes;
        response.block = {};
        response.actor = {};
        response.roles = roles;

        // 現状、blcokとactorは固定の値を設定
        response.block['_value'] = config['block']['_value'];
        response.block['_ver'] = config['block']['_ver'];
        response.actor['_value'] = config['actor']['_value'];
        response.actor['_ver'] = config['actor']['_ver'];
        return response;
    }
}
