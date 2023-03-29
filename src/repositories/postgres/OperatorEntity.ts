/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';

@Entity('operator')
export default class OperatorEntity extends BaseEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id!: number;

    /** 種別 */
    @Column({ type: 'smallint', nullable: false, default: 0, name: 'type' })
    type: number;

    /** ログインID */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'login_id' })
    loginId: string;

    /** ハッシュパスワード */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'hpassword' })
    hpassword: string;

    /** PXR-ID */
    @Column({ type: 'varchar', length: 255, name: 'pxr_id' })
    pxrId: string;

    /** 利用者情報 */
    @Column({ type: 'text', name: 'user_information' })
    userInformation: string;

    /** 表示名 */
    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;

    /** 携帯電話番号 */
    @Column({ type: 'varchar', length: 255, name: 'mobile_phone' })
    mobilePhone: string;

    /** メールアドレス */
    @Column({ type: 'varchar', length: 255, name: 'mail' })
    mail: string;

    /** 権限 */
    @Column({ type: 'text', name: 'auth' })
    auth: any = null;

    /** 前回ログイン日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', name: 'last_login_at' })
    lastLoginAt: Date;

    /** パスワード変更フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'password_changed_flg' })
    passwordChangedFlg: boolean;

    /** ログイン不可フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'login_prohibited_flg' })
    loginProhibitedFlg: boolean;

    /** その他属性 */
    @Column({ type: 'text', name: 'attributes' })
    attributes: any;

    /** アカウントロックフラグ */
    @Column({ type: 'boolean', name: 'lock_flg', nullable: false })
    lockFlg: boolean;

    /** アカウントロック開始日時 */
    @Column({ type: 'timestamp without time zone', default: null, name: 'lock_start_at' })
    lockStartAt: Date;

    /** パスワード更新日時 */
    @Column({ type: 'timestamp without time zone', default: null, name: 'password_updated_at' })
    passwordUpdatedAt: Date;

    /** 利用者ID */
    @Column({ type: 'varchar', length: 255, name: 'user_id' })
    userId: string;

    /** Regionカタログコード */
    @Column({ type: 'bigint', name: 'region_catalog_code' })
    regionCatalogCode: number;

    /** APPカタログコード */
    @Column({ type: 'bigint', name: 'app_catalog_code' })
    appCatalogCode: number;

    /** WFカタログコード */
    @Column({ type: 'bigint', name: 'wf_catalog_code' })
    wfCatalogCode: number;

    /** クライアントID */
    @Column({ type: 'varchar', length: 255, name: 'client_id' })
    clientId: string;

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

    /** 一意性制約チェック列：login_id */
    @Column({ type: 'text', nullable: false, name: 'unique_check_login_id' })
    uniqueCheckLoginId: string = '';

    /**
     * コンストラクタ
     * @param entity
     */
    constructor (entity?: {}) {
        super();
        if (entity) {
            this.id = parseInt(entity['id']);
            this.type = entity['type'] ? parseInt(entity['type']) : 0;
            this.loginId = entity['login_id'];
            this.hpassword = entity['hpassword'];
            this.pxrId = entity['pxr_id'];
            let userInformation = entity['user_information'] ? entity['user_information'] : null;
            if (userInformation) {
                try {
                    userInformation = JSON.parse(userInformation);
                } catch (e) {
                    userInformation = {};
                }
            }
            this.userInformation = userInformation;
            this.name = entity['name'];
            this.mobilePhone = entity['mobile_phone'];
            this.mail = entity['mail'];
            let auth;
            try {
                auth = JSON.parse(entity['auth']);
            } catch (e) {
                auth = {};
            }
            this.auth = auth;
            this.lastLoginAt = entity['last_login_at'] ? new Date(entity['last_login_at']) : null;
            this.passwordChangedFlg = entity['password_changed_flg'] ? entity['password_changed_flg'] : false;
            this.loginProhibitedFlg = entity['login_prohibited_flg'] ? entity['login_prohibited_flg'] : false;
            let attributes;
            try {
                attributes = JSON.parse(entity['attributes']);
            } catch (e) {
                attributes = {};
            }
            this.attributes = attributes;
            this.lockFlg = entity['lock_flg'];
            this.lockStartAt = entity['lock_start_at'];
            this.passwordUpdatedAt = entity['password_updated_at'];
            this.userId = entity['user_id'];
            this.regionCatalogCode = entity['region_catalog_code'];
            this.appCatalogCode = entity['app_catalog_code'];
            this.wfCatalogCode = entity['wf_catalog_code'];
            this.clientId = entity['client_id'];
            this.isDisabled = entity['is_disabled'];
            this.createdBy = entity['created_by'];
            this.createdAt = entity['created_at'] ? new Date(entity['created_at']) : new Date();
            this.updatedBy = entity['updated_by'];
            this.updatedAt = entity['updated_at'] ? new Date(entity['updated_at']) : new Date();
            this.uniqueCheckLoginId = entity['unique_check_login_id'];
        }
    }
}
