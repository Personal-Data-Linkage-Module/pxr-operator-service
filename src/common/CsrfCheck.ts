/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
// import * as log4js from 'log4js';
import Cookie = require('cookie');
import createError = require('http-errors');
import sign = require('cookie-signature');
import Tokens = require('csrf');
// export const applicationLogger: log4js.Logger = log4js.getLogger('application');
/**
 * Module exports.
 * @public
 */

declare global {
    namespace Express {
        interface Request {
            csrfToken(): string;
        }
    }
}

/**
 * CSRF protection middleware.
 *
 * This middleware adds a `req.csrfToken()` function to make a token
 * which should be added to requests which mutate
 * state, within a hidden form field, query-string etc. This
 * token is validated against the visitor's session.
 *
 * @param {Object} options
 * @return {Function} middleware
 * @public
 */

export function csurf (options: any) {
    const opts = options || {};

    // get cookie options
    const cookie = getCookieOptions(opts.cookie);

    // get session options
    const sessionKey = opts.sessionKey || 'session';

    // get value getter
    const value = opts.value || defaultValue;

    // token repo
    const tokens = new Tokens(opts);

    // ignored methods
    const ignoreMethods = opts.ignoreMethods === undefined
        ? ['GET', 'HEAD', 'OPTIONS']
        : opts.ignoreMethods;

    if (!Array.isArray(ignoreMethods)) {
        throw new TypeError('option ignoreMethods must be an array');
    }

    // generate lookup
    const ignoreMethod = getIgnoredMethods(ignoreMethods);

    const ignoreRoutes = opts.ignoreRoutes === undefined ? [] : opts.ignoreRoutes;

    if (!Array.isArray(ignoreRoutes)) {
        throw new TypeError('option ignoreRoutes must be an array');
    }

    // generate lookup
    return function csrf (req, res, next) {
        // validate the configuration against request
        if (!verifyConfiguration(req, sessionKey, cookie)) {
            return next(new Error('misconfigured csrf'));
        }

        // get the secret from the request
        let secret = getSecret(req, sessionKey, cookie);
        let token;

        // lazy-load token getter
        req.csrfToken = function csrfToken () {
            let sec = !cookie
                ? getSecret(req, sessionKey, cookie)
                : secret;

            // use cached token if secret has not changed
            if (token && sec === secret) {
                return token;
            }

            // generate & set new secret
            if (sec === undefined) {
                sec = tokens.secretSync();
                setSecret(req, res, sessionKey, sec, cookie);
            }

            // update changed secret
            secret = sec;

            // create new token
            token = tokens.create(secret);

            return token;
        };

        // generate & set secret
        if (!secret) {
            secret = tokens.secretSync();
            setSecret(req, res, sessionKey, secret, cookie);
        }

        const allowTheRoute = allowRoute(req.url, ignoreRoutes);

        // verify the incoming token
        if (!ignoreMethod[req.method] && allowTheRoute && !tokens.verify(secret, value(req))) {
            return next(createError(403, 'invalid csrf token', {
                code: 'EBADCSRFTOKEN'
            }));
        }

        next();
    };
}

/**
 * Default value function, checking the `req.body`
 * and `req.query` for the CSRF token.
 *
 * @param {IncomingMessage} req
 * @return {String}
 * @api private
 */

export function defaultValue (req) {
    return (req.body && req.body._csrf) ||
    (req.query && req.query._csrf) ||
    (req.headers['csrf-token']) ||
    (req.headers['xsrf-token']) ||
    (req.headers['x-csrf-token']) ||
    (req.headers['x-xsrf-token']);
}

/**
 * Get options for cookie.
 *
 * @param {boolean|object} [options]
 * @returns {object}
 * @api private
 */

export function getCookieOptions (options) {
    if (options !== true && typeof options !== 'object') {
        return undefined;
    }

    const opts = Object.create(null);

    // defaults
    opts.key = '_csrf';
    opts.path = '/';

    if (options && typeof options === 'object') {
        for (const prop in options) {
            const val = options[prop];

            if (val !== undefined) {
                opts[prop] = val;
            }
        }
    }

    return opts;
}

/**
 * Get a lookup of ignored methods.
 *
 * @param {array} methods
 * @returns {object}
 * @api private
 */

export function getIgnoredMethods (methods) {
    const obj = Object.create(null);

    for (let i = 0; i < methods.length; i++) {
        const method = methods[i].toUpperCase();
        obj[method] = true;
    }

    return obj;
}

/**
 * Get the token secret from the request.
 *
 * @param {IncomingMessage} req
 * @param {String} sessionKey
 * @param {Object} [cookie]
 * @api private
 */

export function getSecret (req, sessionKey, cookie) {
    // get the bag & key
    const bag = getSecretBag(req, sessionKey, cookie);
    const key = cookie ? cookie.key : 'csrfSecret';

    if (!bag) {
        throw new Error('misconfigured csrf');
    }

    // return secret from bag
    return bag[key];
}

/**
 * Get the token secret bag from the request.
 *
 * @param {IncomingMessage} req
 * @param {String} sessionKey
 * @param {Object} [cookie]
 * @api private
 */

export function getSecretBag (req, sessionKey, cookie) {
    if (cookie) {
        // get secret from cookie
        const cookieKey = cookie.signed
            ? 'signedCookies'
            : 'cookies';
        return req[cookieKey];
    } else {
        // get secret from session
        return req[sessionKey];
    }
}

/**
 * Set a cookie on the HTTP response.
 *
 * @param {OutgoingMessage} res
 * @param {string} name
 * @param {string} val
 * @param {Object} [options]
 * @api private
 */

export function setCookie (res, name, val, options) {
    const data = Cookie.serialize(name, val, options);

    const prev = res.getHeader('set-cookie') || [];
    const header = Array.isArray(prev)
        ? prev.concat(data)
        : [prev, data];

    res.setHeader('set-cookie', header);
}

/**
 * Get a lookup of ignored routes.
 *
 * @param {array} routes
 * @returns {object}
 * @api private
 */

export function getIgnoredRoutes (routes) {
    const obj = Object.create(null);

    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        obj[route] = true;
    }

    return obj;
}

/**
 * Set the token secret on the request.
 *
 * @param {IncomingMessage} req
 * @param {OutgoingMessage} res
 * @param {string} sessionKey
 * @param {string} val
 * @param {Object} [cookie]
 * @api private
 */

export function setSecret (req, res, sessionKey, val, cookie) {
    if (cookie) {
        // set secret on cookie
        let value = val;

        if (cookie.signed) {
            value = 's:' + sign.sign(val, req.secret);
        }

        setCookie(res, cookie.key, value, cookie);
    } else {
        // set secret on session
        req[sessionKey].csrfSecret = val;
    }
}

/**
 * Verify the configuration against the request.
 * @private
 */

export function verifyConfiguration (req, sessionKey, cookie) {
    if (!getSecretBag(req, sessionKey, cookie)) {
        return false;
    }

    if (cookie && cookie.signed && !req.secret) {
        return false;
    }

    return true;
}

export function allowRoute (route, ignoreRoute) {
    let allow : boolean = true;
    /* eslint-disable array-callback-return */
    ignoreRoute.map(function (r) {
        if (r instanceof RegExp) {
            if (route.match(r) != null) {
                allow = false;
                return false;
            }
        }
        if (typeof (r) === 'string' || r instanceof String) {
            if (r !== route) {
                allow = false;
                return false;
            }
        }
    });
    /* eslint-enable array-callback-return */
    return allow;
}
