import { SymbolFunction } from "./symbol/SymbolFunction";
import { Symbol } from "./symbol/Symbol";
import { Type } from "./utils/Type";
import { DeclareFunction } from "./actions/instruction/function/DeclareFunction";

export class Environment {
  public functions: Map<string, SymbolFunction>;
  public variables: Map<string, Symbol>;
  previous: Environment | null;
  size: number;
  break: string | null;
  continue: string | null;
  return: string | null;
  actualFunction: SymbolFunction | null;

  constructor(previous: Environment | null = null) {
    this.functions = new Map();
    this.variables = new Map();
    this.previous = previous;
    this.size = previous?.size || 0;
    this.break = previous?.break || null;
    this.return = previous?.return || null;
    this.continue = previous?.continue || null;
    this.actualFunction = previous?.actualFunction || null;
  }

  setEnvironmentFunction(actualFunction: SymbolFunction, ret: string) {
    this.size = 1;
    this.return = ret;
    this.actualFunction = actualFunction;
  }

  public addVariable(id: string, type: Type, isConst: boolean, isHeap: boolean): Symbol | null {
    if (this.variables.get(id) !== undefined) return null;
    const newVar = new Symbol(type, id, this.size++, isConst, this.previous == null, isHeap);
    this.variables.set(id, newVar);
    return newVar;
  }

  public getVariable(id: string): Symbol | null {
    let env: Environment | null = this;
    while (env != null) {
      const sym = env.variables.get(id);
      if (sym !== undefined) return sym;
      env = env.previous;
    }
    return null;
  }

  public addFunction(func: DeclareFunction): boolean {
    if (this.functions.has(func.id)) return false;
    this.functions.set(func.id, new SymbolFunction(func));
    return true;
  }

  public getFunction(id: string): SymbolFunction {
    //@ts-ignore
    return this.functions.get(id);
  }

  public searchFunction(id: string): SymbolFunction | null {
    let env: Environment | null = this;
    while (env != null) {
      const sym = env.functions.get(id);
      if (sym !==undefined) return sym;
      env = env.previous;
    }
    return null;
  }
}
