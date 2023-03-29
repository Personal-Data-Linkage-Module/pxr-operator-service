/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Server } from 'net';
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import express = require('express');
import pxrSetting = require('./catalog/pxr-setting.json');
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

// サーバをlisten
app.start();

const catalogServer = new (class {
    app: express.Application;
    server: Server;
    constructor () {
        this.app = express();
        this.app.get('/catalog', (req, res) => {
            const ns = req.query.ns;
            if (ns === 'catalog/ext/test-org/setting/global') {
                res.status(200).json(pxrSetting).end();
            } else {
                res.status(204).end();
            }
        });
    }

    start () {
        this.server = this.app.listen(3001, () => {});
    }

    stop () {
        this.server.close(() => {});
    }
})();
catalogServer.start();

/**
 * operator API のユニットテスト
 */
describe('operator API', () => {
    /**
     * 全テスト実行前の処理
     */
    beforeAll(async () => {
        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        // DB切断
        // await common.disconnect();
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 各テスト実行の前処理
     */
    afterEach(async () => {
        // DB切断
        // await common.disconnect();
    });
    /**
     * 全テスト実行後の処理
     */
    afterAll(async () => {
        // サーバ停止
        app.stop();
        // DB切断
        // await common.disconnect();
        catalogServer.stop();
    });

    /**
     * セッション確認
     */
    describe('セッション確認', () => {
        test('データ異常　有効なオペレーターが存在しない', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, true, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('未ログインです');
        });
        test('正常（無効なセッションID）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth, last_login_at, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}', '2020-01-20 12:00:00.000', '09011112222',
                    '{"test": true}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '12e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 1, '2019-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '12e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('有効期限切れです');
        });
        test('正常（運営メンバー）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 1, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常（個人）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    5, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '121212bc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 5, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '121212bc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
                extendFlg: true
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indSessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '121212bc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(5);
            expect(response.body.loginId).toBe('ind01');
            expect(response.body.pxrId).toBe('test.pxrid');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常（app）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 2, 'app_staff01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app_staff011'
                );
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    3, 43, 1,
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 3, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
                extendFlg: true
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(3);
            expect(response.body.loginId).toBe('app_staff01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常（appロールなし）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 2, 'app_staff02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app_staff022'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12', 4, NOW() + interval '29 minutes',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12',
                extendFlg: true
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(4);
            expect(response.body.loginId).toBe('app_staff02');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('異常（wf）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    7, 1, 'wf_staff01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'wf_staff011'
                );
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    7, 43, 1,
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e13', 7, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e13',
                extendFlg: true
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.UNSUPPORTED_OPERATOR);
        });
        test('異常：個人、cookieなし', async () => {
            // 送信データを生成
            const json = {
                sessionId: '121212bc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indSessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('未ログインです');
        });
        test('異常：個人、cookieのセッションIDとリクエストのセッションIDが異なる', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    6, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    'c17aeeafd492c5da95ed52ced225b2deae274aa09a19634b8d2171e6065bb9db', 6, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            const json = {
                sessionId: '121212bc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indSessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + 'c17aeeafd492c5da95ed52ced225b2deae274aa09a19634b8d2171e6065bb9db'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('未ログインです');
        });
        test('パラメーター異常　空文字（sessionId）', async () => {
            // 送信データを生成
            const json = {
                sessionId: ''
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.sessionURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'sessionId', value: null, message: 'この値は空を期待しません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
    });
});
