"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const prediction_schema_1 = require("./prediction.schema");
let PredictionsService = class PredictionsService {
    model;
    constructor(model) {
        this.model = model;
    }
    create(dto) { return this.model.create(dto); }
    top1CountsSince(date) {
        return this.model.aggregate([
            { $match: { createdAt: { $gte: date } } },
            { $project: { top1: { $arrayElemAt: ['$topk', 0] } } },
            { $group: { _id: '$top1.label', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
    }
};
exports.PredictionsService = PredictionsService;
exports.PredictionsService = PredictionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(prediction_schema_1.Prediction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PredictionsService);
//# sourceMappingURL=predictions.service.js.map