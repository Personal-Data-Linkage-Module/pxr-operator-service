/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { EntityManager } from 'typeorm';
/* eslint-enable */
import IdentifyCodeEntity from './IdentifyCodeEntity';

export default class IdentifyCodeRepository {
    /**
     * IdentifyCodeテーブルにレコードを投入します
     * @param em EntityManager
     * @param entity IdentifyCodeエンティティ
     */
    public async insertIdentifyCode (em: EntityManager, entity: IdentifyCodeEntity): Promise<IdentifyCodeEntity> {
        const repository = em.getRepository(IdentifyCodeEntity);
        const result = await repository.save(entity);
        return result;
    }
}
