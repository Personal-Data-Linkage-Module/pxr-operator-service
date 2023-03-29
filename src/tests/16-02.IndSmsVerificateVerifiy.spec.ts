/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import Config from '../common/Config';
import supertest = require('supertest');
const message = Config.ReadConfig('./config/message.json');
// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();
app.start();

describe('operator API', () => {
    /**
     * 全テスト実行の前処理
     */
    beforeAll(async () => {
        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        // 事前データ登録
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
                2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, '{"member": {"add": true, "update": true, "delete": true}}',
                '{"initialPasswordExpire": "2030-01-01T00:00:00.000+09:00"}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
            );
            INSERT INTO pxr_operator.session
            (
                id, operator_id, expire_at,
                is_disabled, created_by, created_at, updated_by, updated_at
            )
            VALUES
            (
                '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 1, '2025-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            ),
            (
                '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            );
            INSERT INTO pxr_operator.sms_verification_code
            (
                operator_id,
                verification_code,
                verification_code_expiration,
                verification_result,
                created_by,
                updated_by
            )
            VALUES
            (
                2,
                '123456',
                NOW() + INTERVAL '10 MINUTE',
                1,
                'ind01',
                'ind01'
            );
        `);
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // サーバ停止
        app.stop();
    });

    describe('SMS検証コード検証', () => {
        test('正常', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify({
                    smsVerificationCode: '123456'
                }));
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify(
                { result: 'success' }
            ));
        });

        test('パラメータ不足：smsVerificationCode', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({}));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：リクエストが配列', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify([{
                    smsVerificationCode: '123456'
                }]));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：smsVerificationCode（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    smsVerificationCode: null
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：smsVerificationCode（文字列以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    smsVerificationCode: 123456
                }));
            expect(response.status).toBe(400);
        });

        test('対象のSMS検証コードが存在しない', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify({
                    smsVerificationCode: '123456'
                }));
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(message.NOT_EXIST_SMS_VERIFICATION_CODE);
        });

        test('オペレーターが個人以外', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificateVerifiy;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'])
                .send(JSON.stringify({
                    smsVerificationCode: '123456'
                }));
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.NOT_OPERATION_AUTH);
        });
    });
});
