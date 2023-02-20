import * as core from '@actions/core';
import * as path from 'path';
import * as fs from 'fs';
import { castValueToType, getValueByPath, keyValue, setValueByPath } from 'ferramenta';
import { DEFAULT_JSON_FILE, DEFAULT_OUTPUT_NAME } from './constants';

const workspace = process.env.GITHUB_WORKSPACE ?? './';

/**
 * Reads the JSON file and returns the object. If the file is not found or is unparseable, returns {}.
 * @param file A file path.
 */
const readFile = (file: string): object => {
	try {
		return JSON.parse(fs.readFileSync(file).toString());
	} catch {
		core.setFailed(`Invalid JSON file: ${file}`);
		return {};
	}
};

/**
 * Writes the object to the JSON file.
 * @param file A file path.
 * @param obj An object to write.
 */
const writeJSONFile = (file: string, obj: object): void => {
	try {
		fs.writeFileSync(file, JSON.stringify(obj, null, 2));
	} catch (error) {
		core.setFailed(String(error));
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const outputValue = (outputValue: any, outputName = 'value'): void => {
	core.debug(keyValue({ outputName, outputValue }));
	core.setOutput(outputName, outputValue);
};

export const run = () => {
	const file = path.join(workspace, core.getInput('file') || DEFAULT_JSON_FILE);
	const mode: 'read' | 'write' = core.getInput('mode') === 'write' ? 'write' : 'read';
	const property = core.getInput('property');
	const outputName = core.getInput('output_name') || DEFAULT_OUTPUT_NAME;
	const quiet = core.getBooleanInput('quiet');
	const fallback = core.getInput('fallback');
	const overrideWith = core.getInput('override_with');
	const useOverride = core.getBooleanInput('use_override');
	const jsonPath = property.split('.');
	const jsonObject = readFile(file);

	if (!property) {
		core.setFailed('Property is not specified');
		return;
	}

	core.debug(
		'Resolved parameters: ' +
			keyValue({ workspace, file, mode, property, outputName, quiet, fallback, overrideWith, useOverride }),
	);

	try {
		if (mode === 'read') {
			/** Read value **/
			const output = getValueByPath(jsonObject, jsonPath);
			if (useOverride) {
				/** Return override value if useOverride is set to true **/
				outputValue(overrideWith, outputName);
			} else if (typeof output === 'undefined') {
				/** Return fallback value if value is undefined **/
				outputValue(fallback, outputName);
			} else if (typeof output === 'object') {
				/** Return JSON string if value is an object **/
				outputValue(JSON.stringify(output), outputName);
			} else {
				/** Return string value **/
				outputValue(String(output), outputName);
			}
			if (!quiet) core.info(keyValue({ file, property, value: output, outputName }));
		} else {
			/** Write value **/
			const value = core.getInput('value');
			const valueType = core.getInput('value_type') || 'string';
			const outputFile = core.getInput('output_file') ? path.join(workspace, core.getInput('output_file')) : file;
			writeJSONFile(outputFile, setValueByPath(jsonObject, jsonPath, castValueToType(value, valueType)));
			if (!quiet) core.info(JSON.stringify({ file, property, value, valueType }));
		}
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error);
		} else {
			core.setFailed(String(error));
		}
	}
};
