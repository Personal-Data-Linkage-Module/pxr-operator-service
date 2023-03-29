/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AuthMe from '../domains/AuthMe';
/* eslint-enable */
import { doGetRequest } from '../common/DoRequest';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Log from '../common/Log';
import { applicationLogger } from './logging';
import { sprintf } from 'sprintf-js';
import Config from './Config';
// eslint-disable-next-line no-unused-vars
import request = require('request');
import urljoin = require('url-join');
import config = require('config');
const Message = Config.ReadConfig('./config/message.json');
const configure = Config.ReadConfig('./config/config.json');

export default class Catalog {
    /**
     * カタログ情報取得
     * @param catalogDto
     */
    public async getCatalog (authMe: AuthMe, baseUrl: string, code: number, version?: number): Promise<any> {
        let url: string;
        // URLを生成
        if (version) {
            url = urljoin(baseUrl, code.toString(), version.toString());
        } else {
            url = urljoin(baseUrl, code.toString());
        }

        try {
            // ヘッダーにログイン情報を付与
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json'
                }
            };
            options.headers.session = authMe.encoded;

            // カタログサービスからカタログを取得
            const result = await doGetRequest(url, options);
            Log.Debug(sprintf(Message.CATALOG_RESPONSE_STATUS, result.response.statusCode));
            Log.Debug(sprintf(Message.CATALOG_RESPONSE, result.body));

