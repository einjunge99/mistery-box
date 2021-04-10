import { Instruction } from "../../../abstract/Instruction";
import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { Types } from "../../../utils/Type";
import { ErrorTS } from "../../../utils/Error";

export class While extends Instruction {

    constructor(private condition: Expression, private instruction: Instruction, line: number, column: number) {
        super(line, column);
    }

    compile(env: Environment) : void{
        const generator = Generator.getInstance();
        const newEnv = new Environment(env);
        const lblWhile = generator.newLabel();
        generator.addComment('BEGIN while');
        generator.addLabel(lblWhile);
        const condition = this.condition.compile(env);
        if(condition.type.type === Types.BOOLEAN){
            newEnv.break = condition.falseLabel;
            newEnv.continue = lblWhile;
            generator.addLabel(condition.trueLabel);

            this.instruction.compile(newEnv);

            generator.addGoto(lblWhile);
            generator.addLabel(condition.falseLabel);
            generator.addComment('END while');
            return;
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Condition found not boolean`);
    }
}