/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import supertest = require('supertest');
import { Application } from '../resources/config/Application';
import Common from './Common';
/* eslint-enable */

const app = new Application();
const expressApp = app.express.app;

app.start();

describe('Operator Service.Operator Delete API', () => {
    beforeAll(async () => {
        await new Common().connect();
        await new Common().executeSqlFile('initialData.sql');
        await new Common().executeSqlString(`
            INSERT INTO pxr_operator.operator
            (
                id, type, login_id, hpassword, pxr_id, user_information, name, mobile_phone, mail, auth,
                last_login_at, password_changed_flg, login_prohibited_flg, attributes, lock_flg, lock_start_at, password_updated_at,
                user_id, app_catalog_code, wf_catalog_code, region_catalog_code, client_id, 
                is_disabled, created_by, created_at, updated_by, updated_at, unique_check_login_id
            )
            VALUES
            (1,
            3,
            'root_member01',
            '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            null,
            '{}',
            '流通制御運営メンバー01',
            null,
            null,
            '{"member":{"add":true,"update":true,"delete":true}}',
            '2020-09-01 12:53:09.784',
            false,
            false,
            '{}',
            false,
            null,
            '2020-09-01 00:00:00.000',
            null,
            null,
            null,
            null,
            null,
            false,
            'pxr_user',
            '2020-09-01 00:00:00.000',
            'root_member01',
            '2020-09-01 00:00:00.000',
            'root_member013'),

            (2,
            0,
            'member01',
            '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            'pxrId1',
            '{}',
            null,
            null,
            null,
            '{}',
            null,
            false,
            false,
            '{"initialPasswordExpire":"2030-01-01T00:00:00.000"}',
            false,
            null,
            '2020-09-01 00:00:00.000',
            null,
            null,
            null,
            null,
            null,
            false,
            'root_member01',
            '2020-09-01 00:00:00.000',
            'root_member01',
            '2020-09-01 00:00:00.000',
            'member010'),

            (3,
            0,
            'member02',
            '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            'pxrId2',
            '{}',
            null,
            null,
            null,
            '{}',
            null,
            false,
            false,
            '{"initialPasswordExpire":"2030-01-01T00:00:00.000"}',
            false,
            null,
            '2020-09-01 00:00:00.000',
            null,
            null,
            null,
            null,
            null,
            false,
            'root_member01',
            '2020-09-01 00:00:00.000',
            'root_member01',
            '2020-09-01 00:00:00.000',
            'member020');
        `);
        await new Common().executeSqlString(`
        INSERT INTO pxr_operator.session VALUES
        (
            '86d7eb745a94d6a6f95e9ffba4398fc37962144a7c2f50884df3d09d49b0b0b2',
            2,
            '2030-09-01 00:00:00.000',
            false,
            'member01',
            '2020-09-01 00:00:00.000',
            'member01',
            '2020-09-01 00:00:00.000'
        );`);
    });
    afterAll(async () => {
        app.stop();
    });
    test('異常系：別のユーザー(運営以外)から削除のリクエスト', async () => {
        const response = await supertest(expressApp)
            .delete('/operator/3')
            .set({
                'Content-Type': 'application/json',
                accept: 'application/json'
            });

        expect(JSON.stringify(response.body)).toBe(JSON.stringify({
            status: 401,
            message: 'セッションが有効ではありません'
        }));
        expect(response.status).toBe(401);
    });
});
