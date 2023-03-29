/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import { Application } from '../resources/config/Application';
import { CatalogServer } from './StubServer';
import Common, { Url } from './Common';

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;
const common = new Common();

let catalogServer: any;

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
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブ停止
        if (catalogServer) {
            await catalogServer.stop();
        }
        // DB切断
        // await common.disconnect();
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
     * 削除取り消し
     */
    describe('削除取り消し', () => {
        test('パラメーター不足 operatorId', async () => {
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.cancelDelURI + '/')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' });

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('パラメーター異常 数字でない（operatorId）', async () => {
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.cancelDelURI + '/a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' });

            // レスポンスチェック
            expect(response.status).toBe(400);
        });
        test('正常', async () => {
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
                    NULL, true, 'test_user', NOW(), 'test_user', NOW(), '2'
                );
                INSERT INTO pxr_operator.role_setting
                (
                    operator_id, role_catalog_code, role_catalog_version,
                    is_disabled, created_by, created_at, updated_by, updated_at
                )
                VALUES
                (
                    2, 43, 1,
                    true, 'test_user', NOW(), 'test_user', NOW()
                );
            `);
            // スタブ起動
            catalogServer = new CatalogServer();
            await catalogServer.start();
            // 対象APIに送信
            const response = await supertest(expressApp).put(Url.cancelDelURI + '/2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11',
                    'operator_type0_session=' + '123a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e11']);

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.operatorId).toBe(2);
        });
    });
});
