import{_ as a,c as i,o as n,a1 as l}from"./chunks/framework.TuIRSVI8.js";const c=JSON.parse('{"title":"Pre-Commit Validation Workflow","description":"","frontmatter":{},"headers":[],"relativePath":"workflows/pre-commit.md","filePath":"workflows/pre-commit.md","lastUpdated":1765863345000}'),t={name:"workflows/pre-commit.md"};function e(p,s,h,o,k,r){return n(),i("div",null,[...s[0]||(s[0]=[l(`<h1 id="pre-commit-validation-workflow" tabindex="-1">Pre-Commit Validation Workflow <a class="header-anchor" href="#pre-commit-validation-workflow" aria-label="Permalink to &quot;Pre-Commit Validation Workflow&quot;">​</a></h1><p>Validate code and documentation quality before committing changes to git.</p><h2 id="metadata" tabindex="-1">Metadata <a class="header-anchor" href="#metadata" aria-label="Permalink to &quot;Metadata&quot;">​</a></h2><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">workflow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">pre-commit-validation</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">agents</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">test-validator</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">doc-synchronizer</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">execution</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">parallel</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">estimated_time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">20s</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">priority</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">critical</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">gate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Block commit on failure</span></span></code></pre></div><h2 id="purpose" tabindex="-1">Purpose <a class="header-anchor" href="#purpose" aria-label="Permalink to &quot;Purpose&quot;">​</a></h2><p>Ensure code quality and documentation accuracy before committing changes. Run comprehensive tests and doc validation in parallel to catch issues early.</p><h2 id="workflow-steps" tabindex="-1">Workflow Steps <a class="header-anchor" href="#workflow-steps" aria-label="Permalink to &quot;Workflow Steps&quot;">​</a></h2><h3 id="phase-1-parallel-validation-15s" tabindex="-1">Phase 1: Parallel Validation (15s) <a class="header-anchor" href="#phase-1-parallel-validation-15s" aria-label="Permalink to &quot;Phase 1: Parallel Validation (15s)&quot;">​</a></h3><p>Launch both validators simultaneously:</p><p><strong>Agent 1: test-validator</strong></p><ul><li>Extract all documented test cases</li><li>Run system.zsh function tests</li><li>Run git-utils.zsh function tests</li><li>Run dev.zsh function tests</li><li>Validate smart wrapper pipe detection</li><li>Check tool availability fallbacks</li><li>Verify edge case handling</li></ul><p><strong>Agent 2: doc-synchronizer</strong></p><ul><li>Compare function signatures vs docs</li><li>Test all documented examples</li><li>Validate file path references</li><li>Check tool references in TOOLS.md</li><li>Scan for broken links (internal)</li><li>Detect stale version numbers</li><li>Find placeholder text (TODO, FIXME)</li></ul><h3 id="phase-2-result-analysis-3s" tabindex="-1">Phase 2: Result Analysis (3s) <a class="header-anchor" href="#phase-2-result-analysis-3s" aria-label="Permalink to &quot;Phase 2: Result Analysis (3s)&quot;">​</a></h3><p>Determine commit gate decision:</p><ul><li><strong>PASS</strong>: All tests pass, docs accurate → Allow commit</li><li><strong>FAIL</strong>: Any test fails or critical doc issue → Block commit</li><li><strong>WARN</strong>: Tests pass, minor doc issues → Allow with warning</li></ul><h3 id="phase-3-report-action-2s" tabindex="-1">Phase 3: Report &amp; Action (2s) <a class="header-anchor" href="#phase-3-report-action-2s" aria-label="Permalink to &quot;Phase 3: Report &amp; Action (2s)&quot;">​</a></h3><p>Generate validation report and take action:</p><ul><li>Display pass/fail summary</li><li>List any failures with fix suggestions</li><li>Exit with appropriate code (0 = pass, 1 = fail)</li><li>Update git commit message with validation badge</li></ul><h2 id="execution" tabindex="-1">Execution <a class="header-anchor" href="#execution" aria-label="Permalink to &quot;Execution&quot;">​</a></h2><h3 id="via-git-pre-commit-hook" tabindex="-1">Via Git Pre-Commit Hook <a class="header-anchor" href="#via-git-pre-commit-hook" aria-label="Permalink to &quot;Via Git Pre-Commit Hook&quot;">​</a></h3><p><strong>Setup (one-time)</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Create hook directory</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.config/git/hooks</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Create pre-commit hook</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.config/git/hooks/pre-commit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;EOF&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">#!/bin/zsh</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Pre-commit validation workflow</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">echo &quot;🔄 Running pre-commit validation...&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Run workflow</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">if ! workflow pre-commit --quiet; then</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  echo &quot;❌ Pre-commit validation failed!&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  echo &quot;Fix issues or use: git commit --no-verify&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  exit 1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">fi</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">echo &quot;✅ Validation passed&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">exit 0</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">EOF</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Make executable</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chmod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> +x</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.config/git/hooks/pre-commit</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Configure git to use hooks</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --global</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> core.hooksPath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.config/git/hooks</span></span></code></pre></div><h3 id="via-workflow-launcher" tabindex="-1">Via Workflow Launcher <a class="header-anchor" href="#via-workflow-launcher" aria-label="Permalink to &quot;Via Workflow Launcher&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Run manually before committing</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">workflow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pre-commit</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Or explicitly</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">workflow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pre-commit-validation</span></span></code></pre></div><h3 id="via-slash-command" tabindex="-1">Via Slash Command <a class="header-anchor" href="#via-slash-command" aria-label="Permalink to &quot;Via Slash Command&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># In Claude Code</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/agent</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> test-validator,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> doc-synchronizer</span></span></code></pre></div><h2 id="expected-output" tabindex="-1">Expected Output <a class="header-anchor" href="#expected-output" aria-label="Permalink to &quot;Expected Output&quot;">​</a></h2><h3 id="terminal-output-success" tabindex="-1">Terminal Output (Success) <a class="header-anchor" href="#terminal-output-success" aria-label="Permalink to &quot;Terminal Output (Success)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>🔄 Running pre-commit validation...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Launching validators in parallel:</span></span>
<span class="line"><span>  ├─ test-validator...     ✓ (12.3s) - 87/87 tests passed</span></span>
<span class="line"><span>  └─ doc-synchronizer...   ✓ (10.1s) - 0 issues found</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Analyzing results... ✓ (1.2s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>✅ Pre-commit validation PASSED (14.1s total)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>📊 Summary:</span></span>
<span class="line"><span>  Tests:        87/87 passed (100%)</span></span>
<span class="line"><span>  Doc Issues:   0</span></span>
<span class="line"><span>  Gate Status:  OPEN ✅</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Safe to commit!</span></span></code></pre></div><h3 id="terminal-output-failure" tabindex="-1">Terminal Output (Failure) <a class="header-anchor" href="#terminal-output-failure" aria-label="Permalink to &quot;Terminal Output (Failure)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>🔄 Running pre-commit validation...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Launching validators in parallel:</span></span>
<span class="line"><span>  ├─ test-validator...     ✗ (13.5s) - 85/87 tests passed</span></span>
<span class="line"><span>  └─ doc-synchronizer...   ⚠  (9.8s) - 2 warnings</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Analyzing results... ✓ (1.1s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>❌ Pre-commit validation FAILED (15.2s total)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>📊 Summary:</span></span>
<span class="line"><span>  Tests:        85/87 passed (97.7%)</span></span>
<span class="line"><span>  Failed Tests: 2</span></span>
<span class="line"><span>  Doc Issues:   2 (warnings)</span></span>
<span class="line"><span>  Gate Status:  BLOCKED ❌</span></span>
<span class="line"><span></span></span>
<span class="line"><span>🔴 Test Failures (2)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>F-001: bat pipe detection</span></span>
<span class="line"><span>  File: functions/smart-wrappers.zsh:15</span></span>
<span class="line"><span>  Test: Piped output should be plain</span></span>
<span class="line"><span>  Fix:  Update pipe detection logic</span></span>
<span class="line"><span></span></span>
<span class="line"><span>F-002: port invalid input</span></span>
<span class="line"><span>  File: functions/system.zsh:42</span></span>
<span class="line"><span>  Test: Invalid port should show error</span></span>
<span class="line"><span>  Fix:  Add input validation</span></span>
<span class="line"><span></span></span>
<span class="line"><span>⚠️ Doc Warnings (2)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>W-001: Broken link in README.md</span></span>
<span class="line"><span>  Link: [Setup Guide](docs/SETUP.md)</span></span>
<span class="line"><span>  Fix:  Create file or remove link</span></span>
<span class="line"><span></span></span>
<span class="line"><span>W-002: Stale example</span></span>
<span class="line"><span>  File: README.md:125</span></span>
<span class="line"><span>  Fix:  Update path reference</span></span>
<span class="line"><span></span></span>
<span class="line"><span>🔧 To commit anyway: git commit --no-verify</span></span>
<span class="line"><span>🔧 To fix and retry: Fix issues above, then git add &amp; commit again</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Detailed reports:</span></span>
<span class="line"><span>  Tests: ~/.cache/test-validation-report.md</span></span>
<span class="line"><span>  Docs:  ~/.cache/doc-sync-report.md</span></span></code></pre></div><h2 id="gate-behavior" tabindex="-1">Gate Behavior <a class="header-anchor" href="#gate-behavior" aria-label="Permalink to &quot;Gate Behavior&quot;">​</a></h2><h3 id="block-commit-when" tabindex="-1">Block Commit When: <a class="header-anchor" href="#block-commit-when" aria-label="Permalink to &quot;Block Commit When:&quot;">​</a></h3><ul><li>❌ Any test fails</li><li>❌ Broken internal links in docs</li><li>❌ Example commands don&#39;t work</li><li>❌ Function signatures don&#39;t match docs</li></ul><h3 id="allow-with-warning-when" tabindex="-1">Allow with Warning When: <a class="header-anchor" href="#allow-with-warning-when" aria-label="Permalink to &quot;Allow with Warning When:&quot;">​</a></h3><ul><li>⚠️ Minor doc issues (stale versions)</li><li>⚠️ Optional tests skipped (missing tools)</li><li>⚠️ External links broken (network issue)</li></ul><h3 id="always-allow" tabindex="-1">Always Allow: <a class="header-anchor" href="#always-allow" aria-label="Permalink to &quot;Always Allow:&quot;">​</a></h3><ul><li>✅ All tests pass</li><li>✅ All docs synchronized</li><li>✅ No critical issues</li></ul><h2 id="bypass-options" tabindex="-1">Bypass Options <a class="header-anchor" href="#bypass-options" aria-label="Permalink to &quot;Bypass Options&quot;">​</a></h2><h3 id="temporary-bypass" tabindex="-1">Temporary Bypass <a class="header-anchor" href="#temporary-bypass" aria-label="Permalink to &quot;Temporary Bypass&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Skip validation for one commit</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --no-verify</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;WIP: Work in progress&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Use sparingly! Only for:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Work-in-progress</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commits</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Emergency</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> fixes</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Non-code</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> changes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (images, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">etc.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h3 id="permanent-bypass" tabindex="-1">Permanent Bypass <a class="header-anchor" href="#permanent-bypass" aria-label="Permalink to &quot;Permanent Bypass&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Disable hook globally (NOT RECOMMENDED)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --global</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> core.hooksPath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Or remove hook</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.config/git/hooks/pre-commit</span></span></code></pre></div><h2 id="validation-report" tabindex="-1">Validation Report <a class="header-anchor" href="#validation-report" aria-label="Permalink to &quot;Validation Report&quot;">​</a></h2><h3 id="full-report-structure" tabindex="-1">Full Report Structure <a class="header-anchor" href="#full-report-structure" aria-label="Permalink to &quot;Full Report Structure&quot;">​</a></h3><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;"># Pre-Commit Validation Report</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Generated: 2025-10-31 14:45:30</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Commit: feat: Add smart bat wrapper</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 🎯 Gate Decision: PASS ✅</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">All validation checks passed. Safe to commit.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## ✅ Test Validation (87/87 passed)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### System Utilities - All Passed</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ mkcd: creates and enters directory</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ mkcd: handles nested paths</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ port: identifies process on port</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ backup: creates timestamped backup</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ extract: handles .tar.gz files</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ path: lists PATH entries</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ reload: restarts shell</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### Git Utilities - All Passed</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ git-undo: reverts last commit</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ git-amend: amends without changing message</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ git-root: navigates to repo root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ git-ignore: adds pattern to .gitignore</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### Development Utilities - All Passed</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ serve: starts on default port</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ retry: succeeds on first try</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ json: pretty-prints JSON</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ timestamp: outputs ISO format</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Coverage**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 23/23 functions tested (100%)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Pass Rate**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 100%</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## ✅ Documentation Validation (0 issues)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### File References - All Valid</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ All path references exist</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ All tool references valid</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ No broken internal links</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### Examples - All Working</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ All README examples tested</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ All function examples work</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ Version numbers current</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">### Structure - Consistent</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ All required sections present</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ Cross-references accurate</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">✓ No placeholder text</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Health Score**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 100/100</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 📊 Commit Metadata</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Modified Files**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 3</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  -</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> functions/smart-wrappers.zsh</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  -</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> README.md</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  -</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> docs/TOOLS.md</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Lines Changed**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: +47, -12</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Validation Time**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: 14.1s</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-light-font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold;">**Gate Status**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: OPEN ✅</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-light-font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold;">## 🚀 Ready to Commit</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\`\`\`bash</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;feat: Add smart bat wrapper with pipe detection</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- Implements context-aware bat wrapper</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- Detects terminal vs piped output</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- Falls back to plain mode when piped</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- Adds comprehensive test coverage</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">✓ Validated: 87/87 tests passed, 0 doc issues&quot;</span></span></code></pre></div><hr><p>Generated by: test-validator v1.0.0 + doc-synchronizer v1.0.0 Report ID: pre-commit-20251031-144530</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>## Success Criteria</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- ✅ Catches test failures before commit</span></span>
<span class="line"><span>- ✅ Detects doc/code drift before commit</span></span>
<span class="line"><span>- ✅ Completes in &lt; 20 seconds</span></span>
<span class="line"><span>- ✅ Clear pass/fail indication</span></span>
<span class="line"><span>- ✅ Actionable fix suggestions</span></span>
<span class="line"><span>- ✅ Bypass option available for WIP commits</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## Best Practices</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### When to Bypass</span></span>
<span class="line"><span>\`\`\`bash</span></span>
<span class="line"><span># ✅ Good reasons to bypass:</span></span>
<span class="line"><span>- git commit --no-verify -m &quot;WIP: Experimenting with idea&quot;</span></span>
<span class="line"><span>- git commit --no-verify -m &quot;docs: Fix typo&quot; (trivial change)</span></span>
<span class="line"><span>- git commit --no-verify -m &quot;chore: Add .gitignore entry&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ❌ Bad reasons to bypass:</span></span>
<span class="line"><span>- &quot;Tests are failing but I&#39;ll fix later&quot; (NO!)</span></span>
<span class="line"><span>- &quot;Don&#39;t have time to fix docs&quot; (NO!)</span></span>
<span class="line"><span>- &quot;This is just a small change&quot; (run validation anyway!)</span></span></code></pre></div><h3 id="commit-message-enhancement" tabindex="-1">Commit Message Enhancement <a class="header-anchor" href="#commit-message-enhancement" aria-label="Permalink to &quot;Commit Message Enhancement&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Validation adds metadata to commit messages</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Before:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">feat:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> retry</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> function</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># After (auto-enhanced):</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">feat:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> retry</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> function</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Implements</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> retry</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> with</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> configurable</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> attempts</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Adds</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> delay</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> between</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> retries</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Includes</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> comprehensive</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> test</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> coverage</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">✓</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Pre-commit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> validation</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> passed</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">✓</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Tests:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 87/87</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (100%)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">✓</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Docs:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> issues</span></span></code></pre></div><h2 id="integration-points" tabindex="-1">Integration Points <a class="header-anchor" href="#integration-points" aria-label="Permalink to &quot;Integration Points&quot;">​</a></h2><ul><li><strong>test-validator</strong>: Run all function tests</li><li><strong>doc-synchronizer</strong>: Validate documentation</li><li><strong>Git hooks</strong>: Block commits on failure</li><li><strong>CI/CD</strong>: Complement with GitHub Actions</li></ul><h2 id="historical-tracking" tabindex="-1">Historical Tracking <a class="header-anchor" href="#historical-tracking" aria-label="Permalink to &quot;Historical Tracking&quot;">​</a></h2><h3 id="success-rate-monitoring" tabindex="-1">Success Rate Monitoring <a class="header-anchor" href="#success-rate-monitoring" aria-label="Permalink to &quot;Success Rate Monitoring&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Track validation results</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">echo</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;$(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">date</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> +%Y-%m-%d) | PASS | 87/87 tests&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.cache/pre-commit-history.log</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Analyze trends</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tail</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -50</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.cache/pre-commit-history.log</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> grep</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> FAIL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> wc</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -l</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Goal: &lt; 5% failure rate</span></span></code></pre></div><hr><p><strong>Status</strong>: Production Ready <strong>Last Updated</strong>: 2025-10-31 <strong>Workflow ID</strong>: pre-commit-v1</p>`,59)])])}const g=a(t,[["render",e]]);export{c as __pageData,g as default};
