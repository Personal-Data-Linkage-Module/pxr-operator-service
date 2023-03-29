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
import settings = require('./catalog/member-settings.json');
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
                } else if (code === 1000109) {
                    res.json({
                        catalogItem: {
                            ns: 'catalog/ext/test-org/block/data-trader',
                            name: 'Data-Trader-Block',
                            _code: {
                                _value: '1000109',
                                _ver: '1'
                            },
                            inherit: {
                                _value: null,
                                _ver: null
                            },
                            description: 'データ取引サービスプロバイダー用PXR-Blockの定義です。'
                        },
                        template: {
                            _code: {
                                _value: '1000109',
                                _ver: '1'
                            },
                            'actor-type': 'data-trader',
                            'assigned-organization': 'データ取引組織',
                            'assignment-status': 'assigned',
                            'base-url': 'test-org-trader.test.org',
                            'first-login-url': 'https://www.test.org/login',
                            id: 'Data-Trader-01',
                            'service-name': 'test-org-trader-service'
                        },
                        prop: [
                            {
                                key: 'actor-type',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: {
                                        value: [
                                            'pxr-root',
                                            'region-root',
                                            'app',
                                            'wf',
                                            'data-trader',
                                            'consumer'
                                        ]
                                    }
                                },
                                description: 'このPXR-Blockを保有する組織の種別'
                            },
                            {
                                key: 'assigned-organization',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: null
                                },
                                description: '割当アクター名'
                            },
                            {
                                key: 'assignment-status',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: {
                                        value: [
                                            'assigned',
                                            'unassigned'
                                        ]
                                    }
                                },
                                description: '割当状態'
                            },
                            {
                                key: 'base-url',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: null
                                },
                                description: 'PXR-BlockのベースURL'
                            },
                            {
                                key: 'first-login-url',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: null
                                },
                                description: '初回ログインURL'
                            },
                            {
                                key: 'id',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: null
                                },
                                description: 'PXR-Block識別子'
                            },
                            {
                                key: 'service-name',
                                type: {
                                    of: 'string',
                                    cmatrix: null,
                                    format: null,
                                    unit: null,
                                    candidate: null
                                },
                                description: 'PXR-Blockのサービス名'
                            }
                        ],
                        attribute: null
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
            } else if (ns === 'catalog/ext/test-org/setting/actor-own/data-trader/actor_1000020') {
                res.status(200).json(settings).end();
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
        } else if (code === 1000109) {
            this._app.get('/catalog/1000109', _listener);
        }

        this._server = this._app.listen(port);
    }
}

class _StubCatalogServerNotActorOwn {
    _app: express.Express;
    _server: Server;

