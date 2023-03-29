/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Server } from 'net';
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import Common, { Url } from './Common';
import { sprintf } from 'sprintf-js';
import Config from '../common/Config';
import express = require('express');
import pxrSetting = require('./catalog/pxr-setting.json');
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

// サーバをlisten
app.start();

const catalogServer = new (class {
    app: express.Application;
    server: Server;
    constructor () {
        this.app = express();
        this.app.get('/catalog', (req, res) => {
            const ns = req.query.ns;
            if (ns === 'catalog/ext/test-org/setting/global') {
                res.status(200).json(pxrSetting).end();
            } else {
                res.status(204).end();
            }
        });
    }

    async start () {
        this.server = this.app.listen(3001, () => {});
    }

    async stop () {
        this.server.close(() => {});
    }
})();

const DESCRIPTION = 'パスワードリセット';

// セッション情報
const session = JSON.stringify({
    sessionId: '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
    operatorId: 1,
    type: 3,
    loginId: 'mng_member',
    name: 'mng_member',
    auth: {
        member: {
            add: true,
            update: true,
            delete: true
        }
    },
    lastLoginAt: '2020-01-01 00:00:00.000+0900',
    attributes: {},
    block: {
        _value: 1000110,
        _ver: 1
    },
    actor: {
        _value: 1000001,
        _ver: 1
    }
});

// const session2 = JSON.stringify({
//     sessionId: '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e1234',
//     operatorId: 1,
//     type: 3,
//     loginId: 'mng_member',
//     name: 'mng_member',
//     auth: {
//         member: {
//             add: true,
//             update: true,
//             delete: true
//         }
//     },
//     lastLoginAt: '2020-01-01 00:00:00.000+0900',
//     attributes: {},
//     block: {
//         _value: 1000110,
//         _ver: 1
//     },
//     actor: {
//         _value: 1000001,
//         _ver: 1
//     }
// });

// const session3 = JSON.stringify({
//     sessionId: '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
//     operatorId: 3,
//     type: 3,
//     loginId: 'mng_member',
//     name: 'mng_member',
//     auth: {
//         member: {
//             add: true,
//             update: true,
//             delete: true
//         }
//     },
//     lastLoginAt: '2020-01-01 00:00:00.000+0900',
//     attributes: {},
//     block: {
//         _value: 1000110,
//         _ver: 1
//     },
//     actor: {
//         _value: 1000001,
//         _ver: 1
//     }
// });

const session4 = JSON.stringify({
    sessionId: '567a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
    operatorId: 2,
    type: 0,
    loginId: 'ind01',
    pxrId: 'ind01',
    lastLoginAt: '2020-01-01 00:00:00.000+0900',
    attributes: {},
    block: {
        _value: 1000110,
        _ver: 1
    },
    actor: {
        _value: 1000001,
        _ver: 1
    }
});

const session5 = JSON.stringify({
    sessionId: '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
    operatorId: 3,
    type: 3,
    loginId: 'manage_member02',
    name: 'manage_member02',
    auth: {
        member: {
            add: false,
            update: true,
            delete: true
        }
    },
    lastLoginAt: '2020-01-01 00:00:00.000+0900',
    attributes: {},
    block: {
        _value: 1000110,
        _ver: 1
    },
    actor: {
        _value: 1000001,
        _ver: 1
    }
});

