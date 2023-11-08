/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from '../resources/config/Application';
import { clear } from './11-00.Data';
import { CatalogServer, CatalogServer2 } from './StubServer';
import Common from './Common';
import { Session } from './Session';
import Config from '../common/Config';
import supertest = require('supertest');
const Message = Config.ReadConfig('./config/message.json');

jest.mock('../common/Config', () => ({
    ...jest.requireActual('../common/Config') as any,
    default: {
        ReadConfig: jest.fn((path: string) => {
            const fs = require('fs');
            if (path === './config/config.json') {
                return {
                    session_expire: 168,
                    login_code_expire: 10,
                    initial_password_expire: 7,
                    cookie_base_name: 'operator_type%s_session',
                    catalog_url: 'http://localhost:3001/catalog',
                    catalog_ext_name: 'test-org',
                    ca_url: 'http://localhost:3012/certification-authority',
                    block: {
                        _value: 1000109,
                        _ver: 1
                    },
                    actor: {
                        _value: 1000020,
                        _ver: 1
                    },
                    corePerThread: 1,
                    sms: {
                        countryCode: '+81-'
                    },
                    smsVerification: {
                        expiration: {
                            type: 'minute',
                            value: 10
                        },
                        message: 'Your code is %s'
                    },
                    session: {
                        expiration: {
                            type: 'hour',
                            value: 3
                        },
                        timeLeft: {
                            type: 'minute',
                            value: 30
                        }
                    },
                    userInfoCatalogCode: 1000373,
                    timezone: 'Asia/Tokyo',
                    csrf_check_url: 'http://localhost:3000/operator/csrf/check',
                    csrf_get_url: 'http://localhost:3000/operator/csrf/token',
                    headersPattern: {
                        external: [
                            {
                                key: 'host',
                                value: '.+\\.pxrsrc\\.me\\.uk$'
                            },
                            {
                                key: 'x-amzn-trace-id',
                                value: '^[a-zA-Z]+=[0-9]-[a-f0-9]{8}-[a-f0-9]{24}$'
                            }
                        ],
                        betweenBlocks: [
                            {
                                key: 'host',
                                value: '^(root|external|application[0-9]{6}|consumer[0-9]{6}|region[0-9]{6}|trader[0-9]{6})-service$'
                            }
                        ],
                        withinBlock: [
                            {
                                key: 'host',
                                value: '^(localhost|127\\.0\\.0\\.1)(|:[0-9]{4,5})$'
                            }
                        ]
                    }
                };
            } else {
                return JSON.parse(fs.readFileSync(path, 'UTF-8'));
            }
        })
    }
}));

const app = new Application();
const expressApp = app.express.app;
const common = new Common();

app.start();

let catalogServer = null;

