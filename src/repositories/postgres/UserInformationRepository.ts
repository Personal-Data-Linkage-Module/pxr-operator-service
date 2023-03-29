/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { connectDatabase } from '../../common/Connection';
/* eslint-disable */
import { Connection, EntityManager, getRepository } from 'typeorm';
import OperatorEntity from './OperatorEntity';
import { CodeVersionObject } from '../../resources/dto/PostUserInfoSearchReqDto';
/* eslint-enable */
import UserInformationEntity from './UserInformationEntity';

export default class UserInformationRepository {
    /**
     * 利用者管理情報を基にPXR-ID取得
     * @param type
     * @param target
     * @param min
     * @param max
     */
    static async getUserInfoSearch (type: CodeVersionObject, target: string, min: number, max: number): Promise<string[]> {
        const connection = await connectDatabase();
        const repository = getRepository(UserInformationEntity, connection.name);
        let sql = repository
            .createQueryBuilder('user_information')
            .select('operator.pxr_id')
            .innerJoin(OperatorEntity, 'operator', 'operator.id = user_information.operator_id')
            .where('operator.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('user_information.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('user_information.catalog_code = :catalog_code', { catalog_code: type._value })
            .andWhere('user_information.catalog_version = :catalog_version', { catalog_version: type._ver });
        if (target) {
            sql = sql.andWhere('user_information.value = :value', { value: target });
        } else {
            if (min) {
                sql = sql.andWhere('user_information.value >= :min', { min: min });
            }
            if (max) {
                sql = sql.andWhere('user_information.value <= :max', { max: max });
            }
        }
        sql = sql.orderBy('operator.pxr_id');
        const ret = await sql.getRawMany();
        const list: string[] = [];
        ret.forEach(element => {
            list.push(element['pxr_id']);
        });
        return list;
    }

    public async insertUserInformation (em: EntityManager, entity: UserInformationEntity) {
        const repository = em.getRepository(UserInformationEntity);
        const result = await repository.save(entity);
        return result;
    }

    /**
     * 利用者管理情報レコード削除
     * @param em
     * @param operatorId
     * @param register
     */
    public async deleteUserInformation (em: EntityManager, operatorId: number, register: string) {
        // SQLを生成及び実行
        const ret = await em
            .createQueryBuilder()
            .update(UserInformationEntity)
            .set({
                isDisabled: true,
                updatedBy: register
            })
            .where('operator_id = :id', { id: operatorId })
            .andWhere('is_disabled = :is_disabled', { is_disabled: false })
            .execute();
        return ret;
    }
}
