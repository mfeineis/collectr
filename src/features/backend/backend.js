import { buildSchema, execute, parse, validate, validateSchema } from "graphql";

import { schema as appSchemaDef } from "./schema.js";
import { configureResolvers } from "./resolvers.js";

export class Backend {}

export function configureBackend(
    env,
    schema = buildSchema(appSchemaDef),
) {
    // Validate Schema
    const schemaValidationErrors = validateSchema(schema);

    const rootValue = configureResolvers(env);

    /** @type {QueryFacade} */
    return async function query(args) {
        const {
            source,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver,
        } = args;

        if (schemaValidationErrors.length > 0) {
            return { errors: schemaValidationErrors };
        }

        // Parse
        let document;
        try {
            document = parse(source);
        } catch (syntaxError) {
            return { errors: [syntaxError] };
        }

        // Validate
        const validationErrors = validate(schema, document);
        if (validationErrors.length > 0) {
            return { errors: validationErrors };
        }

        // Execute
        return execute({
            schema,
            document,
            rootValue,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver,
        });
    };
}
