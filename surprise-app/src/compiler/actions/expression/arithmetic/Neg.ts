import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Types } from "../../../utils/Type";

export class Neg extends Expression {
    private left: Expression
    constructor(left: Expression, line: number, column: number) {
        super(line, column);
        this.left = left
    }

    public compile(env: Environment): Return {
        const left = this.left.compile(env);
        const generator = Generator.getInstance();
        const temp = generator.newTemporal();
        switch (left.type.type) {
            case Types.NUMBER:
                generator.addExpression(temp, '0', left.getValue(), '-');
                return new Return(temp, true, left.type);
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Operator '-' cannot be applied to type '${left.type.type}'`);
    }
}