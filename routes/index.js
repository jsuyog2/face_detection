const routes = require('express').Router();

createPostRoute('saveimg');
createPostRoute('getfiles');
createPostRoute('getface');
createPostRoute('add_data');

module.exports = routes;

function createPostRoute(path) {
    var getPath = require('./' + path);
    routes.route('/' + path).post(getPath[path]);
}
