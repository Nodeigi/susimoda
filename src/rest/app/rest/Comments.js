'use strict';

const express = require('express');

class Comments {

	constructor(service) {
		this.app = express();

		this.service = service;

		this.enableGetComments();
	}

	getExpressApp() {
		return this.app;
	}

	enableGetComments() {
		this.app.get('/', async (request, response) => {
			let page = request.query.page || 1;
			let itemsPerPage = request.query.items || 20;
			let result = await this.service.findAll(page, itemsPerPage);
			response.set('x-total-count', result.count);
			response.json(result.rows);
		});
	}

}

module.exports = Comments;