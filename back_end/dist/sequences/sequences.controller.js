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
exports.SequencesController = void 0;
const common_1 = require("@nestjs/common");
const sequences_service_1 = require("./sequences.service");
const create_sequence_dto_1 = require("./dto/create-sequence.dto");
let SequencesController = class SequencesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(dto) { return this.svc.create(dto); }
    get(id) { return this.svc.findOne(id); }
};
exports.SequencesController = SequencesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sequence_dto_1.CreateSequenceDto]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "get", null);
exports.SequencesController = SequencesController = __decorate([
    (0, common_1.Controller)('sequences'),
    __metadata("design:paramtypes", [sequences_service_1.SequencesService])
], SequencesController);
//# sourceMappingURL=sequences.controller.js.map