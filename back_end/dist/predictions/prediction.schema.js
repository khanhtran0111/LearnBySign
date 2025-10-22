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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionSchema = exports.Prediction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
class TopKItem {
    label;
    p;
}
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TopKItem.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 1 }),
    __metadata("design:type", Number)
], TopKItem.prototype, "p", void 0);
let Prediction = class Prediction {
    _id;
    sequenceId;
    modelId;
    topk;
};
exports.Prediction = Prediction;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Prediction.prototype, "sequenceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Prediction.prototype, "modelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [TopKItem], required: true }),
    __metadata("design:type", Array)
], Prediction.prototype, "topk", void 0);
exports.Prediction = Prediction = __decorate([
    (0, mongoose_1.Schema)({ collection: 'predictions', timestamps: { createdAt: true, updatedAt: false } })
], Prediction);
exports.PredictionSchema = mongoose_1.SchemaFactory.createForClass(Prediction);
exports.PredictionSchema.index({ sequenceId: 1, createdAt: -1 });
//# sourceMappingURL=prediction.schema.js.map