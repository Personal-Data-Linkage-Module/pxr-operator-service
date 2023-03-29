/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Application } from '../resources/config/Application';
import { clear } from './11-00.Data';
import supertest = require('supertest');
import Common, { Url } from './Common';
/* eslint-enable */
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

let session = null;

app.start();

describe('本人性確認コード > 本人性確認コード登録API', () => {
    beforeAll(async () => {
        await clear();
        await common.connect();
        await common.executeSqlFile('initialData.sql');
    });
    afterAll(async () => {
        app.stop();
    });

    test('正常', async () => {
        session = JSON.stringify({
            sessionId: 'dummy_session',
            operatorId: 1,
            type: 0,
            loginId: 'ind01',
            pxrId: 'ind01',
            name: '個人01',
            auth: { member: { add: true, update: true, delete: true } },
            lastLoginAt: '2021-01-01 00:00:00+0900',
            passwordChangedFlg: false,
            loginProhibitedFlg: false,
            attributes: null,
            roles: null,
            block: { _value: 1000110, _ver: 1 },
            actor: { _value: 1000001, _ver: 1 }
        });
        const response = await supertest(expressApp)
            .post('/operator/identifyCode')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json',
                session: encodeURIComponent(session)
            })
            .send(JSON.stringify({
                identifyCode: 'test_identify_code_001',
                expirationAt: '2100-01-01 00:00:00+0900'
            }));

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            result: 'success'
        }));
        expect(response.status).toBe(200);
    });
    test('正常（/ind/identifyCode）', async () => {
        session = JSON.stringify({
            sessionId: 'dummy_session',
            operatorId: 1,
            type: 0,
            loginId: 'ind01',
            pxrId: 'ind01',
            name: '個人01',
            auth: { member: { add: true, update: true, delete: true } },
            lastLoginAt: '2021-01-01 00:00:00+0900',
            passwordChangedFlg: false,
            loginProhibitedFlg: false,
            attributes: null,
            roles: null,
            block: { _value: 1000110, _ver: 1 },
            actor: { _value: 1000001, _ver: 1 }
        });
        const response = await supertest(expressApp)
            .post('/operator/ind/identifyCode')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json',
                session: encodeURIComponent(session)
            })
            .send(JSON.stringify({
                identifyCode: 'test_identify_code_001',
                expirationAt: '2100-01-01 00:00:00+0900'
            }));

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            result: 'success'
        }));
        expect(response.status).toBe(200);
    });
    test('バリデーションエラー: 本人性確認コード不足', async () => {
        const response = await supertest(expressApp)
            .post('/operator/identifyCode')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send(JSON.stringify({
                expirationAt: '2100-01-01 00:00:00+0900'
            }));

        expect(response.status).toBe(400);
    });
    test('バリデーションエラー: 有効期限不足', async () => {
        const response = await supertest(expressApp)
            .post('/operator/identifyCode')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send(JSON.stringify({
                identifyCode: 'test_identify_code_error'
            }));

        expect(response.status).toBe(400);
    });

    test('異常：sessionのpxrId不足', async () => {
        session = JSON.stringify({
            sessionId: 'dummy_session',
            operatorId: 1,
            type: 0,
            loginId: 'ind01',
            name: '個人01',
            auth: { member: { add: true, update: true, delete: true } },
            lastLoginAt: '2021-01-01 00:00:00+0900',
            passwordChangedFlg: false,
            loginProhibitedFlg: false,
            attributes: null,
            roles: null,
            block: { _value: 1000110, _ver: 1 },
            actor: { _value: 1000001, _ver: 1 }
        });
        const response = await supertest(expressApp)
            .post('/operator/identifyCode')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json',
                session: encodeURIComponent(session)
            })
            .send(JSON.stringify({
                identifyCode: 'test_identify_code_error',
                expirationAt: '2100-01-01 00:00:00+0900'
            }));

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'この操作をするための権限がありません'
        }));
        expect(response.status).toBe(400);
    });
});
