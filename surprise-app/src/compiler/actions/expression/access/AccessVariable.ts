import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Types } from "../../../utils/Type";

export class AccessVariable extends Expression {
  private id: string;
  private previous: Expression | null
  constructor(id: string, previous: Expression | null, line: number, column: number) {
    super(line, column);
    this.id = id;
    this.previous = previous
  }
  compile(env: Environment, state?: boolean): Return {
    const generator = Generator.getInstance();
    let symbol = env.getVariable(this.id);
    if (symbol == null) throw new ErrorTS(this.line, this.column, "Semantical", `Cannot find name '${this.id}'`);
    if (state) {
      if (symbol.isGlobal) return new Return(symbol.position + "", false, symbol.type, symbol);
      else {
        const temp = generator.newTemporal();
        generator.addExpression(temp, "p", symbol.position, "+");
        return new Return(temp, true, symbol.type, symbol);
      }
    } else {
      const temp = generator.newTemporal();
      if (symbol.isGlobal) {
        generator.addGetStack(temp, symbol.position);
      }
      else {
        const tempAux = generator.newTemporal();
        generator.freeTemp(tempAux);
        generator.addExpression(tempAux, "p", symbol.position, "+");
        generator.addGetStack(temp, tempAux);
      }
      if (symbol.type.type !== Types.BOOLEAN) return new Return(temp, true, symbol.type, symbol);
      generator.freeTemp(temp);
      const auxReturn = new Return("", false, symbol.type, symbol);
      this.trueLabel = this.trueLabel === "" ? generator.newLabel() : this.trueLabel;
      this.falseLabel = this.falseLabel === "" ? generator.newLabel() : this.falseLabel;
      generator.addIf(temp, "1", "==", this.trueLabel);
      generator.addGoto(this.falseLabel);
      auxReturn.trueLabel = this.trueLabel;
      auxReturn.falseLabel = this.falseLabel;
      return auxReturn;
    }
  }
}
