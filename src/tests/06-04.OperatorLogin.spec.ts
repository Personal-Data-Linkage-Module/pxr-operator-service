/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import * as express from 'express';
import { Server } from 'net';
import Config from '../common/Config';
import pxrSetting = require('./catalog/pxr-setting.json');
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

// スタブサーバー（SMSサービス）
class _StubSmsServer {
    _app: express.Express;
    _server: Server;

    constructor (port: number, status: number) {
        this._app = express();

        // イベントハンドラー
        const _listener = (req: express.Request, res: express.Response) => {
            res.status(status);
            res.end();
        };

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        this._app.post('/sms/sendBulkSms/request', _listener);
        this._server = this._app.listen(port);
    }
}

// スタブサーバー（カタログサービス）
class _StubCatalogServer {
    _app: express.Express;
    _server: Server;

    constructor (port: number, code: number, status: number) {
        this._app = express();

        // イベントハンドラー
        const _listener = (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200);
                if (code === 43) {
                    res.json({
                        catalogItem: {
                            ns: 'catalog/model/actor/wf/部署/role',
                            name: 'ワークフロー職員ロール',
                            _code: {
                                _value: '43',
                                _ver: '1'
                            },
                            inherit: {
                                _value: null,
                                _ver: null
                            },
                            description: 'ワークフロー職員が持つロールの定義です。'
                        }
                    });
                } else if (code === 1) {
                    res.json({
                        catalogItem: {
                            ns: 'catalog/model/format',
                            name: 'GPGGA形式',
                            _code: {
                                _value: '1',
                                _ver: '1'
                            },
                            inherit: {
                                _value: null,
                                _ver: null
                            },
                            description: '位置の値フォーマット（$GPGGA,m1,m2,c1,m3,c2,d1,d2,f1,f2,M,f3,M,f4,d3*cc形式）の定義です。'
                        }
                    });
                } else if (code === 41) {
                    res.json({
                        catalogItem: {
                            ns: 'catalog/model/actor/app/application',
                            name: 'アプリケーション',
                            _code: {
                                _value: '41',
                                _ver: '1'
                            },
                            inherit: {
                                _value: null,
                                _ver: null
                            },
                            description: 'アプリケーションの定義です。'
                        }
                    });
                }
            } else if (status !== 200) {
                res.status(status);
            }
            res.end();
        };

        this._app.get('/catalog', (req, res) => {
            const ns = req.query.ns;
            if (ns === 'catalog/ext/test-org/setting/global') {
                res.status(200).json(pxrSetting).end();
            } else {
                res.status(204).end();
            }
        });

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        if (code === 43) {
            this._app.get('/catalog/43/1', _listener);
        } else if (code === 1) {
            this._app.get('/catalog/1/1', _listener);
        } else if (code === 41) {
            this._app.get('/catalog/41/1', _listener);
        }

        this._server = this._app.listen(port);
    }
}

// スタブサーバー
let _smsServer: any;
let _catalogServer: any;

// サーバをlisten
app.start();

/**
 * operator API のユニットテスト
 */
describe('operator API', () => {
    // 既定のprocess.envを保存
    const OLD_ENV = process.env;
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
        // process.env.NODE_ENVを変更
        process.env = { ...OLD_ENV };
        process.env.NODE_ENV = 'production';
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
        // process.envを既定に戻す
        process.env = OLD_ENV;
    });

    /**
     * 各テスト実行後の後処理
     */
    afterEach(async () => {
        // スタブサーバー停止
        if (_catalogServer) {
            _catalogServer._server.close();
            _catalogServer = null;
        }
        if (_smsServer) {
            _smsServer._server.close();
            _catalogServer = null;
        }
    });

    /**
     * ログイン
     */
    describe('NODE_ENVがproduction時のログイン', () => {
        test('正常（個人(SMS認証なし)）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone, last_login_at,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
            `);

            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('ind01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
    });
});
