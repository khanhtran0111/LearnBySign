declare class TK {
    label: string;
    p: number;
}
export declare class CreatePredictionDto {
    sequenceId: string;
    modelId: string;
    topk: TK[];
}
export {};
