import { run } from './action';

if (require.main === module) {
	// eslint-disable-next-line no-console
	console.log('Running action...');
	run();
} else {
	// eslint-disable-next-line no-console
	console.log('Exporting action...');
	module.exports = run;
}
