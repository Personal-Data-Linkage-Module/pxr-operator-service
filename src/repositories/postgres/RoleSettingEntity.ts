/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('role_setting')
export default class RoleSettingEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id: number = 0;

    /** オペレータID */
    @Column({ type: 'bigint', nullable: false, name: 'operator_id' })
    operatorId: number = 0;

    /** ロールカタログコード */
    @Column({ type: 'bigint', nullable: false, name: 'role_catalog_code' })
    roleCatalogCode: number = 0;

    /** ロールカタログバージョン */
    @Column({ type: 'bigint', nullable: false, name: 'role_catalog_version' })
    roleCatalogVersion: number = 0;

    /** 削除フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'created_at' })
    readonly createdAt: Date = new Date();

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'updated_at' })
    readonly updatedAt: Date = new Date();

    /**
     * コンストラクタ
     * @param entity
     */
    constructor (entity?: {}) {
        if (entity) {
            this.id = parseInt(entity['id']);
            this.operatorId = parseInt(entity['operator_id']);
            this.roleCatalogCode = parseInt(entity['role_catalog_code']);
            this.roleCatalogVersion = parseInt(entity['role_catalog_version']);
            this.isDisabled = entity['is_disabled'];
            this.createdBy = entity['created_by'];
            this.createdAt = entity['created_at'];
            this.updatedBy = entity['updated_by'];
            this.updatedAt = entity['updated_at'];
        }
    }
}
