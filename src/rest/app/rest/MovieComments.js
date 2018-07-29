'use strict';

const express = require('express');

class MovieComments {

	constructor(moviesService, commentsService) {
		this.app = express.Router({ mergeParams: true });

		this.moviesService = moviesService;
		this.commentsService = commentsService;

		this.enableGetMovieComments();
		this.enablePostMovieComment();
	}

	getExpressApp() {
		return this.app;
	}

	enableGetMovieComments() {
		this.app.route('/').get(async (request, response) => {
			let page = request.query.page || 1;
			let itemsPerPage = request.query.items || 20;
			let result = await this.commentsService.findByMovieId(request.params.movieId, page, itemsPerPage);
			response.set('x-total-count', result.count);
			response.json(result.rows);
		});
	}

	enablePostMovieComment() {
		this.app.route('/').post(async (request, response) => {
			let movie = await this.moviesService.findById(request.params.movieId);

			if (!movie) {
				return response.status(404).json({});
			}
			let comment = await this.commentsService.createComment(movie.id, request.body.author, request.body.content).save();

			response.json(comment);
		});
	}

}

module.exports = MovieComments;