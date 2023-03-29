/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, EntityManager, InsertResult, UpdateResult } from 'typeorm';
import OneTimeLoginCodeEntity from '../OneTimeLoginCodeEntity';
import OperatorEntity from '../OperatorEntity';
/* eslint-enable */
import { Service } from 'typedi';

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
     * one_time_login_codeをloginCodeをもとに取得
     * @param loginCode
     */
    public async getOneTimeLoginCodeCount (loginCode: string): Promise<number> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * one_time_login_code追加
     * @param em
     * @param entity
     */
    public async insertOneTimeLoginCode (em: EntityManager, entity: OneTimeLoginCodeEntity): Promise<InsertResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * ワンタイムログインコードの存在確認
     * @param loginCode
     * @param loginId
     * @param type
     */
    public async isOneTimeLoginCodeExists (loginCode: string, loginId: string, type: number): Promise<OperatorEntity | null> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * ワンタイムログインコードの削除(無効化)
     * @param em
     * @param entity
     */
    public async deleteOneTimeLoginCode (em: EntityManager, entity: OneTimeLoginCodeEntity): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }
}
