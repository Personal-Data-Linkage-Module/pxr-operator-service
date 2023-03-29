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
/* eslint-enable */

// テストモジュールをインポート
jest.mock('../repositories/postgres/OneTimeLoginCodeRepository', () => {
    let count: number = 0;
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                getOneTimeLoginCodeCount: jest.fn(async () => {
                    return ++count === 1 ? 1 : 0;
                }),
                insertOneTimeLoginCode: jest.fn(async () => {})
            };
        })
    };
});

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

        await catalogServer.start();
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
     * ログイン
     */
    describe('ログイン　異常系', () => {
        test('ライブラリエラー（insertOneTimeLoginCode）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222',
                    '{"smsAuth":true}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
            `);

            // 送信データを生成
            const json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                result: 'onetime',
                twoStepVerificationFlag: false
            }));
            expect(response.status).toBe(200);
        });
    });
});
