import { Type } from "./Type";

export class Param {
    id: string;
    type: Type;
    constructor(id: string, type: Type) {
        this.id = id
        this.type = type
    }
}