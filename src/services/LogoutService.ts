/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { Connection } from 'typeorm';
import LogoutServiceDto from './dto/LogoutServiceDto';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
import SessionRepository from '../repositories/postgres/SessionRepository';
import SessionEntity from '../repositories/postgres/SessionEntity';
import OperatorRepository from '../repositories/postgres/OperatorRepository';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { sprintf } from 'sprintf-js';
import Config from '../common/Config';
import { OperatorType } from '../common/OperatorType';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

@Service()
export default class LogoutService {
    /**
     * ログアウト
     * @param connection
     * @param serviceDto
     */
    public async logout (connection: Connection, serviceDto: LogoutServiceDto): Promise<any> {
        const sessionRepository:SessionRepository = new SessionRepository(connection);
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);

        // セッションを更新(無効化)
        const sessionId = serviceDto.getSessionId();
        let operatorId:number = null;
        const configure = serviceDto.getConfigure();

        // セッションIDの存在確認とオペレータID取得
        const sessionData: SessionEntity = await sessionRepository.getRecordFromId(sessionId);
        if (sessionData) {
            // セッション有効期限チェック
            const expireAt = new Date(sessionData.expireAt).getTime();
            const now = new Date().getTime();
            if (expireAt < now) {
                throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
            }
            operatorId = sessionData.operatorId;
        } else {
            throw new AppError(Message.SESSION_NOT_EXISTS, ResponseCode.BAD_REQUEST);
        }

        // オペレーター情報を取得
        const operatorData: OperatorEntity = await operatorRepository.getRecordFromId(operatorId, false);
        const loginId = operatorData.loginId;
        const type = operatorData.type;

        // 個人用からの呼出の場合
        if (serviceDto.getCaller() === 0) {
            // 個人以外ならエラー
            if (type !== OperatorType.TYPE_IND) {
                throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.BAD_REQUEST);
            }
        } else {
            // その他用空の呼出の場合、個人ならエラー
            if (type === OperatorType.TYPE_IND) {
                throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.BAD_REQUEST);
            }
        }

        // セッションを無効化
        await connection.transaction(async trans => {
            const entity = new SessionEntity();
            entity.id = sessionId;
            entity.expireAt = new Date();
            entity.updatedBy = loginId;
            await sessionRepository.deleteSession(trans, entity);
        });

        const req = serviceDto.getRequest();
        const res = serviceDto.getResponse();
        // cookieを破棄
        const cookieName = sprintf(configure['cookie_base_name'], type);
        if (req.cookies[cookieName] === sessionId) {
            res.cookie(cookieName, '', { maxAge: 0, httpOnly: true });
        }

        // レスポンスデータを作成
        const response = {
            result: 'ok'
        };
        return response;
    }
}
