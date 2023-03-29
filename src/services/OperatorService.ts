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
import { Connection, getConnection } from 'typeorm';
import { Request, Response } from 'express';
import OperatorServiceDto from './dto/OperatorServiceDto';
import OperatorRepository from '../repositories/postgres/OperatorRepository';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
import AuthMe from '../domains/AuthMe';
import RoleSettingRepository from '../repositories/postgres/RoleSettingRepository';
import RoleSettingEntity from '../repositories/postgres/RoleSettingEntity';
import SessionRepository from '../repositories/postgres/SessionRepository';
import SessionEntity from '../repositories/postgres/SessionEntity';
import { Service } from 'typedi';
import GetOperatorResDto from '../resources/dto/GetByOperatorIdResDto';
import PostOperatorResDto from '../resources/dto/PostOperatorAddResDto';
import PutOperatorResDto from '../resources/dto/PutByOperatorIdResDto';
import { OperatorType } from '../common/OperatorType';
import CheckOperatorAuth from '../common/CheckOperatorAuth';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { sprintf } from 'sprintf-js';
import Catalog from '../common/Catalog';
import Config from '../common/Config';
import PasswordHistoryOperation from '../repositories/postgres/PasswordHistoryOperation';
import OperatorDomain from '../domains/OperatorDomain';
import IdService from './IdService_Stub';
import { isEmpty } from 'class-validator';
import { v4 as uuid } from 'uuid';
import moment = require('moment-timezone');
/* eslint-enable */
import crypto = require('crypto');
const Message = Config.ReadConfig('./config/message.json');
const config = Config.ReadConfig('./config/config.json');

@Service()
export default class OperatorService {
    /**
     * セッションデータを取得する
     * @param req
     */
    public static async getSession (req: Request) {
        const authMe = new AuthMe();
        const sessionId = req.cookies.operator_type0_session
            ? req.cookies.operator_type0_session : req.cookies.operator_type2_session
                ? req.cookies.operator_type2_session : req.cookies.operator_type3_session
                    ? req.cookies.operator_type3_session : null;
        if (req.headers.session) {
            let session: any = decodeURIComponent(req.headers.session + '');
            while (typeof session === 'string') {
                session = JSON.parse(session);
            }
            authMe.parseToSession(session);
            return authMe;
        } else if (sessionId) {
            const connection = getConnection('postgres');
            const sessionEntity = await connection.getRepository(SessionEntity).createQueryBuilder()
                .andWhere('is_disabled = false')
                .andWhere('id = :id', { id: sessionId })
                .getOne();
            let operatorEntity;
            if (sessionEntity) {
                // セッション有効期限チェック
                const expireAt = new Date(sessionEntity.expireAt).getTime();
                const now = new Date().getTime();
                if (expireAt < now) {
                    throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
                }
                operatorEntity = await new OperatorRepository(connection).getRecordFromId(sessionEntity.operatorId);
            }
            if (operatorEntity) {
                authMe.parseToSession(await new OperatorService().createSession(operatorEntity, sessionId, config));
                return authMe;
            }
        }
        throw new AppError(Message.UNAUTHORIZED, ResponseCode.UNAUTHORIZED);
    }

    /**
     * 取得（オペレーターID,type,loginId指定）
     * @param connection
     * @param serviceDto
     * リファクタ履歴
     *  separate : getOperatorData
     *  separate : createOperatorResponse
     */
    public async getOperator (connection: Connection, serviceDto: OperatorServiceDto): Promise<any> {
        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);
        let roleSettingDataList: Array<RoleSettingEntity> = [];

        const type = serviceDto.getType();
        const loginId = serviceDto.getLoginId();
        const pxrId = serviceDto.getPxrId();
        // operatorテーブルを検索する
        var { operatorData, operatorDataList }: { operatorData: OperatorEntity, operatorDataList: Array<OperatorEntity> } =
            await this.getOperatorData(serviceDto, operatorRepository);

