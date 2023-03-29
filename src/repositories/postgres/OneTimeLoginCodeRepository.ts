/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, EntityManager, InsertResult, UpdateResult } from 'typeorm';
/* eslint-enable */
import OneTimeLoginCodeEntity from './OneTimeLoginCodeEntity';
import OperatorEntity from './OperatorEntity';

export default class OneTimeLoginCodeRepository {
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
     * one_time_login_codeをloginCodeをもとに取得
     * @param loginCode
     */
    public async getOneTimeLoginCodeCount (loginCode: string): Promise<number> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OneTimeLoginCodeEntity, 'one_time_login_code')
            .where('code = :id', { id: loginCode })
            .andWhere('expire_at > NOW()')
            .getCount();
        return ret;
    }

    /**
     * one_time_login_code追加
     * @param em
     * @param entity
     */
    public async insertOneTimeLoginCode (em: EntityManager, entity: OneTimeLoginCodeEntity): Promise<InsertResult> {
        const ret = await em
            .createQueryBuilder()
            .insert()
            .into(OneTimeLoginCodeEntity)
            .values({
                id: entity.id,
                code: entity.code,
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
     * ワンタイムログインコードの存在確認
     * @param loginCode
     * @param loginId
     * @param type
     */
    public async isOneTimeLoginCodeExists (loginCode: string, loginId: string, type: number): Promise<OperatorEntity | null> {
        const ret = await this.connection
            .createQueryBuilder()
            .select('one_time_login_code.operator_id AS id, operator.type AS type, operator.login_id AS login_id')
            .from(OneTimeLoginCodeEntity, 'one_time_login_code')
            .innerJoin(OperatorEntity, 'operator', 'one_time_login_code.operator_id = operator.id and one_time_login_code.expire_at > NOW() and operator.is_disabled = false')
            .where('one_time_login_code.code = :code', { code: loginCode })
            .andWhere('operator.login_id = :loginId', { loginId: loginId })
            .andWhere('operator.type = :type', { type: type })
            .orderBy('one_time_login_code.expire_at', 'DESC')
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * ワンタイムログインコードの削除(無効化)
     * @param em
     * @param entity
     */
    public async deleteOneTimeLoginCode (em: EntityManager, entity: OneTimeLoginCodeEntity): Promise<UpdateResult> {
        const ret = await em
            .createQueryBuilder()
            .update(OneTimeLoginCodeEntity)
            .set({
                expireAt: entity.expireAt,
                updatedBy: entity.updatedBy
            })
            .where('operatorId = :operatorId', { operatorId: entity.operatorId })
            .andWhere('expire_at > NOW()')
            .execute();
        return ret;
    }
}
