import { Expression } from "../../../abstract/Expression";
import { Instruction } from "../../../abstract/Instruction";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Type, Types } from "../../../utils/Type";

export class ReturnTS extends Instruction {
    private value: Expression | null
    constructor(value: Expression | null, line: number, column: number) {
        super(line, column);
        this.value = value
    }

    compile(env: Environment): void {
        const value = this.value?.compile(env) || new Return('0', false, new Type(Types.VOID));
        const symbolFunction = env.actualFunction;
        const generator = Generator.getInstance();

        if (symbolFunction == null) throw new ErrorTS(this.line, this.column, 'Semantico', `A 'return' statement can only be used within a function body`);

        if (!this.sameType(symbolFunction.type, value.type)) throw new ErrorTS(this.line, this.column, 'Semantical', `Type '${value.type.type}' is not assignable to type '${symbolFunction.type.type}'`);

        if (symbolFunction.type.type === Types.BOOLEAN) {
            const templabel = generator.newLabel();
            generator.addLabel(value.trueLabel);
            generator.addSetStack('p', '1');
            generator.addGoto(templabel);
            generator.addLabel(value.falseLabel);
            generator.addSetStack('p', '0');
            generator.addLabel(templabel);
        }
        else if (symbolFunction.type.type !== Types.VOID) generator.addSetStack('p', value.getValue());
        generator.addGoto(env.return || '');
    }
}