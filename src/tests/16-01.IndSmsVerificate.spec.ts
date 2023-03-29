/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import Config from '../common/Config';
import supertest = require('supertest');
const message = Config.ReadConfig('./config/message.json');
// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();
app.start();

describe('operator API', () => {
    /**
     * 全テスト実行の前処理
     */
    beforeAll(async () => {
        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        // 事前データ登録
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
                '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 1, '2025-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            ),
            (
                '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            ),
            (
                '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca', 1, '2020-01-27 23:59:59.000',
                false, 'test_user', NOW(), 'test_user', NOW()
            );
        `);
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // サーバ停止
        app.stop();
    });

    describe('SMS検証コード発行', () => {
        test('正常', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify({
                    userInformation: {
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
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify(
                { result: 'success' }
            ));
        });

        test('正常: 電話番号の先頭が 0 以外', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify({
                    userInformation: {
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
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '80-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(200);
            expect(JSON.stringify(response.body)).toBe(JSON.stringify(
                { result: 'success' }
            ));
        });

        test('パラメータ異常：リクエストが空', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({}));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：リクエストが配列', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify([{
                    userInformation: {
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
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '80-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }]));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    code: '9eee39d0-8c47-1df2-f88e-932d235a0865'
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: null
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInfomation._code', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation._code（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: null,
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation._vaule', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation._value（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: null,
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation._value（数字以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 'a',
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation._ver', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation._ver（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: null
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation._ver（数字以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 'a'
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[]', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        }
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[]（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': null
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[]（配列以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': {
                            title: '連絡先電話番号',
                            item: [
                                {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-0000-0000',
                                    'changable-flag': true,
                                    'require-sms-verification': true
                                }
                            ]
                        }
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].title', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].title（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: null,
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].title（文字列以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: 1,
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].item[]', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '連絡先電話番号'
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[]（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '連絡先電話番号',
                                item: null
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[]（配列以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '連絡先電話番号',
                                item: {
                                    title: '連絡先電話番号',
                                    type: {
                                        _value: 30036,
                                        _ver: 1
                                    },
                                    content: '080-0000-0000',
                                    'changable-flag': true,
                                    'require-sms-verification': true
                                }
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].item[].title', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].title（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: null,
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].title（文字列以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
                        _code: {
                            _value: 1000373,
                            _ver: 1
                        },
                        'item-group': [
                            {
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: 1,
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].item[].type', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].type（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        type: null,
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].item[].type._value', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].type._value（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                            _value: null,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].type._value（数字以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                            _value: 'a',
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].item[].type._ver', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                            _value: 30036
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].type._ver（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                            _ver: null
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].type._ver（数字以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                            _ver: 'a'
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ不足：userInformation.item-group[].item[].content', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].content（空）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        content: null,
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].changable-flag（Boolean以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        content: '080-0000-0000',
                                        'changable-flag': 'a',
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('パラメータ異常：userInformation.item-group[].item[].require-sms-verification（Boolean以外）', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(JSON.stringify({
                    userInformation: {
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
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': 'a'
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
        });

        test('異常：オペレーターが個人以外', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333'])
                .send(JSON.stringify({
                    userInformation: {
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
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.NOT_OPERATION_AUTH);
        });

        test('異常：セッション有効期限切れ', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca'])
                .send(JSON.stringify({
                    userInformation: {
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
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: '080-0000-0000',
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(message.IS_EXPIRED);
        });

        test('異常：連絡先電話番号が文字列以外', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify({
                    userInformation: {
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
                                title: '連絡先電話番号',
                                item: [
                                    {
                                        title: '連絡先電話番号',
                                        type: {
                                            _value: 30036,
                                            _ver: 1
                                        },
                                        content: 8000000000,
                                        'changable-flag': true,
                                        'require-sms-verification': true
                                    }
                                ]
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(message.PHONE_NUMBER_FIELD_IS_NOT_STRING);
        });

        test('異常：連絡先電話番号が存在しない', async () => {
            // 送信データを生成
            const url = Url.IndSmsVerificate;

            // 対象APIに送信
            const response = await supertest(expressApp).post(url)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(JSON.stringify({
                    userInformation: {
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
                            }
                        ]
                    }
                }));
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(message.REQUIRED_PHONE_NUMBER);
        });
    });
});
