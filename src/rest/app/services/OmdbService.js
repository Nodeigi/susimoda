'use strict';

const http = require('http');

const MovieNotFound = require('../exceptions/MovieNotFound');

class OmdbService {

	constructor(apiKey) {
		this.endpoint = 'http://www.omdbapi.com?apikey=' + apiKey;
	}

	async httpRequest(url) {
		return new Promise((resolve, reject) => {
			http.get(url, (response) => {
				if (response.statusCode !== 200) {
					response.resume();
					return reject('Status code: ' + response.statusCode);
				}
				response.setEncoding('utf-8');
				let data = '';
				response.on('data', (chunk) => {
					data += chunk;
				});
				response.on('end', () => {
					try {
						resolve(JSON.parse(data));
					} catch(e) {
						reject(e);
					}
				});
			});
		});
	}

	async findMovie(title, year = null) {
		let search = {
			t: title
		};
		if (year) {
			search.y = year;
		}
		let url = this.endpoint;
		for (let i in search) {
			url += '&' + i + '=' + encodeURIComponent(search[i]);
		}
		let response = await this.httpRequest(url);
		if (response.Error) {
			throw MovieNotFound.byCriteria(search);
		}
		return response;
		
	};

};

module.exports = OmdbService;