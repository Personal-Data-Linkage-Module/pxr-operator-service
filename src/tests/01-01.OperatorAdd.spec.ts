/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Server } from 'net';
import * as supertest from 'supertest';
import Common, { Url } from './Common';
import { Application } from '../resources/config/Application';
import * as express from 'express';
import Config from '../common/Config';
import pxrSetting = require('./catalog/pxr-setting.json');
import memberAuth = require('./catalog/member.json');
import settings = require('./catalog/settings.json');
import moment = require('moment-timezone');
const Message = Config.ReadConfig('./config/message.json');
const config = Config.ReadConfig('./config/config.json');
/* eslint-enable */

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

// 有効期限
var dt = new Date();
dt.setHours(dt.getHours() + 168);
const expire = moment(dt).tz(config['timezone']).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

// サーバをlisten
app.start();

// スタブサーバー（カタログサービス）
class _StubCatalogServer {
    _app: express.Express;
    _server: Server;

    constructor (port: number, status: number, notTargetNs: string = null, idService: boolean = false) {
        this._app = express();

        // イベントハンドラー
        const _listener = (req: express.Request, res: express.Response) => {
            const _code = parseInt(req.params.code);
            if (status === 200) {
                res.status(200);
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
                        catalogItem: {
                            ns: 'catalog/ext/test-org/block/data-trader',
                            name: 'Data-Trader-Block',
                            _code: {
                                _value: 1000109,
                                _ver: 1
                            },
                            inherit: {
                                _value: 32,
                                _ver: 1
                            },
                            description: 'データ取引サービスプロバイダー用PXR-Blockの定義です。'
                        },
                        template: {
                            _code: {
                                _value: 1000109,
                                _ver: 1
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
            if (ns && ns === notTargetNs) {
                res.status(200).json([]).end();
            }
            if (ns === 'catalog/ext/test-org/setting/global') {
                pxrSetting[0]['template']['use_id_connect'] = idService;
                res.status(200).json(pxrSetting).end();
            } else if (ns === 'catalog/model/auth/member') {
                res.status(200).json(memberAuth).end();
            } else if (ns === 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020') {
                res.status(200).json(settings).end();
            } else if (ns === 'catalog/model/actor/wf/部署/store') {
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
            } else if (ns === 'catalog/model/actor/wf/部署/workflow') {
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
        });

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        this._app.get('/catalog/:code', _listener);
        this._app.get('/catalog/:code/:ver', _listener);

        this._server = this._app.listen(port);
    }
}

let _catalogServer: any;

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
     * 追加
     */
    describe('追加', () => {
        test('データ不足　前提：運営メンバーが1人もいないこと', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                attributes: {
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.MEMBER_NOT_EXISTS);
        });
        test('データ不足　前提：全権持ちの運営メンバーが1人もいないこと', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_ALL_AUTH);
        });
        test('データ不足　前提：権限指定がない', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_ALL_AUTH);
        });
        test('異常（運営メンバー（全権））　カタログには存在しない設定不可の権限', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: true,
                        operator: true
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'カタログに存在しない権限が設定されています'
            }));
            expect(response.status).toBe(400);
        });
        test('正常（運営メンバー（全権））　前提：全権持ちの運営メンバーが1人もいないこと', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: true
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(1);
            expect(response.body.loginId).toBe('mng_menber00');
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.auth).toEqual({
                member: {
                    add: true,
                    update: true,
                    delete: true
                }
            });
        });
        test('データ不足　前提：運営メンバーでログインしていないこと', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                attributes: {
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NO_SESSION);
        });
        test('データ不足　前提：セッション有効期限切れ', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca', 1, '2020-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                attributes: {
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('ヘッダ情報不足', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                attributes: {
                    test: 'テスト'
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(406);
        });
        test('パラメータ不足　type0の時、attributes.initialPasswordExpireが無い', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                attributes: {
                    test: 'テスト'
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '初期パスワード期限日時が必要です。attributesプロパティに設定してください'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　type0の時、pxrIdが無い', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                attributes: {
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'PXR-IDが必須です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　loginId', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                attributes: {
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
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
        test('パラメータ不足　hpassword', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                pxrId: 'test',
                attributes: {
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'パスワードを設定してください'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　type0なのにnameが存在する(name)', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                name: '個人01'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '個人種別のオペレーターの場合、nameプロパティが不要です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　true、false以外(auth)', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    99, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": true, "update": true, "delete": true}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 99, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber0001',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00',
                auth: {
                    member: {
                        add: 1,
                        update: 1,
                        delete: 1
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_INVALID);
        });
        test('パラメータ異常　type0以外の時、pxrIdがある', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                name: '運営メンバー00',
                auth: {
                    member: {
                        add: true,
                        update: true,
                        delete: true
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'PXR-IDを設定することはできません'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　rolesに_valueが無い', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 1,
                loginId: 'wf_staff01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: 'WF職員01',
                roles: [
                    {
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'type', value: 1 },
                    { property: '_value', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　rolesに_verが無い', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 1,
                loginId: 'wf_staff01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: 'WF職員01',
                roles: [
                    {
                        _value: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'type', value: 1 },
                    { property: '_ver', value: null, message: 'この値は必須値です' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('異常（運営メンバーデータが取得できない）　前提：操作権限のある運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth, last_login_at,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    100, 3, 'manage_member100', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー100', '{"member": {"add": true, "update": true, "delete": true}}', null,
                    null, false, 'pxr_user', NOW(), 'pxr_user', NOW(), 'manage_member1003'
                ),
                (
                    101, 3, 'manage_member101', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー101', '{"member": {"add": true, "update": true, "delete": true}}', null,
                    null, true, 'pxr_user', NOW(), 'pxr_user', NOW(), 'manage_member1013'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    'efpbbdtx5aze5mbx3duteufyiup424dfsxepuhbcuwrrnyphux4sz8xh5m3fhubm', 101, '2025-01-27 13:45:57.641',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー01',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + 'efpbbdtx5aze5mbx3duteufyiup424dfsxepuhbcuwrrnyphux4sz8xh5m3fhubm'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.OPERATOR_NOT_EXISTS);
        });
        test('正常（運営メンバー（権限なし））　前提：操作権限のある運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    type, login_id, hpassword, name, auth, last_login_at,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 'manage_member00', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー00', '{"member": {"add": true, "update": true, "delete": true}}', null,
                    null, false, 'pxr_user', NOW(), 'pxr_user', NOW(), 'manage_member003'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00', 1, '2025-01-27 13:45:57.641',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー01',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(3);
            expect(response.body.loginId).toBe('mng_menber01');
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.auth).toEqual({
                member: {
                    add: false,
                    update: false,
                    delete: false
                }
            });
        });
        test('正常（運営メンバー（権限null））　前提：操作権限のある運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber02',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー02'
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(4);
            expect(response.body.loginId).toBe('mng_menber02');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('正常（操作権限持ちの運営メンバーのログイン履歴あり）　前提：操作権限のある運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    type, login_id, hpassword, name, auth, last_login_at,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}', '2025-01-27 13:45:57.641',
                    null, false, 'pxr_user', NOW(), 'pxr_user', NOW(), 'manage_member013'
                );
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e01', 5, '2025-01-27 13:45:57.641',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber03',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー03',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e01'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(6);
            expect(response.body.loginId).toBe('mng_menber03');
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.auth).toEqual({
                member: {
                    add: false,
                    update: false,
                    delete: false
                }
            });
        });
        test('パラメーター異常　登録済みのloginId', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.LOGIN_ID_ALREADY);
        });
        test('パラメーター異常　カタログが存在しない（アプリケーション）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 404);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 43,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CATALOG_GET + '404');
        });
        test('パラメーター異常　カタログサーバーエラー（400）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 400);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 43,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストされたコードのカタログは存在しません(コード値: 43, バージョン: 1)');
        });
        test('パラメーター異常　カタログサーバーエラー（500）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 500);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 43,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CATALOG_GET + '500');
        });
        test('サーバー異常　カタログサービスに接続できない（アプリケーション）', async () => {
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 43,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_CATALOG);
        });
        test('パラメーター異常　ロール定義のカタログ項目コードではない', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション_4',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_ROLE_CATALOG);
        });
        test('正常（アプリケーション）　前提：操作権限のある運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 42,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(7);
            expect(response.body.loginId).toBe('アプリケーション');
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.roles[0]._value).toBe(42);
        });
        test('正常（アプリケーション（IDサービス使用））　前提：操作権限のある運営メンバーでログインしていること。IDサービスに組織情報が存在しないこと', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, null, true);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'application',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 42,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(8);
            expect(response.body.loginId).toBe('application');
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.roles[0]._value).toBe(42);
        });
        test('正常（アプリケーション（IDサービス使用））　前提：操作権限のある運営メンバーでログインしていること。IDサービスに組織情報が存在すること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, null, true);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'application2',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 42,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(9);
            expect(response.body.loginId).toBe('application2');
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.roles[0]._value).toBe(42);
        });
        test('正常（個人（SMS認証あり））　前提：操作権限のある運営メンバーでログインしていること', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'ind02',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test',
                mobilePhone: '09011112222',
                attributes: {
                    smsAuth: true,
                    initialPasswordExpire: expire
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(10);
            expect(response.body.loginId).toBe('ind02');
            expect(response.body.pxrId).toBe('test');
            expect(response.body.mobilePhone).toBe('09011112222');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('異常　アプリケーションのカタログ不備', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 2,
                loginId: 'アプリケーション２',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                roles: [
                    {
                        _value: 1,
                        _ver: 1
                    }
                ]
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NOT_ROLE_CATALOG);
        });
        test('異常　ヘッダーからログイン情報を取得（運営メンバー以外）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.pxrid.ind99',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test.pxrid.ind99',
                mobilePhone: '09011112222',
                attributes: {
                    smsAuth: true,
                    initialPasswordExpire: expire
                }
            };

            const session = JSON.stringify({
                sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
                operatorId: 1,
                type: 1,
                loginId: 'test-user',
                name: 'test-user',
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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常　ヘッダーからログイン情報を取得（追加権限がない）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.pxrid.ind99',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test.pxrid.ind99',
                mobilePhone: '09011112222',
                attributes: {
                    smsAuth: true,
                    initialPasswordExpire: expire
                }
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常　アクターで許可されていない権限', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200, 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020');
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber04',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー04',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

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
                    _value: 999999,
                    _ver: 1
                },
                actor: {
                    _value: 999999,
                    _ver: 1
                }
            });

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.NON_CONFIGURABLE_AUTHORITY);
        });
        test('正常　ヘッダーからログイン情報を取得', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.pxrid.ind99',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                pxrId: 'test.pxrid.ind99',
                mobilePhone: '09011112222',
                attributes: {
                    smsAuth: true,
                    initialPasswordExpire: expire
                }
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(11);
            expect(response.body.loginId).toBe('test.pxrid.ind99');
            expect(response.body.passwordChangedFlg).toBe(false);
        });
        test('権限不足　前提：操作権限のない運営メンバーでログインしていること（false）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 3, '2025-01-27 13:45:57.641',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber02',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー02',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('権限不足　前提：操作権限のない運営メンバーでログインしていること（null）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.session
                (
                    id, operator_id, expire_at,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 3, '2025-01-27 13:45:57.641',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber04',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー04',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('正常　ログイン不可個人の登録（APP）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind101',
                userId: 'test.userid.ind101',
                appCatalogCode: 1000999,
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(12);
            expect(response.body.type).toBe(0);
            expect(response.body.loginId).toBe('test.userid.ind101');
            expect(response.body.userId).toBe('test.userid.ind101');
            expect(response.body.appCatalogCode).toBe(1000999);
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.loginProhibitedFlg).toBe(true);
        });
        test('正常　ログイン不可個人の登録（REGION）', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind102',
                userId: 'test.userid.ind102',
                regionCatalogCode: 1000003,
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(13);
            expect(response.body.type).toBe(0);
            expect(response.body.loginId).toBe('test.userid.ind102');
            expect(response.body.userId).toBe('test.userid.ind102');
            expect(response.body.regionCatalogCode).toBe(1000003);
            expect(response.body.passwordChangedFlg).toBe(false);
            expect(response.body.loginProhibitedFlg).toBe(true);
        });
        test('異常　ログイン不可個人でuserId+appCatalogCodeが重複', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind101',
                userId: 'test.userid.ind101',
                appCatalogCode: 1000999,
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.USER_ID_ALREADY);
        });
        test('異常　ログイン不可個人でloginId+appCatalogCodeが重複', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind101',
                userId: 'test.userid.ind100',
                appCatalogCode: 1000999,
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.LOGIN_ID_ALREADY);
        });
        test('パラメータ異常　個人以外でloginProhibitedFlgが設定されている', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 3,
                loginId: 'mng_menber01',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー01',
                auth: {
                    member: {
                        add: false,
                        update: false,
                        delete: false
                    }
                },
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '個人以外ではログイン禁止フラグを設定することができません'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　loginProhibitedFlgがBoolean以外', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind103',
                userId: 'test.userid.ind103',
                wfCatalogCode: 1000007,
                loginProhibitedFlg: 'a'
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    {
                        property: 'loginProhibitedFlg',
                        value: 'a',
                        message: '真偽値ではありません'
                    }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　loginProhibitedFlgがtrueの時にhpasswordが設定されている', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind100',
                userId: 'test.userid.ind100',
                wfCatalogCode: 1000007,
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'ログイン禁止のオペレーターにパスワードを設定できません'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　userId', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind100',
                wfCatalogCode: 1000007,
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '利用者IDが必要です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足　wfCatalogCode(appCatalogCode)', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind100',
                userId: 'test.userid.ind100',
                loginProhibitedFlg: true
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'リクエストに、appCatalogCodeを含めてください'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　ログイン不可個人以外でuserIdが設定されている', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind100',
                userId: 'test.userid.ind100',
                pxrId: 'test-test',
                appCatalogCode: 1000007,
                loginProhibitedFlg: false,
                attributes: {
                    initialPasswordExpire: expire
                }
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '利用者IDは不要です'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常　ログイン不可個人以外でappCatalogCodeが設定されている', async () => {
            _catalogServer = new _StubCatalogServer(3001, 200);
            // 送信データを生成
            var json = {
                type: 0,
                loginId: 'test.userid.ind100',
                pxrId: 'test-test',
                appCatalogCode: 1000999,
                loginProhibitedFlg: false,
                attributes: {
                    initialPasswordExpire: expire
                }
            };

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

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: 'wfCatalogCode, appCatalogCodeは不要です'
            }));
            expect(response.status).toBe(400);
        });
    });
});
