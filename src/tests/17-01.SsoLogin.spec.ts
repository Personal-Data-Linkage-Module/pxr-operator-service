/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import Config from '../common/Config';
import { CatalogServer } from './StubServer';
import supertest = require('supertest');
const message = Config.ReadConfig('./config/message.json');
// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();
app.start();

let _catalogServer: CatalogServer;

describe('operator API', () => {
    /**
     * 全テスト実行の前処理
     */
    beforeAll(async () => {
        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        // DB設定
        await common.executeSqlString(`
            INSERT INTO pxr_operator.operator
            (
                id, type, login_id, hpassword, pxr_id, name, mobile_phone, auth, login_prohibited_flg,
                attributes, client_id, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
            )
            VALUES
            (
                1, 2, 'app01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL, NULL, NULL, false,
                NULL, 'app01', false, 'test_user', NOW(), 'test_user', NOW(), 'app012'
            ),
            (
                2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'pxr_id_ind01', NULL, '09011112223', NULL, false, 
                NULL, 'ind01', false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
            ),
            (
                3, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'pxr_id_ind02', NULL, '09011112223', NULL, true, 
                NULL, 'ind02', false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
            );
            INSERT INTO pxr_operator.role_setting
            (
                id, operator_id, role_catalog_code, role_catalog_version, is_disabled, created_by, created_at, updated_by, updated_at
            )
            VALUES
            (
                1, 1, 43, 1, false, 'test_user', NOW(), 'test_user', NOW()
            )`);
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        if (_catalogServer) {
            _catalogServer.stop();
            _catalogServer = null;
        }
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // サーバ停止
        app.stop();
    });

    describe('SSOログイン', () => {
        test('正常', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.loginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({
                    accept: 'application/json',
                    'access-token': 'SlAV32hkKG'
                });

            // プラグインメソッドは未実装なのでエラーになる
            // expect(response.status).toBe(200);
            // expect(response.body.loginId).toBe('app01');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.AUTH_INFO_INVALID);
        });
        test('異常：認証情報と一致するレコードが取得できない', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.loginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({
                    accept: 'application/json',
                    'access-token': 'SlAV32hkKG'
                });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.AUTH_INFO_INVALID);
        });
        test('異常：headerにアクセストークンが設定されていない', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.loginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(message.NOT_EXIST_ACCESS_TOKEN);
        });
    });
    describe('SSOログイン（個人）', () => {
        test('正常', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.indLoginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json', 'code-verifier': 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' })
                .send({ authorizationCode: 'SplxlOBeZQQYbYS6WxSbIA' });

            // プラグインメソッドは未実装なのでエラーになる
            // expect(response.status).toBe(200);
            // expect(response.body.loginId).toBe('ind01');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.AUTH_INFO_INVALID);
        });
        test('異常：リクエストが配列', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.indLoginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json', 'code-verifier': 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' })
                .send([{ authorizationCode: 'SplxlOBeZQQYbYS6WxSbIA' }]);

            expect(response.status).toBe(400);
        });
        test('異常：認証情報と一致するレコードが取得できない', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.indLoginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json', 'code-verifier': 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' })
                .send({ authorizationCode: 'SplxlOBeZQQYbYS6WxSbIA' });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.AUTH_INFO_INVALID);
        });
        test('異常：ログイン不可フラグがtrue', async () => {
            _catalogServer = new CatalogServer();
            _catalogServer.start();

            // 送信データを生成
            const url = Url.indLoginSsoURI;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json', 'code-verifier': 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' })
                .send({ authorizationCode: 'SplxlOBeZQQYbYS6WxSbIA' });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.AUTH_INFO_INVALID);
        });
    });
});
