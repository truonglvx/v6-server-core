'use strict';
let Base = require('./base.js');
let moduleName = 'Rating', logger, log, err, wrn;

module.exports = class Rating extends Base {
    constructor(server, conf) {
        logger = server.logger.getLogger(moduleName);
        log = logger.log;
        wrn = logger.wrn;
        err = logger.err;
        super(server, conf);
    }

    getData(query) {
        if (!query || !query.game || !query.mode) {
            return Promise.resolve(null);
        }
        let game = query.game,
            mode = query.mode,
            count = +query.count,
            offset = +query.offset,
            column = query.column,
            order = query.order,
            filter = query.filter;
        if (!count || count < 0 || count > 1000) {
            count = 50;
        }
        if (!offset || offset < 0) {
            offset = 0;
        }
        if (typeof filter !== "string" || (filter = filter.trim()).length < 1) {
            filter = false;
        }
        if (!column || column.length < 1) {
            column = 'ratingElo';
        }
        if (order === 'asc' || order === '1') {
            order = 1;
        }
        else {
            order = -1;
        }
        log(`getData`, `get rating ${game}, ${mode}`, 3);
        return this.storage.getRatings(game, mode, count, offset, column, order, filter)
            .then((allUsers) => {
                return JSON.stringify({
                    mode: mode,
                    column: column,
                    order: order,
                    ratings: {
                        allUsers: allUsers,
                        infoUser: {},
                        skip: offset,
                        offset: offset,
                        count: count
                    }
                });
            }).catch((e)=> {
                err(`getData`, `error: ${e.stack || e}`, 1);
                return null;
            });
    }
};