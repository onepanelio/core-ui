import { Parameter } from "../../api";

export class ParameterUtils {
    /**
     * Goes through the template of a Parameter, which includes display name, options, etc, and the actual
     * used value of a parameter, which includes name and value, and combines them into a parameter with all of the information.
     *
     * @param values
     * @param templates
     */
    public static combineValueAndTemplate(values: Parameter[], templates: Parameter[]): Parameter[]
    {
        let result = new Array<Parameter>();

        for(const template of templates) {
            let resultParameter = template;
            const valueParameter = values.find((val: Parameter) => val.name === template.name);
            if(valueParameter) {
                resultParameter.value = valueParameter.value;
            }

            result.push(resultParameter);
        }

        return result;
    }
}
