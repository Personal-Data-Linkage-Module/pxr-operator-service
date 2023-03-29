/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, EntityManager, InsertResult, UpdateResult } from 'typeorm';
import AuthMe from '../../domains/AuthMe';
/* eslint-enable */
import OperatorEntity from './OperatorEntity';
import SessionEntity from './SessionEntity';
import Config from '../../common/Config';
import moment = require('moment-timezone');
const config = Config.ReadConfig('./config/config.json');

export default class SessionRepository {
    /**
     * DB接続オブジェクト
     */
    private connection: Connection;

    /**
     * コンストラクタ
     * @param connection
     */
    public constructor (connection: Connection) {
        this.connection = connection;
    }

    /**
     * sessionをsessionIdをもとに取得
     * @param sessionId
     */
    public async getRecordFromId (sessionId: string): Promise<SessionEntity | null> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(SessionEntity, 'session')
            .andWhere('id = :sessionId', { sessionId: sessionId })
            .andWhere('is_disabled = false')
            .getRawOne();
        return ret ? new SessionEntity(ret) : null;
    }

    /**
     * sessionをsessionIdをもとに取得
     * @param sessionId
     */
    public async getSessionAndOperatorFromSessionId (sessionId: string): Promise<any> {
        const ret = await this.connection
            .createQueryBuilder()
            .select('session.id', 'sessionId')
            .addSelect('session.expireAt', 'expireAt')
            .addSelect('operator.id', 'id')
            .addSelect('operator.type', 'type')
            .addSelect('operator.login_id', 'login_id')
            .addSelect('operator.hpassword', 'hpassword')
            .addSelect('operator.pxr_id', 'pxr_id')
            .addSelect('operator.user_information', 'user_information')
            .addSelect('operator.name', 'name')
            .addSelect('operator.mobile_phone', 'mobile_phone')
            .addSelect('operator.mail', 'mail')
            .addSelect('operator.auth', 'auth')
            .addSelect('operator.last_login_at', 'last_login_at')
            .addSelect('operator.password_changed_flg', 'password_changed_flg')
            .addSelect('operator.login_prohibited_flg', 'login_prohibited_flg')
            .addSelect('operator.attributes', 'attributes')
            .addSelect('operator.lock_flg', 'lock_flg')
            .addSelect('operator.lock_start_at', 'lock_start_at')
            .addSelect('operator.password_updated_at', 'password_updated_at')
            .addSelect('operator.user_id', 'user_id')
            .addSelect('operator.app_catalog_code', 'app_catalog_code')
            .addSelect('operator.wf_catalog_code', 'wf_catalog_code')
            .addSelect('operator.is_disabled', 'is_disabled')
            .addSelect('operator.created_by', 'created_by')
            .addSelect('operator.created_at', 'created_at')
            .addSelect('operator.updated_by', 'updated_by')
            .addSelect('operator.updated_at', 'updated_at')
            .from(SessionEntity, 'session')
            .innerJoin(OperatorEntity, 'operator', 'operator.id = session.operator_id')
            .where('session.id = :sessionId', { sessionId: sessionId })
            .andWhere('session.is_disabled = :isDisabled', { isDisabled: false })
            .andWhere('operator.is_disabled = :isDisabled', { isDisabled: false })
            .getRawOne();
        return ret;
    }

    /**
     * 他のセッションは無効にする
     * @param entity
     */
    public async disableOtherSessions (trans: EntityManager, entity: SessionEntity) {
        await trans.createQueryBuilder()
            .update(SessionEntity)
            .set({
                isDisabled: true,
                updatedBy: entity.updatedBy
            })
            .andWhere('isDisabled = false')
            .andWhere('operatorId = :id', { id: entity.operatorId })
            .andWhere('id != :sessionId', { sessionId: entity.id })
            .execute();
    }

    /**
     * セッションAPIがたたかれた際、必ず現在時刻より3時間の有効期限延長を行う
     * @param sessionId
     */
    public async updateExpire (sessionId: string, operator: AuthMe) {
        const value = config['session']['expiration']['value'];
        const type = config['session']['expiration']['type'];
        await this.connection.getRepository(SessionEntity).update(sessionId, {
            expireAt: moment.utc().add(parseInt(value), type).toDate()
        });
    }

    /**
     * セッションIDの存在確認
     * @param sessionId
     */
    public async isSessionIdExists (sessionId: string): Promise<boolean> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(SessionEntity, 'session')
            .where('id = :id', { id: sessionId })
            .andWhere('expire_at > NOW()')
            .getCount();
        return ret > 0;
    }

    /**
     * 一番新しいsessionをoperatorIdをもとに取得
     * @param operatorId
     */
    public async getLatestSession (operatorId: number): Promise<SessionEntity | null> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(SessionEntity, 'session')
            .where('operator_id = :operatorId', { operatorId: operatorId })
            .andWhere('expire_at > NOW()')
            .orderBy('expire_at', 'DESC')
            .getRawOne();
        return ret ? new SessionEntity(ret) : null;
    }

    /**
     * セッション追加
     * @param sessionDomain
     */
    public async insertSession (em: EntityManager, entity: SessionEntity): Promise<InsertResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .insert()
            .into(SessionEntity)
            .values({
                id: entity.id,
                operatorId: entity.operatorId,
                expireAt: entity.expireAt,
                createdBy: entity.createdBy,
                createdAt: entity.createdAt,
                updatedBy: entity.updatedBy,
                updatedAt: entity.updatedAt
            })
            .execute();
        return ret;
    }

    /**
     * セッション削除(update)
     * @param sessionDomain
     */
    public async deleteSession (em: EntityManager, entity: SessionEntity): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(SessionEntity)
            .set({
                expireAt: entity.expireAt,
                updatedBy: entity.updatedBy
            })
            .where('id = :id', { id: entity.id })
            .andWhere('expire_at > NOW()')
            .execute();
        return ret;
    }
}
