import { Instruction } from "./abstract/Instruction";
import { DeclareFunction } from "./actions/instruction/function/DeclareFunction";
import { Environment } from "./Environment";
import { Generator } from "./Generator";
import { Logs } from "./utils/LogArray";
const parser = require("../grammar/grammar");

export class Compiler {
  private code: string
  private output: string
  constructor(code: string) {
    this.code = code
    this.output = ''
  }
  compile() {
    Logs.length = 0
    let node;
    try {
      node = parser.parse(this.code);
    } catch (error) {
      Logs.push(error)
      return { state: false, message: 'There was an error while parsing your input!' };
    }
    const generator = Generator.getInstance();
    generator.clearCode();
    const env = new Environment(null);
    try {
      node.forEach((e: Instruction) => {
        if (e instanceof DeclareFunction) e.compile(env);
      });
      generator.addBegin("main");
      node.forEach((e: Instruction) => {
        e.compile(env);
      });
      generator.addEnd();
    } catch (error) {
      Logs.push(error)
      return { state: false, message: 'There was an error while generating your TAC!' };
    }
    const functions = generator.getFunctions();
    const code = generator.getCode();
    /*
    Uncomment if want to add temporals to output.
    const labelCount = generator.getTemporal();
    this.code = this.header(labelCount - 1) + functions + code;
    */
    this.output = functions + code;
    return { state: true, message: 'TAC generated successfully!' };
  }
  getOutput() {
    return this.output;
  }
  private header(n: number) {
    let header =
      "#include <stdio.h>\n" +
      "#include <math.h> \n" +
      "double Heap[170720]; \n" +
      "double Stack[170720];\n" +
      "double p;\n" +
      "double h;\n" +
      "double N0,N1,N2,N3,N4,N5,N6,N7;\n";
    header += n > -1 ? "double " + this.setTemp(n) : "";
    return header;
  }
  private setTemp(n: number) {
    let i = 0;
    let header = "";
    while (i <= n) {
      header += "T" + i;
      if (i !== n) header += ", ";
      else header += ";\n";
      i++;
    }
    return header;
  }
}

export default Compiler;
