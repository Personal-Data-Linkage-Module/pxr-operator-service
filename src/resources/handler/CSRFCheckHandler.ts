/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import express = require('express');
import Config from '../../common/Config';
import { doGetRequest, doPutRequest } from '../../common/DoRequest';
import Request = require('request');
import config = require('config');
import {
    Middleware,
    ExpressMiddlewareInterface,
    MethodNotAllowedError,
    UnauthorizedError,
    NotFoundError,
    BadRequestError,
    NotAcceptableError
} from 'routing-controllers';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
const Message = Config.ReadConfig('./config/message.json');
const configure = Config.ReadConfig('./config/config.json');
import * as log4js from 'log4js';
export const applicationLogger: log4js.Logger = log4js.getLogger('application');
/* eslint-enable */

@Middleware({ type: 'before' })
export default class CSRFCheckHandler implements ExpressMiddlewareInterface {
    async use (request: express.Request, response: express.Response, next: express.NextFunction) {
        // 条件に該当する場合CSRF検証を実施
        if (request.url.includes('/login')) {
            try {
                const url = configure['csrf_get_url'];
                applicationLogger.info(JSON.stringify(configure));
                applicationLogger.info(url);
                const options: Request.CoreOptions = {
                    headers: {
                        accept: 'application/json'
                    }
                };

                // CSRFトークンの発行
                const result = await doGetRequest(url, options);

                // 応答が403の場合、エラーを返す
                if (result.response.statusCode === ResponseCode.FOR_BIDDEN) {
                    throw new AppError(Message.CSRF_TOKEN, ResponseCode.FOR_BIDDEN);
                }
                response.setHeader('set-cookie', result.response.headers['set-cookie']);
            } catch (err) {
                applicationLogger.error(err);
                next(err);
            }
            next();
        } else if (request.url === '/operator/csrf/check' ||
            request.url === '/operator/session' ||
            request.url === '/operator/session/' ||
            request.headers.host.includes('127.0.0.1') ||
            (request.headers.referer && request.headers.referer.includes('api-docs')) ||
            !request.headers['cookie']) {
            next();
        } else {
            try {
                // リクエストヘッダーからXSRF-TOKENを取得する
                const xsrfToken = request.headers['x-xsrf-token'];
                // requestからCookieを取得して設定
                const cookieJar = Request.jar();
                cookieJar.setCookie(request.headers['cookie'], request.protocol + '://' + request.headers.host);
                // CSRF検証に必要な情報を設定
                const url = configure['csrf_check_url'];
                const options: Request.CoreOptions = {
                    headers: {
                        accept: 'application/json',
                        'X-XSRF-TOKEN': xsrfToken,
                        Cookie: request.headers['cookie']
                    },
                    jar: cookieJar
                };

                // CSRFトークンの検証実施
                const result = await doPutRequest(url, options);

                // 応答が403の場合、エラーを返す
                if (result.response.statusCode === ResponseCode.FOR_BIDDEN) {
                    throw new AppError(Message.CSRF_TOKEN, ResponseCode.FOR_BIDDEN);
                }
                response.setHeader('set-cookie', result.response.headers['set-cookie']);
            } catch (err) {
                next(err);
            }
            next();
        }
    }
}
