/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

export default class SessionServiceDto {
    /** セッションID */
    private sessionId: string = '';

    private extendFlg: boolean = false;

    public getSessionId (): string {
        return this.sessionId;
    }

    public setSessionId (sessionId: string): void {
        this.sessionId = sessionId;
    }

    public getExtendFlg (): boolean {
        return this.extendFlg;
    }

    public setExtendFlg (extendFlg: boolean): void {
        this.extendFlg = extendFlg;
    }
}
