/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import * as express from 'express';
// eslint-disable-next-line no-unused-vars
import { Server } from 'net';
import Config from '../common/Config';
import pxrSetting = require('./catalog/pxr-setting.json');
import pxrSetting_gen0 = require('./catalog/pxr-setting_gen0.json');
import memberAuth = require('./catalog/member.json');
import settings = require('./catalog/settings.json');
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

// スタブサーバー（カタログサービス）
class _StubCatalogServer {
    _app: express.Express;
    _server: Server;

    constructor (port: number, code: number, status: number, idService: boolean = false) {
        this._app = express();

        // イベントハンドラー
        const _listener = (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200);
                const _code = parseInt(req.params.code);
                const _ns = req.query.ns;
                if (_code === 43) {
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
                } else if (_code === 1) {
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
                } else if (_code === 41) {
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
                } else if (_code === 42) {
                    res.json({
                        catalogItem: {
                            ns: 'catalog/ext/test-org/actor/app/actor_1000020/application',
                            name: 'アプリケーション',
                            _code: {
                                _value: 42,
                                _ver: 1
                            },
                            inherit: {
                                _value: null,
                                _ver: null
                            },
                            description: 'アプリケーションの定義です。'
                        },
                        template: {
                            redirect_url: 'https://xxxxxxxx/xxxxxxx/'
                        }
                    });
                } else if (_code === 1000109) {
                    res.json({
                        "catalogItem": {
                            "ns": "catalog/ext/test-org/block/data-trader",
                            "name": "Data-Trader-Block",
                            "_code": {
                                "_value": 1000109,
                                "_ver": 1
                            },
                            "inherit": {
                                "_value": 32,
                                "_ver": 1
                            },
                            "description": "データ取引サービスプロバイダー用PXR-Blockの定義です。"
                        },
                        "template": {
                            "_code": {
                                "_value": 1000109,
                                "_ver": 1
                            },
                            "actor-type": "data-trader",
                            "assigned-organization": "データ取引組織",
                            "assignment-status": "assigned",
                            "base-url": "test-org-trader.test.org",
                            "first-login-url": "https://www.test.org/login",
                            "id": "Data-Trader-01",
                            "service-name": "test-org-trader-service"
                        },
                        "prop": [
                            {
                                "key": "actor-type",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": {
                                        "value": [
                                            "pxr-root",
                                            "region-root",
                                            "app",
                                            "wf",
                                            "data-trader",
                                            "consumer"
                                        ]
                                    }
                                },
                                "description": "このPXR-Blockを保有する組織の種別"
                            },
                            {
                                "key": "assigned-organization",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": null
                                },
                                "description": "割当アクター名"
                            },
                            {
                                "key": "assignment-status",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": {
                                        "value": [
                                            "assigned",
                                            "unassigned"
                                        ]
                                    }
                                },
                                "description": "割当状態"
                            },
                            {
                                "key": "base-url",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": null
                                },
                                "description": "PXR-BlockのベースURL"
                            },
                            {
                                "key": "first-login-url",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": null
                                },
                                "description": "初回ログインURL"
                            },
                            {
                                "key": "id",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": null
                                },
                                "description": "PXR-Block識別子"
                            },
                            {
                                "key": "service-name",
                                "type": {
                                    "of": "string",
                                    "cmatrix": null,
                                    "format": null,
                                    "unit": null,
                                    "candidate": null
                                },
                                "description": "PXR-Blockのサービス名"
                            }
                        ],
                        "attribute": null
                    });
                } else if (_ns === 'catalog/model/auth/member') {
                    res.json([
                        {
                            catalogItem: {
                                _code: {
                                    _value: 139,
                                    _ver: 1
                                }
                            },
                            template: {
                                'auth-name': 'add'
                            }
                        },
                        {
                            catalogItem: {
                                _code: {
                                    _value: 140,
                                    _ver: 1
                                }
                            },
                            template: {
                                'auth-name': 'update'
                            }
                        },
                        {
                            catalogItem: {
                                _code: {
                                    _value: 141,
                                    _ver: 1
                                }
                            },
                            template: {
                                'auth-name': 'delete'
                            }
                        }
                    ]);
                }
            } else if (status !== 200) {
                res.status(status);
            }
            res.end();
        };

        this._app.get('/catalog', (req, res) => {
            if (code === 2) {
                const ns = req.query.ns;
                if (ns === 'catalog/ext/test-org/setting/global') {
                    res.status(200).json(pxrSetting_gen0).end();
                } else if (ns === 'catalog/model/auth/member') {
                    res.status(200).json(memberAuth).end();
                } else if (ns === 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020') {
                    res.status(200).json(settings).end();
                } else {
                    res.status(204).end();
                }
            } else {
                const ns = req.query.ns;
                if (ns === 'catalog/ext/test-org/setting/global') {
                    pxrSetting[0]['template']['use_id_connect'] = idService;
                    res.status(200).json(pxrSetting).end();
                } else if (ns === 'catalog/model/auth/member') {
                    res.status(200).json(memberAuth).end();
                } else if (ns === 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020') {
                    res.status(200).json(settings).end();
                } else if (ns === 'catalog/model/actor/wf/テスト用リージョンステートメントC/store') {
                    res.status(200);
                    res.json([
                        {
                            catalogItem: {
                                _code: {
                                    _value: 43,
                                    _var: 1
                                }
                            },
                            template: {
                                store: [
                                    {
                                        role: [
                                            {
                                                _value: 43,
                                                _ver: 1
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]);
                    res.end();
                } else if (ns === 'catalog/model/actor/wf/テスト用リージョンステートメントC/workflow') {
                    res.status(200);
                    res.json([
                        {
                            catalogItem: {
                                _code: {
                                    _value: 43,
                                    _var: 1
                                }
                            },
                            template: {
                                store: [
                                    {
                                        _value: 43,
                                        _ver: 1
                                    }
                                ]
                            }
                        }
                    ]);
                    res.end();
                } else {
                    res.status(204).end();
                }
            }
        });

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        this._app.get('/catalog/:code', _listener);
        this._app.get('/catalog/:code/:ver', _listener);

        this._server = this._app.listen(port);
    }
}

// スタブサーバー
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
        // DB切断
        // await common.disconnect();
    });

    /**
     * 更新
     */
    describe('更新', () => {
        test('パラメーター不足　operetorId', async () => {
            // 送信データを生成
            var json = {};

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(404);
        });
        test('パラメーター異常　空文字（loginId）', async () => {
            // 送信データを生成
            var json = {
                loginId: ''
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'loginId', value: null, message: 'この値は空を期待しません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター異常　空文字（loginId）', async () => {
            // 送信データを生成
            var json = {
                loginProhibitedFlg: true,
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'ログイン禁止に更新する場合、パスワードは不要です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター不足　newHpasswordがあるのにhpasswordが無い', async () => {
            // 送信データを生成
            var json = {
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '現在のパスワード、新しいパスワードがどちらか存在する場合には、どちらとも必要です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター不足　hpasswordがあるのにnewHpasswordが無い', async () => {
            // 送信データを生成
            var json = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '現在のパスワード、新しいパスワードがどちらか存在する場合には、どちらとも必要です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメーター異常　newHpasswordがnull', async () => {
            // 送信データを生成
            var json = JSON.stringify({
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: ''
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(json);

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'newHpassword', value: null, message: 'この値は空を期待しません' },
                    { property: 'newHpassword', value: null, message: 'この値はハッシュである必要があります' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　rolesに_verが無い', async () => {
            // 送信データを生成
            var json = {
                roles: [
                    {
                        _value: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: '_ver', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　rolesに_valueが無い', async () => {
            // 送信データを生成
            var json = {
                roles: [
                    {
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: '_value', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('正常（個人）　前提：操作権限のある運営メンバーでログインしていること。更新対象のオペレーターが登録されているいて権限があること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
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
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 1, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 送信データを生成
            var json = {
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    initialPasswordExpire: '2030-01-01T00:00:00.000+09:00',
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('ind01_update');
            expect(response.body.passwordChangedFlg).toBe(true);
        });
        test('異常（更新実行者のセッションが有効でない）　前提：操作権限のある運営メンバーでログインしていること。更新対象のオペレーターが登録されていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
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
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 送信データを生成
            var json = {
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.SESSION_INVALID);
        });
        test('異常（更新実行者のセッションが有効期限切れ）　前提：操作権限のある運営メンバーでログインしていること。更新対象のオペレーターが登録されていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 1, '2020-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 送信データを生成
            var json = {
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('異常（更新実行者のセッションが有効期限切れ）　前提：更新対象者自身でログインしていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca', 2, '2020-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 送信データを生成
            var json = {
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('正常（個人）　前提：操作権限のある運営メンバーでログインしていること。更新対象のオペレーターが登録されていること。携帯電話があること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
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
                    id, type, login_id, hpassword, name, auth, mobile_phone,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}', '09011112222',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,'09011112223',
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
                );
            `);
            // 送信データを生成
            var json = {
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('ind01_update');
            expect(response.body.passwordChangedFlg).toBe(true);
        });
        test('正常（個人）　前提：操作権限のある運営メンバーでログインしていること。更新対象のオペレーターが登録されていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
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
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('ind01_update');
            expect(response.body.passwordChangedFlg).toBe(true);
        });
        test('パラメータ異常（運営メンバー以外でauthがある）', async () => {
            // 送信データを生成
            var json = {
                loginId: 'ind01_update2',
                auth: {
                    member: {
                        add: true
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_INVALID);
        });
        test('パラメーター異常　更新対象のオペレーターが存在しない　前提：操作権限のある運営メンバーでログインしていること。', async () => {
            // 送信データを生成
            var json = {
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    smsAuth: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/9999')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.OPERATOR_NOT_EXISTS);
        });
        test('パラメーター異常　一致しない（hpassword）', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                );
            `);

            // 送信データを生成
            var json = {
                hpassword: '4e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d6',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/3')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOW_PASSWORD_INVALID);
        });
        test('パラメーター異常　type0の時に存在する（name）', async () => {
            // 送信データを生成
            var json = {
                name: '個人',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/3')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_INVALID);
        });
        test('パラメーター異常　既に登録されている（loginId）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    4, 0, 'ind03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind030'
                );
            `);

            // 送信データを生成
            var json = {
                loginId: 'ind03'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.LOGIN_ID_ALREADY);
        });
        test('パラメーター異常　type3の時にtrue、false以外（auth.add）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                auth: {
                    member: {
                        add: 1,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_INVALID);
        });
        test('パラメーター異常　type3の時にtrue、false以外（auth.update）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                auth: {
                    member: {
                        add: false,
                        update: 1,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_INVALID);
        });
        test('パラメーター異常　type3の時にtrue、false以外（auth.delete）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: 1
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_INVALID);
        });
        test('パラメーター異常　authが全権限設定以外で他の全権限設定の運営オペレーターが存在しなくなる', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_ANOTHER_ALL_AUTH_MEMBER);
        });
        test('パラメーター異常　ロール定義のカタログ項目コードではない', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    5, 2, 'application', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    '{"_code": {"_value": 41, "_ver": 1}}', false, 'test_user', NOW(), 'test_user', NOW(), 'application,2'
                ),
                (
                    6, 2, 'application_2', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'application_2', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'application_22'
                );
            `);

            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_ROLE_CATALOG);
        });
        test('パラメーター異常　存在しないカタログ（APP）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 43, 404);
            // 送信データを生成
            var json = {
                name: 'application_2',
                roles: [
                    {
                        _value: 43,
                        _ver: 2
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CATALOG_GET + '404');
        });
        test('サーバー異常　カタログサービスに接続できない（APP）', async () => {
            // 送信データを生成
            var json = {
                name: 'application_2',
                roles: [
                    {
                        _value: 43,
                        _ver: 2
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_CATALOG);
        });
        test('正常（アプリケーション）　前提：更新対象のアプリケーション職員が登録されていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 42, 200);
            // 送信データを生成
            var json = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                name: 'アプリケーション_更新',
                roles: [
                    {
                        _value: 42,
                        _ver: 1
                    }
                ],
                attributes: {
                    test: '更新'
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('アプリケーション_更新');
            expect(response.body.roles[0]._value).toBe(42);
            expect(response.body.passwordChangedFlg).toBe(true);
        });
        test('正常（アプリケーション（IDサービス使用））　前提：更新対象のアプリケーション職員が登録されていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 42, 200, true);
            // 送信データを生成
            var json = {
                name: 'アプリケーション_更新_IDサービス',
                roles: [
                    {
                        _value: 42,
                        _ver: 1
                    }
                ],
                attributes: {
                    test: '更新'
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.name).toBe('アプリケーション_更新_IDサービス');
            expect(response.body.roles[0]._value).toBe(42);
            expect(response.body.passwordChangedFlg).toBe(true);
        });
        test('異常（アプリケーション）　対象のカタログが存在しない', async () => {
            _catalogServer = new _StubCatalogServer(3001, 41, 200);
            // 送信データを生成
            var json = {
                name: 'アプリケーション_更新',
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    },
                ],
                attributes: {
                    test: '更新'
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_ROLE_CATALOG);
        });
        test('権限不足　前提：操作権限のない運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    7, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": false, "update": false, "delete": false}}',
                    '{"key": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    9999, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": false, "update": false, "delete": false}}',
                    '{"key": "test"}', true, 'test_user', NOW(), 'test_user', NOW(), '9999'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 7, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '1', 9999, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                name: 'WF職員01更新'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('正常（運営メンバー）　前提：更新対象の運営メンバーが登録されていること。', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                loginId: 'manage_member02_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                name: '運営メンバー02_更新',
                auth: {
                    member: {
                        add: true,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('manage_member02_update');
            expect(response.body.passwordChangedFlg).toBe(true);
            expect(response.body.auth).toEqual({
                member: {
                    add: true,
                    update: false,
                    delete: false
                }
            });
        });
        test('正常（運営メンバー（authの更新無し））', async () => {
            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update2'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('manage_member02_update2');
            expect(response.body.auth).toEqual({
                member: {
                    add: true,
                    update: false,
                    delete: false
                }
            });
        });
        test('正常（運営メンバー（更新権限無し、自分を更新））', async () => {
            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update3'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('manage_member02_update3');
        });
        test('権限不足（運営メンバー（更新権限無し、自分を更新）） authを更新', async () => {
            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update4',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: true
                    }
                }
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.AUTH_CANT_UPDATED);
        });
        test('正常　ヘッダーからログイン情報を取得（自分以外）', async () => {
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

            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update3'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('manage_member02_update3');
        });
        test('正常　ヘッダーからログイン情報を取得（自分）', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 7,
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

            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update4'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.loginId).toBe('manage_member02_update4');
        });
        test('異常　ヘッダーからログイン情報を取得（運営メンバー以外）', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 3,
                type: 0,
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

            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update5'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常　ヘッダーからログイン情報を取得（運営メンバーだけど更新権限が無い）', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 2,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: false,
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

            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update5'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常　ヘッダー情報不足', async () => {
            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 2,
                type: 3,
                loginId: 'test-user',
                name: 'test-user',
                mobilePhone: '0311112222',
                auth: {
                    member: {
                        add: true,
                        update: false,
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

            // 送信データを生成
            var json = JSON.stringify({
                loginId: 'manage_member02_update5'
            });

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/7')
                .set({ accept: 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(json);

            // レスポンスチェック
            expect(response.status).toBe(406);
        });
        test('異常　更新実行者のオペレーターレコードが存在しない', async () => {
            const response = await supertest(expressApp)
                .put(Url.updateURI + '/7')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=1'])
                .send({
                    loginId: 'manage_member02_update4'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 401,
                message: '対象のオペレーターが存在しません'
            }));
            expect(response.status).toBe(401);
        });
        test('正常　ログイン不可個人のloginIdを変更', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);

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

            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, pxr_id, wf_catalog_code, login_prohibited_flg,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    8, 0, 'test_user01', 'test_user01', 1000007, true,
                    '{"key": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'test_user010'
                );
            `);

            // 送信データを生成
            var json = {
                loginId: 'test_user001'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/8')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(8);
            expect(response.body.type).toBe(0);
            expect(response.body.loginId).toBe('test_user001');
        });
        test('正常　ログイン不可個人のloginProhibitedFlgを変更', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);

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

            // 送信データを生成
            var json = {
                newHpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                loginProhibitedFlg: false
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/8')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: 8,
                type: 0,
                loginId: 'test_user001',
                pxrId: 'test_user01',
                passwordChangedFlg: false,
                attributes: {
                    key: 'test'
                }
            }));
            expect(response.status).toBe(200);
        });
        test('正常　ログイン不可個人のloginProhibitedFlgを変更', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);

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

            // 送信データを生成
            var json = {
                loginProhibitedFlg: true
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/8')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: 8,
                type: 0,
                loginId: 'test_user001',
                pxrId: 'test_user01',
                passwordChangedFlg: false,
                attributes: {
                    key: 'test'
                }
            }));
            expect(response.status).toBe(200);
        });
        test('異常　ログイン不可な個人のパスワード変更', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);

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

            // 送信データを生成
            var json = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/8')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'ログイン不可のオペレーターにパスワードは設定できません'
            }));
            expect(response.status).toBe(400);
        });
        test('異常　アプリケーションをログイン不可に変更', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name,
                    is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    9, 2, 'application_001', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'アプリケーション001',
                    false, 'test_user', NOW(), 'test_user', NOW(), 'application_0012'
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

            // 送信データを生成
            var json = {
                loginProhibitedFlg: true
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/9')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'ログイン不可フラグは個人のみ変更可能です'
            }));
            expect(response.status).toBe(400);
        });
        test('異常　WFをログイン可能に変更時パスワードを設定していない', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, name, login_prohibited_flg,
                    is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    10, 0, 'ind02', '個人02', true,
                    false, 'test_user', NOW(), 'test_user', NOW(), 'ind02,0,,,,true'
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

            // 送信データを生成
            var json = {
                loginProhibitedFlg: false
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/10')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'ログインを許可する場合、パスワードは必要です'
            }));
            expect(response.status).toBe(400);
        });
        test('異常　パラメーター不正', async () => {
            // 送信データを生成
            var json = {
                loginProhibitedFlg: true,
                hpassword: 'aaaaaa',
                newHpassword: 'aaaaaa'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('異常　パラメーター不正', async () => {
            // 送信データを生成
            var json = {
                loginProhibitedFlg: false,
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/6')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('異常　パスワードに歴代と同じものを指定', async () => {
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var successJson1 = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };
            var successJson2 = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d1'
            };
            var failJson = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d1',
                newHpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };

            await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(successJson1));
            await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(successJson2));
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(failJson));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '過去に使用されたパスワードです'
            }));
            expect(response.status).toBe(400);
        });
        test('正常　世代管理数が0のため同パスワードでも更新可能', async () => {
            _catalogServer = new _StubCatalogServer(3001, 2, 200);
            // 送信データを生成
            var json = {
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d1',
                newHpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            };
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
        });
        test('正常　全権限が存在する為、更新可能', async () => {
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    99, 3, 'manage_member99', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー99', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member993'
                );
            `);
            _catalogServer = new _StubCatalogServer(3001, 1, 200);
            // 送信データを生成
            var json = {
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
        });
        test('正常（IDサービス使用）：リクエストにconfigの設定値が使用されている', async () => {
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
                    5, 2, 'application', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    '{"_code": {"_value": 41, "_ver": 1}}', false, 'test_user', NOW(), 'test_user', NOW(), 'application2'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '234a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12', 5, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            _catalogServer = new _StubCatalogServer(3001, 42, 200, true);
            // 送信データを生成
            var json = {
                name: 'アプリケーション_更新_IDサービス',
                roles: [
                    {
                        _value: 42,
                        _ver: 1
                    }
                ],
                attributes: {
                    test: '更新'
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/5')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '234a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e12'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
        });
    });
});
