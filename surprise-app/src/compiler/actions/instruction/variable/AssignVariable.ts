import { Expression } from "../../../abstract/Expression";
import { Instruction } from "../../../abstract/Instruction";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Types } from "../../../utils/Type";

export class AssignVariable extends Instruction {
  private target: Expression;
  private value: Expression;
  constructor(target: Expression, value: Expression, line: number, column: number) {
    super(line, column);
    this.target = target
    this.value = value
  }

  compile(env: Environment): void {
    //@ts-ignore
    const target = this.target.compile(env, true);
    if (target.symbol?.isConst)
      throw new ErrorTS(this.line, this.column, "Semantical", `Cannot assign to '${target.symbol.identifier}' because it is a constant.`);
    const value = this.value.compile(env);

    const generator = Generator.getInstance();
    const symbol = target.symbol;

    if (!this.sameType(target.type, value.type)) throw new ErrorTS(this.line, this.column, "Semantical", `Type '${value.type.type}' is not assignable to type '${target.type.type}'`);

    const ptr = symbol?.isGlobal ? symbol.position : target.getValue()
    if (target.type.type === Types.BOOLEAN) {
      const templabel = generator.newLabel();
      generator.addLabel(value.trueLabel);
      generator.addSetStack(ptr, "1");
      generator.addGoto(templabel);
      generator.addLabel(value.falseLabel);
      generator.addSetStack(ptr, "0");
      generator.addLabel(templabel);
    }
    else generator.addSetStack(ptr, value.getValue());

  }
}
