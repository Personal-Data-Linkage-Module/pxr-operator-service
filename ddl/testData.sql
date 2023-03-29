/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
-- 通常、APIから作成できないテストデータの登録
-- アプリケーション
INSERT INTO pxr_operator.operator
(
    type, login_id, hpassword, name,
    attributes, is_disabled, created_by, created_at, updated_by, updated_at
)
VALUES
(
    2, 'アプリケーション01', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'attributesが空のAPP',
    NULL, false, 'test_user', NOW(), 'test_user', NOW()
),
(
    2, 'アプリケーション02', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'attributesに必要な要素が無いAPP',
    '{"test":"test"}', false, 'test_user', NOW(), 'test_user', NOW()
),
(
    2, 'アプリケーション03', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'カタログと名前が一致しないAPP',
    '{"_code" : {"_value" : 41,"_ver" : 1}}', false, 'test_user', NOW(), 'test_user', NOW()
)
;

-- セッションは有効だけど削除済みのオペレーター
INSERT INTO pxr_operator.operator
(
    id, type, login_id, hpassword, name,
    is_disabled, created_by, created_at, updated_by, updated_at
)
VALUES
(
    999, 3, 'root_member999', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'セッションが有効なのに無効なmenber',
    true, 'test_user', NOW(), 'test_user', NOW()
)
;
INSERT INTO pxr_operator.session VALUES
(
    '00e58ec076ac2ca5c59509e9420e759ef022b9af08c7d06710b8d74a4ed43333', 999, '2025-01-01 00:00:00', 'test_user', NOW(), 'test_user', NOW()
);

-- ワンタイムログインコード照合用オペレーター
INSERT INTO pxr_operator.operator
(
    id, type, login_id, hpassword, mobile_phone,
    attributes, is_disabled, created_by, created_at, updated_by, updated_at
)
VALUES
(
    998, 0, 'ind_one_time', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '09011112222',
    '{"smsAuth" : true}', false, 'test_user', NOW(), 'test_user', NOW()
)
;
INSERT INTO pxr_operator.one_time_login_code VALUES
(
    '999999', 998, '2025-01-01 00:00:00', 'test_user', NOW(), 'test_user', NOW()
);
