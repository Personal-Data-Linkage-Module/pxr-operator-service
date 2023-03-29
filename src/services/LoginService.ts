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
import { Response } from 'express';
import { Connection } from 'typeorm';
import RoleSettingEntity from '../repositories/postgres/RoleSettingEntity';
import LoginServiceDto from './dto/LoginServiceDto';
/* eslint-enable */
import OperatorRepository from '../repositories/postgres/OperatorRepository';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
import OperatorDomain from '../domains/OperatorDomain';
import AuthMe from '../domains/AuthMe';
import RoleSettingRepository from '../repositories/postgres/RoleSettingRepository';
import { Service } from 'typedi';
import SessionRepository from '../repositories/postgres/SessionRepository';
import OneTimeLoginCodeRepository from '../repositories/postgres/OneTimeLoginCodeRepository';
import OneTimeEntity from '../repositories/postgres/OneTimeLoginCodeEntity';
import { OperatorType } from '../common/OperatorType';
import Catalog from '../common/Catalog';
import PostLoginResDto, { CodeVersion } from '../resources/dto/PostLoginResDto';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { sprintf } from 'sprintf-js';
import Generator from '../common/Generator';
import sendMessage from '../common/Sms_Stub';
import SessionEntity from '../repositories/postgres/SessionEntity';
import Config from '../common/Config';
import LoginHistoryOperation from '../repositories/postgres/LoginHistoryOperation';
import { applicationLogger } from '../common/logging';
import IdService from './IdService_Stub';
import moment = require('moment-timezone');
const Message = Config.ReadConfig('./config/message.json');
const config = Config.ReadConfig('./config/config.json');

@Service()
export default class LoginService {
    // PXRログインコード有効期限
    private readonly INIT_PASSWORD_EXPIRE = 'initialPasswordExpire';
    private readonly MOMENT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

    /**
     * ログイン
     * @param connection
     * @param serviceDto
     * リファクタ履歴
     *  separate : checkPassword
     *  separate : checkUseSmsAuth
     */
    public async login (connection: Connection, serviceDto: LoginServiceDto): Promise<PostLoginResDto> {
        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const operatorEntity: OperatorEntity = new OperatorEntity();

        // 設定ファイル情報を取得
        const configure = serviceDto.getConfigure();

        // 認証情報と一致するレコードを取得
        operatorEntity.type = serviceDto.getType();
        operatorEntity.loginId = serviceDto.getLoginId();
        operatorEntity.hpassword = serviceDto.getHpassword();
        const retAuthInfo = await operatorRepository.getAuthInfo(operatorEntity);
        if (!retAuthInfo) {
            throw new AppError(Message.AUTH_INFO_INVALID, ResponseCode.UNAUTHORIZED);
        }

        // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
        const authMe = new AuthMe();
        authMe.parseToSession(await this.createSession(retAuthInfo, 'loginsession', configure, connection));

        // パスワードに関するチェック処理
        const authInfo = await this.checkPassword(retAuthInfo, serviceDto.getHpassword(), authMe, operatorRepository, connection);

        // SMS認証を使用するか確認
        const useSmsAuth = await this.checkUseSmsAuth(authInfo, configure, authMe);

        if (useSmsAuth) {
            const res: any = await this.oneTimeLoginSetData(connection, authInfo, authMe);
            return res;
        } else {
            // セッションID生成と登録、前回ログイン日時更新、cookie生成
            const res = await this.loginSetData(connection, serviceDto, authInfo);
            return res;
        }
    }

