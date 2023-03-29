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
import PasswordServiceDto from './dto/PasswordServiceDto';
import SessionEntity from '../repositories/postgres/SessionEntity';
import AuthMe from '../domains/AuthMe';
/* eslint-enable */
import SessionRepository from '../repositories/postgres/SessionRepository';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
import OperatorRepository from '../repositories/postgres/OperatorRepository';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { sprintf } from 'sprintf-js';
import { OperatorType } from '../common/OperatorType';
import CheckOperatorAuth from '../common/CheckOperatorAuth';
import Config from '../common/Config';
import PasswordHistoryOperation from '../repositories/postgres/PasswordHistoryOperation';
import Catalog from '../common/Catalog';
import SessionService from './SessionService';
import { transformFromDateTimeToString } from '../common/Transform';
const Message = Config.ReadConfig('./config/message.json');

@Service()
export default class PasswordService {
    /**
     * パスワードリセット
     * @param connection
     * @param serviceDto
     */
    public async passwordReset (connection: Connection, serviceDto: PasswordServiceDto): Promise<any> {
        const DESCRIPTION: string = 'パスワードリセット';

        // dtoから値を取り出す
        const configure = serviceDto.getConfigure();
        const req = serviceDto.getRequest();

        const sessionRepository: SessionRepository = new SessionRepository(connection);
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);

        // ヘッダーにセッション情報がある場合
        let registerName: string = null;
        let session: any = null;
        if (req.headers.session) {
            // JSON化
            session = decodeURIComponent(req.headers.session + '');
            while (typeof session === 'string') {
                session = JSON.parse(session);
            }

            // 運営メンバー以外の場合エラー
            if (parseInt(session['type']) !== OperatorType.TYPE_MANAGE_MEMBER) {
                // 例外をthrow
                throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
            }
            // 追加権限が無い場合エラー
            if (!CheckOperatorAuth.checkAuth(session['auth'], true, null, null)) {
                // 例外をthrow
                throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
            }
            // 登録者名をセット
            registerName = session['loginId'];
        } else {
            // ヘッダーにログイン情報が無い場合はCookieからログイン情報を確認
            // 運営メンバーでログインしているか確認
            const memberCookie: string = sprintf(configure['cookie_base_name'], OperatorType.TYPE_MANAGE_MEMBER);
            const memberSessionId: string = req.cookies[memberCookie];
            let memberOperatorId: number = 0;
            const sessionData: SessionEntity = await sessionRepository.getRecordFromId(memberSessionId);
            if (sessionData) {
                // セッション有効期限チェック
                const expireAt = new Date(sessionData.expireAt).getTime();
                const now = new Date().getTime();
                if (expireAt < now) {
                    throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
                }
                memberOperatorId = sessionData.operatorId;
            } else {
                throw new AppError(sprintf(Message.RESPONSE_FAIL, DESCRIPTION), ResponseCode.UNAUTHORIZED);
            }

            // 更新実行オペレーターを取得
            const operatorData = await operatorRepository.getRecordFromId(memberOperatorId);
            if (operatorData) {
                registerName = operatorData.loginId;
            } else {
                throw new AppError(sprintf(Message.RESPONSE_FAIL, DESCRIPTION), ResponseCode.UNAUTHORIZED);
            }
            // 追加権限が無い場合エラー
            if (!CheckOperatorAuth.checkAuth(operatorData.auth, true, null, null)) {
                // 例外をthrow
                throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
            }
            session = await SessionService.createRes(sessionData.id, operatorData, connection);
        }

        // 更新対象のオペレーターを取得
        let targetOperatorId: number = null;
        const targetOperatorData: OperatorEntity = await operatorRepository.getRecordFromId(serviceDto.getOperatorId());
        if (targetOperatorData) {
            // ログイン不可フラグを確認。trueの場合はログインが禁止されているのでエラーとする。
            if (targetOperatorData.loginProhibitedFlg === true) {
                throw new AppError(Message.OPERATOR_NOT_LOGIN, ResponseCode.BAD_REQUEST);
            }
            targetOperatorId = targetOperatorData.id;
        } else {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.BAD_REQUEST);
        }

        // パスワード更新
        await connection.transaction(async trans => {
            // 世代分の確認を行い、パスワード一致によるセキュリティ低下を防ぐ
            const gen = await new Catalog().acquirePasswordGen(((): AuthMe => { const authMe: any = { encoded: encodeURIComponent(JSON.stringify(session)) }; return authMe; })());
            await PasswordHistoryOperation.passwordAlreadyUsing(trans, targetOperatorData, serviceDto.getNewHpassword(), gen);
            // パスワードを履歴に保存
            await PasswordHistoryOperation.recordPasswordHistorical(
                trans,
                targetOperatorData.id,
                targetOperatorData.loginId,
                targetOperatorData.hpassword
            );

            const entity = new OperatorEntity();
            entity.hpassword = serviceDto.getNewHpassword();
            entity.passwordChangedFlg = false;
            entity.updatedBy = registerName;
            await operatorRepository.updateHpassword(trans, targetOperatorId, entity);

            // 対象が個人の場合
            if (targetOperatorData.type === OperatorType.TYPE_IND) {
                // attributesにinitialPasswordExpireを設定
                let attrs = targetOperatorData.attributes;
                const expire = new Date();
                expire.setDate(expire.getDate() + configure['initial_password_expire']);
                if (!attrs) {
                    attrs = {};
                }
                attrs.initialPasswordExpire = transformFromDateTimeToString(configure['timezone'], expire);
                entity.attributes = attrs;
                await operatorRepository.setInitialPasswordExpire(trans, targetOperatorId, entity);
            }
        });

        // レスポンスデータを作成
        const response = {
            result: 'ok'
        };
        return response;
    }
}
