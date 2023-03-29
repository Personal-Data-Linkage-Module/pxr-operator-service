/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection, createConnection, getConnectionManager } from 'typeorm';
import Config from './Config';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
import RoleSettingEntity from '../repositories/postgres/RoleSettingEntity';
import OneTimeLoginCodeEntity from '../repositories/postgres/OneTimeLoginCodeEntity';
import SessionEntity from '../repositories/postgres/SessionEntity';
import LoginHistory from '../repositories/postgres/LoginHistory';
import PasswordHistory from '../repositories/postgres/PasswordHistory';
import ManageBlockInfo from '../repositories/postgres/ManageBlockInfo';
import UserInformationEntity from '../repositories/postgres/UserInformationEntity';
import SmsVerificationCode from '../repositories/postgres/SmsVerificationCode';
import IdentifyCodeEntity from '../repositories/postgres/IdentifyCodeEntity';
// import { applicationLogger } from './logging';
// import { sprintf } from 'sprintf-js';
/* eslint-enable */
// import uuid = require('uuid');
// const contextService = require('request-context');
const config = Config.ReadConfig('./config/ormconfig.json');

// エンティティを設定
config['entities'] = [
    OperatorEntity,
    RoleSettingEntity,
    OneTimeLoginCodeEntity,
    SessionEntity,
    LoginHistory,
    PasswordHistory,
    ManageBlockInfo,
    UserInformationEntity,
    IdentifyCodeEntity,
    SmsVerificationCode
];

/**
 * コネクションの生成
 */
export async function connectDatabase (): Promise<Connection> {
    let connection = null;
    try {
        // データベースに接続
        connection = await createConnection(config);
    } catch (err) {
        if (err.name === 'AlreadyHasActiveConnectionError') {
            // すでにコネクションが張られている場合には、流用する
            connection = getConnectionManager().get('postgres');
        } else {
            throw err;
        }
    }
    // 接続したコネクションを返却
    return connection;
}
