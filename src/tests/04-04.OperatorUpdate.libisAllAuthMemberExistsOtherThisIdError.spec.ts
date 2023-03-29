/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Server } from 'net';
import { Connection } from 'typeorm';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
/* eslint-enable */
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import express = require('express');
import pxrSetting = require('./catalog/pxr-setting.json');
import memberAuth = require('./catalog/member.json');
import settings = require('./catalog/settings.json');

// テストモジュールをインポート
jest.mock('../repositories/postgres/OperatorRepository', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                getRecordFromId: jest.fn(async (operatorId: number): Promise<OperatorEntity> => {
                    if (operatorId === 1) {
                        const results: OperatorEntity = new OperatorEntity({
                            id: 1,
                            type: 3,
                            login_id: 'manage_member01',
                            hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                            auth: JSON.stringify({
                                member: {
                                    add: true,
                                    delete: true,
                                    update: true
                                }
                            })
                        });
                        return results;
                    } else {
                        const results: OperatorEntity = new OperatorEntity({
                            id: 2,
                            type: 3,
                            login_id: 'manage_member02',
                            name: '運営メンバー02',
                            hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                        });
                        return results;
                    }
                }),
                getRecordCountFromLoginId: jest.fn(async (type: number, loginId: string): Promise<number> => {
                    return 0;
                }),
                isAllAuthMemberExistsOtherThisId: jest.fn(async (operatorId: number): Promise<number> => {
                    throw new Error('Unit Test DB Error');
                })
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

// スタブサーバー（カタログサービス）
class _StubCatalogServer {
    _app: express.Express;
    _server: Server;

    constructor (port: number, code: number, status: number) {
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
            if (ns === 'catalog/ext/test-org/setting/global') {
                res.status(200).json(pxrSetting).end();
            } else if (ns === 'catalog/model/auth/member') {
                res.status(200).json(memberAuth).end();
            } else if (ns === 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020') {
                res.status(200).json(settings).end();
            } else {
                res.status(204).end();
            }
        });

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        this._app.get('/catalog/:code/:ver', _listener);

        this._server = this._app.listen(port);
    }
}

/**
 * operator API のユニットテスト
 */
describe('operator API', () => {
    /**
     * 全テスト実行前の処理
     */
    let _catalogServer: _StubCatalogServer;
    beforeAll(async () => {
        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        _catalogServer = new _StubCatalogServer(3001, 1, 200);
    });
    /**
     * 全テスト実行後の処理
     */
    afterAll(async () => {
        // DB切断
        // await common.disconnect();

        // サーバ停止
        app.stop();
        _catalogServer._server.close();
    });

    /**
     * 更新
     */
    describe('更新 異常系', () => {
        test('ライブラリエラー（isAllAuthMemberExistsOtherThisId）', async () => {
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
                    2, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
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
                loginId: 'manage_member02_up',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                auth: {
                    add: true,
                    update: false,
                    delete: false
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.updateURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('次のネームスペースのカタログは存在しません(ネームスペース: catalog/model/auth/add)');
        });
    });
});
