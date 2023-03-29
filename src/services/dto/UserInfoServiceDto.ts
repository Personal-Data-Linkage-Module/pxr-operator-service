/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import UserInformationDto from '../../resources/dto/UserInformationDto';
import AuthMe from '../../domains/AuthMe';
/* eslint-enable */

export default class UserInfoServiceDto {
    /** pxrId */
    private pxrId: string = null;

    /** pxrId */
    private userId: string = null;

    /** 利用者情報 */
    private userInfo: UserInformationDto = null;

    /** リクエスト情報 */
    private request: any = null;

    public getPxrId (): string {
        return this.pxrId;
    }

    public setPxrId (pxrId: string) {
        this.pxrId = pxrId;
    }

    public getUserId (): string {
        return this.userId;
    }

    public setUserId (userId: string) {
        this.userId = userId;
    }

    public getUserInfo (): UserInformationDto {
        return this.userInfo;
    }

    public setUserInfo (userInfo: UserInformationDto) {
        this.userInfo = userInfo;
    }

    public getRequest<T> (): T {
        return this.request;
    }

    public setRequest<T> (request: T) {
        this.request = request;
    }
}
