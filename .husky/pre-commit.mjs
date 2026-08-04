import { execSync } from 'node:child_process';

execSync('npx lint-staged', { stdio: 'inherit' });
