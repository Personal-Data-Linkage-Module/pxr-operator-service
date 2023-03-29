/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');

export default class LoginServiceDto {
    /**
     * 設定ファイル情報
     */
    private configure: {} = null;
    /** ログインコード */
    private loginCode: string = null;

    /** 種別 */
    private type: number = null;

    /** ログインID */
    private loginId: string = null;

    /** パスワード */
    private hpassword: string = null;

    /** authorizationCode */
    private authorizationCode: string = null;

    /** accessToken */
    private accessToken: string = null;

    /** レスポンス */
    private response: express.Response = null;

    /** code_verifier */
    private codeVerifier: string = null;

    public getConfigure (): {} {
        return this.configure;
    }

    public setConfigure (configure: {}): void {
        this.configure = configure;
    }

    public getLoginCode (): string {
        return this.loginCode;
    }

    public setLoginCode (loginCode: string): void {
        this.loginCode = loginCode;
    }

    public getType (): number {
        return this.type;
    }

    public setType (type: number): void {
        this.type = type;
    }

    public getLoginId (): string {
        return this.loginId;
    }

    public setLoginId (loginId: string): void {
        this.loginId = loginId;
    }

    public getHpassword (): string {
        return this.hpassword;
    }

    public setHpassword (hpassword: string): void {
        this.hpassword = hpassword;
    }

    public getAuthorizationCode (): string {
        return this.authorizationCode;
    }

    public setAuthorizationCode (authorizationCode: string): void {
        this.authorizationCode = authorizationCode;
    }

    public getAccessToken (): string {
        return this.accessToken;
    }

    public setAccessToken (accessToken: string): void {
        this.accessToken = accessToken;
    }

    public getResponse () {
        return this.response;
    }

    public setResponse (response: express.Response): void {
        this.response = response;
    }

    public getCodeVerifier (): string {
        return this.codeVerifier;
    }

    public setCodeVerifier (codeVerifier: string): void {
        this.codeVerifier = codeVerifier;
    }

}
