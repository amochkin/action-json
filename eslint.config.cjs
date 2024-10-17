/* eslint-disable */

/** @type {import('@p8ec/shared').EslintConfigOverride} */
const override = {
	copyright: '2024 A. Mochkin',
	// eslintConfig: { languageOptions: { globals: { ...globals.node} } },
}

module.exports = require('@p8ec/shared').eslintConfigRecommended(override);
