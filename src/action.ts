import * as core from '@actions/core';
import * as path from 'path';
import * as fs from 'fs';
import { castValueToType, getValueByPath, keyValue, setValueByPath } from 'ferramenta';

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
const writeFile = (file: string, obj: object): void => {
	try {
		fs.writeFileSync(file, JSON.stringify(obj, null, 2));
	} catch (error) {
		core.setFailed(String(error));
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const outputValue = (value: any): void => {
	core.debug(keyValue({ value }));
	core.setOutput('value', value);
};

export const run = () => {
	// eslint-disable-next-line no-console
	console.log('Running action...');
	// eslint-disable-next-line no-console
	console.log('Workspace:', workspace);

	const file = path.join(workspace, core.getInput('file') || 'package.json');
	const mode: 'read' | 'write' = core.getInput('mode') === 'write' ? 'write' : 'read';
	const property = core.getInput('property');
	const quiet = core.getBooleanInput('quiet');
	const fallback = core.getInput('fallback');
	const overrideWith = core.getInput('overrideWith');
	const useOverride = core.getBooleanInput('useOverride');
	const jsonPath = property.split('.');
	const jsonObject = readFile(file);

	if (!property) {
		core.setFailed('Property is not specified');
		return;
	}

	// eslint-disable-next-line no-console
	console.log(keyValue({ file, property, jsonPath, mode, quiet, fallback, overrideWith, useOverride }));
	try {
		if (mode === 'read') {
			/** Read value **/
			const value = getValueByPath(jsonObject, jsonPath);
			if (useOverride) {
				/** Return override value if useOverride is set to true **/
				outputValue(overrideWith);
			} else if (typeof value === 'undefined') {
				/** Return fallback value if value is undefined **/
				outputValue(fallback);
			} else if (typeof value === 'object') {
				/** Return JSON string if value is an object **/
				outputValue(JSON.stringify(value));
			} else {
				/** Return string value **/
				outputValue(String(value));
			}
			if (!quiet) core.info(keyValue({ file, property, value }));
		} else {
			/** Write value **/
			const value = core.getInput('value');
			const valueType = core.getInput('valueType') || 'string';
			writeFile(file, setValueByPath(jsonObject, jsonPath, castValueToType(value, valueType)));
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
