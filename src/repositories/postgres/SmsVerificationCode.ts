/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * SMS検証コードエンティティ
 */
@Entity('sms_verification_code')
export default class SmsVerificationCode {
    /**
     * ID
     */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id: number;

    /**
     * オペレーターID
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'operator_id' })
    operatorId: number;

    /**
     * 検証コード
     */
    @Column({ type: 'varchar', length: 255, name: 'verification_code' })
    verificationCode: string;

    /**
     * 検証コード有効期限
     */
    @Column({ type: 'timestamp without time zone', nullable: false, name: 'verification_code_expiration' })
    verificationCodeExpiration: Date;

    /**
     * 検証結果 （1: 未検証, 2: 検証済）
     */
    @Column({ type: 'smallint', nullable: false, name: 'verification_result' })
    verificationResult: number;

    /**
     * 削除フラグ
     */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /**
     * 登録者
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /**
     * 登録日時
     */
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'created_at' })
    readonly createdAt: Date = new Date();

    /**
     * 更新者
     */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /**
     * 更新日時
     */
    @UpdateDateColumn({ type: 'timestamp without time zone', nullable: false, default: 'NOW()', name: 'updated_at' })
    readonly updatedAt: Date = new Date();

    /**
     * コンストラクタ
     */
    constructor (entity?: {}) {
        if (entity) {
            this.id = Number(entity['id']);
            this.operatorId = Number(entity['operator_id']);
            this.verificationCode = entity['verification_code'];
            this.verificationCodeExpiration = new Date(entity['verification_code_expiration']);
            this.verificationResult = Number(entity['verification_result']);
            this.isDisabled = entity['is_disabled'];
            this.createdBy = entity['created_by'];
            this.createdAt = new Date(entity['created_at']);
            this.updatedBy = entity['updated_by'];
            this.updatedAt = new Date(entity['updated_at']);
        }
    }
}
