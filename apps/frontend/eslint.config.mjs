import { reactConfig } from '@email/eslint-config/react';

export default [...reactConfig, { ignores: ['dist/**', 'coverage/**', 'api/**'] }];
