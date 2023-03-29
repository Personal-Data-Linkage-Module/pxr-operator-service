/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
-- 対象テーブルのデータをすべて削除
DELETE FROM pxr_operator.sms_verification_code;
DELETE FROM pxr_operator.session;
DELETE FROM pxr_operator.one_time_login_code;
DELETE FROM pxr_operator.role_setting;
DELETE FROM pxr_operator.operator;
DELETE FROM pxr_operator.login_history;
DELETE FROM pxr_operator.password_history;
DELETE FROM pxr_operator.user_information;
DELETE FROM pxr_operator.manage_block_info;

-- 対象テーブルのシーケンスを初期化
SELECT SETVAL('pxr_operator.sms_verification_code_id_seq', 1, false);
SELECT SETVAL('pxr_operator.operator_id_seq', 1, false);
SELECT SETVAL('pxr_operator.role_setting_id_seq', 1, false);
SELECT SETVAL('pxr_operator.login_history_id_seq', 1, false);
SELECT SETVAL('pxr_operator.password_history_id_seq', 1, false);
SELECT SETVAL('pxr_operator.one_time_login_code_id_seq', 1, false);
SELECT SETVAL('pxr_operator.user_information_id_seq', 1, false);
SELECT SETVAL('pxr_operator.manage_block_info_id_seq', 1, false);
