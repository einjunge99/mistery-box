import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Types } from "../../../utils/Type";

export class Inc extends Expression {

    constructor(private assign: Expression, line: number, column: number) {
        super(line, column);
    }

    compile(env: Environment): Return {
        //@ts-ignore
        const assign = this.assign.compile(env, true);
        const symbol = assign.symbol;
        const generator = Generator.getInstance();
        if (symbol == null) throw new ErrorTS(this.line, this.column, 'Semantical', 'The operand of an increment or decrement operator must be a variable or a property assign');
        switch (assign.type.type) {
            case Types.NUMBER:
                const value = this.assign.compile(env);
                const temp = generator.newTemporal();
                if (symbol?.isGlobal) {
                    generator.addExpression(temp, value.getValue(), '1', '+');
                    generator.addSetStack(symbol.position, temp);
                }
                else if (symbol?.isHeap) {
                    generator.addExpression(temp, value.getValue(), '1', '+');
                    generator.addSetHeap(assign.getValue(), temp);
                }
                else {
                    generator.addExpression(temp, value.getValue(), '1', '+');
                    generator.addSetStack(assign.getValue(), temp);
                }
                return new Return(temp, true, symbol.type);
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Operator '++' cannot be applied to type '${assign.type.type}'`);
    }
}