    private async checkPassword (retAuthInfo: OperatorEntity, hpassword: string, authMe: AuthMe, operatorRepository: OperatorRepository, connection: Connection) {
        // パスワード誤りに関する処理
        if (retAuthInfo.lockStartAt && retAuthInfo.lockFlg) {
            const { type, value } = await new Catalog().acquireAccountLockReleaseTime(authMe);
            const releaseTime = moment(retAuthInfo.lockStartAt).add(value, type).toDate();
            if (releaseTime.getTime() >= new Date().getTime()) {
                applicationLogger.error('operatorId: ' + retAuthInfo.id + ' は' + Message.LOCKED_ACCOUNT_LOGIN);
                throw new AppError(Message.AUTH_INFO_INVALID, ResponseCode.UNAUTHORIZED);
            } else {
                await operatorRepository.releaseAccountLock(retAuthInfo);
            }
        }
        if (retAuthInfo.hpassword !== hpassword) {
            await LoginHistoryOperation.insertLoginResult(connection, retAuthInfo.id, retAuthInfo.loginId, false);
            const accountLockCount = await new Catalog().acquireAccountLockCount(authMe);
            const accountLockTime = await new Catalog().acquireAccountLockReleaseTime(authMe);
            if (!retAuthInfo.lockFlg && await LoginHistoryOperation.checkFailedCount(connection, retAuthInfo.id, accountLockCount, accountLockTime)) {
                await operatorRepository.accountLock(retAuthInfo);
                applicationLogger.error('operatorId: ' + retAuthInfo.id + ' は' + Message.LOCK_START);
                throw new AppError(Message.AUTH_INFO_INVALID, ResponseCode.UNAUTHORIZED);
            }
            throw new AppError(Message.AUTH_INFO_INVALID, ResponseCode.UNAUTHORIZED);
        }
        await LoginHistoryOperation.insertLoginResult(connection, retAuthInfo.id, retAuthInfo.loginId, true);

        // パスワード有効期限情報に関する処理
        if (retAuthInfo.passwordChangedFlg) {
            const { type, value } = await new Catalog().acquirePasswordExpiration(authMe);
            const expiration = moment(retAuthInfo.passwordUpdatedAt).add(value, type).toDate();
            if (expiration.getTime() < new Date().getTime()) {
                retAuthInfo = await operatorRepository.enablePasswordResetFlg(retAuthInfo);
            }
        }

        const authInfo: OperatorDomain = new OperatorDomain();
        authInfo.setOperatotId(retAuthInfo.id);
        authInfo.setType(retAuthInfo.type);
        authInfo.setAttributes(retAuthInfo.attributes);
        authInfo.setMobilePhone(retAuthInfo.mobilePhone);
        authInfo.setLoginId(retAuthInfo.loginId);
        authInfo.setCreatedBy(retAuthInfo.loginId);
        authInfo.setUpdatedBy(retAuthInfo.loginId);
        const attributes = authInfo.getAttributes();

        // 個人の場合
        if (authInfo.getType() === OperatorType.TYPE_IND) {
            // 初回パスワードが設定されている場合
            if ((attributes) && (attributes[this.INIT_PASSWORD_EXPIRE])) {
                const now = moment(Date.now()).tz(config['timezone']).format(this.MOMENT_FORMAT);
                const expire = moment(attributes[this.INIT_PASSWORD_EXPIRE]).tz(config['timezone']).format(this.MOMENT_FORMAT);

                // 現在時刻より有効期限の方が小さい場合、有効期限切れでエラーを返す
                if (expire < now) {
                    throw new AppError(Message.INIT_PASSWORD_EXPIRED, ResponseCode.UNAUTHORIZED);
                }
            }
        }
        return authInfo;
    }

    private async checkUseSmsAuth (authInfo: OperatorDomain, configure: {}, authMe: AuthMe) {
        let useMultifactorAuthentication = false;
        // 運営メンバーの場合
        if (authInfo.getType() === OperatorType.TYPE_MANAGE_MEMBER) {
            const catalog: Catalog = new Catalog();
            // アクターカタログを取得する
            const catalogUrl = configure['catalog_url'];

            const blockCatalog = await catalog.getCatalog(authMe, catalogUrl, configure['block']['_value']);
            // アクターがあれば、アクター設定を取得
            const settingNs = 'catalog/ext/' + configure['catalog_ext_name'] +
                '/setting/actor-own/' + blockCatalog['template']['actor-type'] +
                '/actor_' + configure['actor']['_value'];

            // カタログからアクター個別設定を取得
            let settingCatalogs: {}[] = null;
            try {
                settingCatalogs = await catalog.getCatalogByNs(catalogUrl, settingNs, authMe);
            } catch (e) {
                // アクター個別設定が存在しない場合は処理継続、それ以外はエラー
                if (e.statusCode !== ResponseCode.BAD_REQUEST) {
                    throw e;
                }
            }
            // アクター個別設定が存在し、かつ、SMS認証機能がONの場合
            if (settingCatalogs && settingCatalogs[0]['template']['use_multifactor_authentication']) {
                if (!authInfo.getMobilePhone()) {
                    // SMS認証可能な電話番号が登録されていない場合エラー
                    throw new AppError(Message.PHONE_NUMBER_NOT_EXISTS, ResponseCode.UNAUTHORIZED);
                }
                useMultifactorAuthentication = true;
            }
        }
        const attributes = authInfo.getAttributes();
        const useSmsAuth = useMultifactorAuthentication || (attributes && attributes.smsAuth && attributes.smsAuth === true && authInfo.getMobilePhone() != null);
        return useSmsAuth;
    }

