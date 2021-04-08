import { Expression } from "../../../abstract/Expression";
import { Instruction } from "../../../abstract/Instruction";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Type, Types } from "../../../utils/Type";

export class DeclareVariable extends Instruction {
  private access: boolean;
  private id: string;
  private type: Type;
  private value: Expression | null
  constructor(access: boolean, id: string, type: Type, value: Expression | null, line: number, column: number) {
    super(line, column);
    this.access = access
    this.id = id
    this.type = type
    this.value = value
  }

  compile(env: Environment): void {
    const generator = Generator.getInstance();
    const compiled = this.value?.compile(env);
    if (compiled == null) throw new ErrorTS(this.line, this.column, "Semantical", `Variable '${this.id}' must be initialized`);
    if (!this.sameType(this.type, compiled.type)) throw new ErrorTS(this.line, this.column, "Semantical", `Type '${compiled.type.type}' is not assignable to type '${this.type.type}'`);
    const newVariable = env.addVariable(this.id, this.type, this.access, false);
    if (newVariable == null) throw new ErrorTS(this.line, this.column, "Semantical", `Cannot redeclare block-scoped variable '${this.id}'`);
    if (newVariable.isGlobal) {
      if (this.type.type === Types.BOOLEAN) {
        const templabel = generator.newLabel();
        generator.addLabel(compiled.trueLabel);
        generator.addSetStack(newVariable.position, "1");
        generator.addGoto(templabel);
        generator.addLabel(compiled.falseLabel);
        generator.addSetStack(newVariable.position, "0");
        generator.addLabel(templabel);
      }
      else generator.addSetStack(newVariable.position, compiled.getValue());
    }
    else {
      const temp = generator.newTemporal(); generator.freeTemp(temp);
      if (this.type.type === Types.BOOLEAN) {
        const templabel = generator.newLabel();
        generator.addLabel(compiled.trueLabel);
        generator.addExpression(temp, "p", newVariable.position, "+");
        generator.addSetStack(temp, "1");
        generator.addGoto(templabel);
        generator.addLabel(compiled.falseLabel);
        generator.addExpression(temp, "p", newVariable.position, "+");
        generator.addSetStack(temp, "0");
        generator.addLabel(templabel);
      } else {
        generator.addExpression(temp, "p", newVariable.position, "+");
        generator.addSetStack(temp, compiled.getValue());
      }
    }
  }
}
