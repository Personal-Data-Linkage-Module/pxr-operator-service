/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */
/* eslint-disable */
import { Connection, EntityManager, getConnection } from 'typeorm';
import AuthMe from '../domains/AuthMe';
import UserInfoServiceDto from './dto/UserInfoServiceDto';
import PostUserInfoSearchReqDto, { CodeVersionObject } from '../resources/dto/PostUserInfoSearchReqDto';
import PostUserInfoListReqDto from '../resources/dto/PostUserInfoListReqDto';
/* eslint-enable */
import { Service } from 'typedi';
import { transformAndValidate } from 'class-transformer-validator';
import AppError from '../common/AppError';
import CheckOperatorAuth from '../common/CheckOperatorAuth';
import { ResponseCode } from '../common/ResponseCode';
import { OperatorType } from '../common/OperatorType';
import Config from '../common/Config';
import Catalog from '../common/Catalog';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
import OperatorRepository from '../repositories/postgres/OperatorRepository';
import UserInformationDto from '../resources/dto/UserInformationDto';
import PostUserInfoSearchResDto, { PxrObject } from '../resources/dto/PostUserInfoSearchResDto';
import UserInformationEntity from '../repositories/postgres/UserInformationEntity';
import UserInformationRepository from '../repositories/postgres/UserInformationRepository';
import SmsVerificationCodeOperation from '../repositories/postgres/SmsVerificationCodeOperation';
import { sprintf } from 'sprintf-js';
import config = require('config');
const configure = Config.ReadConfig('./config/config.json');
const Message = Config.ReadConfig('./config/message.json');

@Service()
export default class UserInfoService {
    private readonly configure = Config.ReadConfig('./config/config.json');

