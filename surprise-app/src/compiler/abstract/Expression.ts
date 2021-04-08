import { Environment } from "../Environment";
import { Return } from "../utils/Return";
import { Type } from "../utils/Type";

export abstract class Expression {
    trueLabel: string;
    falseLabel: string;
    line: number;
    column: number;

    constructor(line: number, column: number) {
        this.trueLabel = this.falseLabel = "";
        this.line = line;
        this.column = column;
    }

    public sameType(left: Type, right: Type): boolean {
        if (left.type === right.type) return true;
        return false;
      }    

    public abstract compile(env: Environment): Return;

}
