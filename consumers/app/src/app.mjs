import { statusBadgeStyle, assertRequiredTokens } from '@bitfire/ui';
import { sourceHash } from '@bitfire/tokens';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
console.log(JSON.stringify({
  tokens: require('@bitfire/tokens/package.json').version,
  ui: require('@bitfire/ui/package.json').version,
  tokensSourceHash: sourceHash,
  requiredTokensPresent: assertRequiredTokens(),
  going: statusBadgeStyle('danger', true),
  underAssessment: statusBadgeStyle('danger', false)
}, null, 2));
