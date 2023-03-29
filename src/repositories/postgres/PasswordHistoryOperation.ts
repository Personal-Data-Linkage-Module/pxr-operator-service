/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { EntityManager } from 'typeorm';
import OperatorEntity from './OperatorEntity';
/* eslint-enable */
import PasswordHistory from './PasswordHistory';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

export default class PasswordHistoryOperation {
    static async recordPasswordHistorical (manager: EntityManager, operatorId: number, by: string, password: string) {
        const entity = new PasswordHistory();
        entity.operatorId = operatorId;
        entity.hpassword = password;
        entity.createdBy = by;
        entity.updatedBy = by;
        await manager.getRepository(PasswordHistory).save(entity);
    }

    static async passwordAlreadyUsing (trans: EntityManager, operator: OperatorEntity, password: string, gen: number) {
        if (operator.hpassword === password) {
            throw new AppError(Message.ALREADY_USED_PASSWORD, 400);
        }
        if (gen > 1) {
            const entities = await trans
                .getRepository(PasswordHistory)
                .createQueryBuilder('passwordHistory')
                .where('passwordHistory.operatorId = :id', { id: operator.id })
                .andWhere('passwordHistory.isDisabled = false')
                .orderBy('passwordHistory.updatedAt', 'DESC')
                .limit(gen - 1)
                .getMany();

            for (const entity of entities) {
                if (entity.hpassword === password) {
                    throw new AppError(Message.ALREADY_USED_PASSWORD, 400);
                }
            }
        }
    }
}