    /**
     * ワンタイムログインコード照合
     * @param connection
     * @param serviceDto
     */
    public async oneTimeloginCheck (connection: Connection, serviceDto: LoginServiceDto): Promise<PostLoginResDto> {
        // リポジトリを取得
        const oneTimeRepository: OneTimeLoginCodeRepository = new OneTimeLoginCodeRepository(connection);

        let res: any = null;
        let operatorId: number = 0;
        let loginId: string = '';
        let type: number = 0;

        // ワンタイムログインコードが一致するレコードを取得
        const onetimeLoginCodeData = await oneTimeRepository.isOneTimeLoginCodeExists(serviceDto.getLoginCode(), serviceDto.getLoginId(), serviceDto.getType());
        if (onetimeLoginCodeData) {
            operatorId = onetimeLoginCodeData.id;
            type = onetimeLoginCodeData.type;
            loginId = onetimeLoginCodeData.loginId;
        } else {
            throw new AppError(Message.LOGIN_CODE_INVALID, ResponseCode.BAD_REQUEST);
        }

        await connection.transaction(async trans => {
            // ワンタイムログインコードを無効化
            const entity = new OneTimeEntity();
            const now = new Date();
            entity.code = serviceDto.getLoginCode();
            entity.operatorId = operatorId;
            entity.expireAt = now;
            entity.updatedBy = loginId;
            await oneTimeRepository.deleteOneTimeLoginCode(trans, entity);

            const authInfo: OperatorDomain = new OperatorDomain();
            authInfo.setOperatotId(operatorId);
            authInfo.setLoginId(loginId);
            authInfo.setType(type);

            // セッションID生成と登録、前回ログイン日時更新、cookie生成
            res = await this.loginSetData(connection, serviceDto, authInfo);
        });

        // レスポンスを返す
        return res;
    }

    /**
     * SSOログイン
     * @param connection
     * @param serviceDto
     */
    public async loginSso (connection: Connection, serviceDto: LoginServiceDto): Promise<PostLoginResDto> {
        const idService = new IdService();
        // ID サービスアカウント情報取得
        const clientId: string = await idService.loginSso(serviceDto.getAccessToken());

        // 認証情報と一致するレコードを取得
        const retAuthInfo = await new OperatorRepository(connection).getOperatorByClientId(clientId);
        if (!retAuthInfo) {
            throw new AppError(Message.AUTH_INFO_INVALID, ResponseCode.UNAUTHORIZED);
        }

        await LoginHistoryOperation.insertLoginResult(connection, retAuthInfo.id, retAuthInfo.loginId, true);
        const authInfo: OperatorDomain = new OperatorDomain();
        authInfo.setOperatotId(retAuthInfo.id);
        authInfo.setType(retAuthInfo.type);
        authInfo.setAttributes(retAuthInfo.attributes);
        authInfo.setMobilePhone(retAuthInfo.mobilePhone);
        authInfo.setLoginId(retAuthInfo.loginId);
        authInfo.setCreatedBy(retAuthInfo.loginId);
        authInfo.setUpdatedBy(retAuthInfo.loginId);

        // セッションID生成と登録、前回ログイン日時更新、cookie生成
        const res = await this.loginSetData(connection, serviceDto, authInfo);
        return res;
    }

    /**
     * SSOログイン
     * @param connection
     * @param serviceDto
     */
    public async indLoginSso (connection: Connection, serviceDto: LoginServiceDto): Promise<PostLoginResDto> {
        const idService = new IdService();
        const pxrId = await idService.indloginSso(serviceDto.getAuthorizationCode(), serviceDto.getCodeVerifier());

        // 認証情報と一致するレコードを取得
        const retAuthInfo = await new OperatorRepository(connection).getAuthInfoByPxrId(pxrId);
        if (!retAuthInfo) {
            throw new AppError(Message.AUTH_INFO_INVALID, ResponseCode.UNAUTHORIZED);
        }

        await LoginHistoryOperation.insertLoginResult(connection, retAuthInfo.id, retAuthInfo.loginId, true);
        const authInfo: OperatorDomain = new OperatorDomain();
        authInfo.setOperatotId(retAuthInfo.id);
        authInfo.setType(retAuthInfo.type);
        authInfo.setAttributes(retAuthInfo.attributes);
        authInfo.setMobilePhone(retAuthInfo.mobilePhone);
        authInfo.setLoginId(retAuthInfo.loginId);
        authInfo.setCreatedBy(retAuthInfo.loginId);
        authInfo.setUpdatedBy(retAuthInfo.loginId);

        // セッションID生成と登録、前回ログイン日時更新、cookie生成
        const res = await this.loginSetData(connection, serviceDto, authInfo);
        return res;
    }

