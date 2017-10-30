const fs = require('fs');
let _articles = require('../articles.json');
let validatorController =  require('./validator');

let seed = 0;

module.exports = {
    readAll,
    read,
    create,
    update,
    deleteArt
};

const sortFieldDefault = "date";
const sortOrderDefault = "desc";
const pageDefault = 1;
const limitDefault = 10;
const includeDepsDefault = true;

function readAll(req, res, payload, cb) 
{
   let sortField = payload.sortField === undefined ? sortFieldDefault : payload.sortField;
    let sortOrder = payload.sortOrder === undefined ? sortOrderDefault : payload.sortOrder;
    let page      = payload.page === undefined ? pageDefault : payload.page;
    let limit     = payload.limit === undefined ? limitDefault : payload.limit;
    let includeDeps = payload.includeDeps === undefined ? includeDepsDefault : payload.includeDeps;

 let newArticles = [];
   for (let i = 0; i < _articles.length; i++) {
        newArticles.push(Object.assign({}, _articles[i]));

        if (!includeDeps)
        {
            newArticles[i].Comments = undefined;
        }
    }

    let it = {
        "items" : newArticles.sort((a, b) => {
            switch (sortField) {
                case "id" : {
                    if (a.id > b.id) return sortOrder === "asc" ? 1 : -1;
                    if (a.id === b.id) return 0;
                    if (a.id < b.id) return sortOrder === "asc" ? -1 : 1;
                }
                case "title" : {
                    if (a.title > b.title) return sortOrder === "asc" ? 1 : -1;
                    if (a.title === b.title) return 0;
                    if (a.title < b.title) return sortOrder === "asc" ? -1 : 1;
                }
                case "text" : {
                    if (a.text > b.text) return sortOrder === "asc" ? 1 : -1;
                    if (a.text === b.text) return 0;
                    if (a.text < b.text) return sortOrder === "asc" ? -1 : 1;
                }
                case "date" : {
                    if (a.date > b.date) return sortOrder === "asc" ? 1 : -1;
                    if (a.date === b.date) return 0;
                    if (a.date < b.date) return sortOrder === "asc" ? -1 : 1;
                }
                case "author" : {
                    if (a.author > b.author) return sortOrder === "asc" ? 1 : -1;
                    if (a.author === b.author) return 0;
                    if (a.author < b.author) return sortOrder === "asc" ? -1 : 1;
                }
            }

        }).slice((page - 1) * limit, (page - 1) * limit + limit)};

    let meta = {
        "page: ": page,
        "pages: ": Math.ceil(_articles.length / limit),
        "count: ": _articles.length,
        "limit: ": limit,
        "items" :it
    }
      
    cb(null, meta);
}

function read(req, res, payload, cb) {
 if(validatorController.isIdArticle(payload)) {
        cb(null, _articles[_articles.findIndex(article => article.id === payload.id)]);
    }
    else {
        cb(null, null);
    }
}

function create(req, res, payload, cb) {
    if (validatorController.isArticle(payload)) 
    {
        payload.id = Date.now() + ++seed;
        payload.comments = [];
        _articles.push(payload);
        fs.writeFile("articles.json", JSON.stringify(_articles), "utf8", function () { });
        cb(null, payload);
    }
    else {
        cb(null, null);
    }
}


function update(req, res, payload, cb) {
    if (validatorController.isIdArticle(payload)) {
        if (validatorController.isArticle(payload)) {
            _articles[_articles.findIndex(article => article.id === payload.id)].author = payload.author;
            _articles[_articles.findIndex(article => article.id === payload.id)].id = payload.id;
            _articles[_articles.findIndex(article => article.id === payload.id)].date = payload.date;
            _articles[_articles.findIndex(article => article.id === payload.id)].text = payload.text;
            _articles[_articles.findIndex(article => article.id === payload.id)].title = payload.title;
            fs.writeFile("articles.json", JSON.stringify(_articles), "utf8", function () { });
            cb(null, "UPDATE SUCCESS");
        }
        else {
            cb(null, null);
        }
    }
    else {
        cb(null, null);
    }
}

function deleteArt(req, res, payload, cb) {
    if (validatorController.isIdArticle(payload)) {
        _articles.splice(_articles.findIndex(article => article.id === payload.id), 1);
        fs.writeFile("articles.json", JSON.stringify(_articles), "utf8", function () { });
        cb(null, "SUCCESS DELETE ARTICLE");
    }
    else {
        cb(null, null);
    }
}