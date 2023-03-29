/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { systemLogger } from './logging';
import AppError from './AppError';
import Config from './Config';
// import * as log4js from 'log4js';
// import { sprintf } from 'sprintf-js';
// import * as uuid from 'uuid';
import request = require('request');
const Message = Config.ReadConfig('./config/message.json');
// const applicationLogger: log4js.Logger = log4js.getLogger('application');
// const performance = require('perf_hooks').performance;
// const contextService = require('request-context');

/**
 * GETリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doGetRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        // UUIDを発行
        // const uid = uuid();

        // リクエスト時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] external url:%s start', contextService.get('request:requestId'), uid, uri));

        // 開始時間を取得
        // const startTime = performance.now();
        request.get(uri, options, (error: Error, response: request.Response, body: any) => {
            // 終了時間を取得
            // const endTime = performance.now();

            // 処理時間を取得
            // const duration = endTime - startTime;

            // レスポンス時のログを出力
            // applicationLogger.warn(sprintf('[%s][%s] external url:%s finish time:%dmsec', contextService.get('request:requestId'), uid, uri, duration));
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') < 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}

/**
 * POSTリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doPostRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        // UUIDを発行
        // const uid = uuid();

        // リクエスト時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] external url:%s start', contextService.get('request:requestId'), uid, uri));

        // 開始時間を取得
        // const startTime = performance.now();
        request.post(uri, options, (error: Error, response: request.Response, body: any) => {
            // 終了時間を取得
            // const endTime = performance.now();

            // 処理時間を取得
            // const duration = endTime - startTime;

            // レスポンス時のログを出力
            // applicationLogger.warn(sprintf('[%s][%s] external url:%s finish time:%dmsec', contextService.get('request:requestId'), uid, uri, duration));
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') < 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}

/**
 * PUTリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doPutRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        // UUIDを発行
        // const uid = uuid();

        // リクエスト時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] external url:%s start', contextService.get('request:requestId'), uid, uri));

        // 開始時間を取得
        // const startTime = performance.now();
        request.put(uri, options, (error: Error, response: request.Response, body: any) => {
            // 終了時間を取得
            // const endTime = performance.now();

            // 処理時間を取得
            // const duration = endTime - startTime;

            // レスポンス時のログを出力
            // applicationLogger.warn(sprintf('[%s][%s] external url:%s finish time:%dmsec', contextService.get('request:requestId'), uid, uri, duration));
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') < 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}

/**
 * DELETEリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doDeleteRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        // UUIDを発行
        // const uid = uuid();

        // リクエスト時のログを出力
        // applicationLogger.warn(sprintf('[%s][%s] external url:%s start', contextService.get('request:requestId'), uid, uri));

        // 開始時間を取得
        // const startTime = performance.now();
        request.delete(uri, options, (error: Error, response: request.Response, body: any) => {
            // 終了時間を取得
            // const endTime = performance.now();

            // 処理時間を取得
            // const duration = endTime - startTime;

            // レスポンス時のログを出力
            // applicationLogger.warn(sprintf('[%s][%s] external url:%s finish time:%dmsec', contextService.get('request:requestId'), uid, uri, duration));
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') < 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}
