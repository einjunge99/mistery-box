import { InstructionC3D } from "../Abstract/Instruction";
import { Label } from "./Label";

export class FunctionC3D extends InstructionC3D {

    private currentIndex: number
    private type: string;
    private id: string;
    private instr: InstructionC3D[]

    constructor(type: string, id: string, instr: InstructionC3D[], line: number, column: number) {
        super(line, column);
        this.currentIndex = 0
        this.type = type
        this.id = id
        this.instr = instr
    }

    debug() { }

    public getInstruction() {
        const i: number = this.currentIndex;
        this.currentIndex++
        return this.instr[i]
    }

    public goToLabel(label: string) {
        this.instr.forEach((e, i) => {
            if (e instanceof Label && e.getLabel() === label) this.currentIndex = i
        });
    }

    public resetIndex() {
        this.currentIndex = 0
    }

    public setIndex(i: number) {
        this.currentIndex = i
    }

    public getIndex() {
        return this.currentIndex
    }

    public getId() {
        return this.id;
    }
}