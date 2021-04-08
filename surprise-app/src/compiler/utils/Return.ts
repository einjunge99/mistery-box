
import { Symbol } from "../symbol/Symbol";
import { Generator } from "../Generator";
import { Type } from "./Type";

export class Return {
  trueLabel: string;
  falseLabel: string;
  value: string;
  isTemp: boolean;
  type: Type
  symbol: Symbol | null
  constructor(value: string, isTemp: boolean, type: Type, symbol: Symbol | null = null) {
    this.trueLabel = this.falseLabel = "";
    this.value = value;
    this.isTemp = isTemp;
    this.type = type;
    this.symbol = symbol
  }

  getValue() {
    Generator.getInstance().freeTemp(this.value);
    return this.value;
  }
}
