import { Instruction } from "../../abstract/Instruction";
import { Environment } from "../../Environment";
import { Logs } from "../../utils/LogArray";

export class Statement extends Instruction {
    private instructions: Array<Instruction> | null
    constructor(instructions: Array<Instruction> | null, line: number, column: number) {
        super(line, column);
        this.instructions = instructions
    }

    compile(env: Environment): any {
        const newEnv = env.actualFunction == null ? new Environment(env) : env;
        this.instructions?.forEach((instruction) => {
            try {
                instruction.compile(newEnv);
            } catch (error) {
                Logs.push(error);
            }
        });
    }
}