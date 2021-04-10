import { Instruction } from "../../../abstract/Instruction";
import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { Types } from "../../../utils/Type";
import { ErrorTS } from "../../../utils/Error";
import { AssignVariable } from "../variable/AssignVariable";
import { DeclareVariable } from "../variable/DeclareVariable";

export class ForBody extends Instruction {
    private left: AssignVariable | DeclareVariable
    private condition: Expression
    final: Expression
    constructor(left: AssignVariable | DeclareVariable, condition: Expression, final: Expression, line: number, column: number) {
        super(line, column);
        this.left = left
        this.condition = condition
        this.final = final
    }

    compile(env: Environment, instructions?: Instruction): void {
        const generator = Generator.getInstance();
        const lblFor = generator.newLabel();
        this.left.compile(env);
        generator.addLabel(lblFor);
        const condition = this.condition.compile(env);
        if (condition.type.type === Types.BOOLEAN) {
            env.break = condition.falseLabel;
            env.continue = lblFor;
            generator.addLabel(condition.trueLabel);

            //@ts-ignore
            instructions.compile(env);

            this.final.compile(env).getValue();

            generator.addGoto(lblFor);
            generator.addLabel(condition.falseLabel);
            generator.addComment('END For');
            return;
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Condition found not boolean`);
    }
}