describe('User Info API', () => {
    beforeAll(async () => {
        await clear();
        await common.connect();
        await common.executeSqlFile('initialData.sql');
    });
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    afterEach(async () => {
        // スタブを停止
        if (catalogServer) {
            await catalogServer.stop();
            catalogServer = null;
        }
    });
    afterAll(async () => {
        // DB切断
        await common.disconnect();
        if (catalogServer) {
            await catalogServer.stop();
        }
        app.stop();
    });

    describe('利用者情報API GET | POST | DELETE: /operator/user/info', () => {
        test('新しくオペレーターを作成(運営)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    name: '流通制御運営メンバー01',
                    auth: {
                        member: {
                            add: true,
                            update: true,
                            delete: true
                        }
                    },
                    attributes: null,
                    roles: [
                        {
                            _value: 1,
                            _ver: 1
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: 1,
                type: 3,
                loginId: 'root_member01',
                name: '流通制御運営メンバー01',
                auth: { member: { add: true, update: true, delete: true } },
                passwordChangedFlg: false,
                attributes: {},
                roles: [{ _value: 1, _ver: 1 }]
            }));
            expect(response.status).toBe(200);
        });
        let sessionId = '';
        let session = '';
        test('ログイン(運営)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                sessionId: response.body.sessionId,
                operatorId: 1,
                type: 3,
                loginId: 'root_member01',
                name: '流通制御運営メンバー01',
                auth: { member: { add: true, update: true, delete: true } },
                lastLoginAt: response.body.lastLoginAt,
                passwordChangedFlg: false,
                loginProhibitedFlg: false,
                attributes: {},
                roles: [{ _value: 1, _ver: 1 }],
                block: { _value: 1000109, _ver: 1 },
                actor: { _value: 1000020, _ver: 1 }
            }));
            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
            session = encodeURIComponent(JSON.stringify(response.body));
        });
        test('新しくオペレーターを作成(個人)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    type: 0,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    auth: null,
                    pxrId: 'agent',
                    attributes: {
                        initialPasswordExpire: '2050-01-01T00:00:00.000+0900'
                    },
                    roles: null
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: 2,
                type: 0,
                loginId: 'member01',
                pxrId: 'agent',
                passwordChangedFlg: false,
                loginProhibitedFlg: false,
                attributes: { initialPasswordExpire: '2050-01-01T00:00:00.000+0900' }
            }));
            expect(response.status).toBe(200);
        });
        test('新しくオペレーターを作成(ワークフロー)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    type: 1,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    name: 'workflow',
                    auth: null,
                    attributes: {
                    },
                    roles: [
                        {
                            _value: 1000005,
                            _ver: 1
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [{
                    property: 'type',
                    value: 1
                }]
            }));
            expect(response.status).toBe(400);
        });
        test('新しくオペレーターを作成(アプリケーション)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    type: 2,
                    loginId: 'nnnne3',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    name: 'nnnne3',
                    auth: null,
                    attributes: {
                        _code: {
                            _value: 10003,
                            _ver: 1
                        }
                    },
                    roles: [
                        {
                            _value: 44,
                            _ver: 1
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: 3,
                type: 2,
                loginId: 'nnnne3',
                name: 'nnnne3',
                passwordChangedFlg: false,
                attributes: { _code: { _value: 10003, _ver: 1 } },
                roles: [{ _value: 44, _ver: 1 }]
            }));
            expect(response.status).toBe(200);
        });
        test('新しくオペレーターを作成(個人, 利用者(ログイン不可))', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    type: 0,
                    loginId: 'member012',
                    auth: null,
                    userId: '123456789',
                    appCatalogCode: 5002,
                    loginProhibitedFlg: true,
                    attributes: {},
                    roles: [
                        {
                            _value: 1,
                            _ver: 1
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                id: 4,
                type: 0,
                loginId: 'member012',
                userId: '123456789',
                appCatalogCode: 5002,
                passwordChangedFlg: false,
                loginProhibitedFlg: true,
                attributes: {}
            }));
            expect(response.status).toBe(200);
        });
        test('異常系: 利用者情報の登録(item-groupが存在しない)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': null
                    }
                });
            expect(response.status).toBe(400);
        });
        test('異常系: 利用者情報の登録(pxrId, userIdどちらも存在しない)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(response.status).toBe(400);
        });
        test('異常系: 利用者情報の登録(pxrId, userIdどちらも設定)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    pxrId: 'a',
                    userId: 'b',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(response.status).toBe(400);
        });
        test('異常系：利用者情報の登録（正規表現にマッチしない）', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    pxrId: 'agent',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: ''
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(response.body.message).toBe('住所（行政区）が正しく設定されていません');
            expect(response.status).toBe(400);
        });
        test('利用者情報の登録', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    pxrId: 'agent',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ pxrId: 'agent' }));
            expect(response.status).toBe(200);
        });
        test('利用者情報の取得', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .query({
                    pxrId: 'agent'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'agent',
                userInfo: {
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '氏名',
                            item: [
                                {
                                    title: '姓',
                                    type: {
                                        _value: 30019,
                                        _ver: 1
                                    },
                                    content: 'サンプル'
                                },
                                {
                                    title: '名',
                                    type: {
                                        _value: 30020,
                                        _ver: 1
                                    },
                                    content: '太郎'
                                }
                            ]
                        },
                        {
                            title: '性別',
                            item: [
                                {
                                    title: '性別',
                                    type: {
                                        _value: 30021,
                                        _ver: 1
                                    },
                                    content: '男'
                                }
                            ]
                        },
                        {
                            title: '生年',
                            item: [
                                {
                                    title: '生年',
                                    type: {
                                        _value: 1000372,
                                        _ver: 1
                                    },
                                    content: 2000
                                }
                            ]
                        },
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区'
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678',
                                    'changable-flag': true
                                }
                            ]
                        }
                    ]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('利用者情報の取得(個人)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const loginResponse = await supertest(expressApp)
                .post('/operator/ind/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 0,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });
            const response = await supertest(expressApp)
                .get('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + loginResponse.body.sessionId]);

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'agent',
                userInfo: {
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '氏名',
                            item: [
                                {
                                    title: '姓',
                                    type: {
                                        _value: 30019,
                                        _ver: 1
                                    },
                                    content: 'サンプル'
                                },
                                {
                                    title: '名',
                                    type: {
                                        _value: 30020,
                                        _ver: 1
                                    },
                                    content: '太郎'
                                }
                            ]
                        },
                        {
                            title: '性別',
                            item: [
                                {
                                    title: '性別',
                                    type: {
                                        _value: 30021,
                                        _ver: 1
                                    },
                                    content: '男'
                                }
                            ]
                        },
                        {
                            title: '生年',
                            item: [
                                {
                                    title: '生年',
                                    type: {
                                        _value: 1000372,
                                        _ver: 1
                                    },
                                    content: 2000
                                }
                            ]
                        },
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区'
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678',
                                    'changable-flag': true
                                }
                            ]
                        }
                    ]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('個人以外で個人用利用者情報の取得に失敗', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .query({
                    pxrId: 'agent'
                });
            expect(response.status).toBe(401);
        });
        test('正常：空の利用者管理情報取得', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 個人の作成及び作成した個人にjsonフォーマットでないuser_informationを付与
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    type, login_id, hpassword, pxr_id, user_information,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    0, 'empty_user_information', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'empty_user_information', '{format_error}',
                    '{"initialPasswordExpire": "2050-01-01T00:00:00.000+0900"}', false, 'test_user', NOW(), 'test_user', NOW(), 'empty_user_information0'
                );
            `);

            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .query({
                    pxrId: 'empty_user_information'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'empty_user_information',
                userInfo: {}
            }));
            expect(response.status).toBe(200);
        });
        test('利用者情報を削除', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .query({
                    pxrId: 'agent'
                });

            expect(response.status).toBe(200);
        });
        test('利用者情報の登録(対象が存在せず失敗)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    pxrId: 'miss',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(response.status).toBe(400);
        });
        test('リクエストパラメータ不正', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    userInfo: 'text'
                });

            expect(response.status).toBe(400);
        });
        test('pxrIdによる利用者情報の取得(対象が存在せず失敗)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .query({
                    pxrId: 'miss'
                });

            expect(response.status).toBe(204);
        });
        test('userIdによる利用者情報の取得(対象が存在せず失敗)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: 'miss',
                    appCode: 5002
                });

            expect(response.status).toBe(204);
        });
        test('利用者情報を削除(対象が存在せず失敗)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .query({
                    pxrId: 'miss'
                });

            expect(response.status).toBe(400);
        });
        test('利用者情報を再登録', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    pxrId: 'agent',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区',
                                        'changable-flag': true
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ pxrId: 'agent' }));
            expect(response.status).toBe(200);
        });
        test('ログイン(個人)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/ind/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 0,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
        });
        test('異常系 パラメーターが期待しない配列', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send([{
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '氏名',
                            item: [
                                {
                                    title: '姓',
                                    type: {
                                        _value: 30019,
                                        _ver: 1
                                    },
                                    content: 'サンプル'
                                },
                                {
                                    title: '名',
                                    type: {
                                        _value: 30020,
                                        _ver: 1
                                    },
                                    content: '太郎'
                                }
                            ]
                        },
                        {
                            title: '性別',
                            item: [
                                {
                                    title: '性別',
                                    type: {
                                        _value: 30021,
                                        _ver: 1
                                    },
                                    content: '男'
                                }
                            ]
                        },
                        {
                            title: '生年',
                            item: [
                                {
                                    title: '生年',
                                    type: {
                                        _value: 1000372,
                                        _ver: 1
                                    },
                                    content: 2000
                                }
                            ]
                        },
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区',
                                    'changable-flag': true
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678',
                                    'changable-flag': true
                                }
                            ]
                        }
                    ]
                }]);

            expect(response.status).toBe(400);
        });
        test('利用者情報の更新', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区'
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678',
                                    'changable-flag': true,
                                    'require-sms-verification': true
                                }
                            ]
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 'success'
            }));
            expect(response.status).toBe(200);
        });
        test('異常系：SMS検証コードが未検証（SMS検証が必要な場合）', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区'
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-0000',
                                    'changable-flag': true,
                                    'require-sms-verification': true
                                }
                            ]
                        }
                    ]
                });

            expect(response.body.message).toBe('SMS検証コードが未検証です');
            expect(response.status).toBe(401);
        });
        test('異常系: 更新内容が登録済みのデータとの型不一致', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            await common.executeSqlString(
                `
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
                    2,
                    'member01',
                    'member01'
                );
                `
            );
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: 1
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: true
                                }
                            ]
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '対象データとのタイプ不一致により、更新できません'
            }));
            expect(response.status).toBe(400);
        });
        test('利用者情報の更新(今回のリクエストでは更新する内容はない)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '氏名',
                            item: [
                                {
                                    title: '姓',
                                    type: {
                                        _value: 30019,
                                        _ver: 1
                                    },
                                    content: 'サンプル'
                                },
                                {
                                    title: '名',
                                    type: {
                                        _value: 30020,
                                        _ver: 1
                                    },
                                    content: '太郎'
                                }
                            ]
                        },
                        {
                            title: '性別',
                            item: [
                                {
                                    title: '性別',
                                    type: {
                                        _value: 30021,
                                        _ver: 1
                                    },
                                    content: '男'
                                }
                            ]
                        },
                        {
                            title: '生年',
                            item: [
                                {
                                    title: '生年',
                                    type: {
                                        _value: 1000372,
                                        _ver: 1
                                    },
                                    content: 2000
                                }
                            ]
                        }
                    ]
                });

            expect(response.status).toBe(204);
        });
        test('利用者情報の更新（住所 正規表現チェック）', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都台東区'
                                }
                            ]
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 'success'
            }));
            expect(response.status).toBe(200);
        });
        test('異常系：利用者情報の更新（住所 正規表現にマッチしない）', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: ''
                                }
                            ]
                        }
                    ]
                });

            expect(response.body.message).toBe('住所（行政区）が正しく設定されていません');
            expect(response.status).toBe(400);
        });
        test('再ログイン(運営)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                sessionId: response.body.sessionId,
                operatorId: 1,
                type: 3,
                loginId: 'root_member01',
                name: '流通制御運営メンバー01',
                auth: { member: { add: true, update: true, delete: true } },
                lastLoginAt: response.body.lastLoginAt,
                passwordChangedFlg: false,
                loginProhibitedFlg: false,
                attributes: {},
                roles: [{ _value: 1, _ver: 1 }],
                block: { _value: 1000109, _ver: 1 },
                actor: { _value: 1000020, _ver: 1 }
            }));
            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
            session = encodeURIComponent(JSON.stringify(response.body));
        });
        test('利用者情報を再削除', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .query({
                    pxrId: 'agent'
                });

            expect(response.status).toBe(200);
        });
        test('再ログイン(個人)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/ind/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 0,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
            session = encodeURIComponent(JSON.stringify(response.body));
        });
        test('異常系: 利用者情報の更新(未登録の為、エラー)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '氏名',
                            item: [
                                {
                                    title: '姓',
                                    type: {
                                        _value: 30019,
                                        _ver: 1
                                    },
                                    content: 'サンプル'
                                },
                                {
                                    title: '名',
                                    type: {
                                        _value: 30020,
                                        _ver: 1
                                    },
                                    content: '太郎'
                                }
                            ]
                        },
                        {
                            title: '性別',
                            item: [
                                {
                                    title: '性別',
                                    type: {
                                        _value: 30021,
                                        _ver: 1
                                    },
                                    content: '男'
                                }
                            ]
                        },
                        {
                            title: '生年',
                            item: [
                                {
                                    title: '生年',
                                    type: {
                                        _value: 1000372,
                                        _ver: 1
                                    },
                                    content: 2000
                                }
                            ]
                        },
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区'
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678',
                                    'changable-flag': true
                                }
                            ]
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '更新対象の利用者情報が未登録の為、操作できません'
            }));
            expect(response.status).toBe(400);
        });
        test('再ログイン(運営)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                sessionId: response.body.sessionId,
                operatorId: 1,
                type: 3,
                loginId: 'root_member01',
                name: '流通制御運営メンバー01',
                auth: { member: { add: true, update: true, delete: true } },
                lastLoginAt: response.body.lastLoginAt,
                passwordChangedFlg: false,
                loginProhibitedFlg: false,
                attributes: {},
                roles: [{ _value: 1, _ver: 1 }],
                block: { _value: 1000109, _ver: 1 },
                actor: { _value: 1000020, _ver: 1 }
            }));
            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
            session = encodeURIComponent(JSON.stringify(response.body));
        });
        test('利用者情報を再登録', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send({
                    pxrId: 'agent',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678'
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ pxrId: 'agent' }));
            expect(response.status).toBe(200);
        });
        test('再ログイン(個人)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/ind/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 0,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
            session = encodeURIComponent(JSON.stringify(response.body));
        });
        test('異常系: 登録されたデータ上、変更可能なアイテムが存在しない', async () => {
            catalogServer = new CatalogServer2();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .put('/operator/ind/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type0_session=' + sessionId])
                .send({
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678'
                                }
                            ]
                        }
                    ]
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 401,
                message: '対象のデータは更新不可として設定されています'
            }));
            expect(response.status).toBe(401);
        });
        test('利用者情報登録に権限が足りない', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type2_session=' + sessionId])
                .send({
                    pxrId: 'agent',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 401,
                message: 'この操作をするための権限がありません'
            }));
            expect(response.status).toBe(401);
        });
        test('利用者情報削除に権限が足りない', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const loginResponse = await supertest(expressApp)
                .post('/operator/ind/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 1,
                    loginId: 'member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });
            const appSession = encodeURIComponent(JSON.stringify(loginResponse.body));

            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: appSession
                })
                .query({
                    pxrId: 'agent'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 401,
                message: 'この操作をするための権限がありません'
            }));
            expect(response.status).toBe(401);
        });
        test('未ログイン', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .query({
                    pxrId: 'agent'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 401, message: '未ログインです' }));
            expect(response.status).toBe(401);
        });
        test('未ログイン', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type2_session=' + sessionId + 'a'])
                .query({
                    pxrId: 'agent'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 401, message: '未ログインです' }));
            expect(response.status).toBe(401);
        });
        test('異常系：個人がPXR-IDを指定して利用者管理情報を削除', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .query({
                    pxrId: 'dummyId'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: '利用者ID、PXR-IDを設定することはできません' }));
            expect(response.status).toBe(400);
        });
        test('異常系：個人が利用者IDを指定して利用者管理情報を削除', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .query({
                    userId: 'dummyId'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: '利用者ID、PXR-IDを設定することはできません' }));
            expect(response.status).toBe(400);
        });
        test('再ログイン(運営)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                sessionId: response.body.sessionId,
                operatorId: 1,
                type: 3,
                loginId: 'root_member01',
                name: '流通制御運営メンバー01',
                auth: { member: { add: true, update: true, delete: true } },
                lastLoginAt: response.body.lastLoginAt,
                passwordChangedFlg: false,
                loginProhibitedFlg: false,
                attributes: {},
                roles: [{ _value: 1, _ver: 1 }],
                block: { _value: 1000109, _ver: 1 },
                actor: { _value: 1000020, _ver: 1 }
            }));
            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
            session = encodeURIComponent(JSON.stringify(response.body));
        });
        test('利用者情報の登録(利用者ID付き)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .send({
                    userId: '123456789',
                    appCode: 5002,
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: '太郎'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ userId: '123456789' }));
            expect(response.status).toBe(200);
        });
        test('利用者情報の取得(利用者ID付き)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: '123456789',
                    appCode: 5002
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                userId: '123456789',
                userInfo: {
                    _code: {
                        _value: 1000373,
                        _ver: 1
                    },
                    'item-group': [
                        {
                            title: '氏名',
                            item: [
                                {
                                    title: '姓',
                                    type: {
                                        _value: 30019,
                                        _ver: 1
                                    },
                                    content: 'サンプル'
                                },
                                {
                                    title: '名',
                                    type: {
                                        _value: 30020,
                                        _ver: 1
                                    },
                                    content: '太郎'
                                }
                            ]
                        },
                        {
                            title: '性別',
                            item: [
                                {
                                    title: '性別',
                                    type: {
                                        _value: 30021,
                                        _ver: 1
                                    },
                                    content: '男'
                                }
                            ]
                        },
                        {
                            title: '生年',
                            item: [
                                {
                                    title: '生年',
                                    type: {
                                        _value: 1000372,
                                        _ver: 1
                                    },
                                    content: 2000
                                }
                            ]
                        },
                        {
                            title: '住所（行政区）',
                            item: [
                                {
                                    title: '住所（行政区）',
                                    type: {
                                        _value: 1000371,
                                        _ver: 1
                                    },
                                    content: '東京都港区'
                                }
                            ]
                        },
                        {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-1234-5678',
                                    'changable-flag': true
                                }
                            ]
                        }
                    ]
                }
            }));
            expect(response.status).toBe(200);
        });
        test('利用者情報を削除(利用者ID付き)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: '123456789',
                    appCode: 5002
                });

            expect(response.status).toBe(200);
        });
        test('利用者情報の取得(バリデーションエラー：UserId, PxrIdどちらもnull)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .query({});

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '利用者ID、もしくはPXR-IDはどちらかを含めてリクエストをしてください'
            }));
            expect(response.status).toBe(400);
        });
        test('利用者情報の取得(バリデーションエラー：UserId, PxrIdどちらも設定)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .query({
                    pxrId: 'a',
                    userId: 'b'
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '利用者ID、PXR-IDの両方を設定することはできません'
            }));
            expect(response.status).toBe(400);
        });
    });

    describe('利用者情報複数取得', () => {
        let session = '';
        test('ログイン(運営)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
                });
            try {
                expect(response.status).toBe(200);
                expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                    sessionId: response.body.sessionId,
                    operatorId: 1,
                    type: 3,
                    loginId: 'root_member01',
                    name: '流通制御運営メンバー01',
                    auth: { member: { add: true, update: true, delete: true } },
                    lastLoginAt: response.body.lastLoginAt,
                    passwordChangedFlg: false,
                    loginProhibitedFlg: false,
                    attributes: {},
                    roles: [{ _value: 1, _ver: 1 }],
                    block: { _value: 1000109, _ver: 1 },
                    actor: { _value: 1000020, _ver: 1 }
                }));
                session = encodeURIComponent(JSON.stringify(response.body));
            } catch (err) {
                console.log(response.body);
                throw err;
            }
        });
        test('利用者情報なし', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info/list')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    pxrId: [
                        'test-0000'
                    ]
                });
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([]));
            expect(response.status).toBe(200);
        });
        test('利用者情報2件取得', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // オペレーターの登録
            await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    type: 0,
                    loginId: 'test-0001',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    auth: null,
                    pxrId: 'test-0001',
                    attributes: {
                        initialPasswordExpire: '2050-01-01T00:00:00.000+0900'
                    },
                    roles: null
                });
            await supertest(expressApp)
                .post('/operator')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    type: 0,
                    loginId: 'test-0002',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                    auth: null,
                    pxrId: 'test-0002',
                    attributes: {
                        initialPasswordExpire: '2050-01-01T00:00:00.000+0900'
                    },
                    roles: null
                });
            // 利用者情報の登録
            await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    pxrId: 'test-0001',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: 'テスト１'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });
            await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    pxrId: 'test-0002',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: 'テスト２'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2001
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '090-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                });
            const response = await supertest(expressApp)
                .post('/operator/user/info/list')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json',
                    session: session
                })
                .send({
                    pxrId: [
                        'test-0001',
                        'test-0002'
                    ]
                });
            expect(JSON.stringify(response.body)).toBe(JSON.stringify([
                {
                    pxrId: 'test-0001',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: 'テスト１'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2000
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    pxrId: 'test-0002',
                    userInfo: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '氏名',
                                item: [
                                    {
                                        title: '姓',
                                        type: {
                                            _value: 30019,
                                            _ver: 1
                                        },
                                        content: 'サンプル'
                                    },
                                    {
                                        title: '名',
                                        type: {
                                            _value: 30020,
                                            _ver: 1
                                        },
                                        content: 'テスト２'
                                    }
                                ]
                            },
                            {
                                title: '性別',
                                item: [
                                    {
                                        title: '性別',
                                        type: {
                                            _value: 30021,
                                            _ver: 1
                                        },
                                        content: '男'
                                    }
                                ]
                            },
                            {
                                title: '生年',
                                item: [
                                    {
                                        title: '生年',
                                        type: {
                                            _value: 1000372,
                                            _ver: 1
                                        },
                                        content: 2001
                                    }
                                ]
                            },
                            {
                                title: '住所（行政区）',
                                item: [
                                    {
                                        title: '住所（行政区）',
                                        type: {
                                            _value: 1000371,
                                            _ver: 1
                                        },
                                        content: '東京都港区'
                                    }
                                ]
                            },
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '090-1234-5678',
                                        'changable-flag': true
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]));
            expect(response.status).toBe(200);
        });
    });

    describe('利用者管理情報によるPXR-ID取得', () => {
        const sessionId = '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11';
        test('正常：PXR-ID検索 対象データなし', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            await common.executeSqlFile('initialData.sql');
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
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member011'
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
            const response = await supertest(expressApp)
                .post('/operator/user/info/search')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send([
                    {
                        condition: [
                            {
                                type: {
                                    _value: 30021,
                                    _ver: 1
                                },
                                target: {
                                    _value: 8,
                                    _ver: 1
                                },
                                min: null,
                                max: null
                            },
                            {
                                type: {
                                    _value: 1000372,
                                    _ver: 1
                                },
                                target: null,
                                min: 2000,
                                max: 2010
                            }
                        ],
                        min: 2,
                        max: 10
                    },
                    {
                        _code: {
                            _value: 1000001,
                            _ver: 1
                        },
                        condition: [
                            {
                                _code: {
                                    _value: 4,
                                    _ver: 1
                                },
                                type: {
                                    _value: 30021,
                                    _ver: 1
                                },
                                target: {
                                    _value: 7,
                                    _ver: 1
                                },
                                min: null,
                                max: null
                            }
                        ],
                        min: 1,
                        max: 20
                    }
                ]);
            try {
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject([
                    {
                        pxrId: null
                    },
                    {
                        pxrId: null
                    }
                ]);
            } catch (err) {
                console.log(response.body);
                throw err;
            }
        });
        test('正常：PXR-ID検索 対象データ一部あり', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid_1',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                );
                INSERT INTO pxr_operator.user_information
                (
                    id, operator_id, catalog_code, catalog_version, value,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    1, 2, 30021, 1, '男',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    2, 2, 1000372, 1, '2001',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            const response = await supertest(expressApp)
                .post('/operator/user/info/search')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send([
                    {
                        condition: [
                            {
                                type: {
                                    _value: 30021,
                                    _ver: 1
                                },
                                target: {
                                    _value: 7,
                                    _ver: 1
                                },
                                min: null,
                                max: null
                            },
                            {
                                type: {
                                    _value: 1000372,
                                    _ver: 1
                                },
                                target: null,
                                min: 2000,
                                max: 2010
                            }
                        ],
                        min: 2,
                        max: 10
                    },
                    {
                        _code: {
                            _value: 1000001,
                            _ver: 1
                        },
                        condition: [
                            {
                                type: {
                                    _value: 30021,
                                    _ver: 1
                                },
                                target: {
                                    _value: 8,
                                    _ver: 1
                                },
                                min: null,
                                max: null
                            }
                        ],
                        min: 1,
                        max: 20
                    }
                ]);
            try {
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject([
                    {
                        pxrId: null
                    },
                    {
                        pxrId: [
                            'test.pxrid_1'
                        ]
                    }
                ]);
            } catch (err) {
                console.log(response.body);
                throw err;
            }
        });
        test('正常：PXR-ID検索 対象人数がmaxを超えたため対象者なし', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, pxr_id,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 0, 'ind02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'test.pxrid_2',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind020'
                );
                INSERT INTO pxr_operator.user_information
                (
                    id, operator_id, catalog_code, catalog_version, value,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    3, 3, 30021, 1, '女',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    4, 3, 1000372, 1, '2001',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            const response = await supertest(expressApp)
                .post('/operator/user/info/search')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send([
                    {
                        condition: [
                            {
                                type: {
                                    _value: 1000372,
                                    _ver: 1
                                },
                                target: null,
                                min: 2000,
                                max: 2010
                            }
                        ],
                        min: 1,
                        max: 1
                    }
                ]);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject([
                {
                    pxrId: null
                }
            ]);
        });
        test('正常：PXR-ID検索 班指定により対象データ該当なし(min)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info/search')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send([
                    {
                        condition: [
                            {
                                type: {
                                    _value: 1000372,
                                    _ver: 1
                                },
                                target: null,
                                min: 2002
                            }
                        ],
                        min: 1,
                        max: 10
                    }
                ]);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject([
                {
                    pxrId: null
                }
            ]);
        });
        test('正常：PXR-ID検索 班指定により対象データ該当なし(max)', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info/search')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set('Cookie', ['operator_type3_session=' + sessionId])
                .send([
                    {
                        condition: [
                            {
                                type: {
                                    _value: 1000372,
                                    _ver: 1
                                },
                                target: null,
                                max: 2000
                            }
                        ],
                        min: 1,
                        max: 10
                    }
                ]);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject([
                {
                    pxrId: null
                }
            ]);
        });
    });

    /**
     * 利用者情報API GET | POST | DELETE （userId重複パターン）
     */
    describe('利用者情報API GET | POST | DELETE （userId重複パターン）', () => {
        const appUserInfo = {
            _code: {
                _value: 1000373,
                _ver: 1
            },
            'item-group': [
                {
                    title: '氏名',
                    item: [
                        {
                            title: '姓',
                            type: {
                                _value: 30019,
                                _ver: 1
                            },
                            content: 'アプリケーション'
                        },
                        {
                            title: '名',
                            type: {
                                _value: 30020,
                                _ver: 1
                            },
                            content: 'アプリ'
                        }
                    ]
                },
                {
                    title: '性別',
                    item: [
                        {
                            title: '性別',
                            type: {
                                _value: 30021,
                                _ver: 1
                            },
                            content: '男'
                        }
                    ]
                },
                {
                    title: '生年',
                    item: [
                        {
                            title: '生年',
                            type: {
                                _value: 1000372,
                                _ver: 1
                            },
                            content: 2001
                        }
                    ]
                },
                {
                    title: '住所（行政区）',
                    item: [
                        {
                            title: '住所（行政区）',
                            type: {
                                _value: 1000371,
                                _ver: 1
                            },
                            content: '東京都台東区'
                        }
                    ]
                },
                {
                    title: '連絡先電話番号',
                    item: [
                        {
                            title: '連絡先電話番号',
                            type: {
                                _value: 30036,
                                _ver: 1
                            },
                            content: '080-1234-5679',
                            'changable-flag': true
                        }
                    ]
                }
            ]
        };
        const appUserInfo2 = {
            _code: {
                _value: 1000373,
                _ver: 1
            },
            'item-group': [
                {
                    title: '氏名',
                    item: [
                        {
                            title: '姓',
                            type: {
                                _value: 30019,
                                _ver: 1
                            },
                            content: 'アプリケーション2'
                        },
                        {
                            title: '名',
                            type: {
                                _value: 30020,
                                _ver: 1
                            },
                            content: 'アプリ2'
                        }
                    ]
                },
                {
                    title: '性別',
                    item: [
                        {
                            title: '性別',
                            type: {
                                _value: 30021,
                                _ver: 1
                            },
                            content: '男'
                        }
                    ]
                },
                {
                    title: '生年',
                    item: [
                        {
                            title: '生年',
                            type: {
                                _value: 1000372,
                                _ver: 1
                            },
                            content: 2021
                        }
                    ]
                },
                {
                    title: '住所（行政区）',
                    item: [
                        {
                            title: '住所（行政区）',
                            type: {
                                _value: 1000371,
                                _ver: 1
                            },
                            content: '東京都台東区'
                        }
                    ]
                },
                {
                    title: '連絡先電話番号',
                    item: [
                        {
                            title: '連絡先電話番号',
                            type: {
                                _value: 30036,
                                _ver: 1
                            },
                            content: '081-1234-5679',
                            'changable-flag': true
                        }
                    ]
                }
            ]
        };
        const regionUserInfo = {
            _code: {
                _value: 1000373,
                _ver: 1
            },
            'item-group': [
                {
                    title: '氏名',
                    item: [
                        {
                            title: '姓',
                            type: {
                                _value: 30019,
                                _ver: 1
                            },
                            content: 'リージョン'
                        },
                        {
                            title: '名',
                            type: {
                                _value: 30020,
                                _ver: 1
                            },
                            content: '領域'
                        }
                    ]
                },
                {
                    title: '性別',
                    item: [
                        {
                            title: '性別',
                            type: {
                                _value: 30021,
                                _ver: 1
                            },
                            content: '女'
                        }
                    ]
                },
                {
                    title: '生年',
                    item: [
                        {
                            title: '生年',
                            type: {
                                _value: 1000372,
                                _ver: 1
                            },
                            content: 2002
                        }
                    ]
                },
                {
                    title: '住所（行政区）',
                    item: [
                        {
                            title: '住所（行政区）',
                            type: {
                                _value: 1000371,
                                _ver: 1
                            },
                            content: '東京都新宿区'
                        }
                    ]
                },
                {
                    title: '連絡先電話番号',
                    item: [
                        {
                            title: '連絡先電話番号',
                            type: {
                                _value: 30036,
                                _ver: 1
                            },
                            content: '080-1234-5676',
                            'changable-flag': true
                        }
                    ]
                }
            ]
        };
        test('正常：利用者情報の登録(利用者ID指定)、appコード指定、app運営が実行', async () => {
            // 事前データ準備
            await common.executeSqlFile('initialData.sql');
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    type, login_id, hpassword, pxr_id, name, auth, last_login_at, login_prohibited_flg,
                    wf_catalog_code, app_catalog_code, region_catalog_code,
                    user_id, attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    0, 'wfUser01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'wfログイン不可個人01', null, '2020-01-15 23:59:59.000', true, 
                    1000010, null, null,
                    'wfUser01', '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'wfUser0101000010true'
                ),
                (
                    0, 'wfUser01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'wfログイン不可個人01', null, '2020-01-15 23:59:59.000', true, 
                    1000011, null, null,
                    'wfUser01', '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'wfUser0101000011true'
                ),
                (
                    0, 'appUser01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'appログイン不可個人01', null, '2020-01-15 23:59:59.000', true, 
                    null, 1000021, null,
                    'appUser01', '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'appUser0101000021true'
                ),
                (
                    0, 'appUser01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'appログイン不可個人01', null, '2020-01-15 23:59:59.000', true, 
                    null, 1000022, null,
                    'appUser01', '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'appUser0101000022true'
                ),
                (
                    0, 'regionUser01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'regionログイン不可個人01', null, '2020-01-15 23:59:59.000', true, 
                    null, null, 1000030,
                    'regionUser01', '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'regionUser0101000030true'
                ),
                (
                    0, 'regionUser01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', null, 'regionログイン不可個人01', null, '2020-01-15 23:59:59.000', true, 
                    null, null, 1000031,
                    'regionUser01', '{"test": "test"}', false, 'test_user', NOW(), 'test_user', NOW(), 'regionUser0101000031true'
                );
            `);
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .send({
                    userId: 'appUser01',
                    appCode: 1000021,
                    userInfo: appUserInfo
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ userId: 'appUser01' }));
            // リクエストの条件で標的オペレータレコードを取得
            const targetOperatorRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.operator WHERE user_id = 'appUser01' and app_catalog_code = '1000021';
            `);
            expect(targetOperatorRecord.length).toBe(1);
            expect(targetOperatorRecord[0].id).toBe('3');
            expect(targetOperatorRecord[0].user_id).toBe('appUser01');
            expect(targetOperatorRecord[0].app_catalog_code).toBe('1000021');
            expect(targetOperatorRecord[0].region_catalog_code).toBe(null);
            expect(targetOperatorRecord[0].user_information).toBe(JSON.stringify(appUserInfo));
            // 標的オペレータレコードIDに紐づけてリクエストの利用者情報が保存されているかチェック
            const targetUserInfoRecord = await common.executeSqlString(`
            SELECT id, operator_id, catalog_code, catalog_version, value FROM pxr_operator.user_information WHERE operator_id = 3;
            `);
            expect(targetUserInfoRecord.length).toBe(6);
            expect(targetUserInfoRecord).toContainEqual({
                id: '1',
                operator_id: '3',
                catalog_code: '30019',
                catalog_version: '1',
                value: 'アプリケーション'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '2',
                operator_id: '3',
                catalog_code: '30020',
                catalog_version: '1',
                value: 'アプリ'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '3',
                operator_id: '3',
                catalog_code: '30021',
                catalog_version: '1',
                value: '男'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '4',
                operator_id: '3',
                catalog_code: '1000372',
                catalog_version: '1',
                value: '2001'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '5',
                operator_id: '3',
                catalog_code: '1000371',
                catalog_version: '1',
                value: '東京都台東区'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '6',
                operator_id: '3',
                catalog_code: '30036',
                catalog_version: '1',
                value: '080-1234-5679'
            });
        });
        test('正常：利用者情報の登録(利用者ID指定)、regionコード指定、region運営が実行', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRegion) })
                .send({
                    userId: 'regionUser01',
                    regionCode: 1000030,
                    userInfo: regionUserInfo
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ userId: 'regionUser01' }));
            // リクエストの条件で標的オペレータレコードを取得
            const targetOperatorRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.operator WHERE user_id = 'regionUser01' and region_catalog_code = '1000030';
            `);
            expect(targetOperatorRecord.length).toBe(1);
            expect(targetOperatorRecord[0].id).toBe('5');
            expect(targetOperatorRecord[0].user_id).toBe('regionUser01');
            expect(targetOperatorRecord[0].app_catalog_code).toBe(null);
            expect(targetOperatorRecord[0].region_catalog_code).toBe('1000030');
            expect(targetOperatorRecord[0].user_information).toBe(JSON.stringify(regionUserInfo));
            // 標的オペレータレコードIDに紐づけてリクエストの利用者情報が保存されているかチェック
            const targetUserInfoRecord = await common.executeSqlString(`
            SELECT id, operator_id, catalog_code, catalog_version, value FROM pxr_operator.user_information WHERE operator_id = 5;
            `);
            expect(targetUserInfoRecord).toContainEqual({
                id: '7',
                operator_id: '5',
                catalog_code: '30019',
                catalog_version: '1',
                value: 'リージョン'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '8',
                operator_id: '5',
                catalog_code: '30020',
                catalog_version: '1',
                value: '領域'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '9',
                operator_id: '5',
                catalog_code: '30021',
                catalog_version: '1',
                value: '女'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '10',
                operator_id: '5',
                catalog_code: '1000372',
                catalog_version: '1',
                value: '2002'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '11',
                operator_id: '5',
                catalog_code: '1000371',
                catalog_version: '1',
                value: '東京都新宿区'
            });
            expect(targetUserInfoRecord).toContainEqual({
                id: '12',
                operator_id: '5',
                catalog_code: '30036',
                catalog_version: '1',
                value: '080-1234-5676'
            });
        });
        test('異常：利用者情報の登録(利用者ID指定)、regionコード指定、app運営が実行', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .send({
                    userId: 'appUser01',
                    regionCode: 1000030,
                    userInfo: appUserInfo
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.MISMATCH_OPERATOR_BLOCK_TYPE_AND_SERVICE_CODE);
        });
        test('異常：利用者情報の登録(利用者ID指定)、regionコード指定、セッションにアクター情報がない', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.errorNotActor) })
                .send({
                    userId: 'regionUser01',
                    regionCode: 1000031,
                    userInfo: regionUserInfo
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.REQUIRE_SESSION_ACTOR);
        });
        test('異常：利用者情報の登録(利用者ID指定)、regionコード指定、アクターカタログのNS取得失敗', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.errorEmptyActorCatalog) })
                .send({
                    userId: 'regionUser01',
                    regionCode: 1000031,
                    userInfo: regionUserInfo
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_FOUND_ACTOR_CATALOG);
        });
        test('異常：利用者情報の登録(利用者ID指定)、regionコード指定、オペレータの所属Block判定が想定外の値', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.errorNotActorCatalogCode) })
                .send({
                    userId: 'regionUser01',
                    regionCode: 1000031,
                    userInfo: regionUserInfo
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.INVALID_OPERATOR_BLOCK_TYPE);
        });
        test('正常：利用者情報の取得(利用者ID指定)、appコード指定、app運営が実施', async () => {
            // 事前データ準備（重複userIdの別appに利用者情報設定）
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response0 = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .send({
                    userId: 'appUser01',
                    appCode: 1000022,
                    userInfo: appUserInfo2
                });
            expect(response0.status).toBe(200);

            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: 'appUser01',
                    appCode: 1000022
                });

            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                userId: 'appUser01',
                userInfo: appUserInfo2
            }));
        });
        test('正常：利用者情報の取得(利用者ID指定)、regionコード指定、region運営が実施', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRegion) })
                .query({
                    userId: 'regionUser01',
                    regionCode: 1000030
                });

            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                userId: 'regionUser01',
                userInfo: regionUserInfo
            }));
        });
        test('異常：利用者情報の取得(利用者ID指定)、regionコード指定、app運営が実施', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .get('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: 'appUser01',
                    regionCode: 1000030
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.MISMATCH_OPERATOR_BLOCK_TYPE_AND_SERVICE_CODE);
        });
        test('異常：利用者情報の削除(利用者ID指定)、regionコード指定、app運営が実施', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: 'appUser01',
                    regionCode: 1000030
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.MISMATCH_OPERATOR_BLOCK_TYPE_AND_SERVICE_CODE);
        });
        test('正常：利用者情報の削除(利用者ID指定)、appコード指定、app運営が実施', async () => {
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrApp) })
                .query({
                    userId: 'appUser01',
                    appCode: 1000021
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                userId: 'appUser01'
            }));
            // リクエストの条件で標的オペレータレコードを取得し、user_informationがnullに更新されていることを確認
            const targetOperatorRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.operator WHERE user_id = 'appUser01' and app_catalog_code = '1000021';
            `);
            expect(targetOperatorRecord.length).toBe(1);
            expect(targetOperatorRecord[0].id).toBe('3');
            expect(targetOperatorRecord[0].user_id).toBe('appUser01');
            expect(targetOperatorRecord[0].app_catalog_code).toBe('1000021');
            expect(targetOperatorRecord[0].region_catalog_code).toBe(null);
            expect(targetOperatorRecord[0].user_information).toBe(null);
            // 標的オペレータレコードIDに紐づくリクエストの利用者情報が削除されているかチェック
            const targetUserInfoRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.user_information WHERE operator_id = 3;
            `);
            expect(targetUserInfoRecord.length).toBe(6);
            for (const targetUserInfo of targetUserInfoRecord) {
                expect(targetUserInfo.is_disabled).toBe(true);
            }

            // userid重複、別appのオペレータレコードを取得し、user_informationがnullに更新されていないことを確認
            const notTargetOperatorRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.operator WHERE user_id = 'appUser01' and app_catalog_code = '1000022';
            `);
            expect(notTargetOperatorRecord.length).toBe(1);
            expect(notTargetOperatorRecord[0].id).toBe('4');
            expect(notTargetOperatorRecord[0].user_id).toBe('appUser01');
            expect(notTargetOperatorRecord[0].app_catalog_code).toBe('1000022');
            expect(notTargetOperatorRecord[0].region_catalog_code).toBe(null);
            expect(notTargetOperatorRecord[0].user_information).toBe(JSON.stringify(appUserInfo2));
            // userid重複、別appのオペレータレコードIDに紐づくリクエストの利用者情報が削除されていないことをチェック
            const notTargetUserInfoRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.user_information WHERE operator_id = 4;
            `);
            expect(notTargetUserInfoRecord.length).toBe(6);
            for (const targetUserInfo of notTargetUserInfoRecord) {
                expect(targetUserInfo.is_disabled).toBe(false);
            }
        });
        test('正常：利用者情報の削除(利用者ID指定)、regionコード指定、region運営が実施', async () => {
            // 事前データ準備（重複userIdの別regionに利用者情報設定）
            catalogServer = new CatalogServer();
            await catalogServer.start();
            const response0 = await supertest(expressApp)
                .post('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRegion) })
                .send({
                    userId: 'regionUser01',
                    regionCode: 1000031,
                    userInfo: regionUserInfo
                });
            expect(response0.status).toBe(200);

            const response = await supertest(expressApp)
                .delete('/operator/user/info')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .set({ session: JSON.stringify(Session.pxrRegion) })
                .query({
                    userId: 'regionUser01',
                    regionCode: 1000030
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                userId: 'regionUser01'
            }));
            // リクエストの条件で標的オペレータレコードを取得し、user_informationがnullに更新されていることを確認
            const targetOperatorRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.operator WHERE user_id = 'regionUser01' and region_catalog_code = '1000030';
            `);
            expect(targetOperatorRecord.length).toBe(1);
            expect(targetOperatorRecord[0].id).toBe('5');
            expect(targetOperatorRecord[0].user_id).toBe('regionUser01');
            expect(targetOperatorRecord[0].app_catalog_code).toBe(null);
            expect(targetOperatorRecord[0].region_catalog_code).toBe('1000030');
            expect(targetOperatorRecord[0].user_information).toBe(null);
            // 標的オペレータレコードIDに紐づくリクエストの利用者情報が削除されているかチェック
            const targetUserInfoRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.user_information WHERE operator_id = 5;
            `);
            expect(targetUserInfoRecord.length).toBe(6);
            for (const targetUserInfo of targetUserInfoRecord) {
                expect(targetUserInfo.is_disabled).toBe(true);
            }

            // userid重複、別appのオペレータレコードを取得し、user_informationがnullに更新されていないことを確認
            const notTargetOperatorRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.operator WHERE user_id = 'regionUser01' and region_catalog_code = '1000031';
            `);
            expect(notTargetOperatorRecord.length).toBe(1);
            expect(notTargetOperatorRecord[0].id).toBe('6');
            expect(notTargetOperatorRecord[0].user_id).toBe('regionUser01');
            expect(notTargetOperatorRecord[0].app_catalog_code).toBe(null);
            expect(notTargetOperatorRecord[0].region_catalog_code).toBe('1000031');
            expect(notTargetOperatorRecord[0].user_information).toBe(JSON.stringify(regionUserInfo));
            // 標的オペレータレコード以外に紐づくリクエストの利用者情報が削除されていないことをチェック
            const notTargetUserInfoRecord = await common.executeSqlString(`
            SELECT * FROM pxr_operator.user_information WHERE operator_id = 6;
            `);
            expect(notTargetUserInfoRecord.length).toBe(6);
            for (const notTargetUserInfo of notTargetUserInfoRecord) {
                expect(notTargetUserInfo.is_disabled).toBe(false);
            }
        });
    });
});
