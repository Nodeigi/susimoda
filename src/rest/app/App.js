'use strict';

const Rest = require('./Rest');

const MoviesService = require('./services/MoviesService');
const CommentsService = require('./services/CommentsService');
const OmdbService = require('./services/OmdbService');

class App {
	constructor() {
		this.db = require('./models');

		let moviesService = new MoviesService(this.db.Movie);
		let commentsService = new CommentsService(this.db.Comment);
		let omdbService = new OmdbService(process.env.OMDB_API_KEY);

		this.rest = new Rest(
			moviesService,
			commentsService,
			omdbService
		);
	}

	async run() {
		await this.initDatabase();

		this.rest.listen(process.env.REST_INTERNAL_PORT);
	}

	async initDatabase() {
		await this.db.sequelize.authenticate();
	}
}

module.exports = App;