import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator, Natives } from "../../../Generator";
import { ErrorTS } from "../../../utils/Error";
import { Return } from "../../../utils/Return";
import { Type, Types } from "../../../utils/Type";

export class Plus extends Expression {

    constructor(private left: Expression, private right: Expression, line: number, column: number) {
        super(line, column);
    }
    public compile(env: Environment): Return {
        const left = this.left.compile(env);
        let right: Return | null = null;
        const generator = Generator.getInstance();
        let temp;
        let tempAux;
        switch (left.type.type) {
            case Types.NUMBER:
                right = this.right.compile(env);
                temp = generator.newTemporal();
                switch (right.type.type) {
                    case Types.NUMBER:
                        generator.addExpression(temp, left.getValue(), right.getValue(), '+');
                        return new Return(temp, true, left.type);
                    case Types.STRING:
                        tempAux = generator.newTemporal();
                        generator.freeTemp(tempAux);
                        generator.addExpression(tempAux, 'p', env.size + 1, '+');
                        generator.addSetStack(tempAux, left.getValue());
                        generator.addExpression(tempAux, tempAux, '1', '+');
                        generator.addSetStack(tempAux, right.getValue());
                        generator.addNextEnv(env.size);
                        generator.addCall('native_concat_num_str'); generator.addNative(Natives.concat_num_str);
                        generator.addGetStack(temp, 'p');
                        generator.addPrevEnv(env.size);
                        return new Return(temp, true, new Type(Types.STRING));
                    case Types.BOOLEAN:
                        const lblTemp = generator.newLabel();
                        tempAux = generator.newTemporal(); generator.freeTemp(tempAux);

                        generator.addLabel(right.trueLabel);
                        generator.addExpression(tempAux, '1');
                        generator.addGoto(lblTemp);

                        generator.addLabel(right.falseLabel);
                        generator.addExpression(tempAux, '0');
                        generator.addLabel(lblTemp);

                        generator.addExpression(temp, left.getValue(), tempAux, '+');
                        return new Return(temp, true, left.type);
                }
                break;
            case Types.STRING:
                right = this.right.compile(env);
                temp = generator.newTemporal();
                tempAux = generator.newTemporal(); generator.freeTemp(tempAux);
                switch (right.type.type) {
                    case Types.NUMBER:
                        generator.addExpression(tempAux, 'p', env.size + 1, '+');
                        generator.addSetStack(tempAux, left.getValue());
                        generator.addExpression(tempAux, tempAux, '1', '+');
                        generator.addSetStack(tempAux, right.getValue());
                        generator.addNextEnv(env.size);
                        generator.addCall('native_concat_str_num'); generator.addNative(Natives.concat_str_num);
                        generator.addGetStack(temp, 'p');
                        generator.addPrevEnv(env.size);
                        return new Return(temp, true, new Type(Types.STRING));
                    case Types.STRING:
                        generator.addExpression(tempAux, 'p', env.size + 1, '+');
                        generator.addSetStack(tempAux, left.getValue());
                        generator.addExpression(tempAux, tempAux, '1', '+');
                        generator.addSetStack(tempAux, right.getValue());
                        generator.addNextEnv(env.size);
                        generator.addCall('native_concat'); generator.addNative(Natives.concat);
                        generator.addGetStack(temp, 'p');
                        generator.addPrevEnv(env.size);
                        return new Return(temp, true, new Type(Types.STRING));
                    case Types.BOOLEAN:
                        const lblTemp = generator.newLabel();

                        generator.addLabel(right.trueLabel);
                        generator.addExpression(tempAux, 'p', env.size + 1, '+');
                        generator.addSetStack(tempAux, left.getValue());
                        generator.addExpression(tempAux, tempAux, '1', '+');
                        generator.addSetStack(tempAux, '1');
                        generator.addGoto(lblTemp);

                        generator.addLabel(right.falseLabel);
                        generator.addExpression(tempAux, 'p', env.size + 1, '+');
                        generator.addSetStack(tempAux, left.getValue());
                        generator.addExpression(tempAux, tempAux, '1', '+');
                        generator.addSetStack(tempAux, '0');
                        generator.addLabel(lblTemp);

                        generator.addNextEnv(env.size);
                        generator.addCall('native_concat_str_bool'); generator.addNative(Natives.concat_str_bool);
                        generator.addGetStack(temp, 'p');
                        generator.addPrevEnv(env.size);
                        return new Return(temp, true, new Type(Types.STRING));
                }
                break;
            case Types.BOOLEAN:
                const tempBoolean = generator.newTemporal();
                const lblTemp = generator.newLabel();
                generator.addLabel(left.trueLabel);
                generator.addExpression(tempBoolean, '1');
                generator.addGoto(lblTemp);

                generator.addLabel(left.falseLabel);
                generator.addExpression(tempBoolean, '1');
                generator.addLabel(lblTemp);
                right = this.right.compile(env);
                temp = generator.newTemporal();
                switch (right.type.type) {
                    case Types.STRING:
                        tempAux = generator.newTemporal(); generator.freeTemp(tempAux);
                        generator.addExpression(tempAux, 'p', env.size + 1, '+');
                        generator.addSetStack(tempAux, tempBoolean); generator.freeTemp(tempBoolean);
                        generator.addExpression(tempAux, tempAux, '1', '+');
                        generator.addSetStack(tempAux, right.getValue());
                        generator.addNextEnv(env.size);
                        generator.addCall('native_concat_bool_str'); generator.addNative(Natives.concat_bool_str);
                        generator.addGetStack(temp, 'p');
                        generator.addPrevEnv(env.size);
                        return new Return(temp, true, new Type(Types.STRING));
                    case Types.NUMBER:
                        generator.addExpression(temp, tempBoolean, right.getValue(), '+'); generator.freeTemp(tempBoolean);
                        return new Return(temp, true, right.type);
                }
        }
        throw new ErrorTS(this.line, this.column, 'Semantical', `Operator '+' cannot be applied to types '${left.type.type}' and '${right?.type.type}' `);
    }
}
