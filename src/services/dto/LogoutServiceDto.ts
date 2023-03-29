/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
export default class LogoutServiceDto {
    /** セッションID */
    private sessionId: string = '';

    /** 設定ファイル情報 */
    private configure: {} = null;

    /** リクエスト */
    private request: any = null;

    /** レスポンス */
    private response: any = null;

    /**
     * 呼出元
     * 0: /ind/logout
     * それ以外: /logout
     */
    private caller: number = 1;

    public getSessionId (): string {
        return this.sessionId;
    }

    public setSessionId (sessionId: string): void {
        this.sessionId = sessionId;
    }

    public getConfigure (): {} {
        return this.configure;
    }

    public setConfigure (configure: {}): void {
        this.configure = configure;
    }

    public getRequest (): any {
        return this.request;
    }

    public setRequest (request: any): void {
        this.request = request;
    }

    public getResponse (): any {
        return this.response;
    }

    public setResponse (response: any): void {
        this.response = response;
    }

    public getCaller (): number {
        return this.caller;
    }

    public setCaller (caller: number): void {
        this.caller = caller;
    }
}
