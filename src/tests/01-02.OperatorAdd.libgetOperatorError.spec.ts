/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection } from 'typeorm';
/* eslint-enable */
import * as supertest from 'supertest';
import Common, { Url } from './Common';
import { Application } from '../resources/config/Application';
import Config from '../common/Config';
import OperatorEntity from '../repositories/postgres/OperatorEntity';
const Message = Config.ReadConfig('./config/message.json');

// テストモジュールをインポート
jest.mock('../repositories/postgres/OperatorRepository', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            return {
                getRecordFromType: jest.fn(async (type:number): Promise<OperatorEntity[]> => {
                    const results: OperatorEntity[] = [];
                    results.push(new OperatorEntity());
                    return results;
                }),
                getRecordCountFromType: jest.fn(async (type:number): Promise<number> => {
                    return 1;
                }),
                getRecordFromId: jest.fn(async (operatorId: number): Promise<OperatorEntity> => {
                    return null;
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
    });
    /**
     * 全テスト実行後の処理
     */
    afterAll(async () => {
        // DB切断
        // await common.disconnect();

        // サーバ停止
        app.stop();
    });

    /**
     * 追加
     */
    describe('追加 異常系', () => {
        test('データ異常　ログインしている有効なオペレーターが存在しない', async () => {
            // 事前データ準備
            await common.executeSqlString(`
                INSERT INTO pxr_operator.operator
                (
                    id, type, login_id, hpassword, name, auth,
                    attributes, is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
                )
                VALUES
                (
                    1, 3, 'manage_member01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '運営メンバー01', '{"add": true, "update": true, "delete": true}',
                    NULL, false, 'test_user', NOW(), 'test_user', NOW(), 'manage_member013'
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
                loginId: 'mng_menber00',
                hpassword: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
                name: '運営メンバー00',
                auth: {
                    add: true,
                    update: true,
                    delete: true
                }
            };

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.addURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send(JSON.stringify(json));

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.OPERATOR_NOT_EXISTS);
        });
    });
});
