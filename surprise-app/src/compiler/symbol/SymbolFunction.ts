import { DeclareFunction } from "../actions/instruction/function/DeclareFunction";
import { Param } from "../utils/Param";
import { Type } from "../utils/Type";

export class SymbolFunction {
  type: Type;
  id: string;
  size: number;
  params: Array<Param>;
  column: number;
  line: number;
  constructor(func: DeclareFunction) {
    this.type = func.type;
    this.id = func.id;
    this.size = func.params.length;
    this.params = func.params;
    this.column = func.column;
    this.line = func.line;
  }
}
