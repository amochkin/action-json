import { run } from './action';

if (require.main === module) {
	// eslint-disable-next-line no-console
	console.log('Running action...');
	run();
}

export default run;
