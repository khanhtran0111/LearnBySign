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
exports.SequenceSchema = exports.Sequence = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Sequence = class Sequence {
    _id;
    sessionId;
    tStartMs;
    tEndMs;
    label;
    keypoints;
};
exports.Sequence = Sequence;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Sequence.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Sequence.prototype, "tStartMs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Sequence.prototype, "tEndMs", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Sequence.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Sequence.prototype, "keypoints", void 0);
exports.Sequence = Sequence = __decorate([
    (0, mongoose_1.Schema)({ collection: 'sequences', timestamps: true })
], Sequence);
exports.SequenceSchema = mongoose_1.SchemaFactory.createForClass(Sequence);
exports.SequenceSchema.index({ sessionId: 1, tStartMs: 1 });
//# sourceMappingURL=sequence.schema.js.map