import { InstructionC3D } from "../Abstract/Instruction";
import { Interpreter, Type } from "../Interpreter";

export class ExpressionC3D extends InstructionC3D {

    private target: string;
    private left: string;
    private right: string;
    private op: string

    constructor(line: number, column: number, target: string, left: string, right: string = '', op: string = '') {
        super(line, column);
        this.target = target
        this.left = left
        this.right = right
        this.op = op
    }

    debug() {
        const interpreter = Interpreter.getInstance()
        interpreter.evaluateExpresssion(this.target, this.left, this.right, this.op)
        return { type: Type.EXPRESSION }
    }
}