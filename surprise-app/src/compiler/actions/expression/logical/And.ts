import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Types } from "../../../utils/Type";

export class And extends Expression {
    private left: Expression;
    private right: Expression;

    constructor(left: Expression, right: Expression, line: number, column: number) {
        super(line, column);
        this.left = left;
        this.right = right;
    }

    compile(env: Environment): Return {
        const generator = Generator.getInstance();
        this.trueLabel = this.trueLabel === '' ? generator.newLabel() : this.trueLabel;
        this.falseLabel = this.falseLabel === '' ? generator.newLabel() : this.falseLabel;

        this.left.trueLabel = generator.newLabel();
        this.right.trueLabel = this.trueLabel;
        this.left.falseLabel = this.right.falseLabel = this.falseLabel;

        const left = this.left.compile(env);
        generator.addLabel(this.left.trueLabel);
        const right = this.right.compile(env);
        if (left.type.type === Types.BOOLEAN && right.type.type === Types.BOOLEAN) {
            const auxReturn = new Return('', false, left.type);
            auxReturn.trueLabel = this.trueLabel;
            auxReturn.falseLabel = this.right.falseLabel;
            return auxReturn;
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Cannot apply '&&' with ${left.type.type} and ${right.type.type}`);
    }
}