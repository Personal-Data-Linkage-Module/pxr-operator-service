/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, InsertResult, EntityManager, UpdateResult } from 'typeorm';
import RoleSettingEntity from '../RoleSettingEntity';
/* eslint-enable */
import { Service } from 'typedi';

@Service()
export default class RoleSettingRepository {
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
     * ロール設定を取得
     * @param operatorId
     */
    public async getRoleSetting (operatorId: number): Promise<RoleSettingEntity[]> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * role_settingをoperatorIdのリストをもとに取得
     * @param operatorIds
     */
    public async getRecordFromIds (operatorIds:number[]): Promise<RoleSettingEntity[]> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * ロール設定の追加
     * @param em
     * @param entity
     */
    public async insertRoleSetting (em: EntityManager, entity: RoleSettingEntity): Promise<InsertResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * ロール設定削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteRoleSetting (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }
}
