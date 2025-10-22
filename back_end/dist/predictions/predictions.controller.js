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
exports.PredictionsController = void 0;
const common_1 = require("@nestjs/common");
const predictions_service_1 = require("./predictions.service");
const create_prediction_dto_1 = require("./dto/create-prediction.dto");
let PredictionsController = class PredictionsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(dto) { return this.svc.create(dto); }
    top1(days = '7') {
        const d = parseInt(days, 10);
        const since = new Date(Date.now() - d * 24 * 3600 * 1000);
        return this.svc.top1CountsSince(since);
    }
};
exports.PredictionsController = PredictionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prediction_dto_1.CreatePredictionDto]),
    __metadata("design:returntype", void 0)
], PredictionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('top1-stats'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PredictionsController.prototype, "top1", null);
exports.PredictionsController = PredictionsController = __decorate([
    (0, common_1.Controller)('predictions'),
    __metadata("design:paramtypes", [predictions_service_1.PredictionsService])
], PredictionsController);
//# sourceMappingURL=predictions.controller.js.map