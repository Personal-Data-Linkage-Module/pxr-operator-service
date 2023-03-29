/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from '../resources/config/Application';
import { CatalogServer } from './StubServer';
import { clear, updateLockStartAtToPast, updatePasswordLastUpdatedAtToPast } from './11-00.Data';
import supertest = require('supertest');

const app = new Application();
const expressApp = app.express.app;

app.start();

const catalogServer = new CatalogServer();

describe('Security Test', () => {
    beforeAll(async () => {
        await catalogServer.start();
        await clear();
    });
    afterAll(async () => {
        app.stop();
        await catalogServer.stop();
    });

    describe('セキュリティ対応の仕様 各種API POST: ', () => {
        test('ログインID誤り', async () => {
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
                });

            expect(response.status).toBe(401);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 401, message: 'ログインIDまたはパスワードが不正です' }));
        });
        test('新しくオペレーターを作成', async () => {
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

            expect(response.status).toBe(200);
        });
        test('ログインに6回失敗（アカウントロックの開始）', async () => {
            await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d4'
                });
            await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d4'
                });
            await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d4'
                });
            await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d4'
                });
            await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d4'
                });
            const response = await supertest(expressApp)
                .post('/operator/login')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    type: 3,
                    loginId: 'root_member01',
                    hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d4'
                });

            expect(response.status).toBe(401);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 401,
                message: 'ログインIDまたはパスワードが不正です'
            }));
        });
        test('アカウントロック中の正規な情報でのログイン', async () => {
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

            expect(response.status).toBe(401);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 401, message: 'ログインIDまたはパスワードが不正です' }));
        });
        let sessionId = '';
        test('アカウントロックの解放', async () => {
            await updateLockStartAtToPast();
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
                passwordChangedFlg: true,
                loginProhibitedFlg: false,
                attributes: {},
                roles: [{ _value: 1, _ver: 1 }],
                block: { _value: 1000109, _ver: 1 },
                actor: { _value: 1000020, _ver: 1 }
            }));
            expect(response.status).toBe(200);
            sessionId = response.body.sessionId;
        });
        test('パスワードの更新を促す', async () => {
            await updatePasswordLastUpdatedAtToPast();
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
        });
        test('セッションが無効', async () => {
            const response = await supertest(expressApp)
                .post('/operator/session')
                .set({
                    'content-type': 'application/json',
                    accept: 'application/json'
                })
                .send({
                    sessionId: sessionId
                });

            expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 401, message: '未ログインです' }));
            expect(response.status).toBe(401);
        });
    });
});
