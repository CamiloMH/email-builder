import { baseConfig } from '@email/eslint-config/base';

export default [...baseConfig, { ignores: ['dist/**', 'coverage/**'] }];
