'use strict';

module.exports = (sequelize, DataTypes) => {
  var Movie = sequelize.define('Movie', {
    title: DataTypes.STRING,
    year: DataTypes.INTEGER.UNSIGNED,
    plot: DataTypes.TEXT
  }, {});
  Movie.associate = function(models) {
    Movie.hasMany(models.Comment, {as: 'comments'});
  };
  return Movie;
};