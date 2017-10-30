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

let sortField = "date";
let sortOrder = "asc";
let page = 1;
let limit = 10;
let includeDeps = false;


function readAll(req, res, payload, cb) 
{
    payload.page === undefined ? page = 1 : page = payload.page;
    payload.limit === undefined ? limit = 10 : limit = payload.limit;
    payload.sortOrder === undefined ? sortOrder = "asc" : sortOrder = payload.sortOrder; 
    if (payload.sortField) {
        sortField = payload.sortField;
    }
    _articles.sort((a, b) => {
        if (a[sortField] > b[sortField]) {
            return 1;
        }
        if (a[sortField] < b[sortField]) {
            return -1;
        }
        if (a[sortField] === b[sortField]) {
            return 0;
        }
    });


    let newArticles = [];

    for (let i = 0; i < _articles.length; i++) 
    {
        let y = _articles[i];
        newArticles.push(y);
    }
    newArticles = newArticles.slice((page - 1) * limit, (page - 1) * limit + limit);

    if (sortOrder === "desc") {
       newArticles.reverse();
    }

     let meta = 
     {
        "page: ": page,
        "pages: ": Math.ceil(_articles.length / limit),
        "count: ": _articles.length,
        "limit: ": limit
    }

    let responseItem = 
    {
        "items": newArticles,
        "meta": meta
    }

    cb(null, responseItem);
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