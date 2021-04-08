import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Types } from "../../../utils/Type";

export class AccessFunction extends Expression {
  private id: string;
  private params: Array<Expression>
  constructor(id: string, params: Array<Expression>, line: number, column: number) {
    super(line, column);
    this.id = id
    this.params = params
  }

  compile(env: Environment): Return {
    const symbolFunction = env.searchFunction(this.id);
    if (symbolFunction == null) throw new ErrorTS(this.line, this.column, "Semantical", `Cannot find name '${this.id}'`);
    const paramsValues = new Array<Return>();
    const generator = Generator.getInstance();
    const size = generator.saveTemps(env);

    const registeredLength = symbolFunction.params.length;
    const incomingLength = this.params.length;
    if (registeredLength !== incomingLength) throw new ErrorTS(this.line, this.column, "Semantical", `Expected ${registeredLength} arguments, but got ${incomingLength}`);
    let i = 0;
    this.params.forEach((param) => {
      const compiledParam = param.compile(env);
      const registeredType = symbolFunction.params[i].type.type;
      const incomingType = compiledParam.type.type;
      if (registeredType !== incomingType) throw new ErrorTS(this.line, this.column, "Semantical", `Argument of type '${incomingType}' is not assignable to parameter of type '${registeredType}'`);
      if (incomingType === Types.BOOLEAN) {
        const temp = generator.newTemporal();
        generator.freeTemp(temp);
        const templabel = generator.newLabel();
        generator.addLabel(compiledParam.trueLabel);
        generator.addExpression(temp, "p", env.size + i + 1, "+");
        generator.addSetStack(temp, "1");
        generator.addGoto(templabel);
        generator.addLabel(compiledParam.falseLabel);
        generator.addExpression(temp, "p", env.size + i + 1, "+");
        generator.addSetStack(temp, "0");
        generator.addLabel(templabel);
      }
      paramsValues.push(compiledParam);
      i++;
    });
    const temp = generator.newTemporal();
    generator.freeTemp(temp);
    if (paramsValues.length !== 0) {
      generator.addExpression(temp, "p", env.size + 1, "+");
      paramsValues.forEach((value, index) => {
        if (value.type.type !== Types.BOOLEAN)
          generator.addSetStack(temp, value.getValue());
        if (index !== paramsValues.length - 1)
          generator.addExpression(temp, temp, "1", "+");
      });
    }

    generator.addNextEnv(env.size);
    generator.addCall(symbolFunction.id);
    generator.addGetStack(temp, "p");
    generator.addPrevEnv(env.size);
    generator.recoverTemps(env, size);
    generator.addTemp(temp);

    if (symbolFunction.type.type !== Types.BOOLEAN) return new Return(temp, true, symbolFunction.type);
    const auxReturn = new Return("", false, symbolFunction.type);
    this.trueLabel = this.trueLabel === "" ? generator.newLabel() : this.trueLabel;
    this.falseLabel = this.falseLabel === "" ? generator.newLabel() : this.falseLabel;
    generator.addIf(temp, "1", "==", this.trueLabel);
    generator.addGoto(this.falseLabel);
    auxReturn.trueLabel = this.trueLabel;
    auxReturn.falseLabel = this.falseLabel;
    return auxReturn;
  }
}