    /**
     * セッションID生成と登録、前回ログイン日時更新、cookie生成
     * @param connection
     * @param serviceDto
     * @param authInfo
     */
    private async loginSetData (connection: Connection, serviceDto: LoginServiceDto, authInfo: OperatorDomain): Promise<any> {
        // 設定ファイル情報を取得
        const configure = serviceDto.getConfigure();

        // 各テーブルリポジトリ
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const sessionRepository: SessionRepository = new SessionRepository(connection);
        const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);

        // UUID生成インスタンスを生成
        const generate: Generator = new Generator();

        // セッションIDを生成
        let sessionId: string = null;
        do {
            // セッションIDを生成
            sessionId = generate.sessionId();
            // 存在しないIDであることを確認
            if (await sessionRepository.isSessionIdExists(sessionId)) {
                sessionId = null;
            }
        } while (sessionId == null);

        // レスポンス用にオペレーター情報を取得
        const operator: OperatorEntity = await operatorRepository.getRecordFromId(authInfo.getOperatotId());

        // トランザクション開始
        await connection.transaction(async trans => {
            // 前回ログイン日時を更新
            const operatorEntity: OperatorEntity = new OperatorEntity();
            operatorEntity.lastLoginAt = new Date();
            operatorEntity.updatedBy = authInfo.getLoginId();
            const ret = await operatorRepository.updateLastLogin(trans, authInfo.getOperatotId(), operatorEntity);

            // セッションを登録
            const sessionEntity: SessionEntity = new SessionEntity();
            const authMe = new AuthMe();
            authMe.parseToSession(await this.createSession(ret, 'loginsession', configure, connection));
            const value = config['session']['expiration']['value'];
            const type = config['session']['expiration']['type'];
            const expireAt = moment().add(value, type).toDate();
            sessionEntity.id = sessionId;
            sessionEntity.operatorId = authInfo.getOperatotId();
            sessionEntity.expireAt = expireAt;
            sessionEntity.createdBy = authInfo.getLoginId();
            sessionEntity.updatedBy = authInfo.getLoginId();
            await sessionRepository.insertSession(trans, sessionEntity);

            // 同一のオペレーターの場合、それ以外のセッションIDを無効にする
            await sessionRepository.disableOtherSessions(trans, sessionEntity);
        });

        // レスポンス用にロール設定を取得
        const roles: RoleSettingEntity[] = await roleSettingRepository.getRoleSetting(authInfo.getOperatotId());

        // 権限リストからコード、バージョンを抽出
        const roleList: CodeVersion[] = [];
        for (const element of roles) {
            roleList.push(new CodeVersion(element.roleCatalogCode, element.roleCatalogVersion));
        }

        // レスポンスを生成
        const response = new PostLoginResDto();
        response.setSessionId(sessionId);
        response.setOperatorId(operator.id);
        response.setType(operator.type);
        response.setLoginId(operator.loginId);
        response.setName(operator.name);
        response.setPxrId(operator.pxrId);
        response.setMobilePhone(operator.mobilePhone);
        response.setPasswordChangeFlg(operator.passwordChangedFlg);
        response.setLoginProhibitedFlg(operator.loginProhibitedFlg);
        response.setAuth(operator.type === OperatorType.TYPE_MANAGE_MEMBER ? operator.auth : null);
        response.setLastLoginAt(operator.lastLoginAt);
        response.setAttributes(operator.attributes);
        response.setRoles(roleList.length > 0 ? roleList : null);
        response.setBlock(new CodeVersion(configure['block']['_value'], configure['block']['_ver']));
        response.setActor(new CodeVersion(configure['actor']['_value'], configure['actor']['_ver']));
        response.userInformation = operator.userInformation;

        // cookieを作成
        const cookieName = sprintf(configure['cookie_base_name'], authInfo.getType());
        const expire = parseInt(configure['session_expire']) * 60 * 60 * 1000;
        const resVal = serviceDto.getResponse();
        resVal.cookie(cookieName, sessionId,
            process.env.NODE_ENV === 'production' ? {
                expires: new Date(Date.now() + expire),
                httpOnly: true,
                secure: true
            } : {
                expires: new Date(Date.now() + expire),
                httpOnly: true
            }
        );
        this.deleteOtherTypeCookies(resVal, authInfo.getType());

