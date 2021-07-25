"use strict";
var express = require('express');
var graphqlHTTP = require('express-graphql').graphqlHTTP;
var DataLoader = require('dataloader');
var app = express();
var schema = require('./schema');
var _a = require('./dataloader'), userBatchFunction = _a.userBatchFunction, commentBatchFunction = _a.commentBatchFunction, commentNumBatchFunction = _a.commentNumBatchFunction;
app.use('/graphql', graphqlHTTP(function (req) {
    var userDataLoader = new DataLoader(function (keys) { return Promise.all(keys.map(userBatchFunction)); });
    var commentDataLoader = new DataLoader(function (keys) { return Promise.all(keys.map(commentBatchFunction)); });
    var commentNumDataLoader = new DataLoader(function (keys) { return Promise.all(keys.map(commentNumBatchFunction)); });
    return {
        schema: schema,
        context: {
            userDataLoader: userDataLoader,
            commentDataLoader: commentDataLoader,
            commentNumDataLoader: commentNumDataLoader
        },
        graphiql: true // graph"i"ql
    };
}));
app.listen(3000, function () {
    console.log('Server is running');
});
