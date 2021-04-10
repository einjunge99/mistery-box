import { Instruction } from "../../../abstract/Instruction";
import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { Types } from "../../../utils/Type";
import { ErrorTS } from "../../../utils/Error";

export class If extends Instruction {
    private condition: Expression
    private instruction: Instruction
    private elseIf: Instruction|null
    constructor(condition: Expression, instruction: Instruction, elseIf: Instruction | null, line: number, column: number) {
        super(line, column);
        this.condition = condition
        this.instruction = instruction
        this.elseIf = elseIf
    }

    compile(env: Environment): void {
        const generator = Generator.getInstance();
        generator.addComment('BEGIN if');
        const condition = this.condition?.compile(env); condition.getValue();
        const newEnv = new Environment(env);
        if (condition.type.type === Types.BOOLEAN) {
            generator.addLabel(condition.trueLabel);
            this.instruction.compile(newEnv);
            if (this.elseIf !== null) {
                const tempLbl = generator.newLabel();
                generator.addGoto(tempLbl);
                generator.addLabel(condition.falseLabel);
                this.elseIf.compile(env);
                generator.addLabel(tempLbl);
            }
            else {
                generator.addLabel(condition.falseLabel);
            }
            return;
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', 'Condition found not boolean');
    }
}