import { Instruction } from "../../../abstract/Instruction";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";

export class Continue extends Instruction {
  constructor(line: number, column: number) {
    super(line, column);
  }

  compile(enviorement: Environment) {
    if (enviorement.continue == null) throw new ErrorTS(this.line, this.column, "Semantical", "A 'continue' statement can only be used within an enclosing iteration statement");
    Generator.getInstance().addGoto(enviorement.continue);
  }
}
