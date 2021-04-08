import { InstructionC3D } from "../Abstract/Instruction";
import { Type } from "../Interpreter";

export class Label extends InstructionC3D {
    private label: string
    constructor(label: string, line: number, column: number) {
        super(line, column);
        this.label = label
    }

    debug() {
        return {
            type: Type.LABEL
        }
    }

    public getLabel() {
        return this.label;
    }
}