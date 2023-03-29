/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_information')
export default class UserInformationEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id: number = 0;

    /** オペレータID */
    @Column({ type: 'bigint', nullable: false, name: 'operator_id' })
    operatorId: number = 0;

    /** カタログコード */
    @Column({ type: 'bigint', nullable: false, name: 'catalog_code' })
    catalogCode: number = 0;

    /** カタログバージョン */
    @Column({ type: 'bigint', nullable: false, name: 'catalog_version' })
    catalogVersion: number = 0;

    /** 設定値 */
    @Column({ type: 'text', nullable: false })
    value: string = '';

    /** 無効フラグ */
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
}
