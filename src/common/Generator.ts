/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as uuid from 'uuid';
import * as crypto from 'crypto';

/**
 * UUID生成
 */
export default class Generator {
    /**
     * セッションIDを生成
     */
    public sessionId (): string {
        // 乱数を生成
        const uid = uuid();

        // hash化
        const sha256 = crypto.createHash('sha256');
        sha256.update(uid);
        const sessionId = sha256.digest('hex');
        return sessionId;
    }

    /**
     * ワンタイムログインコードを生成
     */
    public loginCode (): string {
        const sourceStr = '0123456789';
        const length = 6;
        return Array.from(crypto.randomFillSync(new Uint8Array(length))).map((n) => sourceStr[n % sourceStr.length]).join('');
    }

    /**
     * SMS検証コードを生成
     */
    public verificationCode (): string {
        const sourceStr = '0123456789';
        const length = 6;
        return Array.from(crypto.randomFillSync(new Uint8Array(length))).map((n) => sourceStr[n % sourceStr.length]).join('');
    }
}
