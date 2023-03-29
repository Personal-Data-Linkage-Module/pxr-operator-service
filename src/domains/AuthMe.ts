/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import OperatorEntity from '../repositories/postgres/OperatorEntity';
/* eslint-enable */

/**
 * オペレーター ドメインオブジェクト
 */
export default class AuthMe {
    /** 個人メンバーのセッションキー */
    public static readonly TYPE_PERSONAL_KEY = 'operator_type0_session';

    /** アプリケーションメンバーのセッションキー */
    public static readonly TYPE_APPLICATION_KEY = 'operator_type2_session';

    /** 運営メンバーのセッションキー */
    public static readonly TYPE_MANAGER_KEY = 'operator_type3_session';

    /** 個人メンバーの種別ナンバー */
    public static readonly TYPE_PERSONAL_NUMBER = 0;

    /** アプリケーションメンバーの種別メンバー */
    public static readonly TYPE_APPLICATION_NUMBER = 2;

    /** 運営メンバーの種別メンバー */
    public static readonly TYPE_MANAGER_NUMBER = 3;

    /** セッションID    */
    sessionId?: string = null;

    /** オペレーターID */
    operatorId: number = null;

    /** オペレーター種別 */
    type: number = null;

    /** ログインID */
    loginId: string = null;

    /** オペレーター名 */
    name: string = null;

    /** 権限情報 */
    auth?: any = null;

    /** ロール */
    roles?: any = null;

    /** ブロックカタログコード */
    blockCode?: number = null;

    /** ブロックカタログバージョン */
    blockVersion?: number = null;

    /** アクターカタログコード */
    actorCode?: number = null;

    /** アクターカタログバージョン */
    actorVersion?: number = null;

    /** PXR-ID */
    pxrId?: string = null;

    /** レスポンスをURIエンコードした結果 */
    encoded: string = null;

    constructor () {
    }

    public parseToSession (session: any, rawData?: string) {
        this.sessionId = session.sessionId;
        this.operatorId = parseInt(session.operatorId);
        this.type = parseInt(session.type);
        this.loginId = session.loginId;
        this.name = session.name;
        this.auth = session.auth;
        this.roles = session.roles;
        if (session.block && typeof session.block === 'object') {
            this.blockCode = parseInt(session.block._value);
            this.blockVersion = parseInt(session.block._ver);
        }
        if (session.actor && typeof session.actor === 'object') {
            this.actorCode = parseInt(session.actor._value);
            this.actorVersion = parseInt(session.actor._ver);
        }
        this.pxrId = session.pxrId;
        this.encoded = rawData || encodeURIComponent(JSON.stringify(session));
    }

    public parseToEntity (entity: OperatorEntity, sessionId?: string) {
        this.sessionId = sessionId || null;
        this.operatorId = entity.id;
        this.type = entity.type;
        this.loginId = entity.loginId;
        this.name = entity.name ? entity.name : null;
        this.auth = entity.auth ? entity.auth : null;
        this.pxrId = entity.pxrId ? entity.pxrId : null;
    }
}
