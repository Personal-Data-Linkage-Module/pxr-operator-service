/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as Log4js from 'log4js';
import { sprintf } from 'sprintf-js';

export default class Log {
    /**
     * Debugログ出力
     * @param message
     */
    public static Debug (message: string): void {
        const log = Log4js.getLogger('http');
        log.debug(message);
    }

    /**
     * Infoログ出力
     * @param message
     */
    public static Info (message: string): void {
        const log = Log4js.getLogger('http');
        log.info(message);
    }

    /**
     * Warnログ出力
     * @param message
     */
    public static Warning (message: string): void {
        const log = Log4js.getLogger('http');
        log.warn(message);
    }

    /**
     * Errorログ出力
     * @param message
     */
    public static Error (message: string): void {
        const log = Log4js.getLogger('http');
        log.error(message);
    }

    /**
     * DbErrorログ出力
     * @param message
     */
    public static DbError (message: Error): void {
        const log = Log4js.getLogger('http');
        log.error(sprintf('code:%s, message:%s', message['code'], message.message));
        if (message.stack) {
            log.error(message.stack);
        }
    }

    /**
     * Errorログ出力
     * @param message
     */
    public static ExceptionError (message: Error): void {
        const log = Log4js.getLogger('http');
        log.error(message.message);
        if (message.stack) {
            log.error(message.stack);
        }
    }

    /**
     * Fatalログ出力
     * @param message
     */
    public static Fatal (message: string): void {
        const log = Log4js.getLogger('http');
        log.fatal(message);
    }

    /**
     * Traceログ出力
     * @param message
     */
    public static Trace (message: string): void {
        const log = Log4js.getLogger('http');
        log.trace(message);
    }
}
