import { Instruction } from "../../../abstract/Instruction";
import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { Types } from "../../../utils/Type";
import { ErrorTS } from "../../../utils/Error";

export class DoWhile extends Instruction {
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
        generator.addComment('BEGIN doWhile');
        newEnv.continue = this.condition.trueLabel = generator.newLabel();
        newEnv.break = this.condition.falseLabel = generator.newLabel();
        generator.addLabel(this.condition.trueLabel);

        this.instructions.compile(newEnv);

        const condition = this.condition.compile(env);
        if (condition.type.type === Types.BOOLEAN) {
            generator.addLabel(condition.falseLabel);
            generator.addComment('END DoWhile');
            return;
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', 'Condition found not boolean');
    }
}