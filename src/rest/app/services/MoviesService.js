class MoviesService {

	constructor(model) {
		this.model = model;
	}

	async findAll(page = 1, itemsPerPage = 20) {
		page = parseInt(page, 10);
		itemsPerPage = parseInt(itemsPerPage, 10);
		return await this.model.findAndCountAll({
			limit: itemsPerPage,
			offset: (page - 1) * itemsPerPage
		});
	}

	async findByTitleAndYear(title, year) {
		return await this.model.findOne({
			where: { title, year }
		})
	}

	createFromData(movieData) {
		return this.model.build({
			title: movieData.Title,
			year: parseInt(movieData.Year, 10),
			plot: movieData.Plot
		});
	}

	async findById(movieId) {
		return await this.model.findById(movieId);
	}
};

module.exports = MoviesService;