            // ステータスコードを判定
            if (result.response.statusCode === ResponseCode.BAD_REQUEST || result.response.statusCode === ResponseCode.NO_CONTENT) {
                // 応答が400の場合、エラーを返す
                throw new AppError(
                    sprintf(Message.NOT_FOUND_CATALOG, code, version),
                    ResponseCode.BAD_REQUEST
                );
            } else if (result.response.statusCode !== ResponseCode.OK) {
                // 応答が200 OK以外の場合、エラーを返す
                throw new AppError(Message.FAILED_CATALOG_GET + result.response.statusCode, ResponseCode.SERVICE_UNAVAILABLE);
            }
            // カタログ情報を戻す
            return JSON.parse(result.body);
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(Message.FAILED_CONNECT_TO_CATALOG, ResponseCode.SERVICE_UNAVAILABLE, err);
        }
    }

    /**
     * ネームスペースによるカタログ情報取得
     * @param catalogDto
     */
    public async getCatalogByNs (baseUrl: string, ns: string, authMe: AuthMe): Promise<any> {
        applicationLogger.info('Catalog.getCatalogByNs start');
        let url;
        // URLを生成（日本語が入っている場合に備えてエンコード）
        if ((baseUrl + '').indexOf('pxr-block-proxy') === -1) {
            url = baseUrl + '?ns=' + encodeURIComponent(ns);
        } else {
            url = baseUrl + encodeURIComponent('?ns=' + ns);
        }

        try {
            // ヘッダーにログイン情報を付与
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json'
                }
            };
            if (!authMe.encoded) {
                authMe.parseToSession(authMe);
            }
            options.headers.session = authMe.encoded;

            // カタログサービスからカタログを取得
            const result = await doGetRequest(url, options);
            Log.Debug(sprintf(Message.CATALOG_RESPONSE_STATUS, result.response.statusCode));
            Log.Debug(sprintf(Message.CATALOG_RESPONSE, result.body));

            // ステータスコードを判定
            if (result.response.statusCode === ResponseCode.NOT_FOUND || result.response.statusCode === ResponseCode.NO_CONTENT) {
                throw new AppError(
                    sprintf(Message.NOT_FOUND_CATALOG_WITH_NS, ns),
                    ResponseCode.BAD_REQUEST
                );
            } else if (result.response.statusCode !== ResponseCode.OK) {
                // 応答が200 OK以外の場合、エラーを返す
                throw new AppError(Message.FAILED_CATALOG_GET + result.response.statusCode, ResponseCode.SERVICE_UNAVAILABLE);
            }
            applicationLogger.info('Catalog.getCatalogByNs end');
            // カタログ情報を戻す
            return JSON.parse(result.body);
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(Message.FAILED_CONNECT_TO_CATALOG, ResponseCode.SERVICE_UNAVAILABLE, err);
        }
    }

    /**
     * セッションの有効期限に関する情報を取得する
     * @param authMe
     */
    async acquireSessionExpiration (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquireSessionExpiration start');
        const catalog = await this.getPxrSetting(authMe);
        const obj = catalog.template['session-expiration'];
        applicationLogger.info('Catalog.acquireSessionExpiration end');
        return obj;
    }

    /**
     * アカウントロックにかかる回数を設定から取得する
     * @param authMe
     */
    async acquireAccountLockCount (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquireAccountLockCount start');
        const catalog = await this.getPxrSetting(authMe);
        const accountLock = catalog.template['account-lock-count'];
        applicationLogger.info('Catalog.acquireAccountLockCount end');
        return parseInt(accountLock);
    }

    /**
     * アカウントロック解放に関する設定を取得する
     * @param authMe
     */
    async acquireAccountLockReleaseTime (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquireAccountLockReleaseTime start');
        const catalog = await this.getPxrSetting(authMe);
        const releaseTime = catalog.template['account-lock-release-time'];
        applicationLogger.info('Catalog.acquireAccountLockReleaseTime end');
        return releaseTime;
    }

    /**
     * パスワード更新のタイミングの設定を取得する
     * @param authMe
     */
    async acquirePasswordExpiration (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquirePasswordExpiration start');
        const catalog = await this.getPxrSetting(authMe);
        const expiration = catalog.template['password-expiration'];
        applicationLogger.info('Catalog.acquirePasswordExpiration end');
        return expiration;
    }

    /**
     * パスワード一致を防ぐ為の世代数を設定から取得する
     * @param authMe
     */
    async acquirePasswordGen (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquirePasswordGen start');
        const catalog = await this.getPxrSetting(authMe);
        const gen = catalog.template['password-generations-number'];
        applicationLogger.info('Catalog.acquirePasswordGen end');
        return gen;
    }

    /**
     * ワンタイムログイン設定
     * @param authMe
     */
    async acquireOneTimeLoginSetting (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquireOneTimeLoginSetting start');
        const catalog = await this.getPxrSetting(authMe);
        const { value, type } = catalog.template['one-time-login-code-expiration'] || config.get('sms.expire');
        const template = catalog.template['login_sms_message'] || config.get('sms.message_template');
        applicationLogger.info('Catalog.acquireOneTimeLoginSetting end');
        return {
            value: value,
            type: type,
            template: template
        };
    }

    /**
     * 2段階認証設定を設定から取得する
     * @param authMe
     */
    async acquireTwoStepSetting (authMe: AuthMe) {
        applicationLogger.info('Catalog.acquireTwoStepSetting start');
        const catalog = await this.getPxrSetting(authMe);
        const gen = catalog.template['personal_two-step_verification'];
        applicationLogger.info('Catalog.acquireTwoStepSetting end');
        return gen;
    }

    /**
     * IDサービス利用設定を取得する
     * @param authMe
     */
    async getUseIdService (authMe: AuthMe) {
        applicationLogger.info('Catalog.getUseIdService start');
        const catalog = await this.getPxrSetting(authMe);
        const useIdService = catalog.template['use_id_connect'];
        applicationLogger.info('Catalog.getUseIdService end');
        return useIdService;
    }

    /**
     * PXR設定のカタログを取得する
     * @param authMe
     */
    async getPxrSetting (authMe: AuthMe) {
        applicationLogger.info('Catalog.getPxrSetting start');
        const ns = config.get('catalog.pxr-setting') + '';
        const catalog = await this.getCatalogByNs(configure['catalog_url'], ns, authMe);
        applicationLogger.info('Catalog.getPxrSetting end');
        return catalog[0];
    }
}
