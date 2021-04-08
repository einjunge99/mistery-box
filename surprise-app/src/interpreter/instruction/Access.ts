import { InstructionC3D } from "../Abstract/Instruction";
import { Type } from "../Interpreter";

export class AccessC3D extends InstructionC3D {
    private id
    constructor(id: string, line: number, column: number) {
        super(line, column);
        this.id = id
    }

    debug() {
        return { type: Type.ACCESS, content: this.id }
    }

}