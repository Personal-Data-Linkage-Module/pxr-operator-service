/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, InsertResult, EntityManager, UpdateResult } from 'typeorm';
/* eslint-enable */
import RoleSettingEntity from './RoleSettingEntity';
// import * as log4js from 'log4js';
// import { sprintf } from 'sprintf-js';
// export const applicationLogger: log4js.Logger = log4js.getLogger('application');
// import uuid = require('uuid');
// const performance = require('perf_hooks').performance;
// const contextService = require('request-context');

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
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(RoleSettingEntity, 'role_setting')
            .where('operator_id = :operator_id', { operator_id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .getRawMany();
        const list: RoleSettingEntity[] = [];
        ret.forEach(element => {
            list.push(new RoleSettingEntity(element));
        });
        return list;
    }

    /**
     * role_settingをoperatorIdのリストをもとに取得
     * @param operatorIds
     */
    public async getRecordFromIds (operatorIds:number[]): Promise<RoleSettingEntity[]> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(RoleSettingEntity, 'role_setting')
            .where('is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('operator_id IN (:...ids)', { ids: operatorIds })
            .orderBy('id', 'ASC')
            .getRawMany();
        const list: RoleSettingEntity[] = [];
        ret.forEach(element => {
            list.push(new RoleSettingEntity(element));
        });
        return list;
    }

    /**
     * ロール設定の追加
     * @param em
     * @param entity
     */
    public async insertRoleSetting (em: EntityManager, entity: RoleSettingEntity): Promise<InsertResult> {
        // UUIDを発行
        // const uid = uuid();

        // リクエスト時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] typrORM getRecordFromType start', contextService.get('request:requestId'), uid));

        // 開始時間を取得
        // const startTime = performance.now();

        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .insert()
            .into(RoleSettingEntity)
            .values({
                operatorId: entity.operatorId,
                roleCatalogCode: entity.roleCatalogCode,
                roleCatalogVersion: entity.roleCatalogVersion,
                createdBy: entity.createdBy,
                createdAt: entity.createdAt,
                updatedBy: entity.updatedBy,
                updatedAt: entity.updatedAt
            })
            .execute();

        // 終了時間を取得
        // const endTime = performance.now();

        // 処理時間を取得
        // const duration = endTime - startTime;

        // レスポンス時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] typrORM getRecordFromType finish time:%dmsec', contextService.get('request:requestId'), uid, duration));

        return ret;
    }

    /**
     * ロール設定削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteRoleSetting (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(RoleSettingEntity)
            .set({
                isDisabled: true,
                updatedBy: register
            })
            .where('operator_id = :operatorId', { operatorId: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }

    /**
     * ロール設定削除取り消し
     * @param em
     * @param operatorId
     * @param register
     */
    public async cancelDeleteRoleSetting (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(RoleSettingEntity)
            .set({
                isDisabled: false,
                updatedBy: register
            })
            .where('operator_id = :operatorId', { operatorId: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: true })
            .execute();
        return ret;
    }
}
