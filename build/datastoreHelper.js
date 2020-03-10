"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var datastore_service_1 = require("./datastore.service");
var DatastoreHelper = /** @class */ (function (_super) {
    __extends(DatastoreHelper, _super);
    function DatastoreHelper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DatastoreHelper.prototype.insert = function (entity, id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.newCreate(entity, function (err, entityResult, key) {
                if (err)
                    return reject(err);
                var result = { entity: entityResult, key: key };
                resolve(result);
            }, id != undefined || null ? id : null);
        });
    };
    DatastoreHelper.prototype.update = function (id, entity) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.newUpdate(id, entity, function (err, entityResult) {
                if (err)
                    return reject(err);
                resolve(entityResult);
            });
        });
    };
    DatastoreHelper.prototype.delete = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.newDelete(id, function (err, entityResult) {
                if (err)
                    return reject(err);
                resolve(entityResult);
            });
        });
    };
    DatastoreHelper.prototype.read = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.newRead(id, function (err, entityResult) {
                if (err)
                    return reject(err);
                resolve(entityResult);
            });
        });
    };
    DatastoreHelper.prototype.list = function (kind, limit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.newList(kind, limit, function (err, entities) {
                if (err)
                    return reject(err);
                resolve(entities);
            });
        });
    };
    return DatastoreHelper;
}(datastore_service_1.DatastoreService));
exports.DatastoreHelper = DatastoreHelper;