        // ロールデータの取得
        // typeのみの場合
        if (type >= 0 && !loginId && !pxrId) {
            const operatorIdList: number[] = [];
            for (let i = 0; i < operatorDataList.length; i++) {
                operatorIdList.push(operatorDataList[i].id);
            }
            roleSettingDataList = await roleSettingRepository.getRecordFromIds(operatorIdList);

            // レスポンスを生成
            const responseList: any[] = [];
            for (const entity of operatorDataList) {
                const res = this.createOperatorResponse(entity, roleSettingDataList);
                responseList.push(res);
            }
            return responseList;
        } else {
            roleSettingDataList = await roleSettingRepository.getRoleSetting(operatorData.id);

            // レスポンスを生成
            const res = this.createOperatorResponse(operatorData, roleSettingDataList);
            return res;
        }
    }

    private createOperatorResponse (operatorData: OperatorEntity, roleSettingDataList: RoleSettingEntity[]) {
        const response = new GetOperatorResDto();
        response.operatorId = operatorData.id;
        response.type = operatorData.type;
        response.loginId = operatorData.loginId;
        response.pxrId = operatorData.pxrId;
        response.name = operatorData.name;
        response.mobilePhone = operatorData.mobilePhone;
        response.auth = operatorData.auth;
        response.lastLoginAt = operatorData.lastLoginAt;
        response.passwordChangedFlg = operatorData.passwordChangedFlg;
        response.loginProhibitedFlg = operatorData.loginProhibitedFlg;
        response.attributes = operatorData.attributes;
        response.roles = [];
        for (const roleSetting of roleSettingDataList) {
            if (roleSetting.operatorId === operatorData.id) {
                const role: any = {};
                role._value = roleSetting.roleCatalogCode;
                role._ver = roleSetting.roleCatalogVersion;
                response.roles.push(role);
            }
        }
        return response.getAsJson(response.type);
    }

    private async getOperatorData (serviceDto: OperatorServiceDto, operatorRepository: OperatorRepository) {
        const operatorId = serviceDto.getOperatorId();
        const loginId = serviceDto.getLoginId();
        const type = serviceDto.getType();
        const pxrId = serviceDto.getPxrId();
        const session = serviceDto.getSession();
        let operatorData: OperatorEntity = null;
        let operatorDataList: Array<OperatorEntity> = [];
        if ((operatorId) && (operatorId > 0)) {
            // 自分以外への操作の場合
            if (session['operatorId'] !== Number(operatorId)) {
                // 運営メンバー以外の場合エラー
                if (session['type'] !== OperatorType.TYPE_MANAGE_MEMBER) {
                    // エラーレスポンス
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }

            operatorData = await operatorRepository.getRecordFromId(operatorId);
        } else if ((type >= 0) && (loginId)) {
            // typeとloginIdがある場合
            // 自分以外への操作の場合
            if (session['loginId'] !== String(loginId)) {
                // 運営メンバー以外の場合エラー
                if (session['type'] !== OperatorType.TYPE_MANAGE_MEMBER) {
                    // エラーレスポンス
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }

            operatorData = await operatorRepository.getRecordFromLoginId(type, loginId);
        } else if (pxrId) {
            // pxrIdがある場合
            // 自分以外への操作の場合
            if (session['pxrId'] !== String(pxrId)) {
                // 運営メンバー以外の場合エラー
                if (session['type'] !== OperatorType.TYPE_MANAGE_MEMBER) {
                    // エラーレスポンス
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }

            operatorData = await operatorRepository.getRecordFromPxrId(pxrId);
        } else {
            // typeのみの場合
            // 運営メンバー以外の場合エラー
            if (session['type'] !== OperatorType.TYPE_MANAGE_MEMBER) {
                // エラーレスポンス
                throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
            }

            operatorDataList = await operatorRepository.getRecordFromType(type);
        }

        if (!operatorData && operatorDataList.length <= 0) {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.NO_CONTENT);
        }
        return { operatorData, operatorDataList };
    }

    /**
     * オペレーター追加
     * @param connection
     * @param serviceDto
     * リファクタ履歴
     *  separate : getSessionInfoForAdd
     *  separate : checkRoles（アクター別処理）
     *  separate : registerClient（特定技術のため）
     */
    public async postOpetatorAdd (connection: Connection, serviceDto: OperatorServiceDto): Promise<any> {
        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const sessionRepository: SessionRepository = new SessionRepository(connection);
        const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);

        // 運営メンバーの存在確認
        let existsFlg: boolean = true;
        const operatorDataCount: number = await operatorRepository.getRecordCountFromType(OperatorType.TYPE_MANAGE_MEMBER);
        if (operatorDataCount <= 0) {
            existsFlg = false;
        }

        const reqLoginId = serviceDto.getLoginId();
        const reqHpassword = serviceDto.getHpassword();
        const reqLoginProhibitedFlg = serviceDto.getLoginProhibitedFlg();
        const req = serviceDto.getRequest();
        const configure = serviceDto.getConfigure();
        const body = req.body;
        const authMe = new AuthMe();

        // type、authを取得
        const type = serviceDto.getType() ? serviceDto.getType() : 0;
        const auth = serviceDto.getAuth() ? serviceDto.getAuth() : null;

        let registerName: string | undefined;
        registerName = await this.getSessionInfoForAdd(existsFlg, serviceDto, authMe, sessionRepository, operatorRepository);
        let uniqueCheckLoginId = '';

        // ログイン不可個人の場合
        if (type === OperatorType.TYPE_IND &&
            reqLoginProhibitedFlg === true
        ) {
            // 利用者IDとログインIDの重複チェック
            await this.checkDuplicateUser(operatorRepository, body.userId, reqLoginId, body.appCatalogCode, body.regionCatalogCode);
            // unique_check_login_id列の値生成
            uniqueCheckLoginId = ([reqLoginId, type, body.appCatalogCode, body.regionCatalogCode, reqLoginProhibitedFlg].join(''));
        } else {
            // ログインIDの存在確認
            const operatorCountData = await operatorRepository.getRecordCountFromLoginId(type, reqLoginId);
            if (operatorCountData > 0) {
                throw new AppError(Message.LOGIN_ID_ALREADY, ResponseCode.BAD_REQUEST);
            }
            // unique_check_login_id列の値生成
            uniqueCheckLoginId = ([reqLoginId, type].join(''));
        }

        // カタログ確認
        const reqRoles = body.roles ? body.roles : null;
        const catalog: Catalog = new Catalog();
        const catalogUrl = configure['catalog_url'];
        let appCatalog = null;
        const appCodes = [];
        // ロールが正しいか確認する
        appCatalog = await this.checkRoles(type, reqRoles, catalog, authMe, catalogUrl, appCodes, appCatalog);

        // 運営メンバーの場合、カタログを取得して権限が設定できるものか確認する
        if (type === OperatorType.TYPE_MANAGE_MEMBER && auth) {
            await this.inquireAuthSettings(auth, configure, authMe);
        }

        if (registerName.length === 0) {
            registerName = 'pxr_user';
        }

        // アプリケーションの場合、
        // グローバル設定カタログを取得してIDサービス利用設定がONであればIDサービスにクライアント作成を呼び出す
        let clientId = null;
        let clientSecret = null;
        const actorCode = configure['actor']['_value'];
        ({ clientId, clientSecret } = await this.registerClient(type, catalog, authMe, clientId, reqLoginId, clientSecret, appCatalog, appCodes, actorCode));
        // トランザクションの開始
        // operatorにレコードを追加
        const resRoles: any[] = [];
        let operatorId: number = 0;
        const name = body.name ? body.name : null;
        const attributes = body.attributes ? body.attributes : {};
        const pxrId = body.pxrId ? body.pxrId : null;
        const mobilePhone = body.mobilePhone ? body.mobilePhone : null;
        await connection.transaction(async trans => {
            const opEntity = new OperatorEntity();
            opEntity.type = type;
            opEntity.loginId = reqLoginId;
            opEntity.hpassword = reqLoginProhibitedFlg === true ? null : reqHpassword;
            opEntity.pxrId = pxrId;
            opEntity.name = name;
            opEntity.mobilePhone = mobilePhone;
            opEntity.auth = auth ? JSON.stringify(auth) : null;
            opEntity.attributes = JSON.stringify(attributes);
            opEntity.loginProhibitedFlg = reqLoginProhibitedFlg;
            opEntity.userId = body.userId ? body.userId : null;
            opEntity.userInformation = JSON.stringify({});
            opEntity.regionCatalogCode = body.regionCatalogCode ? body.regionCatalogCode : null;
            opEntity.appCatalogCode = body.appCatalogCode ? body.appCatalogCode : null;
            opEntity.wfCatalogCode = null;
            opEntity.clientId = clientId;
            opEntity.createdBy = registerName;
            opEntity.updatedBy = registerName;
            opEntity.uniqueCheckLoginId = uniqueCheckLoginId;

            const insertRetData = await operatorRepository.insertOperator(trans, opEntity);

            operatorId = parseInt(insertRetData.raw[0].id);
            // rolesが存在する場合
            if (reqRoles) {
                for (let index = 0; index < reqRoles.length; index++) {
                    // ロールを登録
                    const roleEntity = new RoleSettingEntity();
                    roleEntity.operatorId = operatorId;
                    roleEntity.roleCatalogCode = reqRoles[index]['_value'];
                    roleEntity.roleCatalogVersion = reqRoles[index]['_ver'];
                    roleEntity.createdBy = registerName;
                    roleEntity.updatedBy = registerName;
                    await roleSettingRepository.insertRoleSetting(trans, roleEntity);

                    // レスポンス用データを作成
                    const role = {
                        _value: parseInt(reqRoles[index]['_value']),
                        _ver: parseInt(reqRoles[index]['_ver'])
                    };
                    resRoles.push(role);
                }
            }
        });

        // レスポンスを生成
        const response = new PostOperatorResDto();
        response.id = operatorId;
        response.type = type;
        response.loginId = reqLoginId;
        response.pxrId = pxrId;
        response.name = name;
        response.mobilePhone = mobilePhone;
        response.auth = auth;
        response.loginProhibitedFlg = reqLoginProhibitedFlg;
        response.attributes = attributes;
        response.roles = resRoles;
        response.userId = body.userId ? body.userId : null;
        response.regionCatalogCode = body.regionCatalogCode ? body.regionCatalogCode : null;
        response.appCatalogCode = body.appCatalogCode ? body.appCatalogCode : null;
        response.wfCatalogCode = null;
        if (clientId && clientSecret) {
            response.clientId = clientId;
            response.clientSecret = clientSecret;
        }
        return response.getAsJson(type);
    }

    private async getSessionInfoForAdd (existsFlg: boolean, serviceDto: OperatorServiceDto, authMe: AuthMe, sessionRepository: SessionRepository, operatorRepository: OperatorRepository) {
        const reqLoginId = serviceDto.getLoginId();
        const req = serviceDto.getRequest();
        const configure = serviceDto.getConfigure();
        const body = req.body;
        let registerName: string = '';
        // type、authを取得
        const type = serviceDto.getType() ? serviceDto.getType() : 0;
        const auth = serviceDto.getAuth() ? serviceDto.getAuth() : null;
        // 運営メンバーが1人以上存在している場合
        if (existsFlg) {
            // ヘッダーにセッション情報がある場合
            if (req.headers.session) {
                // JSON化
                let session: any = decodeURIComponent(req.headers.session + '');
                while (typeof session === 'string') {
                    session = JSON.parse(session);
                }

                // 運営メンバー以外の場合エラー
                if (parseInt(session['type']) !== OperatorType.TYPE_MANAGE_MEMBER) {
                    // 例外をthrow
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
                // 追加権限が無い場合エラー
                if (!CheckOperatorAuth.checkAuth(session['auth'], true, null, null)) {
                    // 例外をthrow
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
                // 登録者名をセット
                registerName = session['loginId'];

                // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
                authMe.parseToSession(session, session.encoded);
            } else {
                // 運営メンバーでログインしているか確認
                const menberCookie: string = sprintf(configure['cookie_base_name'], OperatorType.TYPE_MANAGE_MEMBER);
                const memberSessionId: string = req.cookies[menberCookie];
                let memberOperatorId: number = 0;
                const sessionData = await sessionRepository.getRecordFromId(memberSessionId);
                // 運営メンバーでログインしていない場合エラー
                if (!sessionData) {
                    throw new AppError(Message.NO_SESSION, ResponseCode.UNAUTHORIZED);
                }
                // セッション有効期限チェック
                const expireAt = new Date(sessionData.expireAt).getTime();
                const now = new Date().getTime();
                if (expireAt < now) {
                    throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
                }
                memberOperatorId = sessionData.operatorId;

                // 登録実行オペレーターを取得
                const operatorData = await operatorRepository.getRecordFromId(memberOperatorId);
                if (!operatorData) {
                    throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.UNAUTHORIZED);
                }
                // 追加権限が無い場合エラー
                if (!CheckOperatorAuth.checkAuth(operatorData.auth, true, null, null)) {
                    // 例外をthrow
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
                registerName = operatorData.loginId;

                // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
                authMe.parseToSession(await this.createSession(operatorData, memberSessionId, configure));
            }
            // 運営メンバーが1人も存在しない場合
        } else {
            // 運営メンバー以外および全権限持ちではない運営メンバーの追加不可
            if (type !== OperatorType.TYPE_MANAGE_MEMBER) {
                throw new AppError(Message.MEMBER_NOT_EXISTS, ResponseCode.UNAUTHORIZED);
            } else if (type === OperatorType.TYPE_MANAGE_MEMBER && !CheckOperatorAuth.checkAuth(auth, true, true, true)) {
                throw new AppError(Message.NOT_ALL_AUTH, ResponseCode.UNAUTHORIZED);
            }

            // チェックをクリアしたら作成予定ユーザでカタログ取得用のセッション情報を作成
            const dummyOperatorId: number = 0;
            const dummySession: any = {
                sessionId: 'operatorServiceSession',
                operatorId: dummyOperatorId,
                type: AuthMe.TYPE_MANAGER_NUMBER,
                loginId: reqLoginId,
                name: body.name,
                auth: JSON.stringify(auth),
                block: {
                    _value: configure['block']['_value'],
                    _ver: configure['block']['_ver']
                }
            };
            if (configure['actor'] && configure['actor']['_value']) {
                dummySession.actor = {
                    _value: configure['actor']['_value'],
                    _ver: configure['actor']['_ver']
                };
            }

            authMe.parseToSession(dummySession);
        }
        return registerName;
    }

    private async checkRoles (type: number, reqRoles: any, catalog: Catalog, authMe: AuthMe, catalogUrl: any, appCodes: any[], appCatalog: any) {
        if (type === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        } else if (type === OperatorType.TYPE_APP && reqRoles) {
            for (const reqRole of reqRoles) {
                // カタログを取得する
                const catalogCode = parseInt(reqRole['_value']);
                const catalogVersion = parseInt(reqRole['_ver']);
                const catalogInfo = await catalog.getCatalog(authMe, catalogUrl, catalogCode, catalogVersion);
                // アプリケーションかどうか確認する
                const regex = new RegExp('/app/.+/application', 'g');
                if (!catalogInfo['catalogItem']['ns'].match(regex)) {
                    throw new AppError(Message.NOT_ROLE_CATALOG, ResponseCode.BAD_REQUEST);
                }
                // アプリケーションカタログを保持
                appCatalog = catalogInfo;
                if (appCodes !== null) {
                    appCodes.push(catalogCode);
                }
            }
        }
        return appCatalog;
    }

    private async registerClient (type: number, catalog: Catalog, authMe: AuthMe, clientId: any, reqLoginId: string, clientSecret: any, appCatalog: any, appCodes: any[], actorCode: any) {
        if (type === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }
        if (type === OperatorType.TYPE_APP) {
            const getUseIdService = await catalog.getUseIdService(authMe);
            if (getUseIdService) {
                clientId = reqLoginId;
                clientSecret = crypto.createHash('sha256').update(uuid(), 'utf8').digest('hex');
                // アプリケーションカタログからリダイレクトURLを取得
                const redirecturis = appCatalog['template']['redirect_url'];
                const idService = new IdService();
                await idService.addClient(clientId, clientSecret, redirecturis, actorCode, appCodes);
            }
        }
        return { clientId, clientSecret };
    }

    /**
     * オペレーター更新
     * @param connection
     * @param serviceDto
     * リファクタ履歴
     *  separate : getSessionInfoForUpdate
     *  separate : checkLoginId
     *  separate : checkLoginProhibitedFlg
     *  separate : checkAuth
     *  separate : updatePassword
     *  separate : updateRoles
     *  separate : checkRoles（アクター別処理）
     *  separate : updateClient（特定技術のため）
     */
    public async putOpetator (connection: Connection, serviceDto: OperatorServiceDto): Promise<any> {
        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);
        const sessionRepository: SessionRepository = new SessionRepository(connection);

        const reqOperatorId = parseInt(serviceDto.getOperatorId() + '');
        const reqLoginId = serviceDto.getLoginId();
        const reqAuth = serviceDto.getAuth();
        const reqAttrs = serviceDto.getAttributes();
        const reqLoginProhibitedFlg = serviceDto.getLoginProhibitedFlg();
        const configure = serviceDto.getConfigure();
        const authMe = new AuthMe();

        // 更新対象のオペレーターを取得
        const target: OperatorEntity = await operatorRepository.getRecordFromId(reqOperatorId);
        if (!target) {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.BAD_REQUEST);
        }
        // 未サポートのオペレータ種別をガード
        if (target['type'] === OperatorType.TYPE_WF) {
            throw new AppError(Message.UNSUPPORTED_OPERATOR, ResponseCode.BAD_REQUEST);
        }

        // ヘッダーにセッション情報がある場合
        var { register, updaterType, updaterAuth } : { register: string, updaterType: number, updaterAuth: any } =
            await this.getSessionInfoForUpdate(serviceDto, authMe, sessionRepository, operatorRepository);

        let loginId: string | null = null;
        let mobilePhone: string | null = null;
        let name: string | null = null;
        let auth: any = null;
        let attributes: any = null;
        let pChangedFlg: boolean = false;
        let loginProhibitedFlg: boolean = false;
        const resRoles: any[] = [];
        // トランザクションの開始
        await connection.transaction(async trans => {
            // loginId（type+loginIdで一意である事）
            const newLoginId = await this.checkLoginId(reqLoginId, target, operatorRepository);

            let newLPFlg: boolean | null = null;
            // loginProhibitedFlg
            ({ newLPFlg, pChangedFlg } = this.checkLoginProhibitedFlg(reqLoginProhibitedFlg, target, serviceDto));

            // name（type=0じゃなければそのまま上書き）
            let newName: string | null = null;
            if (serviceDto.getName()) {
                if (target.type === OperatorType.TYPE_IND) {
                    // エラーレスポンスを返す
                    throw new AppError(Message.REQUEST_PARAMETER_INVALID, ResponseCode.BAD_REQUEST);
                }
                newName = serviceDto.getName();
            }

            // mobilePhone（そのまま上書き）
            let newMobilePhone: string | null = null;
            if (serviceDto.getMobilePhone()) {
                newMobilePhone = serviceDto.getMobilePhone();
            }

            // auth（値がtrueかfalseでかつ全権設定ではない場合、他に全権設定メンバーが存在すること）
            const newAuth = await this.checkAuth(reqAuth, target, updaterType, updaterAuth, configure, authMe, operatorRepository);

            // attributes（そのまま上書き。但し、type=1の場合は_codeが必須）
            let newAttributes: string | null = null;
            if (reqAttrs) {
                newAttributes = reqAttrs;
            }

            loginId = !isEmpty(newLoginId) ? newLoginId : target.loginId;
            name = !isEmpty(newName) ? newName : target.name;
            mobilePhone = !isEmpty(newMobilePhone) ? newMobilePhone : target.mobilePhone;
            auth = !isEmpty(newAuth) ? newAuth : target.auth;
            attributes = !isEmpty(newAttributes) ? newAttributes : target.attributes;

            if (newLPFlg === true) {
                loginProhibitedFlg = true;
            } else if (newLPFlg === false) {
                loginProhibitedFlg = false;
            } else {
                loginProhibitedFlg = target.loginProhibitedFlg;
            }

            // pChangedFlgがあり、initialPasswordExpireがある場合削除
            if (pChangedFlg && attributes && attributes['initialPasswordExpire']) {
                delete attributes['initialPasswordExpire'];
            }

            // ログイン不可フラグがtrueの場合はhpasswordをクリアする
            if (loginProhibitedFlg === true) {
                serviceDto.setNewHpassword(null);
                serviceDto.setHpassword(null);
            }

            // カタログ確認
            const catalog: Catalog = new Catalog();
            const reqRoles = serviceDto.getRoles() ? serviceDto.getRoles() : null;
            const catalogUrl = configure['catalog_url'];
            const appCodes = [];
            let appCatalog = null;
            // ロールが正しいか確認する
            appCatalog = await this.checkRoles(target['type'], reqRoles, catalog, authMe, catalogUrl, appCodes, appCatalog);

            // loginIdが変更された場合、unique_check_login_id列の値生成
            let uniqueCheckLoginId = target.uniqueCheckLoginId;
            if (!isEmpty(newLoginId)) {
                // ログイン不可個人の場合
                if (target['type'] === OperatorType.TYPE_IND && loginProhibitedFlg === true) {
                    uniqueCheckLoginId = ([newLoginId, target['type'], target.appCatalogCode, target.regionCatalogCode, loginProhibitedFlg].join(''));
                } else {
                    uniqueCheckLoginId = ([newLoginId, target['type']].join(''));
                }
            }

            // オペレーターの更新を実行
            const operatorDomain = new OperatorDomain();
            operatorDomain.setOperatotId(target['id']);
            operatorDomain.setLoginId(loginId);
            operatorDomain.setName(name);
            operatorDomain.setMobilePhone(mobilePhone);
            operatorDomain.setAuth(auth);
            operatorDomain.setPasswordChangedFlg(pChangedFlg);
            operatorDomain.loginProhibitedFlg = loginProhibitedFlg;
            operatorDomain.setAttributes(attributes);
            operatorDomain.setUpdatedBy(register);
            operatorDomain.setUniqueCheckLoginId(uniqueCheckLoginId);
            await operatorRepository.updateOperator(trans, operatorDomain);

            // 更新対象のオペレーターのパスワード（現在）と更新内容のパスワードが異なる場合
            if (serviceDto.getNewHpassword() && target.hpassword !== serviceDto.getNewHpassword()) {
                await this.updatePassword(authMe, trans, target, serviceDto, operatorDomain, operatorRepository);
            }

            // roles（今のroleを全て無効にして、新たに全て登録）
            if (reqRoles) {
                await this.updateRoles(roleSettingRepository, trans, target, register, reqRoles, resRoles);
            }

            // アプリケーションの場合、
            // グローバル設定カタログを取得してIDサービス利用設定がONであればIDサービスにクライアント更新を呼び出す
            await this.updateClient(target, catalog, authMe, appCatalog, appCodes);
        });

        // レスポンスを生成
        const response = new PutOperatorResDto();
        response.operatorId = target['id'];
        response.type = target['type'];
        response.loginId = loginId;
        response.name = name;
        response.pxrId = target.pxrId;
        response.mobilePhone = mobilePhone;
        response.auth = auth;
        response.pcFlg = pChangedFlg;
        response.lpFlg = loginProhibitedFlg;
        response.attributes = attributes;
        response.roles = resRoles;
        const resData = response.getAsJson(target['type']);
        return resData;
    }

    private async updatePassword (authMe: AuthMe, trans, target: OperatorEntity, serviceDto: OperatorServiceDto, operatorDomain: OperatorDomain, operatorRepository: OperatorRepository) {
        // 世代分の確認を行い、パスワード一致によるセキュリティ低下を防ぐ
        const gen = await new Catalog().acquirePasswordGen(authMe);
        await PasswordHistoryOperation.passwordAlreadyUsing(trans, target, serviceDto.getNewHpassword(), gen);

        // パスワード更新
        if (target.hpassword) {
            await PasswordHistoryOperation.recordPasswordHistorical(
                trans,
                target.id,
                operatorDomain.getLoginId(),
                target.hpassword
            );
        }
        const entity = new OperatorEntity();
        entity.hpassword = serviceDto.getNewHpassword();
        entity.passwordChangedFlg = true;
        entity.updatedBy = target.loginId;
        await operatorRepository.updateHpassword(trans, target.id, entity);
    }

    private async updateRoles (roleSettingRepository: RoleSettingRepository, trans, target: OperatorEntity, register: string, reqRoles: any, resRoles: any[]) {
        // ロールを無効化
        await roleSettingRepository.deleteRoleSetting(trans, target['id'], register);

        // ロールを登録
        // const reqRoles = operatorServiceDto['roles'];
        for (let index = 0; index < reqRoles.length; index++) {
            // role_settingにレコードを追加
            const roleEntity = new RoleSettingEntity();
            roleEntity.operatorId = target['id'];
            roleEntity.roleCatalogCode = reqRoles[index]['_value'];
            roleEntity.roleCatalogVersion = reqRoles[index]['_ver'];
            roleEntity.createdBy = register;
            roleEntity.updatedBy = register;
            await roleSettingRepository.insertRoleSetting(trans, roleEntity);

            // レスポンス用データを作成
            const role = {
                _value: parseInt(reqRoles[index]['_value']),
                _ver: parseInt(reqRoles[index]['_ver'])
            };
            resRoles.push(role);
        }
    }

    private checkLoginProhibitedFlg (reqLoginProhibitedFlg: boolean, target: OperatorEntity, serviceDto: OperatorServiceDto) {
        let newLPFlg: boolean | null = null;
        let pChangedFlg: boolean = false;
        // ログイン不可フラグを更新する場合
        if (reqLoginProhibitedFlg !== null) {
            // 個人以外ならエラー
            if (!(target.type === OperatorType.TYPE_IND)) {
                throw new AppError(Message.IND_ONLY, ResponseCode.BAD_REQUEST);
            }
            if (reqLoginProhibitedFlg === false) {
                if (!(serviceDto.getNewHpassword() || target.hpassword)) {
                    throw new AppError(Message.REQUIRED_PASSWORD_FOR_LOGIN_ALLOWED, ResponseCode.BAD_REQUEST);
                }
            }

            newLPFlg = reqLoginProhibitedFlg;
        } else {
            // フラグの更新なし
            newLPFlg = null;

            // もともとtrueの更新対象者に対してパスワードを設定しようとしている場合エラー
            if (target.loginProhibitedFlg === true &&
                serviceDto.getNewHpassword()) {
                throw new AppError(Message.PASSWORD_CANT_SET, ResponseCode.BAD_REQUEST);
            }

            // フラグ変更なし＋現在falseに設定されている場合、パスワード変更を許可
            // hpassword（今のパスワードが一致する事）
            if (serviceDto.getNewHpassword()) {
                if (serviceDto.getHpassword() !== target.hpassword) {
                    // エラーレスポンスを返す
                    throw new AppError(Message.NOW_PASSWORD_INVALID, ResponseCode.BAD_REQUEST);
                }
                // newHpasswordが有効ならパスワード変更フラグをtrueに更新
                pChangedFlg = true;
            } else {
                // パスワードの変更は無いけど、もともとパスワード変更フラグが
                // trueの場合はtrueをセット
                if (target.passwordChangedFlg === true) {
                    pChangedFlg = true;
                }
            }
        }
        return { newLPFlg, pChangedFlg };
    }

    private async checkAuth (reqAuth: any, target: OperatorEntity, updaterType: number, updaterAuth: any, configure: any, authMe: AuthMe, operatorRepository: OperatorRepository) {
        let newAuth: string | null = null;
        // 更新対象が運営メンバー以外の場合でauthが存在する場合
        if (reqAuth &&
            target.type !== OperatorType.TYPE_MANAGE_MEMBER) {
            // エラーレスポンスを返す
            throw new AppError(Message.REQUEST_PARAMETER_INVALID, ResponseCode.BAD_REQUEST);
        }

        // authが存在し、更新実行者が運営メンバーだけど、更新権限が無い場合
        if (reqAuth &&
            updaterType === OperatorType.TYPE_MANAGE_MEMBER &&
            !CheckOperatorAuth.checkAuth(updaterAuth, null, true, null)) {
            // エラーレスポンスを返す
            throw new AppError(Message.AUTH_CANT_UPDATED, ResponseCode.UNAUTHORIZED);
        }

        // 運営メンバーの場合
        if (target.type === OperatorType.TYPE_MANAGE_MEMBER) {
            // authが存在して、nullではない場合
            if (reqAuth && reqAuth != null) {
                // 設定するauthが存在するか確認
                await this.inquireAuthSettings(reqAuth, configure, authMe);
            }
            // authが存在して、全権設定ではない場合
            if (reqAuth && (
                CheckOperatorAuth.checkAuth(reqAuth, false, null, null) ||
                CheckOperatorAuth.checkAuth(reqAuth, null, false, null) ||
                CheckOperatorAuth.checkAuth(reqAuth, null, null, false)
            )) {
                // 更新対象以外の全権持ち運営メンバーの存在確認
                const operatorCountData = await operatorRepository.isAllAuthMemberExistsOtherThisId(target.id);
                if (operatorCountData <= 0) {
                    throw new AppError(Message.NOT_ANOTHER_ALL_AUTH_MEMBER, ResponseCode.UNAUTHORIZED);
                }
            }
            newAuth = reqAuth;
        }
        return newAuth;
    }

    private async checkLoginId (reqLoginId: string, target: OperatorEntity, operatorRepository: OperatorRepository) {
        // loginId（type+loginIdで一意である事）
        let newLoginId: string | null = null;
        if (reqLoginId && reqLoginId !== target.loginId) {
            // loginIdの存在確認
            const operatorCountData = await operatorRepository.getRecordCountFromLoginId(target.type, reqLoginId);
            if (operatorCountData > 0) {
                throw new AppError(Message.LOGIN_ID_ALREADY, ResponseCode.BAD_REQUEST);
            }
            newLoginId = reqLoginId;
        }
        return newLoginId;
    }

    private async getSessionInfoForUpdate (serviceDto: OperatorServiceDto, authMe: AuthMe, sessionRepository: SessionRepository, operatorRepository: OperatorRepository) {
        const reqOperatorId = parseInt(serviceDto.getOperatorId() + '');
        const req = serviceDto.getRequest();
        const configure = serviceDto.getConfigure();
        let register: string;
        let updaterType: number;
        let updaterAuth: any;

        if (req.headers.session) {
            // JSON化
            let session: any = decodeURIComponent(req.headers.session + '');
            while (typeof session === 'string') {
                session = JSON.parse(session);
            }

            // 自分以外への操作の場合
            if (session['operatorId'] !== reqOperatorId) {
                // 運営メンバー以外の場合エラー
                if (parseInt(session['type']) !== OperatorType.TYPE_MANAGE_MEMBER) {
                    // エラーレスポンス
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
                // 更新権限が無い場合エラー
                if (!CheckOperatorAuth.checkAuth(session['auth'], null, true, null)) {
                    // エラー
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }

            // 更新者名、種別、権限を取得
            register = session['loginId'];
            updaterType = session['type'];
            updaterAuth = session['auth'];

            // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
            authMe.parseToSession(session, session.encoded);
        } else {
            // 運営メンバーでログインしているか確認
            const menberCookie: string = sprintf(configure['cookie_base_name'], OperatorType.TYPE_MANAGE_MEMBER);
            const memberSessionId: string = req.cookies[menberCookie];
            let sessionData: SessionEntity;
            let operatorId: number;
            sessionData = await sessionRepository.getRecordFromId(memberSessionId);
            if (sessionData) {
                // セッション有効期限チェック
                const expireAt = new Date(sessionData.expireAt).getTime();
                const now = new Date().getTime();
                if (expireAt < now) {
                    throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
                }
                operatorId = sessionData.operatorId;
            } else {
                operatorId = reqOperatorId;
            }

            // 更新実行オペレーターを取得
            let updater: any = null;
            const operatorData = await operatorRepository.getRecordFromId(operatorId);
            if (!operatorData) {
                throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.UNAUTHORIZED);
            }
            // 自分以外への操作の場合
            if (operatorId !== reqOperatorId) {
                // 運営メンバーだけど更新権限がない場合
                if ((operatorData.type === OperatorType.TYPE_MANAGE_MEMBER) &&
                    (!CheckOperatorAuth.checkAuth(operatorData.auth, null, true, null))) {
                    // エラー生成
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }
            updater = operatorData;

            // 更新実行者のセッションが有効であることを確認
            const updaterCookie: string = sprintf(configure['cookie_base_name'], updater['type']);
            const updaterSessionId: string = req.cookies[updaterCookie];
            sessionData = await sessionRepository.getRecordFromId(updaterSessionId);
            if ((!sessionData) || (sessionData.operatorId !== operatorId)) {
                // エラー生成
                throw new AppError(Message.SESSION_INVALID, ResponseCode.UNAUTHORIZED);
            }
            // セッション有効期限チェック
            const expireAt = new Date(sessionData.expireAt).getTime();
            const now = new Date().getTime();
            if (expireAt < now) {
                throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
            }

            // 更新者名、種別、権限を取得
            register = updater.loginId;
            updaterType = updater['type'];
            updaterAuth = updater['auth'];

            // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
            authMe.parseToSession(await this.createSession(operatorData, memberSessionId, configure));
        }
        return { register, updaterType, updaterAuth };
    }

    /**
     * IDサービスのクライアント情報を更新する
     * @param target
     * @param catalog
     * @param authMe
     * @param appCatalog
     */
    private async updateClient (target: OperatorEntity, catalog: Catalog, authMe: AuthMe, appCatalog: any, appCodes: any[]) {
        if (target['type'] === OperatorType.TYPE_APP) {
            const getUseIdService = await catalog.getUseIdService(authMe);
            if (getUseIdService) {
                const clientId = target.loginId;
                const redirecturis = appCatalog['template']['redirect_url'];
                const idService = new IdService();
                await idService.updateClient(clientId, redirecturis);
            }
        }
    }

    /**
     * オペレーター削除
     * @param connection
     * @param serviceDto
     * リファクタ履歴
     *  separate : getSessionInfoForDelete
     *  separate : deleteClientInfo（特定技術のため）
     */
    public async deleteOpetator (connection: Connection, serviceDto: OperatorServiceDto): Promise<any> {
        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);
        const sessionRepository: SessionRepository = new SessionRepository(connection);

        const req = serviceDto.getRequest();
        const res = serviceDto.getResponse();
        const configure = serviceDto.getConfigure();
        const reqOperatorId = parseInt(serviceDto.getOperatorId() + '');

        // 削除対象のオペレーターを取得
        let target: any = null;
        const operatorData = await operatorRepository.getRecordFromId(reqOperatorId);
        if (!operatorData) {
            throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.BAD_REQUEST);
        }
        target = operatorData;

        // 操作実行者、セッション情報を取得
        var { register, authMe }: { register: string, authMe: AuthMe } = await this.getSessionInfoForDelete(req, reqOperatorId, configure, sessionRepository, operatorData, operatorRepository, target);

        // トランザクションの開始
        await connection.transaction(async trans => {
            // 削除対象オペレーターの最新セッションIDを取得
            let targetSessionId: string | null = null;
            const targetSessionData = await sessionRepository.getLatestSession(target['id']);
            if (targetSessionData) {
                targetSessionId = targetSessionData.id;
            }

            // セッションIDとcookieが一致する場合、セッションとcookieを無効化
            const targetCookie = sprintf(configure['cookie_base_name'], target['type']);
            if (targetSessionId != null && req.cookies[targetCookie] === targetSessionId) {
                // セッションを無効化
                const sessionEntity = new SessionEntity();
                sessionEntity.id = targetSessionId;
                sessionEntity.expireAt = new Date();
                sessionEntity.updatedBy = register;
                await sessionRepository.deleteSession(trans, sessionEntity);

                // cookieを破棄
                res.cookie(targetCookie, '', { maxAge: 0, httpOnly: true });
            }

            // 無効化する前にロール情報を取得
            const roleSettingDataList = await roleSettingRepository.getRoleSetting(reqOperatorId);
            // ロールを無効化
            await roleSettingRepository.deleteRoleSetting(trans, reqOperatorId, register);

            // オペレーターを無効化
            await operatorRepository.deleteOperator(trans, reqOperatorId, register);

            // IDサービスのクライアント情報削除
            await this.deleteClientInfo(authMe, target, configure, roleSettingDataList);
        });

        const response = {
            operatorId: reqOperatorId.toString(),
            register: register
        };

        return response;
    }

    private async getSessionInfoForDelete (req: any, reqOperatorId: number, configure: any, sessionRepository: SessionRepository, operatorData: OperatorEntity, operatorRepository: OperatorRepository, target: any) {
        let operatorId: number = 0;
        let register: string;
        const authMe = new AuthMe();
        if (req.headers.session) {
            // JSON化
            let session: any = decodeURIComponent(req.headers.session + '');
            while (typeof session === 'string') {
                session = JSON.parse(session);
            }

            // 自分以外への操作の場合
            if (session['operatorId'] !== reqOperatorId) {
                // 運営メンバー以外の場合エラー
                if (parseInt(session['type']) !== OperatorType.TYPE_MANAGE_MEMBER) {
                    // エラーレスポンス
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
                // 更新権限が無い場合エラー
                if (!CheckOperatorAuth.checkAuth(session['auth'], null, null, true)) {
                    // エラー
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }

            // 削除実行者名を取得
            register = session['loginId'];
            // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
            authMe.parseToSession(session, session.encoded);
        } else {
            let deleter: any = null;
            let sessionData: SessionEntity;
            // 運営メンバーでログインしているか確認
            const menberCookie: string = sprintf(configure['cookie_base_name'], OperatorType.TYPE_MANAGE_MEMBER);
            const memberSessionId: string = req.cookies[menberCookie];
            sessionData = await sessionRepository.getRecordFromId(memberSessionId);
            if (sessionData) {
                // セッション有効期限チェック
                const expireAt = new Date(sessionData.expireAt).getTime();
                const now = new Date().getTime();
                if (expireAt < now) {
                    throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
                }
                operatorId = sessionData.operatorId;
            } else {
                operatorId = reqOperatorId;
            }

            // 削除実行オペレーターを取得
            operatorData = await operatorRepository.getRecordFromId(operatorId);
            if (!operatorData) {
                throw new AppError(Message.OPERATOR_NOT_EXISTS, ResponseCode.UNAUTHORIZED);
            }
            // 自分以外への操作の場合
            if (operatorId !== reqOperatorId) {
                // 運営メンバーだけど権限がない場合
                if ((operatorData.type === OperatorType.TYPE_MANAGE_MEMBER) &&
                    (!CheckOperatorAuth.checkAuth(operatorData.auth, null, null, true))) {
                    // エラー生成
                    throw new AppError(Message.NOT_OPERATION_AUTH, ResponseCode.UNAUTHORIZED);
                }
            }
            deleter = operatorData;

            // 削除実行者のセッションが有効であることを確認
            const deleterCookie: string = sprintf(configure['cookie_base_name'], deleter['type']);
            const deleterSessionId: string = req.cookies[deleterCookie];
            sessionData = await sessionRepository.getRecordFromId(deleterSessionId);
            if ((!sessionData) || (sessionData.operatorId !== operatorId)) {
                // エラー生成
                throw new AppError(Message.SESSION_INVALID, ResponseCode.UNAUTHORIZED);
            }
            // セッション有効期限チェック
            const expireAt = new Date(sessionData.expireAt).getTime();
            const now = new Date().getTime();
            if (expireAt < now) {
                throw new AppError(Message.IS_EXPIRED, ResponseCode.UNAUTHORIZED);
            }

            // 削除実行者名を取得
            register = deleter.loginId;
            // 他サービス呼出時にヘッダーに付与するオペレーター情報をセット
            authMe.parseToSession(await this.createSession(operatorData, memberSessionId, configure));
        }

        // 削除対象が全権持ち運営メンバーの場合
        if (parseInt(target['type']) === OperatorType.TYPE_MANAGE_MEMBER &&
            CheckOperatorAuth.checkAuth(target['auth'], true, true, true)) {
            // 全権持ち運営メンバーの存在確認
            const operatorCountData = await operatorRepository.isAllAuthMemberExists();
            if (operatorCountData <= 1) {
                throw new AppError(Message.NOT_ANOTHER_ALL_AUTH_MEMBER, ResponseCode.UNAUTHORIZED);
            }
        }
        return { register, authMe };
    }

    /**
     * IDサービスのクライアント情報及び組織情報の削除を行う
     * @param authMe
     * @param target
     * @param configure
     * @param roleSettingDataList
     */
    private async deleteClientInfo (authMe: AuthMe, target: any, configure: any, roleSettingDataList: RoleSettingEntity[]) {
        const catalog = new Catalog();
        const getUseIdService = await catalog.getUseIdService(authMe);
        // グローバル設定のIDサービス利用設定がONかつ削除対象のオペレーターにクライアントIDの登録がある場合、IDサービス クライアント削除APIを呼び出す
        if (getUseIdService && target.clientId) {
            const idService = new IdService();
            await idService.deleteClient(target.clientId);
            const actorCode = configure['actor']['_value'];
            const catalogUrl = configure['catalog_url'];
            const appCodes = [];
            // ロール情報からAPPコードを取得する
            for (const role of roleSettingDataList) {
                // カタログを取得する
                const catalogCode = role.roleCatalogCode;
                const catalogVersion = role.roleCatalogVersion;
                const catalogInfo = await catalog.getCatalog(authMe, catalogUrl, catalogCode, catalogVersion);
                // アプリケーションか確認する
                const appRegex = new RegExp('/app/.+/application', 'g');
                const wfRegex = new RegExp('/wf/.+/role', 'g');
                if (catalogInfo['catalogItem']['ns'].match(appRegex)) {
                    appCodes.push(catalogCode);
                } else if (catalogInfo['catalogItem']['ns'].match(wfRegex)) {
                    throw new AppError(Message.UNSUPPORTED_ACTOR, ResponseCode.BAD_REQUEST);
                }
            }
            // 組織情報の更新を行う
            await idService.deleteService(target.clientId, actorCode, appCodes);
        }
    }

    /**
     * オペレーター削除取り消し
     * @param connection
     * @param serviceDto
     */
    public async cancelDeleteOpetator (connection: Connection, serviceDto: OperatorServiceDto): Promise<any> {
        // リポジトリを取得
        const operatorRepository: OperatorRepository = new OperatorRepository(connection);
        const roleSettingRepository: RoleSettingRepository = new RoleSettingRepository(connection);

        const reqOperatorId = parseInt(serviceDto.getOperatorId() + '');
        const register = serviceDto.getLoginId();

        // トランザクションの開始
        await connection.transaction(async trans => {
            // unique_check_login_id列の値再生成
            let uniqueCheckLoginId;
            const target: OperatorEntity = await operatorRepository.getRecordFromId(reqOperatorId, false);
            if (target['type'] === OperatorType.TYPE_IND && target['loginProhibitedFlg'] === true) {
                // ログイン不可個人の場合
                uniqueCheckLoginId = ([target['loginId'], target['type'], target.appCatalogCode, target.regionCatalogCode, target['loginProhibitedFlg']].join(''));
            } else {
                uniqueCheckLoginId = ([target['loginId'], target['type']].join(''));
            }

            // オペレーターを復元
            await operatorRepository.cancelDeleteOperator(trans, reqOperatorId, register, uniqueCheckLoginId);

            // ロールを復元
            await roleSettingRepository.cancelDeleteRoleSetting(trans, reqOperatorId, register);
        });

        const response = {
            operatorId: reqOperatorId
        };

        return response;
    }

    /**
     * 設定しようとしている権限がカタログで許可されているものか確認する
     * @param auth
     * @param configure
     * @param authMe
     * リファクタ履歴
     *  separate : checkAuthCodes
     *  separate : checkActorAuth
     */
    private async inquireAuthSettings (auth: any, configure: any, authMe: AuthMe) {
        const catalogService: Catalog = new Catalog();
        // 設定しようとしている権限がカタログに定義済みか確認する
        const authCodes = await this.checkAuthCodes(auth, catalogService, configure, authMe);

        // アクターに許可された操作権か確認する
        await this.checkActorAuth(authCodes, catalogService, configure, authMe);
    }

    private async checkAuthCodes (auth: any, catalogService: Catalog, configure: any, authMe: AuthMe) {
        const catalogUrl = configure['catalog_url'];
        const authCodes: any[] = [];
        for (const key in auth) {
            // keyから生成したネームスペースでカタログを取得
            // Ex.catalog/model/auth/member
            const authNs = 'catalog/model/auth/' + key;
            const authCatalogs = await catalogService.getCatalogByNs(catalogUrl, authNs, authMe);

            // keyの中身を1件ずつ取り出す
            for (const actionkey in auth[key]) {
                let isExist = false;

                // 値がbooleanで設定されているかチェック
                if (typeof auth[key][actionkey] !== 'boolean') {
                    throw new AppError(Message.REQUEST_PARAMETER_INVALID, ResponseCode.BAD_REQUEST);
                }

                // 取得してきたカタログでnameが一致するものを取り出す
                for (const authCatalog of authCatalogs) {
                    if (actionkey === authCatalog['template']['auth-name']) {
                        isExist = true;
                        // 後続処理で使用するのでカタログコードを取得
                        const authCode = {
                            _value: authCatalog['catalogItem']['_code']['_value'],
                            _ver: authCatalog['catalogItem']['_code']['_ver']
                        };
                        authCodes.push(authCode);
                        break;
                    }
                }
                // 1件でも一致しないものがあればエラーとする
                if (!isExist) {
                    throw new AppError(Message.NOT_EXIST_AUTH_CATALOG, ResponseCode.BAD_REQUEST);
                }
            }
        }
        return authCodes;
    }

    private async checkActorAuth (authCodes: any[], catalogService: Catalog, configure: any, authMe: AuthMe) {
        const catalogUrl = configure['catalog_url'];
        let settingNs = null;
        const blockCatalog = await catalogService.getCatalog(authMe, catalogUrl, configure['block']['_value']);
        if (configure['actor'] && configure['actor']['_value']) {
            // アクターがあれば、アクター設定を取得
            settingNs = 'catalog/ext/' + configure['catalog_ext_name'] +
                '/setting/actor/' + blockCatalog['template']['actor-type'] +
                '/actor_' + configure['actor']['_value'];
        } else {
            // もしアクターがなければ、modelカタログを取得
            settingNs = 'catalog/model/setting/actor/' + blockCatalog['template']['actor-type'];
        }
        // カタログからアクター個別設定を取得
        const settingCatalogs = await catalogService.getCatalogByNs(catalogUrl, settingNs, authMe);
        for (const authCode of authCodes) {
            if (!settingCatalogs || settingCatalogs.length <= 0) {
                throw new AppError(Message.NON_CONFIGURABLE_AUTHORITY, ResponseCode.BAD_REQUEST);
            }
            let isExist = false;
            // アクター個別設定にて設定されている権限カタログコードを取り出し
            // 設定しようとしている権限のカタログコードと一致するか確認する
            for (const settingAuthGroup of settingCatalogs[0]['template']['auth-group']) {
                for (const settingAuth of settingAuthGroup['auth']) {
                    if (authCode['_value'] === settingAuth['_value']) {
                        isExist = true;
                        break;
                    }
                }
            }
            // 1件でも一致しないものがあればエラーとする
            if (!isExist) {
                throw new AppError(Message.NON_CONFIGURABLE_AUTHORITY, ResponseCode.BAD_REQUEST);
            }
        }
    }

    /**
     * カタログ取得用のセッション情報を作成する
     * @param operatorData
     * @param sessionId
     */
    private async createSession (operatorData: OperatorEntity, sessionId: string, configure: any): Promise<any> {
        const session: any = {
            sessionId: sessionId,
            operatorId: operatorData.id,
            type: operatorData.type,
            loginId: operatorData.loginId,
            pxrId: operatorData.pxrId,
            name: operatorData.name,
            auth: operatorData.auth,
            lastLoginAt: operatorData.lastLoginAt ? moment(operatorData.lastLoginAt).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ss.SSSZZ') : null,
            passwordChangedFlg: operatorData.passwordChangedFlg,
            attributes: operatorData.attributes,
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
     * 利用者IDとログインIDの重複チェック
     * @param userId
     * @param loginId
     * @param appCatalogCode
     */
    private async checkDuplicateUser (repository: OperatorRepository, userId: string, loginId: string, appCatalogCode: number, regionCatalogCode: number) {
        // userId + appCatalogCodeが一意か確認
        let count = await repository.getCountFromDuplicateUserWithUserId(userId, appCatalogCode, regionCatalogCode);
        if (count > 0) {
            throw new AppError(Message.USER_ID_ALREADY, ResponseCode.BAD_REQUEST);
        }

        // loginId + appCatalogCodeが一意か確認
        count = await repository.getCountFromDuplicateUserWithLoginId(loginId, appCatalogCode, regionCatalogCode);
        if (count > 0) {
            throw new AppError(Message.LOGIN_ID_ALREADY, ResponseCode.BAD_REQUEST);
        }
    }
}
