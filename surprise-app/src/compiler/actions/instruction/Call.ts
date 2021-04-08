import { Expression } from "../../abstract/Expression";
import { Instruction } from "../../abstract/Instruction";
import { Environment } from "../../Environment";

export class Call extends Instruction {
  private call: Expression;

  constructor(call: Expression, line: number, column: number) {
    super(line, column);
    this.call = call;
  }

  compile(enviorement: Environment) {
    const value = this.call.compile(enviorement);
    if (value !== undefined) value.getValue();
  }
}
