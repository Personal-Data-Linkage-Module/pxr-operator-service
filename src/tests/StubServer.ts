/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import { Server } from 'net';
import pxrSetting = require('./catalog/pxr-setting.json');
import pxrSettingIdServiceOn = require('./catalog/pxr-setting_IdServiceOn.json');
import memberAuth = require('./catalog/member.json');
import catalogAuth = require('./catalog/catalog.json');
import settings = require('./catalog/settings.json');
import dataTrader = require('./catalog/data-trader.json');

export class BaseStubServer {
    app: express.Express;
    server: Server;

    port: number;

    constructor () {
        this.app = express();
    }

    async start () {
        return new Promise<void>((resolve, reject) => {
            this.server = this.app.listen(this.port, () => { resolve(); });
        });
    }

    async stop () {
        this.server.close();
    }
}

export class CatalogServer extends BaseStubServer {
    // IdService利用設定がONの場合はnumber === 1
    constructor (number = 0) {
        super();
        this.port = 3001;
        this.app.get('/catalog', (req, res) => {
            const ns = req.query.ns;
            if (ns === 'catalog/ext/test-org/setting/global') {
                if (number === 0) {
                    res.status(200).json(pxrSetting).end();
                } else if (number === 1) {
                    res.status(200).json(pxrSettingIdServiceOn).end();
                }
            } else if (ns === 'catalog/model/auth/member') {
                res.status(200).json(memberAuth).end();
            } else if (ns === 'catalog/model/auth/catalog') {
                res.status(200).json(catalogAuth).end();
            } else if (ns === 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020') {
                res.status(200).json(settings).end();
            } else if (ns === 'catalog/model/setting/actor/data-trader') {
                res.status(200).json(dataTrader).end();
            } else if (ns === 'catalog/model/actor/wf/部署/store') {
                res.status(200);
                res.json([
                    {
                        catalogItem: {
                            _code: {
                                _value: 43,
                                _ver: 1
                            }
                        },
                        template: {
                            store: [
                                {
                                    role: [
                                        {
                                            _value: 43,
                                            _ver: 1
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]);
                res.end();
            } else if (ns === 'catalog/model/actor/wf/部署/workflow') {
                res.status(200);
                res.json([
                    {
                        catalogItem: {
                            _code: {
                                _value: 43,
                                _ver: 1
                            }
                        },
                        template: {
                            store: [
                                {
                                    _value: 43,
                                    _ver: 1
                                },
                            ]
                        }
                    }
                ]);
                res.end();
            } else if (ns === 'catalog/ext/test-org/actor/wf/actor_1000004/store') {
                res.status(200);
                res.json([
                    {
                        catalogItem: {
                            _code: {
                                _value: 1000700,
                                _var: 1
                            }
                        },
                        template: {
                            store: [
                                {
                                    role: [
                                        {
                                            _value: 1000005,
                                            _ver: 1
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]);
                res.end();
            } else if (ns === 'catalog/ext/test-org/actor/wf/actor_1000004/workflow') {
                res.status(200);
                res.json([
                    {
                        catalogItem: {
                            _code: {
                                _value: 1000800,
                                _var: 1
                            }
                        },
                        template: {
                            store: [
                                {
                                    _value: 1000700,
                                    _ver: 1
                                }
                            ]
                        }
                    }
                ]);
                res.end();
            } else {
                res.status(204).end();
            }
        });
        const _listener = (req: express.Request, res: express.Response) => {
            const _code = parseInt(req.params.code);
            if (_code === 43) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/actor/wf/部署/role',
                        name: 'ワークフロー職員ロール',
                        _code: {
                            _value: 43,
                            _ver: 1
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'ワークフロー職員が持つロールの定義です。'
                    }
                });
            } else if (_code === 44) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/actor/app/sample_app/application',
                        name: 'アプリケーション',
                        _code: {
                            _value: 44,
                            _ver: 1
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'アプリケーションが持つロールの定義です。'
                    }
                });
            } else if (_code === 1) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/format',
                        name: 'GPGGA形式',
                        _code: {
                            _value: '1',
                            _ver: '1'
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: '位置の値フォーマット（$GPGGA,m1,m2,c1,m3,c2,d1,d2,f1,f2,M,f3,M,f4,d3*cc形式）の定義です。'
                    }
                }).end();
            } else if (_code === 7) {
                res.status(200).json(
                    {
                        "catalogItem": {
                            "ns": "catalog/model/qualitative/gender",
                            "name": "男",
                            "_code": {
                                "_value": 8,
                                "_ver": 1
                            },
                            "inherit": null,
                            "description": "性別の候補値（男）の定義です。"
                        },
                        "template": {
                            "_code": {
                                "_value": 8,
                                "_ver": 1
                            }
                        },
                        "prop": null,
                        "value": null,
                        "attribute": null
                    }
                );
            } else if (_code === 8) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/model/qualitative/gender",
                        "name": "男",
                        "_code": {
                            "_value": 8,
                            "_ver": 1
                        },
                        "inherit": null,
                        "description": "性別の候補値（男）の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 8,
                            "_ver": 1
                        }
                    },
                    "prop": null,
                    "value": null,
                    "attribute": null
                });
            } else if (_code === 41) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/actor/app/application',
                        name: 'アプリケーション',
                        _code: {
                            _value: '41',
                            _ver: '1'
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'アプリケーションの定義です。'
                    }
                }).end();
            } else if (_code === 1000001) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/ext/osaka-u-society5.0/actor/pxr-root',
                        name: 'データビリティコンソーシアム（流通制御）',
                        _code: {
                            _value: 1000001,
                            _ver: 1
                        },
                        inherit: {
                            _value: 50,
                            _ver: 1
                        },
                        description: 'データビリティコンソーシアム（流通制御）の定義です。'
                    },
                    template: {
                        _code: {
                            _value: 1000001,
                            _ver: 1
                        },
                        'app-cert': {
                            cert: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'アプリケーションプロバイダーの認定基準',
                                    content: {
                                        sentence: 'アプリケーションプロバイダーの認定基準です。'
                                    }
                                }
                            },
                            audit: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'アプリケーションプロバイダーの監査手順',
                                    content: {
                                        sentence: 'アプリケーションプロバイダーの監査手順です。'
                                    }
                                }
                            }
                        },
                        category: null,
                        'consumer-cert': {
                            cert: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'データコンシューマーの認定基準',
                                    content: {
                                        sentence: 'データコンシューマーの認定基準です。'
                                    }
                                }
                            },
                            audit: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'データコンシューマーの監査手順',
                                    content: {
                                        sentence: 'データコンシューマーの監査手順です。'
                                    }
                                }
                            }
                        },
                        'data-trader-cert': {
                            cert: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'データ取引サービスプロバイダーの認定基準',
                                    content: {
                                        sentence: 'データ取引サービスプロバイダーの認定基準です。'
                                    }
                                }
                            },
                            audit: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'データ取引サービスプロバイダーの監査手順',
                                    content: {
                                        sentence: 'データ取引サービスプロバイダーの監査手順です。'
                                    }
                                }
                            }
                        },
                        'identification-set': [
                            {
                                element: {
                                    _value: 30001,
                                    _ver: 1
                                }
                            }
                        ],
                        'main-block': {
                            _value: 1000110,
                            _ver: 1
                        },
                        'other-block': null,
                        'region-root-cert': {
                            cert: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: '領域運営サービスプロバイダーの認定基準',
                                    content: {
                                        sentence: '領域運営サービスプロバイダーの認定基準です。'
                                    }
                                }
                            },
                            audit: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: '領域運営サービスプロバイダーの監査手順',
                                    content: {
                                        sentence: '領域運営サービスプロバイダーの監査手順です。'
                                    }
                                }
                            }
                        },
                        statement: [
                            {
                                title: '組織ステートメント',
                                section: {
                                    title: '事業概要',
                                    content: {
                                        sentence: '一般社団法人データビリティコンソーシアムは、ライフデザイン・イノベーション研究拠点 における活動を広く社会に普及させるために、多様なステイクホルダーが集い、高付加価値ヒューマンデータの活用によるイノベーション創出を共創的に実現していく場として、設立しました。\r\n本法人は、データ駆動型の社会課題の解決に関する多様な知識や方法を広く社会実装し、社会において急務とされる人材育成やデータ利活用の促進について、具体的な企業の方々と共に考えていく前例のないプラットフォームです。'
                                    }
                                }
                            }
                        ],
                        status: [
                            {
                                status: 'certified',
                                by: null,
                                at: '2020-01-01T00:00:00.000+0900'
                            }
                        ],
                        'wf-cert': {
                            cert: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'ワークフロープロバイダーの認定基準',
                                    content: {
                                        sentence: 'ワークフロープロバイダーの認定基準です。'
                                    }
                                }
                            },
                            audit: {
                                key: 'title',
                                value: '',
                                section: {
                                    title: 'ワークフロープロバイダーの監査手順',
                                    content: {
                                        sentence: 'ワークフロープロバイダーの監査手順です。'
                                    }
                                }
                            }
                        }
                    },
                    prop: [
                        {
                            key: 'app-cert',
                            type: {
                                of: 'inner',
                                inner: 'Certification'
                            },
                            description: 'アプリケーションプロバイダー認定'
                        },
                        {
                            key: 'category',
                            type: {
                                of: 'code[]',
                                candidate: {
                                    ns: [
                                        'catalog/ext/osaka-u-society5.0/category/supply/actor',
                                        'catalog/built_in/category/supply/actor',
                                        'catalog/model/category/supply/actor',
                                        'catalog/ext/osaka-u-society5.0/category/share/actor',
                                        'catalog/built_in/category/share/actor',
                                        'catalog/model/category/share/actor'
                                    ],
                                    _code: null,
                                    base: null
                                }
                            },
                            description: null
                        },
                        {
                            key: 'consumer-cert',
                            type: {
                                of: 'inner',
                                inner: 'Certification'
                            },
                            description: 'データコンシューマー認定'
                        },
                        {
                            key: 'data-trader-cert',
                            type: {
                                of: 'inner',
                                inner: 'Certification'
                            },
                            description: 'データ取引サービスプロバイダー認定'
                        },
                        {
                            key: 'identification-set',
                            type: {
                                of: 'inner[]',
                                inner: 'Identification'
                            },
                            description: '採用した本人性確認事項の組み合わせ'
                        },
                        {
                            key: 'main-block',
                            type: {
                                of: 'code',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: 'アクター参加時に割り当てられたPXR-Block'
                        },
                        {
                            key: 'other-block',
                            type: {
                                of: 'code[]',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: '他アクターから引き継いだPXR-Blockの配列'
                        },
                        {
                            key: 'region-root-cert',
                            type: {
                                of: 'inner',
                                inner: 'Certification'
                            },
                            description: '領域運営サービスプロバイダー認定'
                        },
                        {
                            key: 'statement',
                            type: {
                                of: 'item[]',
                                candidate: {
                                    ns: null,
                                    _code: [
                                        {
                                            _value: 61,
                                            _ver: 1
                                        }
                                    ],
                                    base: null
                                }
                            },
                            description: '組織ステートメント'
                        },
                        {
                            key: 'status',
                            type: {
                                of: 'inner[]',
                                inner: 'CertStatus'
                            },
                            description: '認定の履歴'
                        },
                        {
                            key: 'store-distribution-ratio',
                            type: {
                                of: 'inner[]',
                                inner: 'DistributionRatio'
                            },
                            description: '蓄積分配比率'
                        },
                        {
                            key: 'supply-distribution-ratio',
                            type: {
                                of: 'inner[]',
                                inner: 'DistributionRatio'
                            },
                            description: '提供分配比率'
                        },
                        {
                            key: 'wf-cert',
                            type: {
                                of: 'inner',
                                inner: 'Certification'
                            },
                            description: 'ワークフロープロバイダー認定'
                        }
                    ],
                    attribute: null
                }).end();
            } else if (_code === 1000002) {
                res.status(200).json({
                    catalogItem: null,
                    template: null,
                    prop: null,
                    attribute: null
                }).end();
            }  else if (_code === 1000004) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/ext/osaka-u-society5.0/actor/wf',
                        name: 'テストアクターカタログ（wf）',
                        _code: {
                            _value: 1000004,
                            _ver: 1
                        },
                        inherit: {
                            _value: 47,
                            _ver: 1
                        },
                        description: 'テストアクターカタログ（wf）の定義です。'
                    },
                    template: {
                        _code: {
                            _value: 1000004,
                            _ver: 1
                        },
                        'main-block': {
                            _value: 1000110,
                            _ver: 1
                        },
                        'other-block': null,
                        'region-alliance': [],
                        statement: null,
                        status: null,
                        workflow: [
                            {
                                _value: 1000010,
                                _ver: 1
                            },
                            {
                                _value: 1000011,
                                _ver: 1
                            }
                        ],
                    },
                    prop: [
                        {
                            key: 'main-block',
                            type: {
                                of: 'code',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: 'アクター参加時に割り当てられたPXR-Block'
                        },
                        {
                            key: 'other-block',
                            type: {
                                of: 'code[]',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: '他アクターから引き継いだPXR-Blockの配列'
                        },
                        {
                            key: 'statement',
                            type: {
                                of: 'item[]',
                                candidate: {
                                    ns: null,
                                    _code: [
                                        {
                                            _value: 61,
                                            _ver: 1
                                        }
                                    ],
                                    base: null
                                }
                            },
                            description: '組織ステートメント'
                        },
                        {
                            key: 'status',
                            type: {
                                of: 'inner[]',
                                inner: 'CertStatus'
                            },
                            description: '認定の履歴'
                        }
                    ],
                    attribute: null
                }).end();
            } else if (_code === 1000104) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/ext/osaka-u-society5.0/actor/app',
                        name: 'テストアクターカタログ（app）',
                        _code: {
                            _value: 1000104,
                            _ver: 1
                        },
                        inherit: {
                            _value: 42,
                            _ver: 1
                        },
                        description: 'テストアクターカタログ（app）の定義です。'
                    },
                    template: {
                        _code: {
                            _value: 1000104,
                            _ver: 1
                        },
                        'main-block': {
                            _value: 1000110,
                            _ver: 1
                        },
                        'other-block': null,
                        'region-alliance': [],
                        statement: null,
                        status: null,
                        application: [
                            {
                                _value: 1000021,
                                _ver: 1
                            },
                            {
                                _value: 1000022,
                                _ver: 1
                            }
                        ],
                    },
                    prop: [
                        {
                            key: 'main-block',
                            type: {
                                of: 'code',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: 'アクター参加時に割り当てられたPXR-Block'
                        },
                        {
                            key: 'other-block',
                            type: {
                                of: 'code[]',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: '他アクターから引き継いだPXR-Blockの配列'
                        },
                        {
                            key: 'statement',
                            type: {
                                of: 'item[]',
                                candidate: {
                                    ns: null,
                                    _code: [
                                        {
                                            _value: 61,
                                            _ver: 1
                                        }
                                    ],
                                    base: null
                                }
                            },
                            description: '組織ステートメント'
                        },
                        {
                            key: 'status',
                            type: {
                                of: 'inner[]',
                                inner: 'CertStatus'
                            },
                            description: '認定の履歴'
                        }
                    ],
                    attribute: null
                }).end();
            } else if (_code === 1000204) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/ext/osaka-u-society5.0/actor/region-root',
                        name: 'テストアクターカタログ（region-root）',
                        _code: {
                            _value: 1000204,
                            _ver: 1
                        },
                        inherit: {
                            _value: 49,
                            _ver: 1
                        },
                        description: 'テストアクターカタログ（region-root）の定義です。'
                    },
                    template: {
                        _code: {
                            _value: 1000204,
                            _ver: 1
                        },
                        'main-block': {
                            _value: 1000110,
                            _ver: 1
                        },
                        'other-block': null,
                        statement: null,
                        status: null,
                        region: [
                            {
                                _value: 1000030,
                                _ver: 1
                            },
                            {
                                _value: 1000031,
                                _ver: 1
                            }
                        ],
                    },
                    prop: [
                        {
                            key: 'main-block',
                            type: {
                                of: 'code',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: 'アクター参加時に割り当てられたPXR-Block'
                        },
                        {
                            key: 'other-block',
                            type: {
                                of: 'code[]',
                                candidate: {
                                    ns: null,
                                    _code: null,
                                    base: {
                                        _value: 29,
                                        _ver: null
                                    }
                                }
                            },
                            description: '他アクターから引き継いだPXR-Blockの配列'
                        },
                        {
                            key: 'statement',
                            type: {
                                of: 'item[]',
                                candidate: {
                                    ns: null,
                                    _code: [
                                        {
                                            _value: 61,
                                            _ver: 1
                                        }
                                    ],
                                    base: null
                                }
                            },
                            description: '組織ステートメント'
                        },
                        {
                            key: 'status',
                            type: {
                                of: 'inner[]',
                                inner: 'CertStatus'
                            },
                            description: '認定の履歴'
                        }
                    ],
                    attribute: null
                }).end();
            } else if (_code === 1000109) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/block/data-trader",
                        "name": "Data-Trader-Block",
                        "_code": {
                            "_value": 1000109,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 32,
                            "_ver": 1
                        },
                        "description": "データ取引サービスプロバイダー用PXR-Blockの定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000109,
                            "_ver": 1
                        },
                        "actor-type": "data-trader",
                        "assigned-organization": "データ取引組織",
                        "assignment-status": "assigned",
                        "base-url": "test-org-trader.test.org",
                        "first-login-url": "https://www.test.org/login",
                        "id": "Data-Trader-01",
                        "service-name": "test-org-trader-service"
                    },
                    "prop": [
                        {
                            "key": "actor-type",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": {
                                    "value": [
                                        "pxr-root",
                                        "region-root",
                                        "app",
                                        "wf",
                                        "data-trader",
                                        "consumer"
                                    ]
                                }
                            },
                            "description": "このPXR-Blockを保有する組織の種別"
                        },
                        {
                            "key": "assigned-organization",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "割当アクター名"
                        },
                        {
                            "key": "assignment-status",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": {
                                    "value": [
                                        "assigned",
                                        "unassigned"
                                    ]
                                }
                            },
                            "description": "割当状態"
                        },
                        {
                            "key": "base-url",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "PXR-BlockのベースURL"
                        },
                        {
                            "key": "first-login-url",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "初回ログインURL"
                        },
                        {
                            "key": "id",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "PXR-Block識別子"
                        },
                        {
                            "key": "service-name",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "PXR-Blockのサービス名"
                        }
                    ],
                    "attribute": null
                }).end();
            } else if (_code === 1000005) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/actor/wf/actor_1000004/role",
                        "name": "研究員",
                        "_code": {
                            "_value": 1000005,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 43,
                            "_ver": 1
                        },
                        "description": "テスト用ワークフローＡの研究員です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000005,
                            "_ver": 1
                        },
                        "document": null,
                        "event": null,
                        "licence": null,
                        "thing": null
                    },
                    "prop": [
                        {
                            "key": "document",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/document/*",
                                        "catalog/built_in/document/*",
                                        "catalog/ext/test-org/document/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "作成可能なドキュメント"
                        },
                        {
                            "key": "event",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/event/*",
                                        "catalog/built_in/event/*",
                                        "catalog/ext/test-org/event/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "作成可能なイベント"
                        },
                        {
                            "key": "licence",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/licence",
                                        "catalog/built_in/licence",
                                        "catalog/ext/test-org/licence"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "所持ライセンス"
                        },
                        {
                            "key": "thing",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/thing/*",
                                        "catalog/built_in/thing/*",
                                        "catalog/ext/test-org/thing/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "作成可能なモノ"
                        }
                    ],
                    "attribute": null
                }).end();
            } else if (_code === 10003) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/built_in/format",
                        "name": "nnnne3",
                        "_code": {
                            "_value": 10003,
                            "_ver": 1
                        },
                        "inherit": null,
                        "description": "有効数字の値フォーマット（整数部3桁、小数部1桁）の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 10003,
                            "_ver": 1
                        }
                    },
                    "prop": null,
                    "attribute": null
                }).end();
            } else if (_code === 1000373) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/person/user-information",
                        "name": "利用者情報",
                        "_code": {
                            "_value": 1000373,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 106,
                            "_ver": 1
                        },
                        "description": "組織で利用する利用者情報の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000373,
                            "_ver": 1
                        },
                        "item-group": [
                            {
                                "title": "氏名",
                                "item": [
                                    {
                                        "title": "姓",
                                        "type": {
                                            "_value": 30019,
                                            "_ver": 1
                                        },
                                        "content": null
                                    },
                                    {
                                        "title": "名",
                                        "type": {
                                            "_value": 30020,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "性別",
                                "item": [
                                    {
                                        "title": "性別",
                                        "type": {
                                            "_value": 30021,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "生年（西暦）",
                                "item": [
                                    {
                                        "title": "生年（西暦）",
                                        "type": {
                                            "_value": 1000372,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "住所（行政区）",
                                "item": [
                                    {
                                        "title": "住所（行政区）",
                                        "type": {
                                            "_value": 1000371,
                                            "_ver": 1
                                        },
                                        "content": null,
                                        "changable-flag": true,
                                    }
                                ]
                            },
                            {
                                "title": "連絡先電話番号",
                                "item": [
                                    {
                                        "title": "連絡先電話番号",
                                        "type": {
                                            "_value": 30036,
                                            "_ver": 1
                                        },
                                        "content": null,
                                        "changable-flag": true,
                                        "require-sms-verification": true
                                    }
                                ]
                            }
                        ]
                    },
                    "prop": [
                        {
                            "key": "item-group",
                            "type": {
                                "of": "inner[]",
                                "inner": "ItemGroup",
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "個人属性グループの配列"
                        }
                    ],
                    "attribute": null
                }).end();
            } else if (_code === 30019 || _code === 30020 || _code === 30021 || _code === 30036) {
                res.status(200);
                res.json({
                    "catalogItem": {
                        "ns": "catalog/built_in/person/item-type",
                        "name": "dummy",
                        "_code": {
                            "_value": 0,
                            "_ver": 1
                        },
                        "inherit": null,
                        "description": "個人属性の項目種別（dummy）の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 0,
                            "_ver": 1
                        }
                    },
                    "prop": null,
                    "value": null,
                    "attribute": null
                });
            } else if (_code === 1000371) {
                res.status(200);
                res.json({
                    "catalogItem": {
                        "ns": "catalog/ext/aaa-healthcare-consortium/person/item-type",
                        "name": "住所（行政区）",
                        "_code": {
                            "_value": 1000371,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 133,
                            "_ver": 1
                        },
                        "description": "個人属性の項目種別（住所（行政区））の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000371,
                            "_ver": 1
                        },
                        "input-pattern": ".+"
                    },
                    "prop": null,
                    "value": null,
                    "attribute": null
                });
            } else if (_code === 1000372) {
                res.status(200);
                res.json({
                    "catalogItem": {
                        "ns": "catalog/ext/aaa-healthcare-consortium/person/item-type",
                        "name": "生年（西暦）",
                        "_code": {
                            "_value": 1000372,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 133,
                            "_ver": 1
                        },
                        "description": "個人属性の項目種別（生年（西暦））の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000372,
                            "_ver": 1
                        },
                        "input-pattern": "^[12][0-9]{3}$"
                    },
                    "prop": null,
                    "value": null,
                    "attribute": null
                });
            } else {
                res.status(400).end();
            }
        };
        this.app.get('/catalog/:code', _listener);
        this.app.get('/catalog/:code/:ver', _listener);
    }
}

export class CatalogServer2 extends BaseStubServer {
    constructor () {
        super();
        this.port = 3001;
        this.app.get('/catalog', (req, res) => {
            const ns = req.query.ns;
            if (ns === 'catalog/ext/test-org/setting/global') {
                res.status(200).json(pxrSetting).end();
            } else if (ns === 'catalog/model/auth/member') {
                res.status(200).json(memberAuth).end();
            } else if (ns === 'catalog/model/auth/catalog') {
                res.status(200).json(catalogAuth).end();
            } else if (ns === 'catalog/ext/test-org/setting/actor/data-trader/actor_1000020') {
                res.status(200).json(settings).end();
            } else if (ns === 'catalog/model/setting/actor/data-trader') {
                res.status(200).json(dataTrader).end();
            } else {
                res.status(204).end();
            }
        });
        const _listener = (req: express.Request, res: express.Response) => {
            const _code = parseInt(req.params.code);
            if (_code === 43) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/actor/wf/部署/role',
                        name: 'ワークフロー職員ロール',
                        _code: {
                            _value: 43,
                            _ver: 1
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'ワークフロー職員が持つロールの定義です。'
                    }
                });
            } else if (_code === 44) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/actor/app/sample_app/application',
                        name: 'アプリケーション',
                        _code: {
                            _value: 44,
                            _ver: 1
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'アプリケーションが持つロールの定義です。'
                    }
                });
            } else if (_code === 1) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/format',
                        name: 'GPGGA形式',
                        _code: {
                            _value: '1',
                            _ver: '1'
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: '位置の値フォーマット（$GPGGA,m1,m2,c1,m3,c2,d1,d2,f1,f2,M,f3,M,f4,d3*cc形式）の定義です。'
                    }
                }).end();
            } else if (_code === 41) {
                res.status(200).json({
                    catalogItem: {
                        ns: 'catalog/model/actor/app/application',
                        name: 'アプリケーション',
                        _code: {
                            _value: '41',
                            _ver: '1'
                        },
                        inherit: {
                            _value: null,
                            _ver: null
                        },
                        description: 'アプリケーションの定義です。'
                    }
                }).end();
            } else if (_code === 1000109) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/block/data-trader",
                        "name": "Data-Trader-Block",
                        "_code": {
                            "_value": 1000109,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 32,
                            "_ver": 1
                        },
                        "description": "データ取引サービスプロバイダー用PXR-Blockの定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000109,
                            "_ver": 1
                        },
                        "actor-type": "data-trader",
                        "assigned-organization": "データ取引組織",
                        "assignment-status": "assigned",
                        "base-url": "test-org-trader.test.org",
                        "first-login-url": "https://www.test.org/login",
                        "id": "Data-Trader-01",
                        "service-name": "test-org-trader-service"
                    },
                    "prop": [
                        {
                            "key": "actor-type",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": {
                                    "value": [
                                        "pxr-root",
                                        "region-root",
                                        "app",
                                        "wf",
                                        "data-trader",
                                        "consumer"
                                    ]
                                }
                            },
                            "description": "このPXR-Blockを保有する組織の種別"
                        },
                        {
                            "key": "assigned-organization",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "割当アクター名"
                        },
                        {
                            "key": "assignment-status",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": {
                                    "value": [
                                        "assigned",
                                        "unassigned"
                                    ]
                                }
                            },
                            "description": "割当状態"
                        },
                        {
                            "key": "base-url",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "PXR-BlockのベースURL"
                        },
                        {
                            "key": "first-login-url",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "初回ログインURL"
                        },
                        {
                            "key": "id",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "PXR-Block識別子"
                        },
                        {
                            "key": "service-name",
                            "type": {
                                "of": "string",
                                "cmatrix": null,
                                "format": null,
                                "unit": null,
                                "candidate": null
                            },
                            "description": "PXR-Blockのサービス名"
                        }
                    ],
                    "attribute": null
                }).end();
            } else if (_code === 1000005) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/actor/wf/actor_1000004/role",
                        "name": "研究員",
                        "_code": {
                            "_value": 1000005,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 43,
                            "_ver": 1
                        },
                        "description": "テスト用ワークフローＡの研究員です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000005,
                            "_ver": 1
                        },
                        "document": null,
                        "event": null,
                        "licence": null,
                        "thing": null
                    },
                    "prop": [
                        {
                            "key": "document",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/document/*",
                                        "catalog/built_in/document/*",
                                        "catalog/ext/test-org/document/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "作成可能なドキュメント"
                        },
                        {
                            "key": "event",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/event/*",
                                        "catalog/built_in/event/*",
                                        "catalog/ext/test-org/event/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "作成可能なイベント"
                        },
                        {
                            "key": "licence",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/licence",
                                        "catalog/built_in/licence",
                                        "catalog/ext/test-org/licence"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "所持ライセンス"
                        },
                        {
                            "key": "thing",
                            "type": {
                                "of": "code[]",
                                "cmatrix": null,
                                "candidate": {
                                    "ns": [
                                        "catalog/model/thing/*",
                                        "catalog/built_in/thing/*",
                                        "catalog/ext/test-org/thing/*"
                                    ],
                                    "_code": null,
                                    "base": null
                                }
                            },
                            "description": "作成可能なモノ"
                        }
                    ],
                    "attribute": null
                }).end();
            } else if (_code === 10003) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/built_in/format",
                        "name": "nnnne3",
                        "_code": {
                            "_value": 10003,
                            "_ver": 1
                        },
                        "inherit": null,
                        "description": "有効数字の値フォーマット（整数部3桁、小数部1桁）の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 10003,
                            "_ver": 1
                        }
                    },
                    "prop": null,
                    "attribute": null
                }).end();
            } else if (_code === 1000373) {
                res.status(200).json({
                    "catalogItem": {
                        "ns": "catalog/ext/test-org/person/user-information",
                        "name": "利用者情報",
                        "_code": {
                            "_value": 1000373,
                            "_ver": 1
                        },
                        "inherit": {
                            "_value": 106,
                            "_ver": 1
                        },
                        "description": "組織で利用する利用者情報の定義です。"
                    },
                    "template": {
                        "_code": {
                            "_value": 1000373,
                            "_ver": 1
                        },
                        "item-group": [
                            {
                                "title": "氏名",
                                "item": [
                                    {
                                        "title": "姓",
                                        "type": {
                                            "_value": 30019,
                                            "_ver": 1
                                        },
                                        "content": null
                                    },
                                    {
                                        "title": "名",
                                        "type": {
                                            "_value": 30020,
                                            "_ver": 1
                                        },
                                        "content": null
                                    },
                                    {
                                        "title": "姓",
                                        "type": {
                                            "_value": 30019,
                                            "_ver": 1
                                        },
                                        "content": null
                                    },
                                    {
                                        "title": "名",
                                        "type": {
                                            "_value": 30020,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "性別",
                                "item": [
                                    {
                                        "title": "性別",
                                        "type": {
                                            "_value": 30021,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "生年（西暦）",
                                "item": [
                                    {
                                        "title": "生年（西暦）",
                                        "type": {
                                            "_value": 1000372,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "住所（行政区）",
                                "item": [
                                    {
                                        "title": "住所（行政区）",
                                        "type": {
                                            "_value": 1000371,
                                            "_ver": 1
                                        },
                                        "content": null
                                    }
                                ]
                            },
                            {
                                "title": "連絡先電話番号",
                                "item": [
                                    {
                                        "title": "連絡先電話番号",
                                        "type": {
                                            "_value": 30036,
                                            "_ver": 1
                                        },
                                        "content": null,
                                        "changable-flag": false,
                                        "require-sms-verification": true
                                    }
                                ]
                            }
                        ]
                    },
                    "prop": [
                        {
                            "key": "item-group",
                            "type": {
                                "of": "inner[]",
                                "inner": "ItemGroup",
                                "cmatrix": null,
                                "candidate": null
                            },
                            "description": "個人属性グループの配列"
                        }
                    ],
                    "attribute": null
                }).end();
            } else {
                res.status(400).end();
            }
        };
        this.app.get('/catalog/:code', _listener);
        this.app.get('/catalog/:code/:ver', _listener);
    }
}
