import { Expression } from "../../abstract/Expression";
import { Instruction } from "../../abstract/Instruction";
import { Environment } from "../../Environment";
import { Generator, Natives } from "../../Generator";
import { ErrorTS } from "../../utils/Error";
import { Types } from "../../utils/Type";

export class Console extends Instruction {
  private value: Array<Expression>
  constructor(value: Array<Expression>, line: number, column: number) {
    super(line, column);
    this.value = value
  }

  compile(env: Environment): void {
    const n = this.value.length;
    const generator = Generator.getInstance();
    let j = 0;
    this.value.forEach((i: Expression) => {
      const value = i.compile(env);
      switch (value.type.type) {
        case Types.NUMBER:
          generator.addPrint("f", "(float)" + value.getValue());
          break;
        case Types.BOOLEAN:
          const templabel = generator.newLabel();
          generator.addLabel(value.trueLabel);
          generator.addPrintTrue();
          generator.addGoto(templabel);
          generator.addLabel(value.falseLabel);
          generator.addPrintFalse();
          generator.addLabel(templabel);
          break;
        case Types.STRING:
          generator.addNextEnv(env.size);
          generator.addSetStack("p", value.getValue());
          generator.addCall("native_print_str");
          generator.addNative(Natives.print_str);
          generator.addPrevEnv(env.size);
          break;
        default:
          throw new ErrorTS(this.line, this.column, "Semantical", `'${value.type.type}' not supported in this version`);
      }
      j++;
      if (j !== n) {
        generator.addPrint("c", "32");
      }
    });
    generator.addPrint("c", "10");
  }
}
