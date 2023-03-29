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
/* eslint-disable */
import * as config from 'config';
import { Container } from 'typedi';
import { Server } from 'net';

import { ExpressConfig } from './Express';
import { systemLogger } from '../../common/logging';
import Config from '../../common/Config';
/* eslint-enable */
// import cluster = require('cluster');
// import os = require('os');
// const numCPUs = os.cpus().length;
// const Configure = Config.ReadConfig('./config/config.json');

export class Application {
    server!: Server;
    express: ExpressConfig;

    constructor () {
        this.express = Container.get(ExpressConfig);
        const port = config.get('ports.http');

        // WEBサーバを開始
        if (process.env.NODE_ENV !== 'test') {
            /*
            if (cluster.isMaster) {
                // CPUコア数分のワーカープロセスを起動
                const threadCount: number = Number(numCPUs) * Number(Configure['corePerThread']);
                for (let index = 0; index < threadCount; index++) {
                    cluster.fork();
                }
                // ワーカープロセスが停止した場合
                cluster.on('exit', (worker, code, signal) => {
                    // プロセス再起動
                    if (signal) {
                        console.log(`worker ${worker.process.pid} was killed by signal: ${signal}`);
                    } else if (code !== 0) {
                        console.log(`worker ${worker.process.pid} exited with error code: ${code}`);
                    } else {
                        console.log(`worker ${worker.process.pid} success!`);
                    }
                    cluster.fork();
                });
            } else {
            */
            this.server = this.express.app.listen(port, () => {
                systemLogger.info(`
                        ----------------
                        Server Started!
    
                        Http: http://localhost:${port}
                        ----------------
                    `);
                console.log(`Worker ${process.pid} started`);
            });
            /*
            }
            */
        }
    }

    start () {
        this.server = this.express.app.listen(config.get('ports.http'), () => {
            systemLogger.info(`
                ----------------
                Server Started!

                Http: http://localhost:${config.get('ports.http')}
                ----------------
            `);
        });
    }

    stop () {
        this.server.close();
    }
}
