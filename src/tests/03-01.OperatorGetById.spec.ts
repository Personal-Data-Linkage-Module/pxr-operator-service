/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import { Session } from './Session';

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
     * 各テスト実行の後処理
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
     * 取得（オペレーターID指定）
     */
    describe('取得（オペレーターID指定）', () => {
        test('正常　前提：対象IDのオペレーターが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    last_login_at, attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"add": true, "update": true, "delete": true}',
                    '2020-01-10 23:59:59.000', '{"test":"test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/1')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常　前提：対象IDのオペレーターが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    last_login_at, attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', NULL,
                    '2020-01-10 23:59:59.000', '{"test":"test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/4')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(4);
            expect(response.body.loginId).toBe('manage_member02');
        });
        test('正常　前提：対象IDのオペレーター+ロールが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 2, 'app_02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'app02',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app_022'
                );
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version, is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    2, 16, 1, false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/2')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(2);
            expect(response.body.loginId).toBe('app_02');
            expect(response.body.roles[0]._value).toBe(16);
        });
        test('正常　前提：対象IDのオペレーターが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/3')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(3);
            expect(response.body.loginId).toBe('ind01');
        });
        test('正常　セッション情報をcookie0から取得', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                    INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00', 1, '2030-12-31T00:00:00.000+0000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/1')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type0_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常　セッション情報をcookie2から取得', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/1')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type2_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常　セッション情報をcookie3から取得', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/1')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type3_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });

        test('データ不足　登録されていないオペレーターIDを指定', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/999999')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(204);
        });
        test('パラメータ異常　オペレーターIDが数字でない', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/a')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　オペレーターIDの指定なし', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '必要なクエリパラメーターがすべて未設定です'
            }));
            expect(response.status).toBe(400);
        });

        test('異常　オペレーターIDが自分以外かつセッションのオペレータータイプが運営メンバー以外', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/999999')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot0) });

            // レスポンスチェック
            expect(response.status).toBe(401);
        });
    });
});
