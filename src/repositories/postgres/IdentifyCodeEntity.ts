/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('identify_code')
export default class IdentifyCodeEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    /** コード */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'code' })
    code: string;

    /** PXR-ID */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'pxr_id' })
    pxrId: string;

    /** 有効期限 */
    @Column({ type: 'timestamp without time zone', nullable: false, name: 'expiration_at' })
    expirationAt: Date;

    /** 無効フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'created_at' })
    createdAt: Date = new Date();

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', onUpdate: 'NOW()', name: 'updated_at' })
    updatedAt: Date = new Date();

    /**
     * コンストラクタ
     * @param entity
     */
    constructor (entity?: {}) {
        if (entity) {
            this.id = parseInt(entity['id']);
            this.code = entity['code'];
            this.pxrId = entity['pxr_id'];
            this.expirationAt = new Date(entity['expiration_at']);
            this.isDisabled = entity['is_disabled'];
            this.createdBy = entity['created_by'];
            this.createdAt = new Date(entity['created_at']);
            this.updatedBy = entity['updated_by'];
            this.updatedAt = new Date(entity['updated_at']);
        }
    }
}
