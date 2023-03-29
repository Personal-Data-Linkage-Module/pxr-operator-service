/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, InsertResult, EntityManager, UpdateResult } from 'typeorm';
import OperatorDomain from '../../domains/OperatorDomain';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
/* eslint-enable */
import OperatorEntity from './OperatorEntity';
import { OperatorType } from '../../common/OperatorType';

const Message = Config.ReadConfig('./config/message.json');

export default class OperatorRepository {
    /**
     * DB接続オブジェクト
     */
    private connection: Connection = null;

    /**
     * コンストラクタ
     * @param connection
     */
    public constructor (connection: Connection) {
        this.connection = connection;
    }

    /**
     * OperatorをoperatorIdをもとに取得
     * @param operatorId
     * @param isDisabled
     */
    public async getRecordFromId (operatorId: number, isCheckDisabled: boolean = true): Promise<OperatorEntity> {
        let sql = this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('id = :operatorId', { operatorId: operatorId });
        if (isCheckDisabled) {
            sql = sql.andWhere('is_disabled = :is_disabled', { is_disabled: false });
        }
        const ret = await sql.getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * OperatorをpxrIdをもとに取得
     * @param pxrId
     */
    public async getRecordFromPxrId (pxrId: string): Promise<OperatorEntity> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('pxr_id = :pxrId', { pxrId: pxrId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * OperatorをpxrIdをもとに取得
     * @param pxrId
     */
    public async getRecordFromPxrIds (pxrIds: string[]): Promise<OperatorEntity[]> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('pxr_id in (:...ids)', { ids: pxrIds })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .orderBy('id', 'ASC')
            .getRawMany();
        const list: OperatorEntity[] = [];
        ret.forEach(element => {
            list.push(new OperatorEntity(element));
        });
        return list;
    }

    /**
     * OperatorをtypeとloginIdをもとに取得
     * @param type
     * @param loginId
     */
    public async getRecordFromLoginId (type:number, loginId: string): Promise<OperatorEntity> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('type = :type', { type: type })
            .andWhere('login_id = :login_id', { login_id: loginId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     *
     * @param userId
     */
    public async getRecordFromUserId (userId: string) {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('user_id = :id', { id: userId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * Operatorをtypeをもとに取得
     * @param type
     */
    public async getRecordFromType (type: number): Promise<OperatorEntity[]> {
        const sql = this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('type = :type', { type: type })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .orderBy('id', 'ASC');
        const ret = await sql.getRawMany();

        const list: OperatorEntity[] = [];
        ret.forEach(element => {
            list.push(new OperatorEntity(element));
        });

        return list;
    }

    /**
     * Operatorをtypeをもとに件数取得
     * @param type
     */
    public async getRecordCountFromType (type: number): Promise<number> {
        const sql = this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('type = :type', { type: type })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false });
        const ret = await sql.getCount();

        return ret;
    }

    /**
     * 認証情報と一致するレコードを取得
     * @param entity
     */
    public async getAuthInfo (entity: OperatorEntity): Promise<OperatorEntity> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('type = :type', { type: entity.type })
            .andWhere('login_id = :login_id', { login_id: entity.loginId })
            .andWhere('login_prohibited_flg = false')
            .orderBy('id', 'ASC')
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * clientIdでオペレーターを取得
     * @param clientId
     */
    public async getOperatorByClientId (clientId: string): Promise<OperatorEntity> {
        // SQLを生成及び実行
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('client_id = :client_id', { client_id: clientId })
            .andWhere('login_prohibited_flg = :login_prohibited_flg', { login_prohibited_flg: false })
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * pxrIdでオペレーターを取得
     * @param pxrId
     */
    public async getAuthInfoByPxrId (pxrId: string): Promise<OperatorEntity> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('pxr_id = :pxrId', { pxrId: pxrId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('login_prohibited_flg = :login_prohibited_flg', { login_prohibited_flg: false })
            .getRawOne();
        return ret ? new OperatorEntity(ret) : null;
    }

    /**
     * 全権持ちの運営メンバーの存在確認（指定id以外）
     * @param operatorId
     */
    public async isAllAuthMemberExistsOtherThisId (operatorId: number): Promise<number> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('type = :type', { type: OperatorType.TYPE_MANAGE_MEMBER })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('auth::json->\'member\'->>\'add\' = \'true\'')
            .andWhere('auth::json->\'member\'->>\'update\' = \'true\'')
            .andWhere('auth::json->\'member\'->>\'delete\' = \'true\'')
            .andWhere('id != :id', { id: operatorId })
            .getCount();
        return ret;
    }

    /**
     * 全権持ちの運営メンバーの存在確認
     */
    public async isAllAuthMemberExists (): Promise<number> {
        const ret = await this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('type = :type', { type: OperatorType.TYPE_MANAGE_MEMBER })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('auth::json->\'member\'->>\'add\' = \'true\'')
            .andWhere('auth::json->\'member\'->>\'update\' = \'true\'')
            .andWhere('auth::json->\'member\'->>\'delete\' = \'true\'')
            .getCount();
        return ret;
    }

    /**
     * アカウントロックを解除
     * @param operator
     */
    public async releaseAccountLock (operator: OperatorEntity) {
        const entity = await this.connection.getRepository(OperatorEntity).findOne(operator.id);
        entity.lockFlg = false;
        entity.updatedBy = operator.loginId;
        await this.connection.getRepository(OperatorEntity).save(entity);
    }

    /**
     * アカウントロックを開始
     * @param operator
     */
    public async accountLock (operator: OperatorEntity) {
        const entity = await this.connection.getRepository(OperatorEntity).findOne(operator.id);
        entity.lockFlg = true;
        entity.lockStartAt = new Date();
        entity.updatedBy = operator.loginId;
        await this.connection.getRepository(OperatorEntity).save(entity);
    }

    /**
     * パスワード初期フラグを有効化
     * @param operator
     */
    public async enablePasswordResetFlg (operator: OperatorEntity) {
        const entity = await this.connection.getRepository(OperatorEntity).findOne(operator.id);
        entity.passwordChangedFlg = false;
        entity.updatedBy = operator.loginId;
        const ret = await this.connection.getRepository(OperatorEntity).save(entity);
        return ret;
    }

    /**
     * OperatorをtypeとloginIdをもとに件数取得
     * @param type
     * @param loginId
     */
    public async getRecordCountFromLoginId (type: number, loginId: string): Promise<number> {
        const sql = this.connection
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('type = :type', { type: type })
            .andWhere('login_id = :login_id', { login_id: loginId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false });
        const ret = await sql.getCount();

        return ret;
    }

    /**
     * オペレーターの追加
     * @param em
     * @param entity
     */
    public async insertOperator (em: EntityManager, entity: OperatorEntity): Promise<InsertResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .insert()
            .into(OperatorEntity)
            .values({
                type: entity.type,
                loginId: entity.loginId,
                hpassword: entity.hpassword,
                pxrId: entity.pxrId,
                name: entity.name,
                mobilePhone: entity.mobilePhone,
                auth: entity.auth,
                lastLoginAt: null,
                attributes: entity.attributes,
                loginProhibitedFlg: entity.loginProhibitedFlg,
                userId: entity.userId,
                userInformation: entity.userInformation,
                regionCatalogCode: entity.regionCatalogCode,
                appCatalogCode: entity.appCatalogCode,
                wfCatalogCode: entity.wfCatalogCode,
                clientId: entity.clientId,
                createdBy: entity.createdBy,
                createdAt: entity.createdAt,
                updatedBy: entity.updatedBy,
                updatedAt: entity.updatedAt,
                uniqueCheckLoginId: entity.uniqueCheckLoginId
            })
            .execute();

        return ret;
    }

    /**
     * オペレーター更新
     * @param em
     * @param operatorDomain
     */
    public async updateOperator (em: EntityManager, operatorDomain: OperatorDomain): Promise<UpdateResult> {
        let attrs:any = null;
        if (operatorDomain.getAttributes() != null) {
            attrs = JSON.stringify(operatorDomain.getAttributes());
        }
        let auth:any = null;
        if (operatorDomain.getAuth() != null) {
            auth = JSON.stringify(operatorDomain.getAuth());
        }
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                loginId: operatorDomain.getLoginId(),
                name: operatorDomain.getName(),
                mobilePhone: operatorDomain.getMobilePhone(),
                auth: auth,
                passwordChangedFlg: operatorDomain.getPasswordChangedFlg(),
                loginProhibitedFlg: operatorDomain.loginProhibitedFlg,
                attributes: attrs,
                updatedBy: operatorDomain.getUpdatedBy(),
                uniqueCheckLoginId: operatorDomain.getUniqueCheckLoginId()
            })
            .where('id = :id', { id: operatorDomain.getOperatotId() })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }

    /**
     * 前回ログイン日時更新
     * @param em
     * @param operatorId
     * @param entity
     */
    public async updateLastLogin (em: EntityManager, operatorId: number, target: OperatorEntity): Promise<OperatorEntity> {
        // updateを実行
        await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                lastLoginAt: target.lastLoginAt,
                updatedBy: target.updatedBy
            })
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();

        // 返却の為に更新したレコードを取得
        const entity = await em
            .createQueryBuilder()
            .from(OperatorEntity, 'operator')
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .getRawOne();
        return new OperatorEntity(entity);
    }

    /**
     * オペレーター削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteOperator (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                isDisabled: true,
                updatedBy: register,
                uniqueCheckLoginId: String(operatorId)
            })
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }

    /**
     * オペレーター削除取り消し
     * @param em
     * @param operatorId
     * @param register
     */
    public async cancelDeleteOperator (em: EntityManager, operatorId: number, register: string, uniqueCheckLoginId: string): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                isDisabled: false,
                updatedBy: register,
                uniqueCheckLoginId: uniqueCheckLoginId
            })
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: true })
            .execute();
        return ret;
    }

    /**
     * 利用者情報更新
     * @param em
     * @param operatorId
     * @param userInformation
     * @param register
     */
    public async updateUserInfo (em: EntityManager, operatorId: number, userInformation: any, mobilePhone: string, register: string) : Promise<UpdateResult> {
        const userInfo = JSON.stringify(userInformation);

        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                userInformation: userInfo,
                mobilePhone: mobilePhone,
                updatedBy: register
            })
            .where('id = :id', { id: operatorId })
            .execute();
        return ret;
    }

    /**
     * 利用者情報削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteUserInfo (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                userInformation: null,
                updatedBy: register
            })
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }

    /**
     * パスワード更新
     * @param em
     * @param operatorId
     * @param entity
     */
    public async updateHpassword (em: EntityManager, operatorId: number, entity: OperatorEntity): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                hpassword: entity.hpassword,
                passwordChangedFlg: entity.passwordChangedFlg,
                passwordUpdatedAt: new Date(),
                updatedBy: entity.updatedBy
            })
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }

    /**
     * ログイン不可個人のログインID重複件数を取得
     * @param loginId
     * @param appCatalogCode
     * @param regionCatalogCode
     */
    public async getCountFromDuplicateUserWithLoginId (loginId: string, appCatalogCode: number, regionCatalogCode: number): Promise<number> {
        if (appCatalogCode) {
            const ret = await this.connection
                .createQueryBuilder()
                .from(OperatorEntity, 'operator')
                .where('type = :type', { type: OperatorType.TYPE_IND })
                .andWhere('login_id = :login_id', { login_id: loginId })
                .andWhere('login_prohibited_flg = :lpflg', { lpflg: true })
                .andWhere('app_catalog_code = :code', { code: appCatalogCode })
                .andWhere('is_disabled = :is_disabled', { is_disabled: false })
                .getCount();
            return ret;
        } else if (regionCatalogCode) {
            const ret = await this.connection
                .createQueryBuilder()
                .from(OperatorEntity, 'operator')
                .where('type = :type', { type: OperatorType.TYPE_IND })
                .andWhere('login_id = :login_id', { login_id: loginId })
                .andWhere('login_prohibited_flg = :lpflg', { lpflg: true })
                .andWhere('region_catalog_code = :code', { code: regionCatalogCode })
                .andWhere('is_disabled = :is_disabled', { is_disabled: false })
                .getCount();
            return ret;
        } else {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }
    }

    /**
     * ログイン不可個人の利用者ID重複件数を取得
     * @param userId
     * @param appCatalogCode
     * @param regionCatalogCode
     */
    public async getCountFromDuplicateUserWithUserId (userId: string, appCatalogCode: number, regionCatalogCode: number): Promise<number> {
        if (appCatalogCode) {
            const ret = await this.connection
                .createQueryBuilder()
                .from(OperatorEntity, 'operator')
                .where('type = :type', { type: OperatorType.TYPE_IND })
                .andWhere('user_id = :user_id', { user_id: userId })
                .andWhere('login_prohibited_flg = :lpflg', { lpflg: true })
                .andWhere('app_catalog_code = :code', { code: appCatalogCode })
                .andWhere('is_disabled = :is_disabled', { is_disabled: false })
                .getCount();
            return ret;
        } else if (regionCatalogCode) {
            const ret = await this.connection
                .createQueryBuilder()
                .from(OperatorEntity, 'operator')
                .where('type = :type', { type: OperatorType.TYPE_IND })
                .andWhere('user_id = :user_id', { user_id: userId })
                .andWhere('login_prohibited_flg = :lpflg', { lpflg: true })
                .andWhere('region_catalog_code = :code', { code: regionCatalogCode })
                .andWhere('is_disabled = :is_disabled', { is_disabled: false })
                .getCount();
            return ret;
        } else {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }
    }

    /**
     * attributesに初期パスワード有効期限を設定
     * @param em
     * @param operatorId
     * @param attributes
     */
    public async setInitialPasswordExpire (em: EntityManager, operatorId: number, entity: OperatorEntity): Promise<UpdateResult> {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(OperatorEntity)
            .set({
                attributes: entity.attributes,
                updatedBy: entity.updatedBy
            })
            .where('id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }
}
