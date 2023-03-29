/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import path = require('path');
import fs = require('fs');
import { connectDatabase } from '../common/Connection';
import { getConnection } from 'typeorm';
/* eslint-enable */

// テスト用にlisten数を無制限に設定
require('events').EventEmitter.defaultMaxListeners = 0;

/**
 * URL
 */
export namespace Url {
    /**
     * ベースURL
     */
    export const baseURI: string = '/operator';

    /**
     * 追加URL
     */
    export const addURI: string = baseURI;

    /**
     * 更新URL
     */
    export const updateURI: string = baseURI;

    /**
     * 削除URL
     */
    export const delURI: string = baseURI;

    /**
     * 削除取り消しURL
     */
    export const cancelDelURI: string = baseURI + '/cancelDelete';

    /**
     * 取得URL
     */
    export const getURI: string = baseURI;

    /**
     * ログインURL
     */
    export const loginURI: string = baseURI + '/login';

    /**
     * ログインURL
     */
    export const indLoginURI: string = baseURI + '/ind/login';

    /**
     * ワンタイムログインコード認証URL
     */
    export const onetimeURI: string = baseURI + '/login/onetime';

    /**
     * 個人ワンタイムログインコード認証URL
     */
    export const indOnetimeURI: string = baseURI + '/ind/login/onetime';

    /**
     * ログアウトURL
     */
    export const logoutURI: string = baseURI + '/logout';

    /**
     * ログアウトURL
     */
    export const indLogoutURI: string = baseURI + '/ind/logout';

    /**
     * セッション確認URL
     */
    export const sessionURI: string = baseURI + '/session';

    /**
     * セッション確認URL
     */
    export const indSessionURI: string = baseURI + '/ind/session';

    /**
     * パスワードリセットURL
     */
    export const passwordURI: string = baseURI + '/password';

    /**
     * SMS検証コード発行
     */
    export const IndSmsVerificate: string = baseURI + '/ind/sms-verificate';

    /**
     * SMS検証コード発行
     */
    export const IndSmsVerificateVerifiy: string = baseURI + '/ind/sms-verificate/verifiy';

    /**
     * SSOログイン
     */
    export const loginSsoURI: string = baseURI + '/login/sso';

    /**
     * SSOログイン（個人）
     */
    export const indLoginSsoURI: string = baseURI + '/ind/login/sso/';
}

/**
 * テスト用共通クラス
 */
export default class Common {
    async connect () {
        await connectDatabase();
    }

    /**
     * SQLファイル実行
     * @param fileName
     */
    public async executeSqlFile (fileName: string) {
        // ファイルをオープン
        const fd: number = fs.openSync(path.join('./ddl/unit-test/', fileName), 'r');

        // ファイルからSQLを読込
        const sql: string = fs.readFileSync(fd, 'utf-8');

        // ファイルをクローズ
        fs.closeSync(fd);

        // DBを初期化
        await getConnection('postgres').query(sql);
    }

    /**
     * SQL実行
     * @param sql
     */
    public async executeSqlString (sql: string) {
        // DBを初期化
        await getConnection('postgres').query(sql);
    }
}
