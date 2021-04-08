import { type } from "node:os";
import { InstructionC3D } from "../Abstract/Instruction";
import { Interpreter, Type } from "../Interpreter";

export class Print extends InstructionC3D {
    private str: string
    private value: string
    constructor(str: string, value: string, line: number, column: number) {
        super(line, column);
        this.str = str
        this.value = value
    }

    debug() {
        const interpreter = Interpreter.getInstance()
        interpreter.setOutput(this.str, this.value)
        return { type: Type.CONSOLE }
    }
}