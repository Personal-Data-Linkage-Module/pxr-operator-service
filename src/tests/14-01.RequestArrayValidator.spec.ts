/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Application } from '../resources/config/Application';
import { clear } from './11-00.Data';
import supertest = require('supertest');
import Common from './Common';
/* eslint-enable */

const app = new Application();
const expressApp = app.express.app;
const common = new Common();

app.start();

describe('Validate request body is array', () => {
    beforeAll(async () => {
        await clear();
        await common.connect();
        await common.executeSqlFile('initialData.sql');
    });

    afterAll(async () => {
        app.stop();
    });

    test('バリデーションエラー: パスワード更新', async () => {
        const response = await supertest(expressApp)
            .put('/operator/password/1')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                newHpassword: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: オペレーター追加', async () => {
        const response = await supertest(expressApp)
            .post('/operator')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
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
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: オペレーター更新', async () => {
        const response = await supertest(expressApp)
            .put('/operator/1')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                loginId: 'ind01_update',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948',
                mobilePhone: '09099998888',
                attributes: {
                    initialPasswordExpire: '2030-01-01T00:00:00.000+09:00',
                    smsAuth: true
                }
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: ログイン', async () => {
        const response = await supertest(expressApp)
            .post('/operator/login')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                hpassword: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
                loginId: '123',
                type: 0
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: 個人ログイン', async () => {
        const response = await supertest(expressApp)
            .post('/operator/ind/login')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                type: 0,
                loginId: 'root_ind_member04',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: ワンタイムログイン', async () => {
        const response = await supertest(expressApp)
            .post('/operator/ind/login/onetime')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                loginCode: '123456',
                loginId: '123',
                type: 0
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: セッション確認', async () => {
        const response = await supertest(expressApp)
            .post('/operator/session')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                sessionId: 'a'
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: 利用者登録', async () => {
        const response = await supertest(expressApp)
            .post('/operator/user/info')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
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
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: 利用者情報複数取得', async () => {
        const response = await supertest(expressApp)
            .post('/operator/user/info/list')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send([{
                pxrId: [
                    'test-0001',
                    'test-0002'
                ]
            }]);

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
    test('バリデーションエラー: 本人性確認コード登録', async () => {
        const response = await supertest(expressApp)
            .post('/operator/identifyCode')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            })
            .send(JSON.stringify([{
                identifyCode: 'test_identify_code_001',
                expirationAt: '2100-01-01 00:00:00+0900'
            }]));

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 400,
            message: 'リクエストが配列です'
        }));
    });
});
