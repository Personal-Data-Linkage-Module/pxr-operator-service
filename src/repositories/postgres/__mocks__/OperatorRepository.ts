/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, InsertResult, EntityManager, UpdateResult, Repository } from 'typeorm';
import OperatorEntity from '../OperatorEntity';
import OperatorDomain from '../../../domains/OperatorDomain';
/* eslint-enable */
import { Service } from 'typedi';

@Service()
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
     */
    public async getRecordFromId (operatorId: number): Promise<OperatorEntity> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * OperatorをpxrIdをもとに取得
     * @param pxrId
     */
    public async getRecordFromPxrId (pxrId: string): Promise<OperatorEntity> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * OperatorをtypeとloginIdをもとに取得
     * @param type
     * @param loginId
     */
    public async getRecordFromLoginId (type:number, loginId: string): Promise<OperatorEntity> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * Operatorをtypeをもとに取得
     * @param type
     */
    public async getRecordFromType (type: number): Promise<OperatorEntity[]> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 認証情報と一致するレコードを取得
     * @param entity
     */
    public async getAuthInfo (entity: OperatorEntity): Promise<OperatorEntity> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 全権持ちの運営メンバーの存在確認（指定id以外）
     * @param operatorId
     */
    public async isAllAuthMemberExistsOtherThisId (operatorId: number): Promise<number> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 全権持ちの運営メンバーの存在確認
     */
    public async isAllAuthMemberExists (): Promise<number> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * アカウントロックを解除
     * @param operator
     */
    public async releaseAccountLock (operator: OperatorEntity) {
        throw new Error('Unit Test DB Error');
    }

    /**
     * アカウントロックを開始
     * @param operator
     */
    public async accountLock (operator: OperatorEntity) {
        throw new Error('Unit Test DB Error');
    }

    /**
     * パスワード初期フラグを有効化
     * @param operator
     */
    public async enablePasswordResetFlg (operator: OperatorEntity) {
        throw new Error('Unit Test DB Error');
    }

    /**
     * OperatorをtypeとloginIdをもとに件数取得
     * @param type
     * @param loginId
     */
    public async getRecordCountFromLoginId (type: number, loginId: string): Promise<number> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * オペレーターの追加
     * @param em
     * @param entity
     */
    public async insertOperator (em: EntityManager, entity: OperatorEntity): Promise<InsertResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * オペレーター更新
     * @param em
     * @param operatorDomain
     */
    public async updateOperator (em: EntityManager, operatorDomain: OperatorDomain): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 前回ログイン日時更新
     * @param em
     * @param operatorId
     * @param entity
     */
    public async updateLastLogin (em: EntityManager, operatorId: number, target: OperatorEntity): Promise<OperatorEntity> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * オペレーター削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteOperator (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 利用者情報更新
     * @param em
     * @param operatorId
     * @param userInformation
     * @param register
     */
    public async updateUserInfo (em: EntityManager, operatorId: number, userInformation: any, register: string) : Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * 利用者情報削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteUserInfo (em: EntityManager, operatorId: number, register: string): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }

    /**
     * パスワード更新
     * @param em
     * @param operatorId
     * @param entity
     */
    public async updateHpassword (em: EntityManager, operatorId: number, entity: OperatorEntity): Promise<UpdateResult> {
        throw new Error('Unit Test DB Error');
    }
}
