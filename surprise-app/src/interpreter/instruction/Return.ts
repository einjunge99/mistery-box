import { InstructionC3D } from "../Abstract/Instruction";
import { Type } from '../Interpreter'
export class ReturnC3D extends InstructionC3D {
    constructor(line: number, column: number) {
        super(line, column);
    }
    debug() { 
        return {type:Type.RETURN}
    }
}