    constructor (port: number, code: number, status: number) {
        this._app = express();

        // イベントハンドラー
        const _listener = (req: express.Request, res: express.Response) => {
            res.status(200);
            if (code === 1000109) {
                res.json({
                    catalogItem: {
                        ns: 'catalog/ext/test-org/block/data-trader',
                        name: 'Data-Trader-Block',
                        _code: {
                            _value: '1000109',
                            _ver: '1'
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'データ取引サービスプロバイダー用PXR-Blockの定義です。'
                    },
                    template: {
                        _code: {
                            _value: '1000109',
                            _ver: '1'
                        },
                        'actor-type': 'data-trader',
                        'assigned-organization': 'データ取引組織',
                        'assignment-status': 'assigned',
                        'base-url': 'test-org-trader.test.org',
                        'first-login-url': 'https://www.test.org/login',
                        id: 'Data-Trader-01',
                        'service-name': 'test-org-trader-service'
                    },
                    prop: [
                        {
                            key: 'actor-type',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: {
                                    value: [
                                        'pxr-root',
                                        'region-root',
                                        'app',
                                        'wf',
                                        'data-trader',
                                        'consumer'
                                    ]
                                }
                            },
                            description: 'このPXR-Blockを保有する組織の種別'
                        },
                        {
                            key: 'assigned-organization',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: null
                            },
                            description: '割当アクター名'
                        },
                        {
                            key: 'assignment-status',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: {
                                    value: [
                                        'assigned',
                                        'unassigned'
                                    ]
                                }
                            },
                            description: '割当状態'
                        },
                        {
                            key: 'base-url',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: null
                            },
                            description: 'PXR-BlockのベースURL'
                        },
                        {
                            key: 'first-login-url',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: null
                            },
                            description: '初回ログインURL'
                        },
                        {
                            key: 'id',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: null
                            },
                            description: 'PXR-Block識別子'
                        },
                        {
                            key: 'service-name',
                            type: {
                                of: 'string',
                                cmatrix: null,
                                format: null,
                                unit: null,
                                candidate: null
                            },
                            description: 'PXR-Blockのサービス名'
                        }
                    ],
                    attribute: null
                });
            }
            res.end();
        };

        this._app.get('/catalog', (req, res) => {
            const ns = req.query.ns;
            if (ns === 'catalog/ext/test-org/setting/global') {
                res.status(200).json(pxrSetting).end();
            } else if (ns === 'catalog/ext/test-org/setting/actor-own/data-trader/actor_1000020') {
                if (status === 200) {
                    res.status(200).json(settings).end();
                } else {
                    res.status(status).end();
                }
            } else {
                res.status(204).end();
            }
        });

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        if (code === 1000109) {
            this._app.get('/catalog/1000109', _listener);
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
    describe('ログイン', () => {
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
        test('正常（個人2回目(SMS認証なし)）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
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
        test('正常（1回目:成功、2回目失敗後の3回目のログイン）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 送信データを生成
            var successJson = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };
            var failJson = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d9'
            };

            // 1回目のログイン成功
            await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(successJson));
            // 2回目のログイン失敗
            await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(failJson));
            // 3回目のログイン成功
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(successJson));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(1);
            expect(response.body.loginId).toBe('ind01');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常（個人以外）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('データ異常　初期パスワードの有効期限切れ', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    '{"initialPasswordExpire":"2000-01-01 23:59:59.000+0900"}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                );
            `);

            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind02',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.INIT_PASSWORD_EXPIRED);
        });
        test('正常（個人(SMS認証あり)）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 0, 'ind03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222',
                    '{"smsAuth":true}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind030'
                );
            `);

            _smsServer = new _StubSmsServer(3020, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind03',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('onetime');
        });
        test('正常（アプリケーション）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 2, 'アプリケーション', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    '{"_code": {"_value": 41, "_ver": 1}}', false, 'test_user', NOW(), 'test_user', NOW(), 'アプリケーション2'
                );
            `);

            _catalogServer = new _StubCatalogServer(3001, 41, 200);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('アプリケーション');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常（個人）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 41, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'person',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('運営メンバー 携帯電話番号なし', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1000109, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    9, 3, 'mng_menber01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
        });
        test('正常（運営メンバー）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1000109, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, mobile_phone, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    11, 3, 'mng_menber02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}',
                    '{"smsAuth":true}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber02',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('onetime');
        });
        test('正常（運営メンバー、アクター個別設定なし）', async () => {
            // 事前データ準備
            _catalogServer = new _StubCatalogServerNotActorOwn(3001, 1000109, 404);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
        });
        test('パラメーター不足　type', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 送信データを生成
            var json = {
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
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
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 送信データを生成
            var json = {
                type: 3,
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
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
        test('パラメーター不足　hpassword', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'ind01'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'hpassword', value: null, message: 'この値は空を期待しません' },
                    { property: 'hpassword', value: null, message: 'この値はハッシュである必要があります' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター異常　一致しない（hpassword）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '6e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.AUTH_INFO_INVALID);
        });
        test('正常（個人(初回ログイン有効期限内)）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 43);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    10, 0, 'ind04', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    '{"initialPasswordExpire":"2100-12-31 23:59:59.000+0900"}', false, 'test_user', NOW(), 'test_user', NOW(), 'ind040'
                );
            `);

            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind04',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.indLoginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(10);
            expect(response.body.loginId).toBe('ind04');
        });
        test('異常（運営メンバー、アクター個別設定取得時エラー）', async () => {
            _catalogServer = new _StubCatalogServerNotActorOwn(3001, 1000109, 503);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.loginURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(503);
        });
    });
});