// リクエスト
const testReq = JSON.stringify({
    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
});
const testReq2 = JSON.stringify({
    oldHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202948'
});
const testReq3 = JSON.stringify({
    newHpassword: ''
});

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
        await catalogServer.start();
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 各テスト実行の後処理
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
        await catalogServer.stop();
    });

    /**
     * パスワードリセット
     */
    describe('パスワードリセット', () => {
        test('正常：運営メンバー（追加権限有）で実行（Cookie）', async () => {
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
                    2, 0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                ),
                (
                    3, 3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": false, "update": false, "delete": false}}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    4, 3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": false, "update": false, "delete": false}}',
                    NULL, true, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
                ),
                (
                    99, 1, 'workflow_member99', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'workflow_member991'
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
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 3, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '567a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '789a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202950'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
        });
        test('異常：セッション有効期限切れ', async () => {
            // 事前データ準備
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

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '2212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca'])
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202945'
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.IS_EXPIRED);
        });
        test('正常：運営メンバー（追加権限有）で実行（header）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202945'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
        });
        test('正常：対象が個人以外のオペレーター種別', async () => {
            const response = await supertest(expressApp).put(Url.passwordURI + '/99')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202950'
                });

            expect(response.status).toBe(200);
        });
        // test('異常：セッションIDが無効（header）', async () => {
        //     // 対象APIに送信
        //     const response = await supertest(expressApp).put(Url.passwordURI + '/2')
        //         .set({ accept: 'application/json', 'Content-Type': 'application/json' })
        //         .set({ session: encodeURIComponent(session2) })
        //         .send(testReq);

        //     // レスポンスチェック
        //     expect(response.status).toBe(401);
        //     expect(response.body.message).toBe(sprintf(Message.RESPONSE_FAIL, DESCRIPTION));
        // });
        // test('異常：オペレーターIDが一致しない（header）', async () => {
        //     // 対象APIに送信
        //     const response = await supertest(expressApp).put(Url.passwordURI + '/2')
        //         .set({ accept: 'application/json', 'Content-Type': 'application/json' })
        //         .set({ session: encodeURIComponent(session3) })
        //         .send(testReq);

        //     // レスポンスチェック
        //     expect(response.status).toBe(401);
        //     expect(response.body.message).toBe(sprintf(Message.RESPONSE_FAIL, DESCRIPTION));
        // });
        test('異常：運営メンバー以外（header）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session4) })
                .send(testReq);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常：追加権限が無い（header）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session5) })
                .send(testReq);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常：運営メンバーでログインしていない（Cookie）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send(testReq);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(sprintf(Message.RESPONSE_FAIL, DESCRIPTION));
        });
        test('異常：運営メンバーが無効（Cookie）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '789a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(testReq);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(sprintf(Message.RESPONSE_FAIL, DESCRIPTION));
        });
        test('異常：追加権限が無い（Cookie）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(testReq);

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_OPERATION_AUTH);
        });
        test('異常：対象オペレーターが存在しない', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/4')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202941'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.OPERATOR_NOT_EXISTS);
        });
        test('異常：前回と同じパスワードが設定されている', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session) })
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202945'
                });

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                message: '過去に使用されたパスワードです'
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足：operatorId', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(testReq);

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'operatorId', value: 'password', message: '数値ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常：operatorId（数字以外）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(testReq);

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'operatorId', value: 'a', message: '数値ではありません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ不足：newHpassword', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(testReq2);

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'newHpassword', value: null, message: 'この値はハッシュである必要があります' },
                    { property: 'newHpassword', value: null, message: 'この値は空を期待しません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('パラメータ異常：newHpassword（空文字）', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send(testReq3);

            // レスポンスチェック
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                status: 400,
                reasons: [
                    { property: 'newHpassword', value: null, message: 'この値はハッシュである必要があります' },
                    { property: 'newHpassword', value: null, message: 'この値は空を期待しません' }
                ]
            }));
            expect(response.status).toBe(400);
        });
        test('異常：ログイン禁止フラグがtrue', async () => {
            // 事前データ準備
            await common.executeSqlFile('initialData.sql');
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    type, login_id, hpassword, name, auth, login_prohibited_flg,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"member": {"add": true, "update": true, "delete": true}}', true,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
                ),
                (
                    0, 'ind01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', NULL, NULL, false,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'ind010'
                ),
                (
                    3, 'manage_member02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー02', '{"member": {"add": false, "update": false, "delete": false}}',false,
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member023'
                ),
                (
                    3, 'manage_member03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー03', '{"member": {"add": false, "update": false, "delete": false}}',false,
                    NULL, true, 'test_user', NOW(), 'test_user', NOW(), 'manage_member033'
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
                ),
                (
                    '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 3, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '567a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 2, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                ),
                (
                    '789a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11', 4, '2025-01-27 23:59:59.000',
                    false, 'test_user', NOW(), 'test_user', NOW()
                );
            `);

            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.passwordURI + '/1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11'])
                .send({
                    newHpassword: 'cd08374a2f7d9827ac1e592e497bf0268b0d2af4a84e1d55c690348012202950'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.OPERATOR_NOT_LOGIN);
        });
    });
});
