/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Server } from 'net';
/* eslint-enable */
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import Config from '../common/Config';
import express = require('express');
import pxrSetting = require('./catalog/pxr-setting.json');
const Message = Config.ReadConfig('./config/message.json');

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

    async start () {
        this.server = this.app.listen(3001, () => {});
    }

    async stop () {
        this.server.close(() => {});
    }
})();

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
        await catalogServer.start();
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
        await catalogServer.stop();
    });

    /**
     * ワンタイムログインコード照合
     */
    describe('ワンタイムログインコード照合', () => {
        test('正常', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 0, 'ind_one_time', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222',
                    '{"smsAuth": true}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind_one_time,0'
                );
                INSERT INTO pxr_operator.one_time_login_code
                (
                    code, operator_id, expire_at,
                    created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '999999', 1, '2025-01-27 23:59:59.000',
                    'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind_one_time',
                loginCode: '999999'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('ind_one_time');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常　個人以外', async () => {
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'ind_one_time',
                loginCode: '999999'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('正常　運営メンバー', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 3, 'one_time', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222',
                    '{"smsAuth": true}', false, 'test_user', NOW(), 'test_user', NOW(), 'one_time3'
                );
                INSERT INTO pxr_operator.one_time_login_code
                (
                    code, operator_id, expire_at,
                    created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '888888', 2, '2025-01-27 23:59:59.000',
                    'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'one_time',
                loginCode: '888888'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.onetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(2);
            expect(response.body.loginId).toBe('one_time');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常　運営メンバー以外', async () => {
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind_one_time',
                loginCode: '999999'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.onetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_MANAGE_MEMBER);
        });
        test('以上　リクエストが配列', async () => {
            // 送信データを生成
            var json = [{
                type: 0,
                loginId: 'ind_one_time',
                loginCode: '999999'
            }];

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.onetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_IS_ARRAY);
        });
        test('パラメーター不足　type', async () => {
            // 送信データを生成
            var json = {
                loginId: 'ind02',
                loginCode: '123456'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'type', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター不足　loginId', async () => {
            // 送信データを生成
            var json = {
                type: 0,
                loginCode: '123456'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'loginId', value: null, message: 'この値は空を期待しません' },
                    { property: 'loginId', value: null, message: '文字列ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター不足　loginCode', async () => {
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind02'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'loginCode', value: null, message: '設定できる最短・最長の値の長さが異なっています' },
                    { property: 'loginCode', value: null, message: 'この値は空を期待しません' },
                    { property: 'loginCode', value: null, message: '文字列ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター異常　未登録（loginCode）', async () => {
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind02',
                loginCode: '000000'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.LOGIN_CODE_INVALID);
        });
        test('パラメーター異常　リクエストが配列', async () => {
            // 送信データを生成
            var json = [{
                type: 0,
                loginId: 'ind02',
                loginCode: '000000'
            }];

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_IS_ARRAY);
        });
        test('パラメーター異常　桁数（loginCode）', async () => {
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind02',
                loginCode: '1234567'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'loginCode', value: '1234567', message: '設定できる最短・最長の値の長さが異なっています' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター異常　文字列（loginCode）', async () => {
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind02',
                loginCode: 'a00001'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indOnetimeURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'ワンタイムログインコードが不正です'
            }));
            expect(response.status).toBe(400);
        });
    });
});
