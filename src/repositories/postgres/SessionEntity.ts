/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('session')
export default class SessionEntity {
    /** ID */
    @PrimaryColumn({ type: 'varchar', length: 255, nullable: false, name: 'id' })
    id: string = '';

    /** オペレータID */
    @Column({ type: 'bigint', nullable: false, name: 'operator_id' })
    operatorId: number = 0;

    /** 有効期限 */
    @Column({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'expire_at' })
    expireAt: Date = new Date();

    /** 無効フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', name: 'created_at' })
    readonly createdAt!: Date;

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', name: 'updated_at', onUpdate: 'now()' })
    readonly updatedAt!: Date;

    /**
     * コンストラクタ
     * @param entity
     */
    constructor (entity?: any) {
        if (entity) {
            this.id = entity['id'];
            this.operatorId = parseInt(entity['operator_id']);
            this.expireAt = new Date(entity['expire_at']);
            this.isDisabled = entity.is_disabled;
            this.createdBy = entity['created_by'];
            this.createdAt = new Date(entity['created_at']);
            this.updatedBy = entity['updated_by'];
            this.updatedAt = new Date(entity['updated_at']);
        }
    }
}
