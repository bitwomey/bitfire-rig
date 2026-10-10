---
name: repo-public-until-refined
description: "Ben keeps bitfire-rig public on the bitwomey account until it is refined, then transfers to BITFire-org; publishing, registry rollback and map work are deferred"
type: decision
---

**Decision (Ben, 2026-10-10).** `bitwomey/bitfire-rig` stays public (free CI) and on his personal account until it is fully functional and refined. Then it is transferred to the `BITFire-org` organisation and protected. Deferred, each with the `deferred` label and a comment: #3 (publish), #4 (rollback on the real registry), #8 (Cesium adapter), #9 (map asset sources), #10 (hatching channel). "A long way off using Cesium."

**Package scope.** GitHub Packages scopes to the owning org, so under `BITFire-org` the scope would be `@bitfire-org`, not `@bitfire`. The org `BITFire` is an unrelated 2013 organisation. Decide the scope before #3.

**Context.** BITFire is Ben's personal project (agentic coding learning vehicle; firefighting knowledge corpus for his FBAN, Incident Manager, Planning Officer and Air Observer roles), shared openly with AEM's head of engineering. No employer product names in the repo (Elements 360 and AEM references removed, PR #16). Default skin: Ember confirmed (#13).
