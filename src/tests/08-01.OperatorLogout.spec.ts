/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

// サーバをlisten
app.start();

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
    });

    /**
     * ログアウト
     */
    describe('ログアウト', () => {
        test('正常　前提：ログインしているオペレーターが存在すること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"add": true, "update": true, "delete": true}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                );
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
            var json = {
                sessionId: '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.logoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('ok');
        });
        test('正常　前提：ログインしているオペレーターが存在すること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"add": true, "update": true, "delete": true}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                sessionId: '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.logoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('ok');
        });
        test('パラメーター異常　空文字（sessionId）', async () => {
            // 送信データを生成
            var json = {
                sessionId: ''
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.logoutURI)
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
        test('パラメーター異常　登録されていない（sessionId）', async () => {
            // 送信データを生成
            var json = {
                sessionId: '11111'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.logoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.SESSION_NOT_EXISTS);
        });
        test('正常　前提：ログインしているオペレーターが存在すること（個人）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '個人01', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12', 3, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                sessionId: '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLogoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('ok');
        });
        test('異常　前提：個人、cookieなし', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '個人02', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    'c17aeeafd492c5da95ed52ced225b2deae274aa09a19634b8d2171e6065bb9db', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                sessionId: 'c17aeeafd492c5da95ed52ced225b2deae274aa09a19634b8d2171e6065bb9db'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLogoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.UNAUTHORIZED);
        });
        test('異常　前提：個人、cookieのセッションIDとリクエストのセッションIDが異なる', async () => {
            // 事前データ準備
            await common.executeSqlString(`
            INSERT INTO pxr_operator.session
            (
                id, operator_id, expire_at,
                is_disabled, created_by, created_at, updated_by, updated_at
            )
            VALUES
            (
                '1512299e08c3084aeb7dfbb3d76724e4ecaf546e87dc8c3cca79de28d3cefc2b', 3, '2025-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            );
            `);

            // 送信データを生成
            var json = {
                sessionId: '1512299e08c3084aeb7dfbb3d76724e4ecaf546e87dc8c3cca79de28d3cefc2b'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLogoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + 'c17aeeafd492c5da95ed52ced225b2deae274aa09a19634b8d2171e6065bb9db'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.UNAUTHORIZED);
        });
        test('異常　前提：個人、セッション有効期限切れ', async () => {
            // 事前データ準備
            await common.executeSqlString(`
            INSERT INTO pxr_operator.session
            (
                id, operator_id, expire_at,
                is_disabled, created_by, created_at, updated_by, updated_at
            )
            VALUES
            (
                '12e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 3, '2020-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            );
            `);

            // 送信データを生成
            var json = {
                sessionId: '12e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLogoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '12e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('異常：個人がログアウト', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    5, 0, 'ind03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind030'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '12345cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                sessionId: '12345cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.logoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '12345cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常： 個人以外がログアウト', async () => {
            // 事前データ準備
            await common.executeSqlFile('initialData.sql');
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'menber_01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '個人01', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'menber_013'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 1, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                sessionId: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLogoutURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.UNAUTHORIZED);
        });
    });
});
