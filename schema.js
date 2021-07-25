"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var pool = require('./models/mysql').pool;
var _a = require("graphql"), GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, GraphQLList = _a.GraphQLList, GraphQLInt = _a.GraphQLInt, GraphQLString = _a.GraphQLString;
var CommentType = new GraphQLObjectType({
    name: 'Comment',
    description: '...',
    fields: function () { return ({
        content: {
            type: GraphQLString,
            resolve: function (commentResult) { return commentResult.content; }
        },
        author: {
            type: UserType,
            resolve: function (commentResult, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, context.userDataLoader.load(commentResult.author)];
                });
            }); }
        }
    }); }
});
var UserType = new GraphQLObjectType({
    name: 'User',
    description: '...',
    fields: function () { return ({
        name: {
            type: GraphQLString,
            resolve: function (userResult) { return userResult.author || userResult.name; }
        },
        avatar: {
            type: GraphQLString,
            resolve: function (userResult) { return userResult.avatar; }
        }
    }); }
});
var BookType = new GraphQLObjectType({
    name: 'Book',
    description: '...',
    fields: function () { return ({
        name: {
            type: GraphQLString,
            resolve: function (bookResult) { return bookResult.name; }
        },
        author: {
            type: UserType,
            resolve: function (bookResult) { return bookResult; }
        },
        publishDate: {
            type: GraphQLString,
            resolve: function (bookResult) { return new Date(bookResult.publish_date).toISOString().split('T')[0]; }
        },
        commentNum: {
            type: GraphQLInt,
            resolve: function (bookResult, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, context.commentNumDataLoader.load(bookResult.id)];
                });
            }); }
        },
        comment: {
            type: new GraphQLList(CommentType),
            resolve: function (bookResult, args, context) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, context.commentDataLoader.load(bookResult.id)];
                });
            }); }
        },
    }); }
});
module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: function () { return ({
            book: {
                type: BookType,
                args: {
                    id: { type: GraphQLInt }
                },
                resolve: function (root, ags) { return __awaiter(void 0, void 0, void 0, function () {
                    var querySting, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                querySting = "\n          SELECT bookTemp.id AS id, bookTemp.name AS name, user.name AS author, publish_date, avatar FROM\n          (SELECT * FROM book WHERE id = ? ) AS bookTemp\n          JOIN user\n          ON bookTemp.author = user.id\n          ";
                                return [4 /*yield*/, pool.query(querySting, [ags.id])];
                            case 1:
                                result = (_a.sent())[0][0];
                                return [2 /*return*/, result];
                        }
                    });
                }); }
            },
            books: {
                type: GraphQLList(BookType),
                args: {
                    pagination: { type: GraphQLInt },
                    bookName: { type: GraphQLString },
                    authorName: { type: GraphQLString },
                    keyword: { type: GraphQLString },
                    nameSort: { type: GraphQLString },
                    publishSort: { type: GraphQLString },
                },
                resolve: function (root, args) { return __awaiter(void 0, void 0, void 0, function () {
                    var querySting, queryBinding, orderQuerySting, paginationQuerySting, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                querySting = "\n            SELECT bookTemp.id AS id, bookTemp.name AS name, userTemp.name AS author, publish_date, avatar FROM \n            ( SELECT * FROM book WHERE book.name LIKE ? ) AS bookTemp \n            JOIN\n            ( SELECT * FROM user WHERE user.name LIKE ? ) AS userTemp \n            ON bookTemp.author = userTemp.id\n            WHERE bookTemp.name LIKE ? OR userTemp.name LIKE ?\n          ";
                                queryBinding = [
                                    "%" + (args.bookName || '') + "%",
                                    "%" + (args.authorName || '') + "%",
                                    "%" + (args.keyword || '') + "%",
                                    "%" + (args.keyword || '') + "%"
                                ];
                                if (!args.nameSort && !args.publishSort) {
                                    orderQuerySting = '';
                                }
                                else {
                                    orderQuerySting = 'ORDER BY ';
                                    if (args.nameSort !== undefined && args.publishSort !== undefined) {
                                        orderQuerySting += 'bookTemp.name ' + args.nameSort;
                                        orderQuerySting += ', ';
                                        orderQuerySting += 'bookTemp.publish_date ' + args.publishSort;
                                    }
                                    else if (args.nameSort !== undefined) {
                                        orderQuerySting += 'bookTemp.name ' + args.nameSort;
                                    }
                                    else if (args.publishSort !== undefined) {
                                        orderQuerySting += 'bookTemp.publish_date ' + args.publishSort;
                                    }
                                }
                                if (args.pagination === undefined) {
                                    paginationQuerySting = ' LIMIT 0 , 60';
                                }
                                else {
                                    paginationQuerySting = ' LIMIT ? , 10';
                                    queryBinding.push(args.pagination * 10);
                                }
                                querySting += orderQuerySting;
                                querySting += paginationQuerySting;
                                return [4 /*yield*/, pool.query(querySting, queryBinding)];
                            case 1:
                                result = (_a.sent())[0];
                                return [2 /*return*/, result];
                        }
                    });
                }); }
            },
        }); }
    })
});
