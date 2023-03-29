/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { connectDatabase } from '../../common/Connection';
import SmsVerificationCode from './SmsVerificationCode';
import Config from '../../common/Config';
import moment = require('moment');
import { Connection, EntityManager, UpdateResult } from 'typeorm';
import AuthMe from '../../domains/AuthMe';
const config = Config.ReadConfig('./config/config.json');
/* eslint-enable */
/**
 * SMS検証コード操作
 */
export default class SmsVerificationCodeOperation {
    /**
     * SMS検証コード登録
     */
    static async insertSmsVerificationCode (em: EntityManager | Connection, entity: SmsVerificationCode) {
        if (!em) {
            em = await connectDatabase();
        }
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .insert()
            .into(SmsVerificationCode)
            .values({
                operatorId: entity.operatorId,
                verificationCode: entity.verificationCode,
                verificationCodeExpiration: entity.verificationCodeExpiration,
                verificationResult: 1,
                createdBy: entity.createdBy,
                updatedBy: entity.updatedBy
            })
            .execute();
        return ret;
    }

    /**
     * SMS検証コード取得
     */
    static async getSmsVerificationCode (em: EntityManager | Connection, verificationCode: string, verificationResult: number, operatorId: number): Promise<SmsVerificationCode> {
        if (!em) {
            em = await connectDatabase();
        }
        // SQLを生成及び実行
        let sql = em
            .createQueryBuilder()
            .select('*')
            .from(SmsVerificationCode, 'sms_verification_code')
            .where('is_disabled = :isDisabled', { isDisabled: false });
        if (verificationCode) {
            sql = sql
                .andWhere('verification_code = :verificationCode', { verificationCode: verificationCode })
                .andWhere('verification_code_expiration >= :verificationCodeExpiration', { verificationCodeExpiration: new Date() });
        }
        if (verificationResult) {
            sql = sql.andWhere('verification_result = :verificationResult', { verificationResult: verificationResult });
        }
        if (operatorId) {
            sql = sql.andWhere('operator_id = :operatorId', { operatorId: operatorId });
        }
        const ret = await sql.getRawOne();
        return ret ? new SmsVerificationCode(ret) : null;
    }

    /**
     * SMS検証コード更新
     */
    static async updateSmsVerificationCode (em: EntityManager | Connection, entity: SmsVerificationCode, verificationResult: number): Promise<UpdateResult> {
        if (!em) {
            em = await connectDatabase();
        }

        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(SmsVerificationCode)
            .set({
                verificationResult: verificationResult,
                updatedBy: entity.updatedBy
            })
            .where('id = :id', { id: entity.id })
            .andWhere('is_disabled = :isDisabled', { isDisabled: false })
            .execute();
        return ret;
    }

    /**
     * オペレーターIDによるSMS検証コードテーブル更新
     */
    static async updateSmsVerificationCodeByOperatorId (em: EntityManager | Connection, operator: AuthMe) {
        if (!em) {
            em = await connectDatabase();
        }

        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(SmsVerificationCode)
            .set({
                verificationCodeExpiration: new Date(),
                updatedBy: operator.loginId
            })
            .where('operator_id = :operatorId', { operatorId: operator.operatorId })
            .andWhere('is_disabled = :isDisabled', { isDisabled: false })
            .execute();
        return ret;
    }
}
