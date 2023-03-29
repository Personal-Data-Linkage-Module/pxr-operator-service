/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
/* eslint-enable */

export default class IdService {
    /**
     * オペレータSSOログイン
     */
    public async loginSso (accessToken: string): Promise<string> {
        // アクセストークン検証要求
        const clientId = '';

        // 検証結果のクライアントIDを返却する
        return clientId;
    }

    /**
     * 個人SSOログイン
     */
    public async indloginSso (authorizationCode: string, codeVerifier: string): Promise<string> {
        // アクセストークン要求
        //   OpenID Connect 1.0 specification のToken Endpoint（トークン要求受付）に相当
        //   http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#TokenEndpoint
        // ユーザー情報要求
        //   OpenID Connect 1.0 specification のUserInfo Endpoint（ユーザ情報要求受付）に相当
        //   http://openid-foundation-japan.github.io/openid-connect-core-1_0.ja.html#UserInfo
        // OpenId逆引き
        const pxrId = '';
        return pxrId;
    }

    /**
     * オペレータ（クライアント）追加
     */
    public async addClient (clientId: string, clientSecret: string, redirecturis: string, actorCode: string, appCodes: string[]) {
        // クライアント作成
        // 利用可能スコープ更新
        // 組織情報検索
        //   組織ID = appCodes.map((code) => {return actorCode + '_' + code});
        // 組織情報が存在する場合は組織情報のサービス名にオペレータ名を追加登録する
        // 組織情報が存在しない場合は組織情報を新しく登録する
    }

    /**
     * オペレータ（クライアント）更新
     */
    public async updateClient (clientid: string, redirecturis: string) {
        // クライアントIDが一致するクライアント情報からクライアントシークレットを取得
        // クライアント変更
    }

    /**
     * クライアント削除
     */
    public async deleteClient (clientId: string) {
        // クライアント削除
    }

    /**
     * 組織情報の更新
     */
    public async deleteService (clientId: string, actorCode: string, appCodes: string[]) {
        // 組織情報のサービス名からオペレータ名を削除する
        //   組織ID = appCodes.map((code) => {return actorCode + '_' + code});
    }
}
