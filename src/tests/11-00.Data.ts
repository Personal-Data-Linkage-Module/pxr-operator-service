/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Common from './Common';
import moment = require('moment');

export async function clear () {
    const common = new Common();
    await common.connect();
    await common.executeSqlFile('initialData.sql');
}

export async function updateLockStartAtToPast () {
    const str = moment().add('-7', 'days').format('YYYY-MM-DD HH:mm:ss.SSS');
    const sql = `UPDATE pxr_operator.operator SET lock_start_at = '${str}';
    UPDATE pxr_operator.operator SET password_changed_flg = true`;
    const common = new Common();
    await common.connect();
    await common.executeSqlString(sql);
}

export async function updatePasswordLastUpdatedAtToPast () {
    const str = moment().add('-100', 'days').format('YYYY-MM-DD HH:mm:ss.SSS');
    const sql = `UPDATE pxr_operator.operator SET password_updated_at = '${str}';
    UPDATE pxr_operator.operator SET password_changed_flg = true;`;
    const common = new Common();
    await common.connect();
    await common.executeSqlString(sql);
}

export async function disableAllSessions () {
    const sql = 'UPDATE pxr_operator.session SET is_disabled = true;';
    const common = new Common();
    await common.connect();
    await common.executeSqlString(sql);
}

export async function updateUserInformation () {
    const sql = `
        UPDATE pxr_operator.operator
        SET user_information = '{format_error}'
        WHERE type = 0 AND is_disabled = false AND id = 2;
    `;
    const common = new Common();
    await common.connect();
    await common.executeSqlString(sql);
}
