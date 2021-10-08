import { Instruction } from "../../../abstract/Instruction";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";

export class Break extends Instruction {

  compile(enviorement: Environment): void {
    if (enviorement.break == null) throw new ErrorTS(this.line, this.column, "Semantical", "A 'break' statement can only be used within an enclosing iteration statement");
    Generator.getInstance().addGoto(enviorement.break);
  }
}
