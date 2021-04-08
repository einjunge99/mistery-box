import { Environment } from "../Environment";
import { Type } from "../utils/Type";

export abstract class Instruction {
  line: number;
  column: number;

  constructor(line: number, column: number) {
    this.line = line;
    this.column = column;
  }

  public sameType(left: Type, right: Type): boolean {
    if (left.type === right.type) return true;
    return false;
  }

  public abstract compile(env: Environment): any;
}
