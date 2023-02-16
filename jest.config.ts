import type { Config } from 'jest';

export default async (): Promise<Config> => {
	return {
		verbose: true,
		roots: ['<rootDir>/tests'],
		testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
		transform: {
			'^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
		},
	};
};
