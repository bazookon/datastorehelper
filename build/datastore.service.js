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
Object.defineProperty(exports, "__esModule", { value: true });
var datastore_1 = require("@google-cloud/datastore");
exports.ds = new datastore_1.Datastore({ projectId: 'vendeme' });
var DatastoreService = /** @class */ (function () {
    function DatastoreService(aesService) {
        this.aesService = aesService;
    }
    DatastoreService.prototype.toDatastore = function (obj, nonIndexed) {
        nonIndexed = nonIndexed || [];
        var results = [];
        Object.keys(obj).forEach(function (value) {
            if (obj[value] === undefined || value == 'kind' || value == 'nonIndexed') {
                return;
            }
            results.push({
                name: value,
                value: obj[value],
                excludeFromIndexes: nonIndexed.indexOf(value) !== -1
            });
        });
        return results;
    };
    DatastoreService.prototype.fromDatastore = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = obj;
                        return [4 /*yield*/, exports.ds.keyToLegacyUrlSafe(obj[exports.ds.KEY])];
                    case 1:
                        _a.urlsafe = _b.sent();
                        obj.urlsafe = this.aesService.encrypt(obj.urlsafe[0]);
                        return [2 /*return*/, obj];
                }
            });
        });
    };
    //Especial Queries
    DatastoreService.prototype.filterByField = function (kind, field, valuefield, callback) {
        var query = exports.ds.createQuery([kind]).filter(field, '=', valuefield);
        exports.ds.runQuery(query, function (err, entity) {
            if (err) {
                return callback(err);
            }
            if (entity.length != 0) {
                return callback(null, entity, entity[0][exports.ds.KEY]);
            }
            else {
                return callback(null, entity);
            }
        });
    };
    DatastoreService.prototype.resolveKey = function (key) {
        return new Promise(function (resolve, reject) {
            exports.ds.get(key, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    DatastoreService.prototype.asyncFilterByField = function (entity, field, valuefield) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = exports.ds.createQuery([entity.kind]).filter(field, '=', valuefield);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        exports.ds.runQuery(query, function (error, entityResult) {
                            if (error)
                                return reject(error);
                            resolve(entityResult);
                        });
                    })];
            });
        });
    };
    DatastoreService.prototype.newCreate = function (data, callback, id) {
        delete data.urlsafe;
        var key;
        if (id != null) {
            key = exports.ds.key([data.kind, id]);
        }
        else {
            key = exports.ds.key(data.kind);
        }
        var entity = {
            key: key,
            data: this.toDatastore(data, data.nonIndexed)
        };
        exports.ds.save(entity, function (err) {
            return callback(err, err ? null : data, entity.key);
        });
    };
    DatastoreService.prototype.newUpdate = function (id, data, callback) {
        delete data.urlsafe;
        var decrypt = this.aesService.decrypt(id);
        var key = exports.ds.keyFromLegacyUrlsafe(decrypt);
        var entity = {
            key: key,
            data: this.toDatastore(data, data.nonIndexed),
        };
        exports.ds.update(entity, function (err) {
            data.key = exports.ds.keyToLegacyUrlSafe(entity.key);
            return callback(err, err ? null : data);
        });
    };
    DatastoreService.prototype.newDelete = function (id, callback) {
        var decrypt = this.aesService.decrypt(id);
        var key = exports.ds.keyFromLegacyUrlsafe(decrypt);
        exports.ds.delete(key, function (err) {
            return callback(err, err ? null : "Deleted");
        });
    };
    DatastoreService.prototype.newRead = function (id, callback) {
        var _this = this;
        var decrypt = this.aesService.decrypt(id);
        var key = exports.ds.keyFromLegacyUrlsafe(decrypt);
        exports.ds.get(key, function (err, entity) {
            if (err) {
                return callback(err);
            }
            Promise.resolve(_this.fromDatastore(entity)).then(function (results) {
                return callback(null, results);
            });
        });
    };
    DatastoreService.prototype.newList = function (kind, limit, callback) {
        var _this = this;
        var query = exports.ds.createQuery([kind]).limit(limit).order('name');
        exports.ds.runQuery(query, function (err, entities) {
            if (err) {
                return callback(err);
            }
            Promise.all(entities.map(function (entity) { return _this.fromDatastore(entity); })).then(function (results) {
                return callback(null, results);
            });
        });
    };
    DatastoreService.prototype.newCreateTransaction = function (entities) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = exports.ds.transaction();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, transaction.run()];
                    case 2:
                        _a.sent();
                        transaction.save(entities);
                        return [4 /*yield*/, transaction.commit()];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 4:
                        err_1 = _a.sent();
                        transaction.rollback();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreService.prototype.newDeleteTransaction = function (entities) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = exports.ds.transaction();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, transaction.run()];
                    case 2:
                        _a.sent();
                        transaction.delete(entities);
                        return [4 /*yield*/, transaction.commit()];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 4:
                        err_2 = _a.sent();
                        transaction.rollback();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return DatastoreService;
}());
exports.DatastoreService = DatastoreService;
