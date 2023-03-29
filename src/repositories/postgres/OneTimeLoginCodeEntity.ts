/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('one_time_login_code')
export default class OneTimeLoginCodeEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    code: string;

    /** オペレータID */
    @Column({ type: 'bigint', nullable: false, name: 'operator_id' })
    operatorId: number = 0;

    /** 有効期限 */
    @Column({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'expire_at' })
    expireAt: Date = new Date();

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
