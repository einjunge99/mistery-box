import { InstructionC3D } from "../Abstract/Instruction";
import { Type } from '../Interpreter'
export class ReturnC3D extends InstructionC3D {

    debug() {
        return { type: Type.RETURN }
    }
}