import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator, Natives } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Type, Types } from "../../../utils/Type";

export class Equals extends Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression, line: number, column: number) {
    super(line, column);
    this.left = left;
    this.right = right;
  }

  //@ts-ignore
  compile(env: Environment): Return {
    const left = this.left.compile(env);
    let right: Return | null = null;
    const generator = Generator.getInstance();

    switch (left.type.type) {
      case Types.NUMBER:
        right = this.right.compile(env);
        switch (right.type.type) {
          case Types.NUMBER:
            this.trueLabel = this.trueLabel === "" ? generator.newLabel() : this.trueLabel;
            this.falseLabel = this.falseLabel === "" ? generator.newLabel() : this.falseLabel;
            generator.addIf(left.getValue(), right.getValue(), "==", this.trueLabel);
            generator.addGoto(this.falseLabel);
            const auxReturn = new Return("", false, new Type(Types.BOOLEAN));
            auxReturn.trueLabel = this.trueLabel;
            auxReturn.falseLabel = this.falseLabel;
            return auxReturn;
        }
        break;
      case Types.BOOLEAN:

        const trueLabel = this.trueLabel === "" ? generator.newLabel() : this.trueLabel;
        const falseLabel = this.falseLabel === "" ? generator.newLabel() : this.falseLabel;

        generator.addLabel(left.trueLabel);
        this.right.trueLabel = trueLabel;
        this.right.falseLabel = falseLabel;
        right = this.right.compile(env);

        generator.addLabel(left.falseLabel);
        this.right.trueLabel = falseLabel;
        this.right.falseLabel = trueLabel;
        right = this.right.compile(env);
        if (right.type.type === Types.BOOLEAN) {
          const auxReturn = new Return("", false, left.type);
          auxReturn.trueLabel = trueLabel;
          auxReturn.falseLabel = falseLabel;
          return auxReturn;
        }
        break;
      case Types.STRING:
        right = this.right.compile(env);
        switch (right.type.type) {
          case Types.STRING: {
            const temp = generator.newTemporal(); generator.freeTemp(temp);
            const tempAux = generator.newTemporal();
            generator.freeTemp(tempAux);
            generator.freeTemp(tempAux);
            generator.addExpression(tempAux, "p", env.size + 1, "+");
            generator.addSetStack(tempAux, left.getValue());
            generator.addExpression(tempAux, tempAux, "1", "+");
            generator.addSetStack(tempAux, right.getValue());
            generator.addNextEnv(env.size);
            generator.addCall("native_cmp_str");
            generator.addNative(Natives.cmp_str);
            generator.addGetStack(temp, "(int)p");
            generator.addPrevEnv(env.size);

            this.trueLabel = this.trueLabel === "" ? generator.newLabel() : this.trueLabel;
            this.falseLabel = this.falseLabel === "" ? generator.newLabel() : this.falseLabel;
            generator.addIf(temp, "1", "==", this.trueLabel);
            generator.addGoto(this.falseLabel);
            const auxReturn = new Return("", false, new Type(Types.BOOLEAN));
            auxReturn.trueLabel = this.trueLabel;
            auxReturn.falseLabel = this.falseLabel;
            return auxReturn;
          }

        }
        break;
    }
    throw new ErrorTS(this.line, this.column, 'Semantical', `Cannot apply '==' with ${left.type.type} and ${right?.type.type}`);
  }
}
