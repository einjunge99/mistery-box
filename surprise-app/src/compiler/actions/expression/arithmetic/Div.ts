import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Type, Types } from "../../../utils/Type";
export class Div extends Expression {
    private left: Expression;
    private right: Expression
    constructor(left: Expression, right: Expression, line: number, column: number) {
        super(line, column);
        this.left = left
        this.right = right
    }

    public compile(env: Environment): Return {
        const left = this.left.compile(env);
        const right = this.right.compile(env);
        const generator = Generator.getInstance();
        const temp = generator.newTemporal();
        switch (left.type.type) {
            case Types.NUMBER:
                switch (right.type.type) {
                    case Types.NUMBER:
                        generator.addExpression(temp, left.getValue(), right.getValue(), '/');
                        return new Return(temp, true, new Type(Types.NUMBER));
                }
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Operator '/' cannot be applied to types '${left.type.type}' and '${right.type.type}' `);
    }
}