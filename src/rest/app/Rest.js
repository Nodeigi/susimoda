'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const Movies = require('./rest/Movies');
const Comments = require('./rest/Comments');
const MovieComments = require('./rest/MovieComments');

class Rest {

	constructor(moviesService, commentsService, omdbService) {
		this.app = express();

		this.app.use(bodyParser.json());

		let movies = new Movies(moviesService, omdbService);
		let comments = new Comments(commentsService);
		let movieComments = new MovieComments(moviesService, commentsService);

		this.app.use('/movies', movies.getExpressApp());
		this.app.use('/comments', comments.getExpressApp());

		movies.getExpressApp().use('/:movieId/comments', movieComments.getExpressApp());
	}

	listen(port) {
		this.app.listen(port);
	}


};

module.exports = Rest;