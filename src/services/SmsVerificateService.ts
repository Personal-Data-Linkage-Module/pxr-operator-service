/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from '../common/AppError';
import { Service } from 'typedi';
import SmsVerificateServiceDto from './dto/SmsVerificateServiceDto';
import Config from '../common/Config';
import { ResponseCode } from '../common/ResponseCode';
import { sendMessage } from '../common/Sms_Stub';
import Generator from '../common/Generator';
import SmsVerificationCode from '../repositories/postgres/SmsVerificationCode';
import moment = require('moment-timezone');
import { sprintf } from 'sprintf-js';
import SmsVerificationCodeOperation from '../repositories/postgres/SmsVerificationCodeOperation';
import config = require('config');
const configure = Config.ReadConfig('./config/config.json');
const message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

@Service()
export default class SmsVerificateService {
    /**
     * SMS検証コード発行
     */
    public async postIndSmsVerificate (dto: SmsVerificateServiceDto) {
        const operator = dto.getOperator();
        const userInfo = dto.getUserInformation();

        // 電話番号の取得 取得できなければエラー
        let phoneNumber = await (async u => {
            for (const itemGroup of u['item-group']) {
                for (const item of itemGroup.item) {
                    if (item.type._value === Number(config.get('phoneNumberCode'))) {
                        const value = item.content;
                        if (typeof value !== 'string') {
                            throw new AppError(message.PHONE_NUMBER_FIELD_IS_NOT_STRING, ResponseCode.BAD_REQUEST);
                        }
                        return value;
                    }
                }
            }
        })(userInfo);
        if (!phoneNumber) {
            throw new AppError(message.REQUIRED_PHONE_NUMBER, ResponseCode.BAD_REQUEST);
        }

        // code生成インスタンスを生成
        const generate: Generator = new Generator();
        // 検証コードの生成
        const verificationCode = generate.verificationCode();

        // 検証コードの有効期限取得
        const amount = configure['smsVerification']['expiration']['value'];
        const unit = configure['smsVerification']['expiration']['type'];
        const expiration = moment.utc().add(amount, unit).toDate();

        // SMS検証コードにレコードを登録
        const entity = new SmsVerificationCode();
        entity.operatorId = operator.operatorId;
        entity.verificationCode = verificationCode;
        entity.verificationCodeExpiration = expiration;
        entity.verificationResult = 1;
        entity.createdBy = operator.loginId;
        entity.updatedBy = operator.loginId;
        await SmsVerificationCodeOperation.insertSmsVerificationCode(null, entity);
        phoneNumber = config.get('sms.country-code') + (p => {
            if (p.indexOf('0') === 0) {
                return p.substring(1);
            }
            return p;
        })(phoneNumber);
        await sendMessage(
            sprintf(configure['smsVerification']['message'], verificationCode),
            phoneNumber
        );

        return { result: 'success' };
    }

    /**
     * SMS検証コード検証
     */
    public async postIndSmsVerificateVerifiy (dto: SmsVerificateServiceDto) {
        const verificationCode = dto.getSmsVerificationCode();
        const operator = dto.getOperator();

        // SMS検証コードを検索する レコードが存在しない場合エラー
        const entity = await SmsVerificationCodeOperation.getSmsVerificationCode(null, verificationCode, 1, operator.operatorId);
        if (!entity) {
            throw new AppError(message.NOT_EXIST_SMS_VERIFICATION_CODE, ResponseCode.BAD_REQUEST);
        }
        // 取得したSMS検証コードを検証済(2)に更新する
        await SmsVerificationCodeOperation.updateSmsVerificationCode(null, entity, 2);
        // SMS検証コードテーブルを更新
        await SmsVerificationCodeOperation.updateSmsVerificationCodeByOperatorId(null, operator);

        return { result: 'success' };
    }
}
