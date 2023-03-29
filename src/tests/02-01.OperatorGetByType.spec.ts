/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Common, { Url } from './Common';
import { Application } from '../resources/config/Application';
import { Session } from './Session';
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
        // DB切断
        // await common.disconnect();
        // サーバ停止
        app.stop();
    });

    /**
     * 取得（種別指定）
     */
    describe('取得（種別指定）', () => {
        test('異常　パラメーター不足', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?loginId=manage01')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('正常　前提：対象種別のオペレーターが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, name, auth, last_login_at,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid', '運営メンバー01', '{"add": true, "update": true, "delete": true}', '2020-01-15 23:59:59.000',
                    '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body[0].operatorId).toBe(1);
            expect(response.body[0].loginId).toBe('manage_member01');
            expect(response.body[0].passwordChangedFlg).toBe(false);
        });
        test('正常　前提：対象種別のオペレーターが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, name, auth, last_login_at,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid', '運営メンバー02', NULL, '2020-01-15 23:59:59.000',
                    '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body[1].operatorId).toBe(4);
            expect(response.body[1].loginId).toBe('manage_member02');
            expect(response.body[1].passwordChangedFlg).toBe(false);
        });
        test('正常　リクエストがpxrIDのみ', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 2, 'app02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'aaa', 'app02',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app022'
                ),
                (
                    6, 2, 'app06', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'app06',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app062'
                );
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version, is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    2, 16, 1, false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    2, 17, 1, false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    2, 21, 1, false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    6, 16, 2, false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?pxrId=aaa')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(2);
            expect(response.body.roles[0]._value).toBe(16);
            expect(response.body.roles[1]._value).toBe(17);
            expect(response.body.roles[2]._value).toBe(21);
        });
        test('正常　前提：対象種別のオペレーター+ロールが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, name,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    5, 2, 'app05', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'app05',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'app052'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=2')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body[1].operatorId).toBe(5);
            expect(response.body[1].loginId).toBe('app05');
        });
        test('正常　前提：対象種別のオペレーターが登録済みであること', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid', '09011112222',
                    '{"smsAuth": true}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=0')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body[0].operatorId).toBe(3);
            expect(response.body[0].mobilePhone).toBe('09011112222');
        });
        test('正常　前提：対象種別+ログインIDのオペレーターが登録済みであること', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3&loginId=manage_member01')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
        });
        test('正常　セッション情報をcookie0から取得', async () => {
            // 事前データ準備(セッションテーブルデータ追加)
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
                .get(Url.getURI + '/?type=3&loginId=manage_member01')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type0_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
        });
        test('正常　セッション情報をcookie2から取得', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3&loginId=manage_member01')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type2_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
        });
        test('正常　セッション情報をcookie3から取得', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3&loginId=manage_member01')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type3_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('manage_member01');
        });

        test('データ不足　オペレーターが登録されていない種別を指定', async () => {
            await common.executeSqlString(`
                DELETE FROM pxr_operator.role_setting WHERE operator_id = 2 OR operator_id = 6;
            `);
            await common.executeSqlString(`
                DELETE FROM pxr_operator.operator WHERE type = 2;
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=2')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(204);
        });
        test('データ不足　登録されていないログインIDを指定', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3&loginId=manage_member00')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(204);
        });
        test('パラメータ異常　種別の指定なし', async () => {
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
        test('パラメータ異常　種別が数字でない', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=a')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'type', value: 'a', message: '数値ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　種別が範囲外', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=4')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.OUT_OF_SCOPE);
        });
        test('パラメータ異常　種別が空', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRoot) });

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'type', value: null, message: '数値ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('異常　未ログイン(セッション情報なし)', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.UNAUTHORIZED);
        });

        test('異常　type指定でオペレーターが運営メンバー以外', async () => {
            // 事前データ準備(セッションテーブルデータ追加)
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e99', 3, '2030-12-31T00:00:00.000+0000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type0_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e99']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });

        test('異常　type、loginId指定でオペレーターが運営メンバー以外', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?type=3&loginId=manage_member01')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type0_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e99']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });

        test('異常　pxrId指定でオペレーターが運営メンバー以外', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp)
                .get(Url.getURI + '/?pxrId=test.pxrid2')
                .set({
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                })
                .set('Cookie', ['operator_type0_session=437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e99']);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
    });
});
