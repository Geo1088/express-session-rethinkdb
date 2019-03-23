// !
// Express Session RethinkDB
// MIT Licensed

'use strict';

const RethinkDB = require('rethinkdbdash');
const cache = require('memory-cache');

module.exports = session => class RethinkStore extends session.Store {
	constructor (options) {
		options = options || {};
		options.connectOptions = options.connectOptions || {};

		super(options);

		this.r = options.connection || new RethinkDB(options.connectOptions);

		this.emit('connect');
		this.sessionTimeout = options.sessionTimeout || 86400000; // 1 day
		this.table = options.table || 'session';
		setInterval(() => {
			try {
				this.r.table(this.table).filter(this.r.row('expires').lt(this.r.now().toEpochTime().mul(1000))).delete().run(_ => null);
			} catch (error) {
				console.error(error);
				return null;
			}
		}, options.flushInterval || 60000);
	}

	// Get Session
	get (sid, fn) {
		const sdata = cache.get(`sess-${sid}`);
		if (sdata) {
			return fn(null, JSON.parse(sdata.session));
		}
		this.r.table(this.table).get(sid).run().then(data => fn(null, data ? JSON.parse(data.session) : null)).error(err => fn(err));
	}

	// Set Session
	set (sid, sess, fn) {
		const sessionToStore = {
			id: sid,
			expires: new Date().getTime() + (sess.cookie.originalMaxAge || this.sessionTimeout),
			session: JSON.stringify(sess),
		};

		this.r.table(this.table).insert(sessionToStore, {conflict: 'replace', returnChanges: true}).run().then(data => {
			let sdata = null;
			if (data.changes[0] != null) {
				sdata = data.changes[0].new_val || null;
			}

			if (sdata) {
				cache.put(`sess-${sdata.id}`, sdata, 30000);
			}
			if (typeof fn === 'function') {
				return fn();
			}
			return null;
		}).error(err => fn(err));
	}

	// Destroy Session
	destroy (sid, fn) {
		cache.del(`sess-${sid}`);
		this.r.table(this.table).get(sid).delete().run().then(_ => {
			if (typeof fn === 'function') {
				return fn();
			}
			return null;
		}).error(err => fn(err));
	}
};
