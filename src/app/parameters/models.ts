import { Parameter } from '../../api';

export class ParameterUtils {
    /**
     * Goes through the template of a Parameter, which includes display name, options, etc, and the actual
     * used value of a parameter, which includes name and value, and combines them into a parameter with all of the information.
     */
    public static combineValueAndTemplate(values: Parameter[], templates: Parameter[]): Parameter[] {
        const result = new Array<Parameter>();

        for (const template of templates) {
            const resultParameter = template;
            const valueParameter = values.find((val: Parameter) => val.name === template.name);
            if (valueParameter) {
                resultParameter.value = valueParameter.value;
            }

            result.push(resultParameter);
        }

        return result;
    }
}
