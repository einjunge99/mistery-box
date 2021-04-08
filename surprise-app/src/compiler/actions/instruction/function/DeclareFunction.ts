import { Generator } from "../../../Generator";
import { Environment } from "../../../Environment";
import { Type } from "../../../utils/Type";
import { Param } from "../../../utils/Param";
import { Instruction } from "../../../abstract/Instruction";
import { ErrorTS } from "../../../utils/Error";

export class DeclareFunction extends Instruction {
  private preCompile: boolean;
  private body: Instruction;
  id: string;
  params: Array<Param>;
  type: Type;
  constructor(id: string, params: Array<Param>, type: Type, body: Instruction, line: number, column: number) {
    super(line, column);
    this.preCompile = true;
    this.id = id
    this.params = params
    this.type = type
    this.body = body
  }

  compile(env: Environment) {
    if (this.preCompile) {
      this.preCompile = false;
      this.validateParams();
      if (!env.addFunction(this)) throw new ErrorTS(this.line, this.column, "Semantical", `Duplicate function implementation: ${this.id}`);
      return;
    }

    const generator = Generator.getInstance();
    const newEnv = new Environment(env);

    const symbolFunction = env.getFunction(this.id);
    const returnlbl = generator.newLabel();
    const tempStorage = generator.getTempStorage();

    newEnv.setEnvironmentFunction(symbolFunction, returnlbl);
    this.params.forEach((param) => { newEnv.addVariable(param.id, param.type, false, false) });
    generator.clearTempStorage();
    const auxCode = generator.saveCode();
    generator.clearPrevious();
    generator.addBegin(symbolFunction.id);
    this.body.compile(newEnv);
    generator.addLabel(returnlbl);
    generator.addEnd();
    generator.addFunction();
    generator.setCode(auxCode);

    generator.setTempStorage(tempStorage);
  }

  private validateParams() {
    const set = new Set<string>();
    this.params.forEach((param) => {
      if (set.has(param.id)) throw new ErrorTS(this.line, this.column, "Semantical;", `Duplicate identifier '${param.id}'`);
      set.add(param.id);
    });
  }
}