        // レスポンスを返す
        return response.getAsJson();
    }

    /**
     * ワンタイムログインコード生成と登録、SMS送信
     * @param connection
     * @param serviceDto
     * @param authInfo
     */
    private async oneTimeLoginSetData (connection: Connection, authInfo: OperatorDomain, authMe: AuthMe) {
        // テーブルリポジトリ
        const oneTimeRepository: OneTimeLoginCodeRepository = new OneTimeLoginCodeRepository(connection);

        // code生成インスタンスを生成
        const generate: Generator = new Generator();
        // ワンタイムログインコードを生成
        let loginCode: any = null;
        do {
            // ワンタイムログインコードを生成
            loginCode = generate.loginCode();
            // 存在しないIDであることを確認
            const count = await oneTimeRepository.getOneTimeLoginCodeCount(loginCode);
            if (count > 0) {
                loginCode = null;
            }
        } while (loginCode == null);

        // PXR設定を取得する
        const { value, type, template } = await new Catalog().acquireOneTimeLoginSetting(authMe);

        // ワンタイムログインコードを登録
        const entity: OneTimeEntity = new OneTimeEntity();
        entity.code = loginCode;
        entity.operatorId = authInfo.getOperatotId();
        entity.createdBy = authInfo.getLoginId();
        entity.updatedBy = authInfo.getLoginId();
        entity.expireAt = moment.utc().add(value, type).toDate();

        // SMS送信
        let mobilePhone = authInfo.mobilePhone;
        if (mobilePhone.slice(0, 1) === '0') {
            const countryCode = config['sms']['country-code'];
            mobilePhone = countryCode + mobilePhone.substring(1, mobilePhone.length);
        }
        await sendMessage(sprintf(template, entity.code), mobilePhone);

        // エンティティ登録
        await connection.transaction(async trans => {
            await oneTimeRepository.insertOneTimeLoginCode(trans, entity);
        });

        // 2段階認証設定を取得
        const twoStepFlag = await new Catalog().acquireTwoStepSetting(authMe);

        // レスポンスを返す
        return {
            result: 'onetime',
            twoStepVerificationFlag: twoStepFlag
        };
    }

    /**
     * カタログ取得用のセッション情報を作成する
     * @param operatorData
     * @param sessionId
     */
    private async createSession (operatorData: OperatorEntity, sessionId: string, configure: any, connection: Connection): Promise<any> {
        const roleList: CodeVersion[] = [];
        if (operatorData.type === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }
        if (operatorData.type === OperatorType.TYPE_APP) {
            const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);
            // レスポンス用にロール設定を取得
            const roles: RoleSettingEntity[] = await roleSettingRepository.getRoleSetting(operatorData.id);

            // 権限リストからコード、バージョンを抽出
            for (const element of roles) {
                roleList.push(new CodeVersion(element.roleCatalogCode, element.roleCatalogVersion));
            }
        }
        const session: any = {
            sessionId: sessionId,
            operatorId: operatorData.id,
            type: operatorData.type,
            loginId: operatorData.loginId,
            name: operatorData.name,
            auth: operatorData.auth,
            lastLoginAt: operatorData.lastLoginAt ? moment(operatorData.lastLoginAt).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ss.SSSZZ') : null,
            passwordChangedFlg: operatorData.passwordChangedFlg,
            attributes: operatorData.attributes,
            roles: roleList,
            block: {
                _value: configure['block']['_value'],
                _ver: configure['block']['_ver']
            },
            actor: {
                _value: configure['actor']['_value'],
                _ver: configure['actor']['_ver']
            }
        };
        return session;
    }

    /**
     * ログインしたType以外のCookieを削除
     * @param resVal
     * @param type
     */
    private deleteOtherTypeCookies (resVal: Response, type: number) {
        if (type !== OperatorType.TYPE_IND) {
            const cookieName = sprintf(config['cookie_base_name'], OperatorType.TYPE_IND);
            resVal.cookie(cookieName, '', { maxAge: 0, httpOnly: true });
        }
        if (type !== OperatorType.TYPE_APP) {
            const cookieName = sprintf(config['cookie_base_name'], OperatorType.TYPE_APP);
            resVal.cookie(cookieName, '', { maxAge: 0, httpOnly: true });
        }
        if (type !== OperatorType.TYPE_MANAGE_MEMBER) {
            const cookieName = sprintf(config['cookie_base_name'], OperatorType.TYPE_MANAGE_MEMBER);
            resVal.cookie(cookieName, '', { maxAge: 0, httpOnly: true });
        }
    }
}
