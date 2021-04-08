import { InstructionC3D } from "../Abstract/Instruction";
import { Interpreter, Type } from "../Interpreter";

export class Conditional extends InstructionC3D {

    private left: string
    private relational: string
    private right: string
    private label: string

    constructor(left: string, relational: string, right: string, label: string, line: number, column: number) {
        super(line, column);
        this.left = left
        this.right = right
        this.relational = relational
        this.label = label
    }

    debug() {
        const interpreter = Interpreter.getInstance()
        const result = interpreter.evaluateConditional(this.left, this.relational, this.right)
        return {
            type: Type.GOTO, content: { goto: result, label: this.label }
        }
    }
    public getDestination() {
        return this.label;
    }

    public getLeft() {
        return this.left;
    }
    public getRight() {
        return this.right;
    }
    public getRelational() {
        return this.relational;
    }
}