    /**
     * 利用者情報の取得を行う
     * @param pxrId
     * @param operator
     */
    static async getUserInfo (pxrId: string, userId: string, operator: AuthMe) {
        const data = await (async () => {
            if (operator.type === OperatorType.TYPE_IND) {
                return new OperatorRepository(getConnection('postgres')).getRecordFromPxrId(operator.pxrId);
            } else {
                if (pxrId) {
                    return new OperatorRepository(getConnection('postgres')).getRecordFromPxrId(pxrId);
                } else {
                    return new OperatorRepository(getConnection('postgres')).getRecordFromUserId(userId);
                }
            }
        })();
        if (!data) {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.NO_CONTENT);
        }
        return data.pxrId ? {
            pxrId: data.pxrId,
            userInfo: data.userInformation
        } : {
            userId: data.userId,
            userInfo: data.userInformation
        };
    }

    /**
     * 利用者情報の複数取得を行う
     * @param dto
     */
    static async getUserInfoList (dto: PostUserInfoListReqDto) {
        const operators = await new OperatorRepository(getConnection('postgres')).getRecordFromPxrIds(dto.pxrId);
        const res: any[] = [];
        for (const operator of operators) {
            const ele = {
                pxrId: operator.pxrId,
                userInfo: operator.userInformation
            };
            res.push(ele);
        }
        return res;
    }

    /**
     * 利用者情報からPXR-IDの検索を行う
     * @param dto
     */
    static async getUserInfoSearch (operator: AuthMe, dto: UserInfoServiceDto): Promise<PostUserInfoSearchResDto> {
        // 検索条件を取得
        const requestList = dto.getRequest<PostUserInfoSearchReqDto[]>();

        const resPxrList: PxrObject[] = [];
        for (let index = 0; index < requestList.length; index++) {
            // 検索結果の判定値を取得
            const min: number = Number(requestList[index].min);
            const max: number = Number(requestList[index].max);

            const conditionList = requestList[index].condition;
            const info = new PxrObject();
            for (let conditionIndex = 0; conditionIndex < conditionList.length; conditionIndex++) {
                let target: string = null;
                if (conditionList[conditionIndex]['target']) {
                    // targetが存在する場合値を取得
                    const url = configure['catalog_url'];
                    const targetCatalog = await new Catalog().getCatalog(operator, url, conditionList[conditionIndex]['target']._value);
                    target = targetCatalog['catalogItem']['name'];
                }
                // 各種条件を取得
                const type: CodeVersionObject = conditionList[conditionIndex]['type'];
                const valueMin: number = conditionList[conditionIndex]['min'];
                const valueMax: number = conditionList[conditionIndex]['max'];

                // 利用者管理情報テーブルを検索
                const pxrList: string[] = await UserInformationRepository.getUserInfoSearch(type, target, valueMin, valueMax);

                if (info.pxrId.length === 0) {
                    // 取得したPXRIDリストをレスポンスに設定
                    info.pxrId = info.pxrId.concat(pxrList);
                } else {
                    info.pxrId = info.pxrId.filter(id => pxrList.indexOf(id) >= 0);
                }
            }
            // 取得件数を判定
            if (info.pxrId.length < min) {
                resPxrList.push(new PxrObject());
                continue;
            }
            if (max && info.pxrId.length > max) {
                resPxrList.push(new PxrObject());
                continue;
            }
            info.pxrId = [...new Set(info.pxrId)];
            resPxrList.push(info);
        }

        // レスポンスを返却
        const res = new PostUserInfoSearchResDto();
        res.list = resPxrList;
        return res;
    }

    /**
     * 利用者情報更新
     * @param operator
     * @param dto
     * リファクタ履歴
     *  separate : getChangeableItemList
     *  separate : createUpdateData
     *  separate : setUpdateData
     */
    static async updateUserInfo (operator: AuthMe, dto: UserInformationDto) {
        const connection = getConnection('postgres');
        await connection.transaction(async trans => {
            // 対象のデータを取得
            const entity = await new OperatorRepository(connection).getRecordFromId(operator.operatorId);
            if (!entity.userInformation) {
                throw new AppError(Message.NO_DATA_USER_INFORMATION, ResponseCode.BAD_REQUEST);
            }
            const userInfo = await transformAndValidate(UserInformationDto, entity.userInformation) as UserInformationDto;

            // カタログのUserInformationを確認、changable-flagを確認し
            // `変更可能な`アイテムリストを形成する
            const userInfoCode = Number(configure['userInfoCatalogCode']);
            var { smsVerificateFlg, changeableItemList }: { smsVerificateFlg: boolean; changeableItemList: number[]; } =
                await UserInfoService.getChangeableItemList(operator, userInfoCode);

            // 電話番号が変更可能かつ電話番号の変更に対してSMS検証が必要な場合、変更前の電話番号を取得する
            let phoneNumber: string;
            if (smsVerificateFlg) {
                for (const itemGroup of userInfo['item-group']) {
                    for (const item of itemGroup.item) {
                        if (item.type._value === Number(config.get('phoneNumberCode')) && item['content']) {
                            phoneNumber = <string>item['content'];
                        }
                    }
                }
            }

            // リクエストの内容を確認、変更可能リストと突き合わせて、
            // 今回の更新データを形成する
            let map: Map<number, string | number | boolean> = new Map<number, string | number | boolean>();
            ({ map, smsVerificateFlg } =
                await UserInfoService.createUpdateData(dto, map, changeableItemList, operator, smsVerificateFlg, phoneNumber));

            // 電話番号が変更されている場合 かつ SMS検証が必要な場合
            // SMS検証コードを検索してレコードが存在しない場合エラー
            if (smsVerificateFlg) {
                const smsVerificationCode = await SmsVerificationCodeOperation.getSmsVerificationCode(trans, null, 2, operator.operatorId);
                if (!smsVerificationCode) {
                    throw new AppError(Message.NOT_VERIFIED_SMS_VERIFICATION_CODE, ResponseCode.UNAUTHORIZED);
                }
                // SMS検証コードを使用済(3)に更新
                await SmsVerificationCodeOperation.updateSmsVerificationCode(trans, smsVerificationCode, 3);
            }

            // 今回の更新では、変更可能だったデータを対象とすることがなければエラー
            if (map.size <= 0) {
                throw new AppError('', 204);
            }

            // レコードから取ってきた利用者情報に、更新するデータを上書きする
            await UserInfoService.setUpdateData(userInfo, map, trans, entity);

            const userInformations = UserInfoService.createUserInformation(userInfo['item-group'], operator.operatorId, operator);

            // 更新
            await trans.getRepository(OperatorEntity).update(entity.id, {
                userInformation: JSON.stringify(userInfo),
                updatedBy: operator.loginId
            });
            const userInformationRepository: UserInformationRepository = new UserInformationRepository();
            await userInformationRepository.deleteUserInformation(trans, operator.operatorId, operator.loginId);
            for (const userInformation of userInformations) {
                await userInformationRepository.insertUserInformation(trans, userInformation);
            }
        });
    }

    private static async createUpdateData (dto: UserInformationDto, map: Map<number, string | number | boolean>, changeableItemList: number[], operator: AuthMe, smsVerificateFlg: boolean, phoneNumber: string) {
        const url = configure['catalog_url'];
        for (const itemGroup of dto['item-group']) {
            for (const item of itemGroup.item) {
                if (changeableItemList.includes(item.type._value)) {
                    // item-typeのカタログを取得
                    const itemTypeCatalog = await new Catalog().getCatalog(operator, url, item.type._value, item.type._ver);
                    if (itemTypeCatalog && itemTypeCatalog['template']['input-pattern']) {
                        // item.contentが存在しない または input-patternと合致しない場合エラー
                        const regex = new RegExp(itemTypeCatalog['template']['input-pattern']);
                        if (!item.content || !item.content.toString().match(regex)) {
                            throw new AppError(sprintf(Message.NOT_MATCH_REGEX, item.title), ResponseCode.BAD_REQUEST);
                        }
                    }
                    map.set(item.type._value, item.content);
                    // 電話番号が変更されている場合 かつ SMS検証が必要な場合
                    if (smsVerificateFlg && item.type._value === Number(config.get('phoneNumberCode'))) {
                        if (item.content !== phoneNumber) {
                            smsVerificateFlg = true;
                        } else {
                            smsVerificateFlg = false;
                        }
                    }
                }
            }
        }
        return { map, smsVerificateFlg };
    }

    private static async setUpdateData (userInfo: UserInformationDto, map: Map<number, string | number | boolean>, trans: EntityManager, entity: OperatorEntity) {
        for (const itemGroup of userInfo['item-group']) {
            for (const item of itemGroup.item) {
                if (map.get(item.type._value)) {
                    const typeA: string = typeof map.get(item.type._value);
                    const typeB: string = typeof item.content;
                    if (typeA !== typeB) {
                        throw new AppError(Message.CAN_NOT_UPDATE_TYPE_MISMATCH, 400);
                    }
                    item.content = map.get(item.type._value);

                    // 電話番号であれば、別のカラムも更新する
                    if (item.type._value === parseInt(config.get('phoneNumberCode'))) {
                        await trans.getRepository(OperatorEntity).update(entity.id, {
                            mobilePhone: item.content + ''
                        });
                    }
                }
            }
        }
    }

    private static async getChangeableItemList (operator: AuthMe, userInfoCode: number) {
        // リクエスト.利用者管理情報の_codeから利用者管理情報のカタログを取得
        const url = configure['catalog_url'];
        const userInfoCatalog = await new Catalog().getCatalog(operator, url, userInfoCode);

        let smsVerificateFlg = false;
        const changeableItemList: number[] = [];
        for (const itemGroup of userInfoCatalog['template']['item-group']) {
            for (const item of itemGroup.item) {
                if (item['changable-flag']) {
                    changeableItemList.push(item.type._value);
                    // 電話番号の変更に対してSMS検証が必要
                    if (item.type._value === Number(config.get('phoneNumberCode')) && item['require-sms-verification']) {
                        smsVerificateFlg = true;
                    }
                }
            }
        }

        // 変更可能なアイテムが存在しない場合は、対象を更新することができないと判断し
        // エラーとする
        if (changeableItemList.length <= 0) {
            throw new AppError(Message.TARGET_DATA_IS_SET_AS_DO_NOT_UPDATABLE, 401);
        }
        return { smsVerificateFlg, changeableItemList };
    }

    /**
     * 利用者情報追加
     * @param connection
     * @param serviceDto
     * リファクタ履歴
     *  separate : checkInputPattern
     */
    public async postUserInfo (connection: Connection, serviceDto: UserInfoServiceDto, operator: AuthMe) {
        // 権限の確認
        if (operator.type !== OperatorType.TYPE_MANAGE_MEMBER ||
            !CheckOperatorAuth.checkAuth(operator.auth, null, true, null)) {
            throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
        }

        // 更新対象のオペレーターを取得
        const operatorData = await (async () => {
            if (serviceDto.getPxrId()) {
                return new OperatorRepository(getConnection('postgres')).getRecordFromPxrId(serviceDto.getPxrId());
            } else {
                return new OperatorRepository(getConnection('postgres')).getRecordFromUserId(serviceDto.getUserId());
            }
        })();
        if (!operatorData) {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.BAD_REQUEST);
        }

        // 利用者情報カタログの存在を確認する
        const dto = await transformAndValidate(UserInformationDto, serviceDto.getUserInfo()) as UserInformationDto;
        await new Catalog().getCatalog(operator, this.configure.catalog_url, dto._code._value, dto._code._ver);

        // 入力値のパターンチェックを行う
        const mobilePhone: string = await this.checkInputPattern(dto, operator);

        const userInformations = UserInfoService.createUserInformation(dto['item-group'], operatorData.id, operator);

        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const userInformationRepository: UserInformationRepository = new UserInformationRepository();

        // 更新実行
        await connection.transaction(async trans => {
            await operatorRepository.updateUserInfo(trans, operatorData.id, serviceDto.getUserInfo(), mobilePhone, operator.loginId);
            await userInformationRepository.deleteUserInformation(trans, operatorData.id, operator.loginId);
            for (const userInformation of userInformations) {
                await userInformationRepository.insertUserInformation(trans, userInformation);
            }
        });

        return serviceDto.getPxrId() ? {
            pxrId: serviceDto.getPxrId()
        } : {
            userId: serviceDto.getUserId()
        };
    }

    private async checkInputPattern (dto: UserInformationDto, operator: AuthMe) {
        let mobilePhone: string = null;
        // 入力値のパターンチェックを行う
        for (const itemGroup of dto['item-group']) {
            for (const item of itemGroup.item) {
                // item-typeのカタログを取得
                const url = configure['catalog_url'];
                const itemTypeCatalog = await new Catalog().getCatalog(operator, url, item.type._value, item.type._ver);
                if (itemTypeCatalog && itemTypeCatalog['template']['input-pattern']) {
                    // item.contentが存在しない または input-patternと合致しない場合エラー
                    const regex = new RegExp(itemTypeCatalog['template']['input-pattern']);
                    if (!item.content || !item.content.toString().match(regex)) {
                        throw new AppError(sprintf(Message.NOT_MATCH_REGEX, item.title), ResponseCode.BAD_REQUEST);
                    }
                }
                // 電話番号であれば、別のカラムも更新する
                if (item.type._value === parseInt(config.get('phoneNumberCode'))) {
                    mobilePhone = item.content + '';
                }
            }
        }
        return mobilePhone;
    }

    /**
     * 利用者情報削除
     * @param connection
     * @param serviceDto
     */
    public async deleteUserInfo (connection: Connection, serviceDto: UserInfoServiceDto, operator: AuthMe) {
        // 権限の確認
        if (operator.type !== OperatorType.TYPE_MANAGE_MEMBER ||
            !CheckOperatorAuth.checkAuth(operator.auth, null, null, true)) {
            throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
        }

        // 削除対象のオペレーターを取得
        const operatorData = await (async () => {
            if (serviceDto.getPxrId()) {
                return new OperatorRepository(getConnection('postgres')).getRecordFromPxrId(serviceDto.getPxrId());
            } else {
                return new OperatorRepository(getConnection('postgres')).getRecordFromUserId(serviceDto.getUserId());
            }
        })();
        if (!operatorData) {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.BAD_REQUEST);
        }

        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const userInformationRepository: UserInformationRepository = new UserInformationRepository();

        // トランザクションの開始
        await connection.transaction(async trans => {
            await operatorRepository.deleteUserInfo(trans, operatorData.id, operator.loginId);
            await userInformationRepository.deleteUserInformation(trans, operatorData.id, operator.loginId);
        });

        return serviceDto.getPxrId() ? {
            pxrId: serviceDto.getPxrId()
        } : {
            userId: serviceDto.getUserId()
        };
    }

    /**
     * 利用者管理情報登録用entity作成
     */
    private static createUserInformation (itemGroups: any, targetOperatorId: number, operator: AuthMe): UserInformationEntity[] {
        const result: UserInformationEntity[] = [];
        for (const itemGroup of itemGroups) {
            for (const item of itemGroup.item) {
                const entity = new UserInformationEntity();
                entity.operatorId = targetOperatorId;
                entity.catalogCode = item['type']['_value'];
                entity.catalogVersion = item['type']['_ver'];
                entity.value = item['content'];
                entity.createdBy = operator.loginId;
                entity.updatedBy = operator.loginId;
                result.push(entity);
            }
        }
        return result;
    }
}
