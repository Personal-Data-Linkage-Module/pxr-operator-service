/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from '../resources/config/Application';
import { CatalogServer } from './StubServer';
import { clear } from './11-00.Data';
import { Url } from './Common';
import supertest = require('supertest');

jest.mock('../common/Config', () => ({
    ...jest.requireActual('../common/Config') as any,
    default: {
        ReadConfig: jest.fn((path: string) => {
            const fs = require('fs');
            if (path === './config/config.json') {
                return {
                    session_expire: 168,
                    login_code_expire: 10,
                    cookie_base_name: 'operator_type%s_session',
                    sms_url: 'http://localhost:3020/sms/sendBulkSms/request?form=1',
                    sms_sender: '0120550171',
                    sms_auth_code: 'MTAwMDAwMTUwMTpyMGdSQlI3WVFY',
                    sms_msg_base: 'PXRポータルのワンタイムログインコードは%sです。',
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
                    timezone: 'Asia/Tokyo',
                    csrf_check_url: 'http://localhost:3000/operator/csrf/check',
                    csrf_get_url: 'http://localhost:3000/operator/csrf/token'
                };
            } else {
                return JSON.parse(fs.readFileSync(path, 'UTF-8'));
            }
        })
    }
}));

const app = new Application();
const expressApp = app.express.app;

app.start();

const catalogServer = new CatalogServer();

describe('Security Test', () => {
    beforeAll(async () => {
        await catalogServer.start();
    });
    beforeEach(async () => {
        await clear();
    });
    afterAll(async () => {
        app.stop();
        await catalogServer.stop();
    });

    describe('操作権限の仕様 オペレーター追加API POST: /operator', () => {
        test('新しくオペレーターを作成', async () => {
            const response = await supertest(expressApp)
                .post(Url.baseURI)
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

            expect(response.status).toBe(200);
        });
        test('authオブジェクトに、カタログとして存在しない権限が設定されている', async () => {
            const response = await supertest(expressApp)
                .post(Url.baseURI)
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
                        },
                        operation: {
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
                status: 400,
                message: '次のネームスペースのカタログは存在しません(ネームスペース: catalog/model/auth/operation)'
            }));
            expect(response.status).toBe(400);
        });
        test('操作権は、アクターカタログでは認められない権限', async () => {
            const response = await supertest(expressApp)
                .post(Url.baseURI)
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
                        },
                        catalog: {
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

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: 'アクターで許可されていない権限が設定されています' }));
            expect(response.status).toBe(400);
        });
    });
});
