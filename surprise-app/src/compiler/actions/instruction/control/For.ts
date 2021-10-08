import { Instruction } from "../../../abstract/Instruction";
import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";

export class For extends Instruction {
    private condition: Expression;
    private instructions: Instruction
    constructor(condition: Expression, instructions: Instruction, line: number, column: number) {
        super(line, column);
        this.condition = condition
        this.instructions = instructions
    }

    compile(env: Environment): void {
        const generator = Generator.getInstance();
        const newEnv = new Environment(env);
        generator.addComment('BEGIN for');
        //@ts-ignore
        this.condition.compile(newEnv, this.instructions);
    }

}