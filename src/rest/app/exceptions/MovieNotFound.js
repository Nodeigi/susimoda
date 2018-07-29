class MovieNotFound {
	constructor(msg) {
		this.message = msg;
	}

	static byCriteria(criteria) {
		return new this('A movie has not been found by following criteria: ' + JSON.stringify(criteria));
	}
}

module.exports = MovieNotFound;