import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Types } from "../../../utils/Type";

export class Not extends Expression {
    private value: Expression;

    constructor(value: Expression, line: number, column: number) {
        super(line, column);
        this.value = value;
    }

    compile(env: Environment): Return {
        const generator = Generator.getInstance();
        this.trueLabel = this.trueLabel === '' ? generator.newLabel() : this.trueLabel;
        this.falseLabel = this.falseLabel === '' ? generator.newLabel() : this.falseLabel;

        this.value.trueLabel = this.falseLabel;
        this.value.falseLabel = this.trueLabel;

        const value = this.value.compile(env);

        if (value.type.type === Types.BOOLEAN) {
            const auxReturn = new Return('', false, value.type);
            auxReturn.trueLabel = this.trueLabel;
            auxReturn.falseLabel = this.falseLabel;
            return auxReturn;
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Cannot apply '!' with ${value.type.type}`);
    }
}