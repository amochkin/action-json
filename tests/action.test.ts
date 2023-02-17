import * as core from '@actions/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fs from 'fs'; // <-- Import hack to fix "TypeError: Cannot redefine property: readFileSync"

import { run } from '../src/action';
import * as path from 'path';
import { DEFAULT_JSON_FILE, DEFAULT_OUTPUT_NAME } from '../src/constants';

const workspace = process.env.GITHUB_WORKSPACE ?? './';

interface IRunInputs {
	file?: string;
	property: string;
	mode?: 'read' | 'write';
	value?: string;
	quiet?: boolean;
	fallback?: string;
	override_with?: string;
	use_override?: boolean;
	output_name?: string;
	output_file?: string;
}

interface ITestCase {
	name: string;
	inputs: IRunInputs;
	json: object;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	output: any;
}

describe('Function `run` general tests', () => {
	test('is exported, can be compiled and can be imported', () => {
		expect(run).toBe(run);
	});
});

describe('Function `run` read tests', () => {
	const defaultInputs: IRunInputs = {
		file: DEFAULT_JSON_FILE,
		property: 'version',
		mode: 'read',
		value: '',
		quiet: false,
		fallback: '',
		output_name: DEFAULT_OUTPUT_NAME,
	};

	const defaultJson = { name: 'action-json', version: '1.2.3' };

	const defaultOutput = defaultJson.version;

	/**
	 * Provides convenience wrapper for JSON value read test cases.
	 * @param inputs Test case inputs.
	 * @param jsonString JSON object to read.
	 * @param value Expected value.
	 */
	const readTestFactory = (inputs = defaultInputs, jsonString: object = defaultJson, value = defaultOutput) => {
		jest.clearAllMocks();

		const fsReadSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(jsonString));

		jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return inputs[name as keyof IRunInputs] || ('' as any);
		});
		jest.spyOn(core, 'getBooleanInput').mockImplementation((name: string) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return inputs[name as keyof IRunInputs] || (false as any);
		});

		const setOutputSpy = jest.spyOn(core, 'setOutput');
		// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
		setOutputSpy.mockImplementation((_name: string, _value: string) => {});

		run();

		expect(fsReadSpy).toBeCalledWith(path.join(workspace, inputs.file || ''));

		expect(setOutputSpy).toBeCalledWith(inputs.output_name, value);
	};

	const readTestCases: ITestCase[] = [
		{
			name: 'defaults',
			inputs: defaultInputs,
			json: defaultJson,
			output: defaultOutput,
		},
		{
			name: 'defaults with custom file name',
			inputs: { ...defaultInputs, file: 'custom-file-name.json' },
			json: defaultJson,
			output: defaultOutput,
		},
		{
			name: 'defaults with custom output name',
			inputs: { ...defaultInputs, output_name: 'custom-output-name' },
			json: defaultJson,
			output: defaultOutput,
		},
		{
			name: `empty json`,
			inputs: defaultInputs,
			json: {},
			output: '',
		},
		{
			name: `non-existent property`,
			inputs: { ...defaultInputs, property: 'non-existent-property' },
			json: defaultJson,
			output: '',
		},
		{
			name: `non-existent property with fallback`,
			inputs: { ...defaultInputs, property: 'non-existent-property', fallback: 'none' },
			json: defaultJson,
			output: 'none',
		},
		{
			name: `property with empty value`,
			inputs: defaultInputs,
			json: { ...defaultJson, version: '' },
			output: '',
		},
		{
			name: `property with falsy value`,
			inputs: defaultInputs,
			json: { ...defaultJson, version: false },
			output: 'false',
		},
		{
			name: `property with falsy value and fallback`,
			inputs: { ...defaultInputs, fallback: 'none' },
			json: { ...defaultJson, version: false },
			output: 'false',
		},
	];

	readTestCases.forEach((t, i) =>
		test(`${t.name} [${i + 1}]: inputs: ${JSON.stringify(t.inputs)} expected-output: '${
			t.output
		}' json: ${JSON.stringify(t.json)}`, () => readTestFactory(t.inputs, t.json, t.output)),
	);
});

describe('Function `run` write tests', () => {
	const defaultInputs: IRunInputs = {
		file: DEFAULT_JSON_FILE,
		property: 'version',
		mode: 'write',
		value: '2.3.4',
		quiet: false,
		fallback: '',
		output_file: DEFAULT_JSON_FILE,
	};

	const defaultJson = { name: 'action-json', version: '1.2.3' };

	const defaultOutputJson = { name: 'action-json', version: '2.3.4' };

	/**
	 * Provides convenience wrapper for JSON value write test cases.
	 * @param inputs Test case inputs.
	 * @param originalJson JSON object to read.
	 * @param modifiedJson JSON object to write.
	 */
	const writeTestFactory = (
		inputs = defaultInputs,
		originalJson: object = defaultJson,
		modifiedJson: object = defaultOutputJson,
	) => {
		jest.clearAllMocks();

		const fsReadSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(originalJson));

		jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return inputs[name as keyof IRunInputs] || ('' as any);
		});
		jest.spyOn(core, 'getBooleanInput').mockImplementation((name: string) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return inputs[name as keyof IRunInputs] || (false as any);
		});

		const fsWriteSpy = jest.spyOn(fs, 'writeFileSync');
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		fsWriteSpy.mockImplementation(() => {});

		run();

		expect(fsReadSpy).toBeCalledWith(path.join(workspace, inputs.file || ''));

		expect(fsWriteSpy).toBeCalledWith(
			path.join(workspace, inputs.output_file || ''),
			JSON.stringify(modifiedJson, null, 2),
		);
	};

	const writeTestCases: ITestCase[] = [
		{
			name: 'defaults',
			inputs: defaultInputs,
			json: defaultJson,
			output: defaultOutputJson,
		},
		{
			name: 'defaults with custom output name',
			inputs: { ...defaultInputs, output_file: 'custom-output-file.json' },
			json: defaultJson,
			output: defaultOutputJson,
		},
		{
			name: 'defaults with custom input and output name',
			inputs: { ...defaultInputs, output_file: 'custom-output-file.json', file: 'custom-input-file.json' },
			json: defaultJson,
			output: defaultOutputJson,
		},
		{
			name: 'new property',
			inputs: { ...defaultInputs, property: 'new', value: '12345' },
			json: defaultJson,
			output: { ...defaultJson, new: '12345' },
		},
		{
			name: 'empty json',
			inputs: { ...defaultInputs, property: 'new', value: '12345' },
			json: {},
			output: { new: '12345' },
		},
	];

	writeTestCases.forEach((t, i) =>
		test(`${t.name} [${i + 1}]: inputs: ${JSON.stringify(t.inputs)} expected-output: '${JSON.stringify(
			t.output,
		)}' json: ${JSON.stringify(t.json)}`, () => writeTestFactory(t.inputs, t.json, t.output)),
	);
});
