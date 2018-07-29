class CommentsService {

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

	async findByMovieId(movieId, page = 1, itemsPerPage = 20) {
		page = parseInt(page, 10);
		itemsPerPage = parseInt(itemsPerPage, 10);
		return await this.model.findAndCountAll({
			where: { movieId },
			limit: itemsPerPage,
			offset: (page - 1) * itemsPerPage
		});
	}

	createComment(movieId, author, content) {
		return this.model.build({movieId, author, content});
	}
};

module.exports = CommentsService;