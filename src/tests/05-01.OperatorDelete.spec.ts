/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import { CatalogServer } from './StubServer';
import Common, { Url } from './Common';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

let catalogServer: any;

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
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブ停止
        if (catalogServer) {
            await catalogServer.stop();
        }
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
     * 削除
     */
    describe('削除', () => {
        test('パラメーター不足 operatorId', async () => {
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' });

            // レスポンスチェック
            expect(response.status).toBe(404);
        });
        test('パラメーター異常 存在しない（operatorId）', async () => {
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/999')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.OPERATOR_NOT_EXISTS);
        });
        test('パラメーター異常 数字でない（operatorId）', async () => {
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' });

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('正常 前提：操作権限のある運営メンバーでログインしていること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
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
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
                    'operator_type0_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('2');
        });
        test('データ不足 前提：全権持ちの運営メンバーが最後の1人であること', async () => {
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_ANOTHER_ALL_AUTH_MEMBER);
        });
        test('正常（全権持ち運営メンバー） 前提：操作権限のある運営メンバーでログインしていること。他に全権持ちの運営メンバーが存在すること。', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/3')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('3');
        });
        test('権限不足 前提：操作権限のない運営メンバーでログインしていること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": true, "update": true, "delete": false}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
                ),
                (
                    11, 3, 'manage_member05', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member053'
                ),
                (
                    5, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '333a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '333a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('正常 前提：運営メンバー以外でログインしていること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    6, 0, 'ind06', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind060'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '666a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 6, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '666a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('6');
        });
        test('正常 ヘッダーからログイン情報を取得（自分以外で削除）', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 1,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: true
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('5');
        });
        test('正常 ヘッダーからログイン情報を取得（自分で削除）', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 4,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: false
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/4')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('4');
        });
        test('異常 前提：運営メンバーでログイン、セッション有効期限切れ', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    7, 3, 'manage_member07', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー07', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member073'
                ),
                (
                    8, 0, 'ind08', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind080'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 7, '2020-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/8')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('異常 前提：削除者自身でログイン、セッション有効期限切れ', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca', 8, '2020-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/8')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('異常 ヘッダーからログイン情報を取得（自分以外で削除だが権限がない）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                DELETE FROM pxr_operator.session;
                DELETE FROM pxr_operator.one_time_login_code;
                DELETE FROM pxr_operator.role_setting;
                DELETE FROM pxr_operator.operator;
                SELECT SETVAL('pxr_operator.operator_id_seq', 1, false);
                SELECT SETVAL('pxr_operator.role_setting_id_seq', 1, false);
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                ),
                (
                    3, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    4, 3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": true, "update": true, "delete": false}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
                ),
                (
                    5, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                ),
                (
                    6, 0, 'ind06', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind060'
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
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '333a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '666a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 6, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 1,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常 ヘッダーからログイン情報を取得（運営メンバー以外）', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 4,
                type: 0,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: false
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常 ヘッダーからログイン情報を取得（運営メンバーだけど削除権限が無い）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                DELETE FROM pxr_operator.session;
                DELETE FROM pxr_operator.one_time_login_code;
                DELETE FROM pxr_operator.role_setting;
                DELETE FROM pxr_operator.operator;
                SELECT SETVAL('pxr_operator.operator_id_seq', 1, false);
                SELECT SETVAL('pxr_operator.role_setting_id_seq', 1, false);
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                ),
                (
                    3, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    4, 3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": true, "update": true, "delete": false}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
                ),
                (
                    5, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind023'
                ),
                (
                    6, 0, 'ind06', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind063'
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
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '333a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '666a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 6, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 4,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: false
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('正常 Idサービス連携あり', async () => {
            await common.executeSqlString(`
                DELETE FROM pxr_operator.session;
                DELETE FROM pxr_operator.one_time_login_code;
                DELETE FROM pxr_operator.role_setting;
                DELETE FROM pxr_operator.operator;
                SELECT SETVAL('pxr_operator.operator_id_seq', 1, false);
                SELECT SETVAL('pxr_operator.role_setting_id_seq', 1, false);
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                ),
                (
                    3, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    4, 3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": true, "update": true, "delete": false}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
                ),
                (
                    5, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                ),
                (
                    6, 0, 'ind06', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind060'
                ),
                (
                    7, 2, 'app01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app012'
                )
                ;
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 1, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '333a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '666a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 6, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '766a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 7, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
                UPDATE pxr_operator.operator
                    SET client_id = 'test-user'
                    WHERE id = 4
                ;
                UPDATE pxr_operator.operator
                    SET client_id = 'test-app1'
                    WHERE id = 7
                ;
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    4, 44, 1,
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    7, 41, 1,
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 4,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: false
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer(1);
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/4')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('4');
        });
        test('正常 Idサービス連携あり APP', async () => {
            await common.executeSqlString(`
                DELETE FROM pxr_operator.session;
                DELETE FROM pxr_operator.one_time_login_code;
                DELETE FROM pxr_operator.role_setting;
                DELETE FROM pxr_operator.operator;
                SELECT SETVAL('pxr_operator.operator_id_seq', 1, false);
                SELECT SETVAL('pxr_operator.role_setting_id_seq', 1, false);
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                ),
                (
                    3, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    4, 3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
                ),
                (
                    5, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind023'
                ),
                (
                    6, 0, 'ind06', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind063'
                ),
                (
                    7, 2, 'app01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app012'
                )
                ;
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 1, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '333a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '666a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 6, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '766a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 7, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
                UPDATE pxr_operator.operator
                    SET client_id = 'test-user'
                    WHERE id = 4
                ;
                UPDATE pxr_operator.operator
                    SET client_id = 'test-app1'
                    WHERE id = 7
                ;
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    4, 43, 1,
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    7, 44, 1,
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 4,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: true
                    }
                },
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ],
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });

            // スタブ起動
            catalogServer = new CatalogServer(1);
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).delete(Url.delURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) });
            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe('7');
        });
    });
});
