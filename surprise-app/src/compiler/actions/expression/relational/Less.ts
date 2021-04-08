import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Type, Types } from "../../../utils/Type";

export class Less extends Expression {

    private isLessEqual: boolean;
    private left: Expression;
    private right: Expression
    constructor(isLessEqual: boolean, left: Expression, right: Expression, line: number, column: number) {
        super(line, column);
        this.isLessEqual = isLessEqual
        this.left = left
        this.right = right
    }
    compile(env: Environment): Return {
        const left = this.left.compile(env);
        const right = this.right.compile(env);

        const lefType = left.type.type;
        const rightType = right.type.type;
        const operator = this.isLessEqual ? '<=' : '<'

        if (lefType === Types.NUMBER && rightType === Types.NUMBER) {
            const generator = Generator.getInstance();
            this.trueLabel = this.trueLabel === '' ? generator.newLabel() : this.trueLabel;
            this.falseLabel = this.falseLabel === '' ? generator.newLabel() : this.falseLabel;
            generator.addIf(left.getValue(), right.getValue(), operator, this.trueLabel);
            generator.addGoto(this.falseLabel);
            const auxReturn = new Return('', false, new Type(Types.BOOLEAN));
            auxReturn.trueLabel = this.trueLabel;
            auxReturn.falseLabel = this.falseLabel;
            return auxReturn;
        }

        throw new ErrorTS(this.line, this.column, 'Semantical', `Cannot apply '${operator}' with ${left.type.type} and ${right.type.type}`);
    }
}