export abstract class InstructionC3D {
    line: number;
    column: number
    constructor(line: number, column: number) {
        this.line = line
        this.column = column
    }

    public getLine() {
        return this.line
    }
    public abstract debug(): any;
}