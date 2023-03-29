/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection } from 'typeorm';
/* eslint-enable */
import LoginHistory from './LoginHistory';
import moment = require('moment-timezone');

export default class LoginHistoryOperation {
    static async insertLoginResult (connection: Connection, operatorId: number, by: string, result?: boolean) {
        const entity = new LoginHistory();
        entity.operatorId = operatorId;
        entity.createdBy = by;
        entity.updatedBy = by;
        entity.result = result === true;
        entity.loginAt = new Date();
        await connection.getRepository(LoginHistory).save(entity);
    }

    static async checkFailedCount (connection: Connection, operatorId: number, lockCount: number, lockTime: any) {
        const { type, value } = lockTime;
        const time = moment().utc().subtract(value, type).format('YYYY-MM-DD HH:mm:ss.SSS');
        const entities = await connection.getRepository(LoginHistory)
            .createQueryBuilder('loginHistory')
            .where('loginHistory.operatorId = :id', { id: operatorId })
            .andWhere('loginHistory.loginAt >= :time', { time: time })
            .limit(lockCount)
            .orderBy('loginHistory.loginAt', 'DESC')
            .getMany();
        if (entities.length < lockCount) {
            return false;
        }
        for (const entity of entities) {
            if (entity.result) {
                return false;
            }
        }
        return true;
    }
}
