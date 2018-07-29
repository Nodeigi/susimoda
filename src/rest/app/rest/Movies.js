'use strict';

const express = require('express');

const MovieNotFound = require('../exceptions/MovieNotFound');

class Movies {

	constructor(service, omdbService) {
		this.app = express();

		this.service = service;
		this.omdbService = omdbService;

		this.enableGetMovies();
		this.enablePostMovie();
	}

	getExpressApp() {
		return this.app;
	}

	enableGetMovies() {
		this.app.get('/', async (request, response) => {
			let page = request.query.page || 1;
			let itemsPerPage = request.query.items || 20;
			let result = await this.service.findAll(page, itemsPerPage);
			response.set('x-total-count', result.count);
			response.json(result.rows);
		});
	}

	enablePostMovie() {
		this.app.post('/', async (request, response) => {
			let title = request.body.title;
			let year = request.body.year || null;

			let movieData;
			try {
				movieData = await this.omdbService.findMovie(title, year);
			} catch (e) {
				if (e instanceof MovieNotFound) {
					return response.status(404).json({
						error: 'Movie has not been found'
					});
				} else {
					return response.status(500).json({});
				}
			}

			let persistedMovie = await this.service.findByTitleAndYear(movieData.Title, parseInt(movieData.Year, 10));

			if (persistedMovie) {
				return response.status(208).json(persistedMovie);
			}

			let movie = await this.service.createFromData(movieData).save();

			response.json(movie);
		});
	}

}

module.exports = Movies;