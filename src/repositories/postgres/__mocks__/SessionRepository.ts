/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, EntityManager, InsertResult, UpdateResult } from 'typeorm';
import SessionEntity from '../SessionEntity';
import AuthMe from '../../../domains/AuthMe';
import { Service } from 'typedi';
/* eslint-enable */

@Service()
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
        if (sessionId === '1') {
            const ret:SessionEntity = new SessionEntity();
            ret.operatorId = 1;
            return ret;
        } else {
            throw new Error('Unit Test DB Error');
        }
    }

    /**
     * 他のセッションを無効にする
     * @param entity
     */
    public async updateDisableAnySessions (entity: SessionEntity, old?: string) {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 他のセッションは無効にする
     * @param entity
     */
    public async disableOtherSessions (trans: EntityManager, entity: SessionEntity) {
        throw new Error('Unit Test DB Error');
    }

    /**
     * セッションAPIがたたかれた際、必ず現在時刻より3時間の有効期限延長を行う
     * @param sessionId
     */
    public async updateExpire (entity: SessionEntity, operator: AuthMe) {
        throw new Error('Unit Test DB Error');
    }

    /**
     * セッションIDの存在確認
     * @param sessionId
     */
    public async isSessionIdExists (sessionId: string): Promise<boolean> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 一番新しいsessionをoperatorIdをもとに取得
     * @param operatorId
     */
    public async getLatestSession (operatorId: number): Promise<SessionEntity | null> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * セッション追加
     * @param sessionDomain
     */
    public async insertSession (em: EntityManager, entity: SessionEntity): Promise<InsertResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * セッション削除(update)
     * @param sessionDomain
     */
    public async deleteSession (em: EntityManager, entity: SessionEntity): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }
}
