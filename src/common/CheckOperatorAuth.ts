/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * 権限
 */
export namespace Authority {
    /**
     * 追加
     */
    export const ADD: string = 'add';

    /**
     * 更新
     */
    export const UPDATE: string = 'update';

    /**
     * 削除
     */
    export const DELETE: string = 'delete';
}
/**
 * 権限チェッククラス
 */
export default class CheckOperatorAuth {
    /**
     * 権限のチェック
     * @param auth
     * @param add
     * @param update
     * @param del
     */
    public static checkAuth (auth: any, add: boolean | null, update: boolean | null, del: boolean | null): boolean {
        // 権限がnullまたは空文字の場合、false
        if (!auth || typeof auth !== 'object' || typeof auth.member !== 'object') {
            return false;
        }

        // addがnullではない場合かつkeyにaddが無い、またはaddが指定した値ではない場合
        if (auth.member.add === add) {
            return true;
        }

        // updateがnullではない場合かつkeyにupdateが無い、またはupdateが指定した値ではない場合
        if (auth.member.update === update) {
            return true;
        }

        // delがnullではない場合かつkeyにdeleteが無い、またはdeleteが指定した値ではない場合
        if (auth.member.delete === del) {
            return true;
        }

        // すべてNGならfalse
        return false;
    }
}
