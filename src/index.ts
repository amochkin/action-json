import { run } from './action';

if (require.main === module) {
	// eslint-disable-next-line no-console
	console.log('Running action (via node)...');
} else {
	// eslint-disable-next-line no-console
	console.log('Running action...');
}
run();

// eslint-disable-next-line no-console
console.log('Completed action.');

export default run;
