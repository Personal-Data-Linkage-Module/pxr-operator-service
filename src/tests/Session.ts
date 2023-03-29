/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * セッション情報
 */
export namespace Session {
    /**
    * 正常(流通制御)
    */
    export const pxrRoot = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
    * 正常(wf)
    */
   export const pxrWf = {
       sessionId: 'sessionId',
       operatorId: 1,
       type: 3,
       loginId: 'loginid',
       name: 'test-user',
       mobilePhone: '0311112222',
       auth: {
           member: {
               add: true,
               update: true,
               delete: true
           }
       },
       lastLoginAt: '2020-01-01T00:00:00.000+0900',
       attributes: {},
       roles: [
           {
               _value: 1,
               _ver: 1
           }
       ],
       block: {
           _value: 1000110,
           _ver: 1
       },
       actor: {
           _value: 1000004,
           _ver: 1
       }
   };

    /**
    * 正常(app)
    */
    export const pxrApp = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000104,
            _ver: 1
        }
    };

    /**
    * 正常(データ取引)
    */
    export const dataTrader = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000020,
            _ver: 1
        }
    };

    /**
    * 正常(ログインコード再作成)
    */
    export const loginCode = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            book: {
                create: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
    * 異常(オペレータタイプ0)
    */
    export const pxrRoot0 = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 0,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
    * 異常(オペレータタイプ1)
    */
    export const pxrRoot1 = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 1,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
    * 異常(オペレータタイプ2)
    */
    export const pxrRoot2 = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 2,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

   /**
    * 異常(対象カタログなし)
    */
    export const errorNotCatalog = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            member: {
                add: true,
                update: true,
                delete: true
            }
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 999999,
            _ver: 1
        }
    };

    /**
    * 異常(オペレータタイプがワークフロー、運営メンバー以外)
    */
    export const errorOperatorType = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 0,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            add: true,
            update: true,
            delete: true
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1,
            _ver: 1
        }
    };

    /**
    * 異常(流通制御、データ取引以外)
    */
    export const errorActorCode = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            add: true,
            update: true,
            delete: true
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1,
            _ver: 1
        }
    };

    /**
    * 異常(データ取引、create_bookなし)
    */
    export const errorNotCreateBook = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            add: true,
            update: true,
            delete: true
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000109,
            _ver: 1
        }
    };

    /**
    * 異常(アクターなし)
    */
    export const errorNotActor = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            add: true,
            update: true,
            delete: true
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        }
    };

    /**
     * 正常（個人）利用者ID連携取得用
     */
    export const getCooperate = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 0,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
     * 正常（個人）
     */
    export const bookCloseDelete = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 0,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
     * 異常（pxeId該当なし）
     */
    export const bookCloseDeleteError = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 0,
        loginId: 'pxr_user',
        pxrId: 'aaa',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
     * 異常（wf）
     */
    export const bookCloseDelete1 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 1,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
     * 異常（app）
     */
    export const bookCloseDelete2 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 2,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
     * 異常（運用メンバー）
     */
    export const bookCloseDelete3 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 3,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
     * 正常（個人）
     */
    export const dataStorePost = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 0,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（運営メンバー）
     */
    export const errorDataStoreDelete3 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 3,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（app）
     */
    export const errorDataStoreDelete2 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 2,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（wf）
     */
    export const errorDataStoreDelete1 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 1,
        type: 1,
        loginId: 'pxr_user',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（ログインIDなし）
     */
    export const identityPostErrLoginId = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            add: true,
            update: true,
            delete: true
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（ログインIDなし）
     */
    export const dataStorePostErrLoginId = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 0,
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（オペレーター種別が個人以外）
     */
    export const dataStorePostErrType = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 3,
        loginId: '58di2dfse2.test.org',
        pxrId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（PXR-IDが取得できない）
     */
    export const dataStorePostErrNotPxrId = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 0,
        loginId: '58di2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（BOOKが開設されていない）
     */
    export const dataStorePostErrBookNotExists = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 0,
        loginId: '123i2dfse2.test.org',
        pxrId: '123i2dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 正常（WF）
     */
    export const dataStoreGetWf = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 1,
        loginId: 'wf_staff01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000004,
            _ver: 1
        }
    };
    /**
     * 正常（APP）
     */
    export const dataStoreGetApp = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 4,
        type: 2,
        loginId: 'app01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000104,
            _ver: 1
        }
    };
    /**
     * 異常（データ蓄積定義が無い）
     */
    export const dataStoreNotExistSetting = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 0,
        loginId: '12342dfse2.test.org',
        pxrId: '12342dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（データ種が無い）
     */
    export const dataStoreNotExistDataType = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 2,
        type: 0,
        loginId: '56782dfse2.test.org',
        pxrId: '56782dfse2.test.org',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（アクターが無い）
     */
    export const dataStoreGetWfNotActor = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 1,
        loginId: 'wf_staff01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        }
    };
    /**
     * 異常（アクターがWF、APP以外）
     */
    export const dataStoreGetErrActor = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 1,
        loginId: 'wf_staff01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };
    /**
     * 異常（利用者IDからブックID取得ができない）
     */
    export const dataStoreGetNotFoundBookId = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 1,
        loginId: 'wf_staff01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000014,
            _ver: 1
        }
    };
    /**
     * 異常（カタログにnsがない）
     */
    export const dataStoreGetNotNs = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 1,
        loginId: 'wf_staff01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000304,
            _ver: 1
        }
    };
    /**
     * 異常（wfカタログにtemplate.workflowがない）
     */
    export const dataStoreGetNotWorkflow = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 1,
        loginId: 'wf_staff01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000404,
            _ver: 1
        }
    };
    /**
     * 異常（wfカタログにtemplate.workflowがない）
     */
    export const dataStoreGetNotApplication = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 2,
        loginId: 'app01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000604,
            _ver: 1
        }
    };
    /**
     * 異常（データ種が無い2）
     */
    export const dataStoreNotExistDataType2 = {
        sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
        operatorId: 3,
        type: 2,
        loginId: 'app01',
        pxrId: '',
        mobilePhone: '09011112222',
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000104,
            _ver: 1
        }
    };
}
