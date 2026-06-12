/**
 * scripts/seed-data-extra.ts
 *
 * Extra seed content:
 *  - Manual QA Interview      (~100 questions)
 *  - Automation QA Interview  (~100 questions)
 *  - Code exercises (type 'code') for Java, Playwright, Postman and SQL
 */

export const EXTRA_TOPICS = [
  {
    name: 'Manual QA Interview',
    slug: 'manual-qa-interview',
    description: 'Real-world manual QA interview questions: processes, test design, defects and scenarios.',
    color: '#F43F5E',
    icon: 'ClipboardCheck',
  },
  {
    name: 'Automation QA Interview',
    slug: 'automation-qa-interview',
    description: 'Automation engineer interview questions: frameworks, locators, waits, CI and best practices.',
    color: '#8B5CF6',
    icon: 'Bot',
  },
]

type Diff = 'easy' | 'medium' | 'hard'
type Label = 'A' | 'B' | 'C' | 'D'

export interface ExtraQuestionSeed {
  topicSlug: string
  text: string
  type: 'multiple' | 'true_false' | 'open' | 'code'
  difficulty: Diff
  options?: { label: Label; text: string }[]
  correctAnswer: string | null
  explanation: string
  tags: string[]
  version: string | null
  code?: string | null
  solutionCode?: string | null
}

const LABELS: Label[] = ['A', 'B', 'C', 'D']

/** multiple choice */
const m = (
  topicSlug: string, difficulty: Diff, text: string,
  opts: [string, string, string, string], correct: Label,
  explanation: string, tags: string[] = []
): ExtraQuestionSeed => ({
  topicSlug, type: 'multiple', difficulty, text,
  options: opts.map((t, i) => ({ label: LABELS[i], text: t })),
  correctAnswer: correct, explanation, tags, version: null,
})

/** true / false */
const tf = (
  topicSlug: string, difficulty: Diff, text: string,
  correct: boolean, explanation: string, tags: string[] = []
): ExtraQuestionSeed => ({
  topicSlug, type: 'true_false', difficulty, text,
  options: [], correctAnswer: String(correct), explanation, tags, version: null,
})

/** open (interview) */
const op = (
  topicSlug: string, difficulty: Diff, text: string,
  explanation: string, tags: string[] = []
): ExtraQuestionSeed => ({
  topicSlug, type: 'open', difficulty, text,
  options: [], correctAnswer: null, explanation, tags, version: null,
})

/** code exercise */
const cx = (
  topicSlug: string, difficulty: Diff, text: string,
  code: string | null, solutionCode: string, explanation: string, tags: string[] = []
): ExtraQuestionSeed => ({
  topicSlug, type: 'code', difficulty, text,
  options: [], correctAnswer: null, explanation, tags, version: null,
  code, solutionCode,
})

const MQ = 'manual-qa-interview'
const AQ = 'automation-qa-interview'

export const EXTRA_QUESTIONS: ExtraQuestionSeed[] = [

  // ════════════════════════════════════════════════════════════════════
  // MANUAL QA INTERVIEW — multiple choice (40)
  // ════════════════════════════════════════════════════════════════════
  m(MQ, 'easy', 'A login form accepts passwords of 8 to 16 characters. Which set of values is the best boundary value selection?',
    ['7, 8, 16, 17 characters', '1, 8, 12, 20 characters', '8, 10, 12, 14 characters', '6, 9, 15, 18 characters'], 'A',
    'Boundary value analysis tests the edges: just below the minimum (7), the minimum (8), the maximum (16) and just above it (17).', ['bva', 'test-design']),
  m(MQ, 'easy', 'Which document traces each requirement to the test cases that cover it?',
    ['Test summary report', 'Requirements Traceability Matrix (RTM)', 'Test plan', 'Defect triage report'], 'B',
    'The RTM maps requirements to test cases so coverage gaps and impact of changes are visible.', ['rtm', 'documentation']),
  m(MQ, 'easy', 'A bug crashes the app, but only through a hidden debug menu no real user can reach. How should it be classified?',
    ['High severity, low priority', 'Low severity, high priority', 'High severity, high priority', 'Low severity, low priority'], 'A',
    'A crash is technically severe, but since users cannot reach it, fixing it is not urgent — classic high severity / low priority case.', ['severity', 'priority']),
  m(MQ, 'easy', 'The spell-checker highlights the company logo text on the home page as a typo. The brand name is intentional. What is this result called?',
    ['False negative', 'False positive', 'True positive', 'Defect leakage'], 'B',
    'A false positive is reporting a defect where the behavior is actually correct or intended.', ['defects']),
  m(MQ, 'easy', 'Which testing type verifies that a recent bug fix did not break existing functionality?',
    ['Smoke testing', 'Sanity testing', 'Regression testing', 'Retesting'], 'C',
    'Regression testing re-runs existing tests around the change; retesting only re-checks the specific fixed defect.', ['regression']),
  m(MQ, 'easy', 'After deploying a new build, you run a quick set of tests to confirm the core flows work before deeper testing. This is:',
    ['Regression testing', 'Smoke testing', 'Exploratory testing', 'Acceptance testing'], 'B',
    'Smoke testing is a shallow, wide pass over critical functionality to decide if a build is testable at all.', ['smoke']),
  m(MQ, 'easy', 'Verification vs validation: which statement is correct?',
    ['Verification asks "are we building the product right", validation asks "are we building the right product"', 'Verification is always manual, validation is always automated', 'Validation happens before verification in the SDLC', 'They are synonyms in ISTQB terminology'], 'A',
    'Verification checks conformance to specifications (reviews, static checks); validation checks the product meets user needs (dynamic testing).', ['fundamentals']),
  m(MQ, 'easy', 'Which of these is NOT typically part of a bug report?',
    ['Steps to reproduce', 'Expected vs actual result', 'The line of code causing the bug', 'Environment and build version'], 'C',
    'Identifying the faulty line of code is the developer’s job during debugging; QA reports observable behavior and context.', ['bug-report']),
  m(MQ, 'easy', 'A field accepts ages 18 to 65. Using equivalence partitioning, which values cover all partitions with the fewest tests?',
    ['17, 40, 70', '18, 65', '0, 18, 65, 100, -5', '20, 30, 40'], 'A',
    'Three partitions exist: below range (e.g. 17), valid (e.g. 40) and above range (e.g. 70) — one value from each is enough.', ['equivalence-partitioning']),
  m(MQ, 'easy', 'What is the correct order of the classic defect life cycle?',
    ['New → Assigned → Open → Fixed → Retest → Closed', 'New → Fixed → Assigned → Closed → Retest', 'Open → New → Retest → Fixed → Closed', 'Assigned → New → Open → Closed → Fixed'], 'A',
    'A defect is reported (New), assigned, worked on (Open), fixed, verified by QA (Retest) and finally Closed — or Reopened if the fix fails.', ['bug-lifecycle']),
  m(MQ, 'medium', 'You have 2 hours before release and 200 regression cases. What is the best strategy?',
    ['Run cases alphabetically until time runs out', 'Run risk-based: critical user flows and areas changed in this release first', 'Skip testing and rely on developer unit tests', 'Run only the fastest test cases to maximize the count'], 'B',
    'Risk-based testing prioritizes by business impact and probability of failure — changed areas and revenue-critical flows first.', ['risk-based', 'prioritization']),
  m(MQ, 'medium', 'Exploratory testing is best described as:',
    ['Random clicking without documentation', 'Simultaneous learning, test design and execution', 'Executing scripted cases without deviation', 'Testing done only by end users'], 'B',
    'Exploratory testing is a structured, skilled activity where you design and execute tests on the fly, guided by what you learn — often time-boxed in charters.', ['exploratory']),
  m(MQ, 'medium', 'Which technique is MOST suitable to test a screen whose behavior depends on combinations of 4 independent dropdowns?',
    ['Boundary value analysis', 'Pairwise (all-pairs) testing', 'State transition testing', 'Use case testing'], 'B',
    'Pairwise testing covers all combinations of every two parameters, drastically reducing the combinatorial explosion with high defect-finding power.', ['pairwise', 'test-design']),
  m(MQ, 'medium', 'An ATM card flow (insert card → PIN → menu → withdraw) with locked/unlocked card states is best modeled with:',
    ['Decision table', 'State transition diagram', 'Equivalence partitioning', 'Checklist'], 'B',
    'State transition testing models systems whose response depends on current state and event — perfect for card/PIN/locked flows.', ['state-transition']),
  m(MQ, 'medium', 'A discount engine applies rules based on member status (yes/no), coupon (yes/no) and order > $100 (yes/no). Best technique to derive tests?',
    ['Decision table testing', 'Boundary value analysis', 'Monkey testing', 'Statement coverage'], 'A',
    'Decision tables enumerate condition combinations and their expected actions — ideal for business-rule logic.', ['decision-table']),
  m(MQ, 'medium', 'What distinguishes sanity testing from smoke testing?',
    ['Sanity is broad and shallow; smoke is narrow and deep', 'Sanity is a narrow check that a specific fix or area works; smoke is a broad check of core flows', 'Sanity is automated; smoke is manual', 'There is no difference'], 'B',
    'Smoke = wide and shallow on a new build; sanity = focused verification of a specific change before deeper regression.', ['smoke', 'sanity']),
  m(MQ, 'medium', 'Defect leakage refers to:',
    ['Bugs found by QA before release', 'Bugs that escaped to production undetected by QA', 'Bugs rejected as not reproducible', 'Duplicate bug reports'], 'B',
    'Leakage measures defects that slipped past testing into production — a key quality metric for the test process.', ['metrics']),
  m(MQ, 'medium', 'Which is an example of a non-functional requirement?',
    ['The user can reset their password', 'Search returns results within 2 seconds for 1000 concurrent users', 'Admin can delete accounts', 'The cart shows the item count'], 'B',
    'Non-functional requirements describe HOW the system performs (performance, security, usability) rather than WHAT it does.', ['nfr']),
  m(MQ, 'medium', 'During load testing the system handles 500 users fine, but performance degrades and never recovers after a 30-minute spike of 2000 users. Which test found this?',
    ['Soak testing', 'Spike testing', 'Volume testing', 'Stress testing'], 'B',
    'Spike testing throws sudden extreme load and verifies the system degrades gracefully and recovers afterward.', ['performance']),
  m(MQ, 'medium', 'A test executed over 48 hours reveals memory consumption growing steadily until a crash. This is typically discovered by:',
    ['Smoke testing', 'Soak (endurance) testing', 'Spike testing', 'Unit testing'], 'B',
    'Soak testing runs sustained load over long periods specifically to surface memory leaks and resource exhaustion.', ['performance', 'soak']),
  m(MQ, 'easy', 'Which level of testing is performed FIRST in the V-model?',
    ['System testing', 'Integration testing', 'Unit testing', 'Acceptance testing'], 'C',
    'Test levels run bottom-up: unit → integration → system → acceptance.', ['levels']),
  m(MQ, 'medium', 'The pesticide paradox in testing means:',
    ['Automated tests are toxic to manual testing', 'Re-running the same tests stops finding new bugs, so tests must be reviewed and updated', 'Testing too much damages the product', 'Developers become resistant to bug reports'], 'B',
    'Like pests becoming immune, software "gets used to" static test suites — tests need regular revision to keep finding defects.', ['principles']),
  m(MQ, 'medium', 'Which statement about exhaustive testing is true?',
    ['It is achievable with enough automation', 'It is impossible except in trivial cases; risk and priorities should guide testing', 'It is required for ISO certification', 'It only applies to performance testing'], 'B',
    'A core testing principle: complete testing of all input/state combinations is infeasible — use risk-based selection instead.', ['principles']),
  m(MQ, 'medium', 'Defect clustering suggests that:',
    ['Bugs are evenly distributed across all modules', 'A small number of modules usually contain most of the defects', 'All bugs appear in new code only', 'Clustering bugs in one report saves time'], 'B',
    'Empirically, defects concentrate in a few complex or frequently-changed modules — focus testing there (Pareto principle).', ['principles']),
  m(MQ, 'easy', 'UAT (User Acceptance Testing) is primarily performed by:',
    ['Developers', 'QA engineers', 'Business users or client representatives', 'DevOps engineers'], 'C',
    'UAT validates the system against business needs and is executed by users/stakeholders, not by the engineering team.', ['uat']),
  m(MQ, 'medium', 'Alpha testing vs beta testing — which is correct?',
    ['Alpha is at the developer site with internal users; beta is at customer site with real users', 'Alpha is after release; beta is before release', 'Alpha is automated; beta is manual', 'Alpha is for performance; beta is for security'], 'A',
    'Alpha happens in-house in a controlled environment; beta releases the product to a limited external audience in real conditions.', ['alpha-beta']),
  m(MQ, 'medium', 'Which review type is the most formal, with trained moderators, defined roles and defect logging metrics?',
    ['Walkthrough', 'Informal review', 'Inspection', 'Pair review'], 'C',
    'Inspections are the most formal static review: trained moderator, entry/exit criteria, roles and metrics.', ['static-testing']),
  m(MQ, 'medium', 'Entry criteria for a test phase typically include:',
    ['All defects closed', 'Build deployed to the test environment, smoke passed, test data ready', 'Test summary report approved', 'Code coverage above 90%'], 'B',
    'Entry criteria define what must be true to START testing: stable build, environment, data and documentation availability.', ['test-plan']),
  m(MQ, 'hard', 'You find a critical bug on the day of release. The PM wants to ship anyway. What is the BEST action for QA?',
    ['Block the release unilaterally', 'Document the risk, impact and workaround clearly and escalate so stakeholders make an informed go/no-go decision', 'Silently log it for the next sprint', 'Fix the code yourself'], 'B',
    'QA informs and quantifies risk; the ship decision belongs to stakeholders. Clear documentation and escalation is the professional path.', ['process', 'communication']),
  m(MQ, 'hard', 'A developer rejects your bug as "works on my machine". The best next step is:',
    ['Close the bug', 'Reopen it repeatedly until fixed', 'Add exact environment details, build version, data, logs/video, and reproduce it together if possible', 'Escalate to the manager immediately'], 'C',
    'Most environment disputes resolve with precise repro context: build, browser/OS, test data, network state and evidence.', ['bug-report', 'communication']),
  m(MQ, 'hard', 'Which metric combination best indicates test process health rather than tester productivity?',
    ['Number of test cases written per day', 'Defect leakage, defect detection percentage and escaped-defect severity', 'Hours logged in the test tool', 'Number of bugs reported per tester'], 'B',
    'Leakage and detection percentage measure how well testing protects production; raw counts incentivize the wrong behavior.', ['metrics']),
  m(MQ, 'hard', 'In a decision table with conditions C1, C2, C3 (each true/false), how many rules exist before simplification?',
    ['3', '6', '8', '9'], 'C',
    'Each boolean condition doubles the combinations: 2^3 = 8 rules.', ['decision-table']),
  m(MQ, 'medium', 'Error guessing as a technique relies mainly on:',
    ['Random number generators', 'The tester’s experience with common failure patterns', 'Formal models of the system', 'Code coverage reports'], 'B',
    'Error guessing uses experience and intuition about typical developer mistakes (nulls, empty lists, max lengths, special characters).', ['error-guessing']),
  m(MQ, 'easy', 'Which test case field makes a test case reusable and unambiguous for any tester?',
    ['The author’s name', 'Clear preconditions, steps and expected results', 'A long narrative description', 'The execution date'], 'B',
    'Good test cases are deterministic: anyone can execute the same steps from the same preconditions and judge the same expected result.', ['test-cases']),
  m(MQ, 'medium', 'Localization testing verifies:',
    ['That the app can be adapted to any locale architecture-wise', 'Translations, formats (dates, currency), and cultural fit for a specific market', 'Server response times per region', 'Database schema migrations'], 'B',
    'Localization checks a specific locale’s adaptation; internationalization (i18n) is the architectural capability to support locales.', ['l10n-i18n']),
  m(MQ, 'medium', 'Which is the BEST example of an accessibility check?',
    ['Verifying the page loads in under 3 seconds', 'Verifying all images have meaningful alt text and the site is navigable by keyboard only', 'Verifying the logo colors match the brand book', 'Verifying SQL injection is blocked'], 'B',
    'Accessibility (a11y) ensures usability for people with disabilities: screen reader support, keyboard navigation, contrast, alt text (WCAG).', ['accessibility']),
  m(MQ, 'hard', 'Your regression suite has 800 cases and takes 5 days manually. Release cadence is weekly. The most sustainable solution is:',
    ['Hire 5 more manual testers', 'Prioritize and automate the stable high-value cases, keep a lean manual exploratory pass', 'Cut the suite to 50 random cases', 'Move releases to monthly'], 'B',
    'Automating stable, repetitive regression plus targeted exploratory testing is the standard scaling strategy for fast cadences.', ['strategy', 'automation-roi']),
  m(MQ, 'medium', 'A test oracle is:',
    ['A senior tester who approves releases', 'Any source of truth used to determine the expected result of a test', 'A database vendor', 'A type of test report'], 'B',
    'Oracles (specs, prior versions, standards, comparable products) tell you what the correct behavior should be.', ['fundamentals']),
  m(MQ, 'hard', 'Severity is assigned by ____ and priority is typically owned by ____:',
    ['QA based on technical impact; product/business based on urgency', 'Developers; QA', 'Product owner; QA', 'QA; QA exclusively'], 'A',
    'QA judges technical impact (severity); product/business weighs urgency against goals (priority), often with QA input.', ['severity', 'priority']),
  m(MQ, 'medium', 'Which is true about retesting (confirmation testing)?',
    ['It can be skipped if regression passes', 'It re-executes the exact failing steps on the fixed build to confirm the defect is resolved', 'It is performed only in production', 'It must always be automated'], 'B',
    'Retesting verifies the specific defect fix; regression then checks for unintended side effects around it.', ['retesting']),

  // ════════════════════════════════════════════════════════════════════
  // MANUAL QA INTERVIEW — true/false (15)
  // ════════════════════════════════════════════════════════════════════
  tf(MQ, 'easy', '100% test coverage of requirements guarantees the software has no defects.',
    false, 'Coverage shows what was exercised, not correctness of everything else: testing shows the presence of defects, never their absence.', ['principles']),
  tf(MQ, 'easy', 'A test plan and a test strategy are the same document.',
    false, 'The strategy is the high-level organizational approach; the plan applies it to a specific project/release with scope, schedule and resources.', ['documentation']),
  tf(MQ, 'easy', 'Severity describes the impact of a defect on the system, while priority describes how soon it should be fixed.',
    true, 'Severity = technical impact; priority = business urgency. They are related but independent.', ['severity', 'priority']),
  tf(MQ, 'medium', 'Static testing can find defects without executing any code.',
    true, 'Reviews, walkthroughs, inspections and static analysis find defects in requirements, design and code before execution.', ['static-testing']),
  tf(MQ, 'easy', 'Quality Assurance and testing are exactly the same activity.',
    false, 'QA is process-oriented (preventing defects); testing is product-oriented (finding defects). Testing is one activity within QA/QC.', ['fundamentals']),
  tf(MQ, 'medium', 'Beginning testing as early as possible in the SDLC reduces the cost of fixing defects.',
    true, 'The cost of a defect grows the later it is found — shift-left testing catches issues in requirements and design where fixes are cheapest.', ['shift-left']),
  tf(MQ, 'medium', 'Exploratory testing requires no preparation or documentation at all.',
    false, 'Good exploratory testing uses charters, time-boxes and session notes — it is structured even though it is unscripted.', ['exploratory']),
  tf(MQ, 'easy', 'A regression suite should never change once written.',
    false, 'Suites must evolve with the product and be pruned/updated to stay effective (pesticide paradox).', ['regression']),
  tf(MQ, 'medium', 'In agile teams, QA should wait for the sprint to finish before starting any testing.',
    false, 'QA participates from refinement onward: reviewing stories, defining acceptance criteria and testing increments continuously.', ['agile']),
  tf(MQ, 'medium', 'A defect found in production always means the tester did a bad job.',
    false, 'Testing is sampling under time constraints; escapes are analyzed for process improvement, not blame — some risk is always accepted.', ['process']),
  tf(MQ, 'easy', 'Ad-hoc testing is performed without formal documentation or test design.',
    true, 'Ad-hoc is informal, intuition-driven testing; unlike exploratory it typically lacks charters and structured notes.', ['ad-hoc']),
  tf(MQ, 'medium', 'Acceptance criteria written in Given/When/Then format can serve directly as a basis for test cases.',
    true, 'Gherkin-style criteria are concrete and verifiable, mapping naturally to test scenarios.', ['agile', 'bdd']),
  tf(MQ, 'medium', 'Negative testing verifies that the system gracefully handles invalid input and unexpected user behavior.',
    true, 'Negative tests (wrong formats, boundary violations, interrupted flows) confirm robust error handling.', ['negative-testing']),
  tf(MQ, 'hard', 'If smoke tests fail, the QA team should continue with the full regression cycle anyway.',
    false, 'A failed smoke test means the build is not testable — it should be rejected/fixed before wasting full-cycle effort.', ['smoke']),
  tf(MQ, 'medium', 'The same set of test data should be used forever to keep results comparable.',
    false, 'Stale data masks defects; varied and refreshed test data (including edge values) finds more issues.', ['test-data']),

  // ════════════════════════════════════════════════════════════════════
  // MANUAL QA INTERVIEW — open interview questions (45)
  // ════════════════════════════════════════════════════════════════════
  op(MQ, 'easy', 'Walk me through how you would test a login page.',
    'Cover functional cases (valid/invalid credentials, empty fields, case sensitivity), security (SQL injection, XSS, password masking, lockout after N attempts, no credentials in URL), usability (tab order, error messages, password visibility toggle), compatibility (browsers/devices) and non-functional aspects (response time). Mention both positive and negative paths and session handling after login.', ['classic', 'scenario']),
  op(MQ, 'easy', 'How do you write a good bug report?',
    'A clear title, environment (build, OS, browser), preconditions, numbered steps to reproduce, expected vs actual result, severity/priority, and evidence (screenshots, video, logs). It should be reproducible by anyone and free of opinions.', ['bug-report']),
  op(MQ, 'easy', 'What is the difference between QA, QC and testing?',
    'QA is process-focused and preventive (standards, reviews, process improvement). QC is product-focused verification against requirements. Testing is the hands-on activity of executing the product to find defects — a subset of QC.', ['fundamentals']),
  op(MQ, 'easy', 'What does a typical day look like for a manual QA in an agile team?',
    'Stand-up, reviewing new stories and acceptance criteria, designing/updating test cases, testing stories in the sprint, logging and retesting defects, regression on builds, collaborating with developers and PO, and updating test documentation.', ['agile', 'role']),
  op(MQ, 'easy', 'How do you decide what to test when you have limited time?',
    'Risk-based prioritization: what changed in this build, business-critical flows (money, data loss, login), areas with defect history, and high-traffic features. Communicate explicitly what will NOT be covered and the associated risk.', ['prioritization']),
  op(MQ, 'medium', 'A user reports a bug you cannot reproduce. What do you do?',
    'Gather details: exact build/version, environment, account/data, network conditions, screenshots or video, logs. Try edge conditions (slow network, cache, permissions). If still unreproducible, document attempts, mark as cannot-reproduce with the evidence, and keep monitoring for recurrence.', ['scenario', 'debugging']),
  op(MQ, 'medium', 'How would you test an e-commerce checkout flow?',
    'Test the happy path (cart → address → payment → confirmation), payment variations (cards, declined payments, 3DS), pricing math (taxes, discounts, currency), inventory edge cases (item sells out mid-checkout), interruption recovery (refresh, back button, session timeout), guest vs registered flows, and confirmation emails/order records.', ['scenario', 'e-commerce']),
  op(MQ, 'medium', 'What is your approach when requirements are unclear or missing?',
    'Ask the PO/BA targeted questions, check existing behavior and comparable products as oracles, document assumptions explicitly, get them confirmed, and test against the agreed assumptions while flagging ambiguity as a project risk.', ['requirements']),
  op(MQ, 'medium', 'When do you stop testing?',
    'When exit criteria are met: planned coverage executed, no open critical/high defects (or accepted by stakeholders), defect discovery rate has dropped, and time/budget limits are reached. In practice it is a risk-based stakeholder decision, not "when all bugs are gone".', ['process']),
  op(MQ, 'medium', 'Explain severity vs priority with an example of each combination.',
    'High severity / high priority: checkout crashes for all users. High severity / low priority: crash in a legacy feature used by almost nobody. Low severity / high priority: typo in the company name on the home page. Low severity / low priority: minor misalignment in a rarely-visited settings page.', ['severity', 'priority']),
  op(MQ, 'easy', 'How would you test a pen? (or any everyday object)',
    'Clarify requirements first (target user, environment). Then cover functional (writes, ink flow), usability (grip, weight), reliability (lifespan, drops), environmental (heat, cold, water), safety (toxicity), and negative tests (writing on unusual surfaces, upside down). The point is showing structured thinking.', ['classic']),
  op(MQ, 'medium', 'What is the testing pyramid and why does it matter to a manual tester?',
    'A strategy model: many fast unit tests at the base, fewer integration/API tests in the middle, few UI/E2E tests on top, with manual exploratory testing complementing the top. It matters because manual effort should focus where automation is weakest: exploratory, usability and new-feature testing.', ['strategy']),
  op(MQ, 'medium', 'How do you handle disagreement with a developer about whether something is a bug?',
    'Go back to the source of truth: requirements, acceptance criteria, design specs or established UX conventions. If the spec is silent, involve the PO to decide intended behavior. Keep it factual and about the product, not personal.', ['communication']),
  op(MQ, 'medium', 'A critical bug escaped to production. What is your post-mortem process?',
    'First support the hotfix with fast verification. Then root-cause: why was it missed (coverage gap, env difference, data, time pressure)? Add a regression test, adjust the test approach, and share learnings blamelessly with the team.', ['process', 'scenario']),
  op(MQ, 'medium', 'What test design techniques do you use and when?',
    'Equivalence partitioning and BVA for input ranges, decision tables for business rules, state transition for stateful flows, pairwise for configuration combinations, use-case/journey based for end-to-end, and error guessing/exploratory based on experience.', ['test-design']),
  op(MQ, 'easy', 'What is the difference between functional and non-functional testing?',
    'Functional verifies WHAT the system does (features, business rules, calculations). Non-functional verifies HOW WELL it does it: performance, security, usability, accessibility, compatibility, reliability.', ['fundamentals']),
  op(MQ, 'medium', 'How do you test an API without a UI as a manual tester?',
    'Use Postman or similar: validate status codes, response schema and values, headers, error responses for invalid input, auth (missing/expired tokens), boundary payloads, idempotency where applicable, and basic performance. Compare against the API contract/documentation.', ['api']),
  op(MQ, 'medium', 'How would you test a file upload feature?',
    'Valid types/sizes, exactly-at-limit and over-limit files, zero-byte files, wrong extensions and renamed extensions, special characters/long filenames, duplicates, concurrent uploads, canceling mid-upload, malware-like content handling, progress and error messaging, and what happens to storage on failures.', ['scenario']),
  op(MQ, 'medium', 'What is shift-left testing and how have you applied it?',
    'Moving QA earlier: reviewing requirements and designs, defining acceptance criteria during refinement, ambiguity reviews, API/contract tests before UI exists, and pairing with developers on testability. It prevents defects rather than just finding them.', ['shift-left']),
  op(MQ, 'medium', 'Describe how you would test a password reset flow.',
    'Request reset for existing/non-existing/unverified emails, token validity (expiry, single-use, tampering), link behavior on multiple requests, new password rules and reuse policy, session invalidation after reset, rate limiting, and the email content itself (link, sender, localization).', ['scenario', 'security']),
  op(MQ, 'hard', 'How do you estimate testing effort for a new feature?',
    'Break the feature into testable scenarios, weigh complexity and risk, account for test design, execution across environments, defect cycles (usually 30-40% extra), regression impact and test data setup. Use historical velocity from similar features and state assumptions explicitly.', ['estimation']),
  op(MQ, 'hard', 'The team wants to release but 20% of regression is not executed. What do you report?',
    'A risk-based summary: what was covered and passed, what remains (mapped to features and their business criticality), defects found and their severity, and a clear recommendation. The decision is shared, but my job is to make the risk visible and quantified.', ['reporting', 'scenario']),
  op(MQ, 'medium', 'What metrics would you include in a test summary report?',
    'Planned vs executed vs passed test cases, defects by severity/status, defect density per module, open risks and unexecuted scope, environment issues, and a go/no-go quality assessment. Trends matter more than raw counts.', ['reporting', 'metrics']),
  op(MQ, 'medium', 'How do you keep regression testing manageable as the product grows?',
    'Maintain a prioritized suite (critical/high/medium), prune obsolete cases regularly, map cases to features for impact analysis, push stable repetitive cases toward automation, and use risk-based selection per release instead of always running everything.', ['regression', 'strategy']),
  op(MQ, 'easy', 'What is a test charter in exploratory testing?',
    'A short mission statement for a time-boxed session, e.g. "Explore checkout with extreme quantities to discover calculation errors". It defines target, resources and what to look for, and results are captured in session notes.', ['exploratory']),
  op(MQ, 'medium', 'How would you test a search feature?',
    'Exact/partial/case-insensitive matches, no-results behavior, special characters and SQL/XSS strings, very long queries, empty query, relevance ordering, pagination, filters interaction, performance with large result sets, and indexing freshness (new content appearing in results).', ['scenario']),
  op(MQ, 'medium', 'What is the difference between test scenario and test case?',
    'A scenario is a high-level "what to test" (verify login works); a test case is the detailed "how": preconditions, specific steps, data and expected results. One scenario typically expands into multiple cases.', ['test-cases']),
  op(MQ, 'medium', 'How do you test for usability without a UX specialist?',
    'Heuristic checks: consistency, clear feedback, error prevention/recovery, sensible defaults, minimal steps for common tasks, readable labels, mobile ergonomics. Observe a colleague using the feature cold — confusion points are findings.', ['usability']),
  op(MQ, 'hard', 'How would you introduce a QA process in a startup that has none?',
    'Start lightweight: a defect workflow, smoke + critical-path regression checklist, acceptance criteria in stories, and risk-based testing on releases. Measure escapes to show value, then iterate toward automation and broader coverage. Avoid heavyweight documentation that the team will not maintain.', ['process', 'strategy']),
  op(MQ, 'medium', 'What is compatibility testing and how do you choose what to cover?',
    'Verifying behavior across browsers, OS versions, devices and resolutions. Choose matrix by real usage analytics (top browsers/devices of your users), business requirements and risk; test critical flows on the full matrix and the rest on a primary configuration.', ['compatibility']),
  op(MQ, 'medium', 'How do you test date and time handling?',
    'Time zones (user vs server), DST transitions, leap years, date formats per locale, boundaries (end of month/year), past/future validations, sorting and filtering by date, and displayed vs stored values (UTC in storage, local in display).', ['test-design', 'dates']),
  op(MQ, 'medium', 'Describe negative testing for a numeric quantity field (1-99).',
    'Try 0, 100, negatives, decimals, letters, special characters, spaces, empty value, copy-paste of huge numbers, scientific notation (1e5), leading zeros, and unicode digits. Verify validation messages, no crashes and no bad data persisted.', ['negative-testing', 'bva']),
  op(MQ, 'easy', 'Why do you want to work in QA? / What makes a good QA engineer?',
    'Genuine interest in how things break, user empathy, curiosity and skepticism, attention to detail, strong communication for defect advocacy, and a constructive team mindset — quality as everyone’s goal, with QA as its specialist advocate.', ['behavioral']),
  op(MQ, 'medium', 'What is risk-based testing and how do you assess risk?',
    'Prioritizing test effort by probability of failure (complexity, change frequency, defect history, new technology) times business impact (revenue, safety, data, reputation). High-risk areas get the deepest and earliest testing.', ['risk-based']),
  op(MQ, 'medium', 'How would you test a notifications feature (email/push)?',
    'Trigger conditions, content correctness and localization, links deep-linking properly, opt-in/opt-out preferences respected, frequency capping/digests, delivery on device states (offline, app killed), unsubscribes, and no duplicate or ghost notifications.', ['scenario']),
  op(MQ, 'hard', 'A regression cycle keeps finding almost no bugs. Is that good or bad? What do you do?',
    'Could be genuine stability, or the pesticide paradox: the suite no longer matches risk. I would check production escapes, review/refresh cases against recent changes, add exploratory sessions, and rebalance effort toward new and changed areas.', ['regression', 'metrics']),
  op(MQ, 'medium', 'What is end-to-end testing? Give an example.',
    'Validating a complete business flow across all integrated systems, e.g. placing an order: catalog → cart → payment gateway → inventory update → confirmation email → order visible in admin. It verifies the integrated whole, not isolated parts.', ['e2e']),
  op(MQ, 'medium', 'How do you organize your test cases and documentation?',
    'A test management tool (TestRail, Zephyr, Xray) or structured sheets: suites by feature, tagged by priority and type, linked to requirements and defects, versioned with the product. Reusable preconditions and shared steps reduce duplication.', ['documentation']),
  op(MQ, 'medium', 'How would you test offline behavior of a mobile app?',
    'Use airplane mode at key moments (mid-transaction, mid-upload), verify cached content, queued actions syncing on reconnect, clear messaging, no data loss/duplication after sync conflicts, and transitions between wifi/cellular/captive portals.', ['mobile', 'scenario']),
  op(MQ, 'easy', 'What is a defect triage meeting?',
    'A regular session where QA, dev and product review new defects to agree severity/priority, assign owners, and decide fix-now vs backlog vs will-not-fix, keeping the defect backlog actionable.', ['process']),
  op(MQ, 'hard', 'Tell me about the best bug you ever found.',
    'Strong answers describe a non-obvious defect found through systematic thinking (data combination, timing, environment), its business impact, and how the discovery improved tests or process afterward. The structure: context → hunch/technique → bug → impact → lesson.', ['behavioral']),
  op(MQ, 'medium', 'How do you verify a fix without the original tester being available?',
    'Reproduce the defect from the report on the old build if possible, then confirm the exact steps pass on the fixed build, and run targeted regression around the change. Good reports make ownership transferable — which is why repro steps matter.', ['retesting']),
  op(MQ, 'medium', 'What would you test in a CSV/Excel data import feature?',
    'Template compliance, required vs optional columns, wrong types per column, duplicates handling, huge files, empty file, special characters/encodings (UTF-8, accents), partial-failure behavior (row-level errors reported), transactional integrity, and a clear import summary.', ['scenario', 'data']),
  op(MQ, 'medium', 'Explain boundary value analysis to a junior tester with an example.',
    'Bugs love edges. For an 18-65 age field, test 17, 18, 65 and 66 (plus a middle value): one below min, min, max, one above max. Most off-by-one validation mistakes are caught exactly there.', ['mentoring', 'bva']),
  op(MQ, 'hard', 'Production has a bug only for one specific customer. How do you investigate?',
    'Compare what is unique: their data shape/volume, configuration, permissions/roles, locale/timezone, integrations, account age. Reproduce with a copy of their configuration in staging, check logs scoped to their requests, and isolate variables one at a time.', ['debugging', 'scenario']),

  // ════════════════════════════════════════════════════════════════════
  // AUTOMATION QA INTERVIEW — multiple choice (40)
  // ════════════════════════════════════════════════════════════════════
  m(AQ, 'easy', 'Which locator strategy is generally the MOST stable for automated UI tests?',
    ['Absolute XPath copied from devtools', 'Dedicated test attributes like data-testid', 'Text content of the element', 'Index-based CSS like div:nth-child(7)'], 'B',
    'Dedicated test ids are immune to styling/structure refactors; absolute XPath and positional selectors break with any layout change.', ['locators']),
  m(AQ, 'easy', 'What is the main problem with using Thread.sleep / fixed waits in tests?',
    ['They are not supported by CI', 'They make tests slow when conditions are fast and flaky when conditions are slow', 'They require admin permissions', 'They only work in Chrome'], 'B',
    'Fixed waits always wait the full time and still fail when the app is slower than expected — explicit/conditional waits solve both issues.', ['waits', 'flakiness']),
  m(AQ, 'easy', 'In the Page Object Model, assertions ideally live in:',
    ['The page object methods', 'The test layer, while page objects expose state and actions', 'A global utilities file', 'The WebDriver configuration'], 'B',
    'POM separates concerns: pages encapsulate locators/actions; tests decide and assert. This keeps pages reusable across different verifications.', ['pom', 'design']),
  m(AQ, 'easy', 'Which test pyramid layer should contain the MOST tests?',
    ['UI end-to-end', 'Manual exploratory', 'Unit', 'Integration'], 'C',
    'Unit tests are fastest and cheapest; the pyramid pushes volume down and keeps slow brittle E2E tests minimal.', ['pyramid', 'strategy']),
  m(AQ, 'easy', 'A flaky test is one that:',
    ['Always fails', 'Passes and fails intermittently without code changes', 'Takes more than a minute', 'Is not yet automated'], 'B',
    'Flaky = non-deterministic results. Common causes: timing/waits, test interdependence, shared environments, race conditions.', ['flakiness']),
  m(AQ, 'medium', 'Your test clicks a button that re-renders, and intermittently throws StaleElementReferenceException (Selenium). The standard fix is:',
    ['Increase implicit wait to 60 seconds', 'Re-locate the element after the DOM change instead of reusing the old reference', 'Use JavaScript clicks everywhere', 'Catch and ignore the exception'], 'B',
    'A stale reference points to a removed DOM node; fetching the element again (or waiting for the re-render to finish) is the correct pattern.', ['selenium', 'stale-element']),
  m(AQ, 'medium', 'Which statement about Playwright auto-waiting is TRUE?',
    ['It eliminates the need for any synchronization thinking', 'Actions wait for elements to be visible, stable and enabled before acting', 'It only applies to page.goto', 'It requires explicit configuration per element'], 'B',
    'Playwright actionability checks wait automatically before clicks/fills, removing most manual waits — though app-level states may still need explicit expectations.', ['playwright', 'waits']),
  m(AQ, 'medium', 'The MAIN advantage of API tests over UI tests for business logic is:',
    ['They are prettier in reports', 'They run faster and are far more stable while covering the same logic', 'They require no maintenance ever', 'They replace security testing'], 'B',
    'Skipping browser rendering removes the slowest, most fragile layer — logic gets validated at high speed with fewer false alarms.', ['api', 'strategy']),
  m(AQ, 'easy', 'In Gherkin/BDD, the Given step is used to:',
    ['Perform the action under test', 'Set up the initial context or state', 'Verify the outcome', 'Tag the scenario'], 'B',
    'Given = context/preconditions, When = action, Then = expected outcome.', ['bdd', 'cucumber']),
  m(AQ, 'medium', 'Which TestNG/JUnit concept lets you run the same test with multiple input sets?',
    ['Test listeners', 'Parameterized / data-driven tests (e.g. @DataProvider, @ParameterizedTest)', 'Test ordering', 'Assertions'], 'B',
    'Data providers/parameterized runners feed multiple datasets through one test method — the core of data-driven testing.', ['testng', 'junit', 'data-driven']),
  m(AQ, 'medium', 'Tests pass locally but fail in CI with element not interactable. The MOST common root cause is:',
    ['CI has no internet', 'Different viewport/headless rendering or timing in the CI environment', 'The CI license expired', 'JUnit is incompatible with Linux'], 'B',
    'Headless browsers and CI machines differ in viewport, speed and fonts — elements may be off-screen, overlapped or slower to appear.', ['ci', 'debugging']),
  m(AQ, 'medium', 'What is the purpose of mocking/stubbing external services in automated tests?',
    ['To increase coverage numbers', 'To isolate the system under test, control responses and avoid flaky external dependencies', 'To bypass authentication in production', 'To make tests slower but safer'], 'B',
    'Mocks make tests deterministic and fast, and let you simulate hard-to-trigger cases (timeouts, 500s, malformed payloads).', ['mocking']),
  m(AQ, 'medium', 'Which Selenium wait expects a custom condition like "element contains text X"?',
    ['Implicit wait', 'Explicit wait (WebDriverWait + ExpectedConditions)', 'Thread.sleep', 'PageLoadTimeout'], 'B',
    'Explicit waits poll a condition until true or timeout; implicit waits only cover element lookup, not arbitrary conditions.', ['selenium', 'waits']),
  m(AQ, 'hard', 'Mixing implicit and explicit waits in Selenium is discouraged because:',
    ['It causes a compile error', 'Interaction between the two can produce unpredictable, additive wait times', 'Implicit waits are deprecated since Selenium 2', 'Explicit waits stop working in headless mode'], 'B',
    'The combination yields unpredictable timeout math (documented by Selenium); the recommendation is explicit waits only.', ['selenium', 'waits']),
  m(AQ, 'medium', 'The Page Factory pattern in Selenium is:',
    ['A cloud service for page objects', 'An annotation-based way (@FindBy) to initialize page object elements', 'A test data generator', 'A reporting library'], 'B',
    '@FindBy + PageFactory.initElements provides lazy element initialization for page objects (though plain By locators are equally valid).', ['selenium', 'pom']),
  m(AQ, 'medium', 'What does test idempotency mean and why does it matter for suites?',
    ['Tests must run in a fixed order', 'A test can run repeatedly with the same result because it creates/cleans its own state', 'Tests must not use assertions twice', 'Tests should share data to be faster'], 'B',
    'Idempotent, independent tests enable parallelism, retries and ordering freedom — interdependent tests cause cascade failures.', ['design', 'best-practices']),
  m(AQ, 'medium', 'For handling a native OS file-picker dialog during upload in Selenium, the standard approach is:',
    ['driver.switchTo().alert()', 'Sending the file path directly to the <input type=file> element with sendKeys', 'Clicking with JavaScript', 'Using Selenium Grid'], 'B',
    'Selenium cannot drive native dialogs; setting the input element value via sendKeys bypasses the picker entirely.', ['selenium', 'file-upload']),
  m(AQ, 'medium', 'Which is TRUE about CSS selectors vs XPath?',
    ['XPath can traverse up to parent elements; CSS cannot', 'CSS is deprecated in modern browsers', 'XPath is always faster than CSS', 'CSS selectors cannot match attributes'], 'A',
    'XPath supports axes like parent/ancestor and text() matching; CSS is typically more readable and at least as fast, but only traverses downward.', ['locators']),
  m(AQ, 'medium', 'A test suite of 400 UI tests takes 3 hours. The FIRST optimization to evaluate is:',
    ['Buying faster laptops', 'Parallel execution across workers/machines plus moving suitable checks to API level', 'Deleting half the tests randomly', 'Running tests only on Fridays'], 'B',
    'Parallelization (Grid, Playwright workers, CI shards) plus pushing logic checks down the pyramid gives the biggest wins.', ['performance', 'strategy']),
  m(AQ, 'easy', 'What does headless browser execution mean?',
    ['Running tests without assertions', 'Running a real browser engine without a visible UI window', 'Running tests without a driver', 'Simulating the browser with regex'], 'B',
    'Headless mode runs the actual engine (Chromium/Firefox/WebKit) without rendering a window — faster and CI-friendly.', ['headless', 'ci']),
  m(AQ, 'medium', 'In Postman, the pm.test() function is used to:',
    ['Send the request', 'Define assertions executed after the response arrives', 'Configure environments', 'Mock the server'], 'B',
    'pm.test registers named assertions (with pm.expect) in the Tests tab, producing pass/fail results per request.', ['postman', 'api']),
  m(AQ, 'medium', 'Newman is:',
    ['A Postman cloud feature', 'The CLI runner that executes Postman collections, e.g. in CI pipelines', 'A mock server', 'A load testing tool'], 'B',
    'Newman runs collections from the command line with environments and reporters — the standard way to put Postman tests in CI.', ['postman', 'newman', 'ci']),
  m(AQ, 'hard', 'Contract testing (e.g. Pact) primarily verifies that:',
    ['The UI matches the design system', 'Consumer and provider agree on the API request/response shape without full integration environments', 'The database schema is normalized', 'Code style rules are followed'], 'B',
    'Contract tests catch breaking API changes between services early, replacing many slow end-to-end integration tests.', ['contract-testing', 'api']),
  m(AQ, 'medium', 'What is the purpose of a test fixture/setup-teardown lifecycle?',
    ['Decorating reports', 'Preparing a known state before tests and cleaning it afterward for isolation', 'Measuring coverage', 'Ordering test execution alphabetically'], 'B',
    'Fixtures (beforeEach/afterEach, @BeforeMethod, etc.) guarantee each test starts from a controlled, repeatable state.', ['design']),
  m(AQ, 'medium', 'Which approach to test data is MOST robust for parallel CI runs?',
    ['A shared static user account for all tests', 'Each test creates (or is allocated) unique isolated data, cleaned up afterward', 'Reusing production data directly', 'Hardcoding ids found manually in staging'], 'B',
    'Shared mutable data causes collisions in parallel runs; per-test unique data (factories, APIs, seeds) keeps tests independent.', ['test-data', 'parallel']),
  m(AQ, 'hard', 'Your automation reports 12 failures; 10 are timeouts in one environment that later pass on retry. Best long-term action:',
    ['Add global automatic retries and ignore', 'Investigate the systemic cause (environment performance, waits, data) and fix it; use retries only as a temporary quarantine signal', 'Delete the 10 tests', 'Triple all timeouts'], 'B',
    'Retries mask rot. A healthy suite treats flakiness as a defect: diagnose root cause, quarantine flaky tests visibly, fix and restore trust.', ['flakiness', 'strategy']),
  m(AQ, 'medium', 'The JavaScriptExecutor in Selenium should be used:',
    ['As the default way to click everything', 'Sparingly, for things WebDriver cannot do natively (e.g. scroll tweaks), since it bypasses real user interaction', 'To replace assertions', 'Only in Firefox'], 'B',
    'JS execution skips actionability checks that real users face — overuse hides real usability/overlay bugs.', ['selenium', 'best-practices']),
  m(AQ, 'medium', 'What problem does Selenium Grid / cloud providers (BrowserStack, Sauce Labs) solve?',
    ['Writing tests automatically', 'Distributed, parallel cross-browser/cross-OS execution without maintaining local machines', 'Recording user sessions in production', 'Replacing CI servers'], 'B',
    'Grid routes sessions to many browser/OS nodes for parallel cross-browser coverage at scale.', ['grid', 'cross-browser']),
  m(AQ, 'easy', 'Which assertion is the BEST practice?',
    ['assert(true) to keep tests green', 'One focused, meaningful assertion of the behavior under test (with soft assertions when grouping related checks)', 'No assertions; rely on absence of exceptions', 'Assert every element on the page in every test'], 'B',
    'Tests should fail for one clear reason. Over-asserting makes failures noisy; under-asserting makes tests useless.', ['assertions', 'best-practices']),
  m(AQ, 'medium', 'In CI, when should the full automated regression run?',
    ['Only manually before quarterly releases', 'Smoke on every commit/PR; broader regression on merge/nightly schedules', 'Once a year', 'Only on developer laptops'], 'B',
    'Layered pipelines balance feedback speed and coverage: fast suites gate PRs, full suites run on merges/nightly.', ['ci', 'strategy']),
  m(AQ, 'medium', 'What does the Arrange-Act-Assert (AAA) pattern promote?',
    ['Three assertions per test', 'A clear test structure: set up state, perform one action, verify the outcome', 'Alphabetical test naming', 'Triple execution for flake detection'], 'B',
    'AAA (or Given/When/Then) keeps tests readable and focused on a single behavior.', ['design']),
  m(AQ, 'hard', 'Which scenario is the WEAKEST candidate for UI automation?',
    ['Login smoke test executed on every build', 'A one-off visual layout review of a marketing page that changes weekly', 'Checkout regression flow', 'Form validation rules used across releases'], 'B',
    'Automation ROI needs repetition and stability; volatile one-off checks are cheaper as manual/visual reviews.', ['strategy', 'roi']),
  m(AQ, 'medium', 'Shadow DOM elements are challenging because:',
    ['They are invisible to users', 'Standard global selectors do not pierce shadow roots; you must query through the shadow root (or use tools that support it)', 'They only exist in Internet Explorer', 'They block JavaScript'], 'B',
    'Encapsulated shadow trees require shadowRoot traversal (Selenium getShadowRoot, Playwright pierces automatically).', ['shadow-dom', 'locators']),
  m(AQ, 'medium', 'To automate verifying an email-sending feature, the BEST approach is:',
    ['Check your personal Gmail manually', 'Use a test inbox service/API (MailHog, Mailosaur) or intercept at the SMTP/API layer and assert content programmatically', 'Trust the 200 response from the send endpoint', 'Disable emails in test environments'], 'B',
    'Asserting on a controllable inbox/interceptor validates delivery, content and links deterministically.', ['integration', 'email']),
  m(AQ, 'medium', 'What is visual regression testing?',
    ['Re-running old tests', 'Comparing screenshots against approved baselines to catch unintended UI changes', 'Testing without looking at the screen', 'Measuring page load times'], 'B',
    'Tools like Percy/Applitools/pixel-diff compare rendered UI to baselines, catching CSS/layout regressions functional tests miss.', ['visual-testing']),
  m(AQ, 'hard', 'A senior reviews your framework and asks: why wrap WebDriver calls in your own driver layer? The strongest justification is:',
    ['It is fashionable', 'Centralized control: logging, waits, retries and a single place to adapt when the underlying tool changes', 'It doubles execution speed', 'It removes the need for page objects'], 'B',
    'A thin abstraction isolates the framework from tool APIs and centralizes cross-cutting behavior — at the cost of added complexity, so keep it lean.', ['framework', 'design']),
  m(AQ, 'medium', 'Which Git practice fits test automation code?',
    ['Commit directly to main without review', 'Same standards as production code: feature branches, code review, CI checks on the test code itself', 'Keep tests in a zip file on a shared drive', 'One commit per month'], 'B',
    'Test code is code: review, versioning and CI (linting, smoke of the framework) keep the suite maintainable.', ['git', 'best-practices']),
  m(AQ, 'easy', 'What is cross-browser testing intended to catch?',
    ['Server-side logic bugs', 'Rendering/behavior differences between browser engines', 'Database deadlocks', 'Compilation errors'], 'B',
    'Engines (Chromium, Gecko, WebKit) differ in rendering and API behavior — critical flows should run on all supported engines.', ['cross-browser']),
  m(AQ, 'medium', 'In Playwright, the recommended way to assert that a element eventually shows text is:',
    ['expect(await el.textContent()).toBe(text) immediately', 'await expect(locator).toHaveText(text) — a web-first auto-retrying assertion', 'while loop with sleep(1000)', 'Screenshot comparison'], 'B',
    'Web-first assertions retry until the condition is met or timeout, eliminating manual polling.', ['playwright', 'assertions']),
  m(AQ, 'hard', 'You must automate a legacy app with no test ids and dynamic ids like ctl00_grid_123. Best locator strategy:',
    ['Absolute XPath from browser devtools', 'Anchor on stable semantics: labels, roles, text, attribute patterns (starts-with/contains), and request test ids for new code', 'Random retry of all selectors', 'Pixel coordinates'], 'B',
    'Semantic and partial-match locators survive dynamic ids; pushing the team to add test hooks is the durable fix.', ['locators', 'legacy']),

  // ════════════════════════════════════════════════════════════════════
  // AUTOMATION QA INTERVIEW — true/false (15)
  // ════════════════════════════════════════════════════════════════════
  tf(AQ, 'easy', 'The goal of automation is to replace all manual testing.',
    false, 'Automation handles repetitive regression; exploratory, usability and new-feature testing remain human strengths. The goals are speed and coverage, not replacement.', ['strategy']),
  tf(AQ, 'easy', 'A good automated test should be able to run independently of any other test.',
    true, 'Independence enables parallelism, retries and reliable failure isolation — shared state between tests is a top flakiness cause.', ['best-practices']),
  tf(AQ, 'medium', 'Playwright supports Chromium, Firefox and WebKit with the same API.',
    true, 'One API drives all three engines, including mobile emulation — a key differentiator versus Selenium-era setups.', ['playwright']),
  tf(AQ, 'medium', 'In Selenium, implicit waits apply to every findElement call for the session once set.',
    true, 'The implicit wait is a session-wide polling timeout for element location (and is why mixing it with explicit waits is discouraged).', ['selenium', 'waits']),
  tf(AQ, 'easy', 'UI test automation is the cheapest type of automated test to maintain.',
    false, 'UI tests are the most expensive layer: brittle selectors, timing issues and slow runs. Unit and API tests are cheaper.', ['pyramid']),
  tf(AQ, 'medium', 'Recording-and-playback tools alone produce maintainable enterprise test suites.',
    false, 'Recorders generate brittle, duplicated locators and no abstractions; they are useful for prototyping, not long-term maintenance.', ['tools']),
  tf(AQ, 'medium', 'API tests can validate business logic before the UI even exists.',
    true, 'Testing the service layer enables shift-left: logic is validated as soon as endpoints exist, independent of frontend progress.', ['api', 'shift-left']),
  tf(AQ, 'medium', 'A test that needs to be retried to pass should be considered passing and healthy.',
    false, 'Pass-on-retry is a flakiness signal; healthy suites track and fix these, otherwise trust in red builds erodes.', ['flakiness']),
  tf(AQ, 'easy', 'Test automation code should go through code review like production code.',
    true, 'Reviews catch brittle locators, missing waits and design issues — the suite is a long-lived codebase.', ['best-practices']),
  tf(AQ, 'medium', 'Hardcoding environment URLs and credentials inside test code is acceptable for speed.',
    false, 'Configuration belongs in env files/variables/secret stores: hardcoding breaks portability and leaks secrets in repos.', ['config', 'security']),
  tf(AQ, 'medium', 'Soft assertions allow a test to continue after a failed check and report all failures at the end.',
    true, 'Soft assertions (e.g. TestNG SoftAssert, expect.soft in Playwright) group related verifications without stopping at the first failure.', ['assertions']),
  tf(AQ, 'hard', 'Running UI tests against production is the recommended default strategy.',
    false, 'Production runs risk real data/side effects and noisy monitoring; default is isolated test environments, with only safe synthetic checks in prod.', ['strategy', 'environments']),
  tf(AQ, 'medium', 'BDD frameworks like Cucumber guarantee good collaboration by themselves.',
    false, 'Gherkin is only valuable if business, dev and QA actually write/discuss scenarios together; otherwise it adds a translation layer with no benefit.', ['bdd']),
  tf(AQ, 'medium', 'Parallel test execution can expose race conditions and data conflicts that sequential runs hide.',
    true, 'Parallelism stresses shared state and backend concurrency — failures there are valuable signals, not just test noise.', ['parallel']),
  tf(AQ, 'easy', 'Docker can be used to run browsers and test environments reproducibly in CI.',
    true, 'Containers pin browser/driver/dependency versions, eliminating works-on-my-machine drift across CI agents.', ['docker', 'ci']),

  // ════════════════════════════════════════════════════════════════════
  // AUTOMATION QA INTERVIEW — open interview questions (45)
  // ════════════════════════════════════════════════════════════════════
  op(AQ, 'easy', 'How do you decide what to automate and what to keep manual?',
    'Automate repetitive, stable, high-value flows: regression, smoke, data-driven validations, cross-browser checks. Keep manual: exploratory, usability, one-off checks, and highly volatile UIs. Consider ROI: frequency of execution times cost of manual run versus automation build/maintenance cost.', ['strategy', 'roi']),
  op(AQ, 'easy', 'Explain the Page Object Model and its benefits.',
    'Each page/component gets a class encapsulating its locators and user actions; tests call those methods instead of touching selectors. Benefits: one place to update when UI changes, readable tests, reuse across suites. Assertions stay in the test layer.', ['pom']),
  op(AQ, 'easy', 'What types of waits exist and which do you prefer?',
    'Fixed sleeps (avoid), implicit waits (global element lookup timeout), explicit/conditional waits (wait for a specific condition) and framework auto-waiting (Playwright/Cypress). Prefer explicit conditions or auto-waiting — they synchronize with real app state.', ['waits']),
  op(AQ, 'medium', 'How do you handle flaky tests in your suite?',
    'Detect via pass-on-retry tracking, quarantine them out of the gating pipeline, diagnose root causes (waits, data isolation, environment, race conditions), fix and return them. Never normalize retries as a permanent solution; flakiness is treated like a defect.', ['flakiness']),
  op(AQ, 'medium', 'Describe the automation framework you would build from scratch for a web app.',
    'Language aligned with the team (TS/Java/Python), Playwright or Selenium, page objects + composable components, fixtures for auth/data setup, env config via files/variables, parallel execution, CI integration with smoke-on-PR and nightly regression, HTML reports with traces/screenshots on failure, and API helpers for fast state setup.', ['framework', 'design']),
  op(AQ, 'medium', 'How do you run your tests in CI/CD? Describe the pipeline.',
    'On PR: lint + unit + API smoke + critical UI smoke in headless parallel workers (fast gate, ~10 min). On merge to main: broader regression. Nightly: full matrix incl. cross-browser. Failures publish reports with traces/videos; flaky quarantine is separated so the signal stays trustworthy.', ['ci']),
  op(AQ, 'medium', 'How do you manage test data for automated suites?',
    'Prefer per-test data created via API/DB seeding for isolation, factories with unique values, cleanup in teardown or disposable environments, and a small set of stable reference data. Avoid shared mutable accounts — they break parallel runs.', ['test-data']),
  op(AQ, 'medium', 'Selenium vs Playwright/Cypress — how do you choose?',
    'Selenium: widest browser/language support, Grid ecosystem, legacy compatibility. Playwright: modern API, auto-waiting, parallelism, traces, all engines incl. WebKit. Cypress: great DX but same-origin and browser limits. Choose by team skills, app architecture, browser matrix and existing investment.', ['tools', 'comparison']),
  op(AQ, 'medium', 'How would you automate API testing and what would you cover?',
    'A suite using REST-assured/Postman+Newman/supertest covering: status codes, response schema (JSON Schema validation), business rules, error cases (400/401/403/404/409), boundary payloads, auth flows, idempotency, and contract checks against the OpenAPI spec — all running in CI before UI suites.', ['api']),
  op(AQ, 'easy', 'What makes a good automated test?',
    'Independent, deterministic, fast, focused on one behavior, readable (AAA structure, descriptive name), resilient locators, no hardcoded waits, meaningful assertion messages and reliable cleanup. A failing test should point directly to the problem.', ['best-practices']),
  op(AQ, 'medium', 'How do you handle authentication in UI test suites efficiently?',
    'Log in once via API or UI, persist session state (cookies/storage, e.g. Playwright storageState), and inject it per test instead of logging in through the UI every time. Keep one explicit UI login test for the flow itself; everything else reuses the session.', ['auth', 'performance']),
  op(AQ, 'medium', 'Your suite takes 90 minutes and the team ignores it. How do you fix this?',
    'Split into layers: a 5-10 minute PR gate (smoke + critical paths) and a nightly full run. Parallelize workers/shards, move logic checks to API level, delete redundant tests, fix flaky ones first to restore trust, and surface results in the PR itself.', ['strategy', 'performance']),
  op(AQ, 'medium', 'How do you test file downloads in automation?',
    'Configure the browser to download without dialogs into a known directory (or intercept the response), wait for the file, then assert existence, name pattern, size/content (parse CSV/PDF where needed) and clean up. In Playwright use the download event API.', ['scenario']),
  op(AQ, 'medium', 'How do you deal with iframes in Selenium/Playwright?',
    'Selenium: switchTo().frame() by index/name/element, then back with defaultContent(). Playwright: frameLocator() pierces into the frame declaratively. The key is realizing the element lives in another document context before debugging "element not found".', ['iframes']),
  op(AQ, 'medium', 'Explain data-driven testing with a concrete example.',
    'One test logic, many datasets: e.g. a login test fed by a table of (email, password, expectedError) covering invalid format, wrong password, locked account, empty fields. Implemented with @DataProvider/@ParameterizedTest/test.each, keeping cases declarative and additions cheap.', ['data-driven']),
  op(AQ, 'medium', 'How would you automate testing of a REST endpoint that sends emails?',
    'Assert the API response, then verify the side effect through a controllable channel: a test SMTP server (MailHog), inbox API (Mailosaur) or message queue inspection. Assert recipient, subject, body content and links. Never depend on real mailboxes.', ['api', 'integration']),
  op(AQ, 'hard', 'How do you measure the value/ROI of your automation?',
    'Track: manual hours saved per cycle, defects caught pre-merge by suites, escape rate trend, pipeline feedback time, suite stability (flake rate), and coverage of critical user journeys. ROI = (manual cost avoided + earlier-defect savings) versus build+maintenance cost.', ['metrics', 'roi']),
  op(AQ, 'medium', 'What is the difference between smoke, regression and sanity suites in automation terms?',
    'Smoke: minutes-long critical-path gate on every build. Sanity: targeted checks around a specific change. Regression: the broad suite guarding existing behavior, run on merges/nightly. Each maps to a different pipeline trigger and time budget.', ['strategy']),
  op(AQ, 'medium', 'How do you debug a test that fails only in CI?',
    'Pull artifacts: screenshots, videos, traces, console/network logs. Reproduce CI conditions locally: headless mode, same viewport, same browser version, throttled resources, clean profile. Common culprits: viewport-dependent rendering, timing, missing env vars, data left by parallel tests.', ['debugging', 'ci']),
  op(AQ, 'medium', 'Describe how you would automate a multi-step form wizard.',
    'Page object or component per step, a flow helper that composes steps with valid defaults, data-driven variations per step (validation errors, back navigation preserving state, refresh persistence), API shortcuts to jump to later steps when testing them in isolation.', ['scenario', 'design']),
  op(AQ, 'easy', 'What is an assertion and what is the difference between hard and soft assertions?',
    'An assertion compares actual vs expected and fails the test on mismatch. Hard assertions stop the test immediately; soft assertions collect failures and report at the end — useful for verifying several related fields of one result.', ['assertions']),
  op(AQ, 'medium', 'How do you keep locators maintainable in a fast-changing UI?',
    'Push for data-testid attributes as part of the definition of done, centralize locators in page objects/components, prefer role/label-based selectors (accessible names), avoid structure-dependent XPath/CSS, and fix locator debt immediately when UI changes.', ['locators']),
  op(AQ, 'medium', 'What is your approach to cross-browser automation coverage?',
    'Analytics-driven: full critical-path suite on the dominant engine each PR, the same suite nightly on all supported engines (Chromium, Firefox, WebKit) plus key mobile viewports, and a slim smoke on long-tail browsers via cloud providers if business requires.', ['cross-browser']),
  op(AQ, 'hard', 'You inherit a 1000-test suite with 30% flakiness. Outline your first month.',
    'Week 1: instrument — collect pass/fail/retry stats per test, classify failure types. Week 2: quarantine flaky tests from gating; stabilize top critical-path tests. Weeks 3-4: fix systemic causes (waits, data isolation, env), delete dead/duplicate tests, restore a small trusted gate, then expand incrementally. Report trust metrics weekly.', ['strategy', 'flakiness']),
  op(AQ, 'medium', 'How do you test responsive design with automation?',
    'Parametrize viewports (mobile/tablet/desktop) over key pages and assert layout-affecting behavior: menu collapsing to hamburger, element visibility, no horizontal scroll; complement with visual regression screenshots per breakpoint.', ['responsive', 'visual-testing']),
  op(AQ, 'medium', 'Explain how you would do database validation in automated tests.',
    'After API/UI actions, query the DB (read-only test user) to assert persisted state: correct rows, statuses, timestamps, no orphans. Use it sparingly — prefer asserting through public APIs — but it is invaluable for async pipelines and data integrity checks.', ['database']),
  op(AQ, 'medium', 'What are fixtures in Playwright (or setup hooks in other frameworks) and how do you use them?',
    'Reusable, composable setup/teardown units injected into tests: authenticated context, seeded data, page objects. They centralize boilerplate, guarantee cleanup and make tests declare exactly what they need.', ['playwright', 'design']),
  op(AQ, 'medium', 'How do you handle environment configuration in a framework?',
    'A config layer reading env name → base URLs, credentials references, feature flags, timeouts from env vars/files (dotenv) with secrets in a vault/CI secrets, never in the repo. Tests stay environment-agnostic; switching env is one variable.', ['config']),
  op(AQ, 'medium', 'How would you automate verifying analytics/tracking events?',
    'Intercept network requests (Playwright route/network listeners, proxy) and assert the tracking calls fire with correct event names and payloads on user actions — no need to query the analytics backend.', ['network', 'scenario']),
  op(AQ, 'hard', 'When would you NOT use BDD/Cucumber, despite stakeholder interest?',
    'When business will not participate in writing/reviewing scenarios, the team is purely technical, or scenarios would duplicate developer tests. Then Gherkin adds parsing overhead and maintenance without collaboration value — plain readable tests serve better. Honest trade-off discussions beat tool fashion.', ['bdd', 'strategy']),
  op(AQ, 'medium', 'How do you organize reporting so failures are actionable?',
    'Reports with: failure grouped by suite/feature, screenshots + video + trace per failure, the failed assertion message and step, environment metadata, history/trends, and flaky markers. Integrated in CI and visible in PRs; a red build must answer "what broke and where" in one click.', ['reporting']),
  op(AQ, 'medium', 'What is mocking at the network layer in UI tests and when do you use it?',
    'Intercepting browser requests and returning controlled responses (Playwright page.route). Use it to test UI states that are hard to trigger: server errors, empty lists, slow responses, feature flags — while keeping a separate E2E layer with real backends.', ['mocking', 'network']),
  op(AQ, 'easy', 'What is continuous testing?',
    'Embedding automated quality checks throughout the delivery pipeline — every commit triggers progressively deeper suites (unit → API → UI smoke → regression) so quality feedback is continuous rather than a phase at the end.', ['ci', 'strategy']),
  op(AQ, 'medium', 'Describe handling of browser alerts, popups and new tabs in automation.',
    'Native alerts: Selenium switchTo().alert() accept/dismiss; Playwright dialog event handlers. New tabs/windows: handle via window handles (Selenium) or context.waitForEvent("page") (Playwright), then operate on the new page object and close it cleanly.', ['selenium', 'playwright']),
  op(AQ, 'medium', 'How do you version and release your test framework shared across teams?',
    'Package it (npm/maven) with semantic versioning, changelog and deprecation policy; teams pin versions and upgrade deliberately. CI runs the framework’s own unit tests plus a canary suite before publishing.', ['framework', 'design']),
  op(AQ, 'medium', 'What is the role of static code analysis and linting in test code?',
    'Linters/formatters (ESLint, Checkstyle) plus custom rules (no sleeps, no hardcoded urls, naming) keep the suite consistent and catch error-prone patterns at PR time — cheap quality control for the test codebase itself.', ['best-practices']),
  op(AQ, 'hard', 'Your company wants 100% automation coverage as a goal. How do you respond?',
    'Reframe: coverage of WHAT? 100% of code lines or cases is neither feasible nor valuable — maintenance cost explodes and exploratory value is lost. Propose risk-based targets: 100% of critical user journeys automated, defined API coverage, and explicit manual/exploratory scope, measured by escape rate rather than raw counts.', ['strategy', 'metrics']),
  op(AQ, 'medium', 'How do you test asynchronous flows (e.g. an order that is processed by a queue)?',
    'Trigger the action, then poll an observable outcome (API status, DB row, webhook receiver) with a timeout and backoff instead of fixed sleeps. For long pipelines, hook into intermediate signals (queue depth, events) and use test doubles where full async infra is overkill.', ['async', 'design']),
  op(AQ, 'medium', 'What is an API contract and how do schema validations help in tests?',
    'The contract defines endpoints, payload shapes, types and errors (OpenAPI/Swagger). Validating responses against JSON Schema in tests catches breaking changes (renamed/removed fields, type changes) automatically even when example-based assertions still pass.', ['api', 'contract-testing']),
  op(AQ, 'medium', 'How do you onboard manual testers into automation?',
    'Pairing on real tasks, starting with readable layers (adding data cases, simple page-object tests), code review as teaching, a learning path (language basics → framework → patterns), and celebrating first merged tests. Structure beats throwing tools at people.', ['mentoring']),
  op(AQ, 'medium', 'How would you automate accessibility checks?',
    'Integrate axe-core (or Playwright/axe plugins) to scan key pages for WCAG violations in CI, plus targeted assertions (focus order, aria labels, keyboard-only flows). Automated scans catch ~30-40% of issues; pair with manual audits for the rest.', ['accessibility']),
  op(AQ, 'hard', 'Describe a time automation caught a critical bug before release. What made it possible?',
    'Strong answers cite a specific regression (e.g. a price calculation broken by a refactor) caught by a data-driven API/UI suite in CI minutes after the commit. Enablers: tests tied to business rules, fast pipelines, trustworthy green/red signal — the lesson is investment in the right layer.', ['behavioral']),
  op(AQ, 'medium', 'What are test doubles? Differentiate mock, stub, fake and spy.',
    'Stand-ins for real dependencies. Stub: returns canned data. Mock: pre-programmed with expectations that are verified. Spy: records calls for later assertions while possibly delegating. Fake: working lightweight implementation (in-memory DB). Choice depends on whether you assert state or interactions.', ['mocking', 'fundamentals']),
  op(AQ, 'easy', 'Which reporting/trace tools have you used and what do you value in them?',
    'Examples: Allure/Extent reports, Playwright HTML report + trace viewer, ReportPortal. Value: per-step traceability, screenshots/videos on failure, history trends, flaky detection, CI/PR integration — anything that shortens diagnosis time.', ['reporting', 'tools']),
  op(AQ, 'hard', 'How would you design automation for a microservices system with 15 services?',
    'Heavy investment at service level: unit + component tests per service, consumer-driven contract tests (Pact) between services, a thin set of true E2E journey tests on a stable environment, synthetic monitoring in production, and per-service pipelines gating independently. Avoid mega-E2E suites that turn every deploy into a bottleneck.', ['architecture', 'strategy']),

  // ════════════════════════════════════════════════════════════════════
  // CODE EXERCISES — Java (type 'code')
  // ════════════════════════════════════════════════════════════════════
  cx('java-basics', 'easy', 'Write a method that reverses a String without using StringBuilder.reverse(). Try it yourself before revealing the solution.',
`public class Exercise {
  public static String reverse(String input) {
    // TODO: implement
    return null;
  }
}`,
`public class Exercise {
  public static String reverse(String input) {
    char[] chars = input.toCharArray();
    int left = 0, right = chars.length - 1;
    while (left < right) {
      char tmp = chars[left];
      chars[left] = chars[right];
      chars[right] = tmp;
      left++;
      right--;
    }
    return new String(chars);
  }
}`,
    'Two pointers swap characters from both ends toward the middle in O(n) time and O(n) space for the char array. A classic warm-up that also shows you know Strings are immutable in Java.', ['java', 'strings']),
  cx('java-basics', 'easy', 'Write a method that returns true if a number is a palindrome (e.g. 121, 1331) without converting it to a String.',
`public static boolean isPalindrome(int number) {
  // TODO: implement (no String conversion)
  return false;
}`,
`public static boolean isPalindrome(int number) {
  if (number < 0) return false;
  int original = number;
  int reversed = 0;
  while (number != 0) {
    reversed = reversed * 10 + number % 10;
    number /= 10;
  }
  return original == reversed;
}`,
    'Build the reversed number digit by digit using modulo and division, then compare with the original. Negative numbers are never palindromes.', ['java', 'logic']),
  cx('java-basics', 'medium', 'Given a List<String> of test results like "PASS", "FAIL", "PASS", count occurrences of each result using a Map.',
`public static Map<String, Integer> countResults(List<String> results) {
  // TODO: implement
  return null;
}`,
`public static Map<String, Integer> countResults(List<String> results) {
  Map<String, Integer> counts = new HashMap<>();
  for (String result : results) {
    counts.merge(result, 1, Integer::sum);
  }
  return counts;
}

// Stream alternative:
// results.stream().collect(
//     Collectors.groupingBy(r -> r, Collectors.counting()));`,
    'Map.merge inserts 1 when the key is absent or applies Integer::sum when present — the idiomatic frequency count. The stream version with groupingBy/counting is equally valid in interviews.', ['java', 'collections']),
  cx('java-basics', 'medium', 'Find the first non-repeated character in a String (e.g. "swiss" → "w").',
`public static Character firstNonRepeated(String input) {
  // TODO: implement
  return null;
}`,
`public static Character firstNonRepeated(String input) {
  Map<Character, Integer> counts = new LinkedHashMap<>();
  for (char c : input.toCharArray()) {
    counts.merge(c, 1, Integer::sum);
  }
  for (Map.Entry<Character, Integer> e : counts.entrySet()) {
    if (e.getValue() == 1) return e.getKey();
  }
  return null;
}`,
    'LinkedHashMap preserves insertion order, so the first entry with count 1 is the answer. Two passes, O(n) time.', ['java', 'collections', 'strings']),
  cx('java-basics', 'medium', 'Remove duplicates from a List<Integer> while preserving the original order.',
`public static List<Integer> removeDuplicates(List<Integer> numbers) {
  // TODO: implement preserving order
  return null;
}`,
`public static List<Integer> removeDuplicates(List<Integer> numbers) {
  return new ArrayList<>(new LinkedHashSet<>(numbers));
}

// Manual alternative:
// Set<Integer> seen = new HashSet<>();
// List<Integer> result = new ArrayList<>();
// for (Integer n : numbers) {
//   if (seen.add(n)) result.add(n);
// }
// return result;`,
    'LinkedHashSet de-duplicates while keeping insertion order in one line. The manual version shows the same idea explicitly: Set.add returns false for duplicates.', ['java', 'collections']),
  cx('java-basics', 'medium', 'Write a method that checks if two Strings are anagrams (e.g. "listen" and "silent").',
`public static boolean areAnagrams(String a, String b) {
  // TODO: implement
  return false;
}`,
`public static boolean areAnagrams(String a, String b) {
  if (a == null || b == null || a.length() != b.length()) return false;
  char[] ca = a.toLowerCase().toCharArray();
  char[] cb = b.toLowerCase().toCharArray();
  Arrays.sort(ca);
  Arrays.sort(cb);
  return Arrays.equals(ca, cb);
}`,
    'Sorting both strings and comparing is the simplest O(n log n) solution; a char-frequency map gives O(n) if asked to optimize.', ['java', 'strings']),
  cx('java-basics', 'hard', 'FizzBuzz with a twist: return a List<String> for 1..n, but make the rules (3→Fizz, 5→Buzz) easy to extend with new pairs.',
`public static List<String> fizzBuzz(int n) {
  // TODO: make divisor→word rules extensible
  return null;
}`,
`public static List<String> fizzBuzz(int n) {
  Map<Integer, String> rules = new LinkedHashMap<>();
  rules.put(3, "Fizz");
  rules.put(5, "Buzz");

  List<String> output = new ArrayList<>();
  for (int i = 1; i <= n; i++) {
    StringBuilder sb = new StringBuilder();
    for (Map.Entry<Integer, String> rule : rules.entrySet()) {
      if (i % rule.getKey() == 0) sb.append(rule.getValue());
    }
    output.add(sb.length() > 0 ? sb.toString() : String.valueOf(i));
  }
  return output;
}`,
    'Driving the logic from an ordered rules map removes nested if/else chains and makes adding 7→Bazz a one-line change — interviewers look for that design instinct.', ['java', 'design']),
  cx('java-basics', 'hard', 'Given int[] prices where prices[i] is the price on day i, return the max profit from one buy + one sell (0 if no profit possible).',
`public static int maxProfit(int[] prices) {
  // TODO: single pass preferred
  return 0;
}`,
`public static int maxProfit(int[] prices) {
  int minPrice = Integer.MAX_VALUE;
  int maxProfit = 0;
  for (int price : prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}`,
    'Track the lowest price seen so far and the best profit if selling today. One pass, O(n) time, O(1) space — the classic "Best Time to Buy and Sell Stock" problem.', ['java', 'algorithms']),

  // ════════════════════════════════════════════════════════════════════
  // CODE EXERCISES — Playwright (type 'code')
  // ════════════════════════════════════════════════════════════════════
  cx('playwright', 'easy', 'Complete the test: open https://example.com, verify the page title contains "Example" and that the h1 heading is visible.',
`import { test, expect } from '@playwright/test';

test('example.com smoke', async ({ page }) => {
  // TODO: navigate and assert title + h1 visibility
});`,
`import { test, expect } from '@playwright/test';

test('example.com smoke', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
  await expect(page.locator('h1')).toBeVisible();
});`,
    'page.goto navigates; toHaveTitle accepts a regex; toBeVisible is a web-first assertion that auto-retries until the element renders.', ['playwright', 'basics']),
  cx('playwright', 'easy', 'Write a test that fills a login form (#email, #password), clicks the submit button and asserts the URL changes to /dashboard.',
`test('login redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  // TODO: fill form, submit, assert URL
});`,
`test('login redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('Secret123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/.*\/dashboard/);
});`,
    'fill clears and types in one step; getByRole targets the accessible button name (resilient locator); toHaveURL waits for the navigation automatically.', ['playwright', 'forms']),
  cx('playwright', 'medium', 'A list renders items asynchronously. Write a test that waits until the list .result-item has exactly 5 elements and the first one contains "Playwright".',
`test('async list renders 5 results', async ({ page }) => {
  await page.goto('/search?q=playwright');
  // TODO: assert count and first item text (no sleeps!)
});`,
`test('async list renders 5 results', async ({ page }) => {
  await page.goto('/search?q=playwright');

  const items = page.locator('.result-item');
  await expect(items).toHaveCount(5);
  await expect(items.first()).toContainText('Playwright');
});`,
    'toHaveCount and toContainText are auto-retrying assertions — they poll until the async render completes or the timeout hits. No waitForTimeout needed.', ['playwright', 'waits']),
  cx('playwright', 'medium', 'Mock the API: intercept GET /api/users and return an empty list, then assert the UI shows the empty state message.',
`test('shows empty state when API returns no users', async ({ page }) => {
  // TODO: intercept /api/users with [] before navigating
  await page.goto('/users');
});`,
`test('shows empty state when API returns no users', async ({ page }) => {
  await page.route('**/api/users', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  );

  await page.goto('/users');
  await expect(page.getByText('No users found')).toBeVisible();
});`,
    'page.route intercepts matching requests; route.fulfill returns a fake response. Registering the route BEFORE goto guarantees the first request is caught — ideal for hard-to-reproduce UI states.', ['playwright', 'mocking']),
  cx('playwright', 'medium', 'Handle a new tab: clicking #open-docs opens documentation in a new tab. Assert the new tab URL contains /docs and close it.',
`test('docs open in a new tab', async ({ page, context }) => {
  await page.goto('/');
  // TODO: capture the new page, assert URL, close it
});`,
`test('docs open in a new tab', async ({ page, context }) => {
  await page.goto('/');

  const [docsPage] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('#open-docs').click(),
  ]);

  await docsPage.waitForLoadState();
  await expect(docsPage).toHaveURL(/\/docs/);
  await docsPage.close();
});`,
    'Promise.all registers the page listener before the click that triggers it — the standard pattern to avoid racing the event. The new Page object is then a fully driveable tab.', ['playwright', 'tabs']),
  cx('playwright', 'medium', 'Reuse login: configure a test that logs in once via API and injects the session for all tests using storageState.',
`// auth.setup.ts
// TODO: login via API request and save storage state to a file
// playwright.config.ts uses: storageState: 'auth.json'`,
`// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: 'user@test.com', password: 'Secret123!' },
  });
  if (!response.ok()) throw new Error('Login failed');

  // Persist cookies + localStorage for reuse
  await request.storageState({ path: 'auth.json' });
});

// playwright.config.ts (project using the saved session):
// {
//   name: 'authenticated',
//   dependencies: ['setup'],
//   use: { storageState: 'auth.json' },
// }`,
    'Logging in once via API and persisting storageState removes the slowest, flakiest step (UI login) from every test — sessions are injected instantly per test.', ['playwright', 'auth']),
  cx('playwright', 'hard', 'Write a Page Object for a Todo page (input .new-todo, list .todo-item) with addTodo and expectTodoCount, and use it in a test.',
`// TODO: TodoPage class + test using it
class TodoPage {
}

test('user can add todos', async ({ page }) => {
});`,
`import { test, expect, type Page, type Locator } from '@playwright/test';

class TodoPage {
  readonly page: Page;
  readonly input: Locator;
  readonly items: Locator;

  constructor(page: Page) {
    this.page = page;
    this.input = page.locator('.new-todo');
    this.items = page.locator('.todo-item');
  }

  async goto() {
    await this.page.goto('/todos');
  }

  async addTodo(text: string) {
    await this.input.fill(text);
    await this.input.press('Enter');
  }

  async expectTodoCount(count: number) {
    await expect(this.items).toHaveCount(count);
  }
}

test('user can add todos', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.addTodo('Write tests');
  await todoPage.addTodo('Review PR');
  await todoPage.expectTodoCount(2);
});`,
    'Locators live once in the page object; tests read like user stories. Locator objects are lazy — they re-query the DOM on each action, avoiding stale references.', ['playwright', 'pom']),
  cx('playwright', 'hard', 'Capture and assert a network response: when clicking #load-orders, assert the API call to /api/orders returns 200 and the UI renders the same number of rows as the payload.',
`test('orders table matches API payload', async ({ page }) => {
  await page.goto('/orders');
  // TODO: waitForResponse + compare payload length to rendered rows
});`,
`test('orders table matches API payload', async ({ page }) => {
  await page.goto('/orders');

  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/orders') && r.status() === 200),
    page.locator('#load-orders').click(),
  ]);

  const orders = await response.json();
  await expect(page.locator('.order-row')).toHaveCount(orders.length);
});`,
    'waitForResponse captures the real API payload triggered by the click; asserting UI rows against payload length validates the full data → render pipeline without hardcoding counts.', ['playwright', 'network']),

  // ════════════════════════════════════════════════════════════════════
  // CODE EXERCISES — Postman (type 'code')
  // ════════════════════════════════════════════════════════════════════
  cx('postman', 'easy', 'Write Postman tests for GET /users/1: status is 200, response time under 500ms, and the body has a non-empty "email" field.',
`// Tests tab of the request
// TODO: three pm.test blocks`,
`pm.test('status is 200', function () {
  pm.response.to.have.status(200);
});

pm.test('response time under 500ms', function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test('email field is present and non-empty', function () {
  const body = pm.response.json();
  pm.expect(body.email).to.be.a('string').and.to.not.be.empty;
});`,
    'pm.response exposes status, time and json(); pm.expect is Chai — the three checks cover protocol, performance and contract basics.', ['postman', 'assertions']),
  cx('postman', 'easy', 'After POST /login returns { "token": "..." }, save the token to an environment variable so the next requests can use it as a Bearer header.',
`// Tests tab of the login request
// TODO: extract token and store it`,
`pm.test('login returns a token', function () {
  const body = pm.response.json();
  pm.expect(body.token).to.be.a('string');
  pm.environment.set('authToken', body.token);
});

// In subsequent requests:
//   Authorization: Bearer {{authToken}}
// (or set it at collection level under Auth → Bearer Token)`,
    'Chaining requests via environment variables is the core Postman workflow pattern: extract in Tests, consume with {{variable}} anywhere.', ['postman', 'chaining']),
  cx('postman', 'medium', 'Validate the JSON schema of GET /products: an array of objects with required id (number), name (string) and price (number).',
`// Tests tab
// TODO: validate response against a JSON schema`,
`const schema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'name', 'price'],
    properties: {
      id:    { type: 'number' },
      name:  { type: 'string' },
      price: { type: 'number' },
    },
  },
};

pm.test('response matches product schema', function () {
  pm.response.to.have.jsonSchema(schema);
});`,
    'Schema validation catches breaking contract changes (missing/renamed/retyped fields) even when example-based assertions would still pass.', ['postman', 'schema']),
  cx('postman', 'medium', 'Make a request retry-aware: if GET /jobs/123 returns "status": "processing", re-run the same request up to 5 times with 2s delay until it is "done".',
`// Tests tab — polling pattern
// TODO: use pm.execution.setNextRequest / setTimeout pattern`,
`const body = pm.response.json();
const attempt = parseInt(pm.environment.get('pollAttempt') || '0', 10);

if (body.status === 'processing' && attempt < 5) {
  pm.environment.set('pollAttempt', String(attempt + 1));
  setTimeout(function () {}, 2000); // crude delay inside the sandbox
  pm.execution.setNextRequest(pm.info.requestName); // re-run this request
} else {
  pm.environment.unset('pollAttempt');
  pm.test('job finished', function () {
    pm.expect(body.status).to.eql('done');
  });
}`,
    'setNextRequest loops the collection runner back to the same request — the standard polling pattern for async jobs in Postman/Newman runs (attempt counter prevents infinite loops).', ['postman', 'async']),
  cx('postman', 'hard', 'Data-driven negative testing: using a CSV with columns email,password,expectedStatus, write tests that assert POST /login returns the expected status per row in the collection runner.',
`// Request body (raw JSON):
// { "email": "{{email}}", "password": "{{password}}" }
// Tests tab:
// TODO: assert per-row expectations from the CSV`,
`// Body uses {{email}} / {{password}} from the CSV row automatically.

pm.test(
  'returns ' + pm.iterationData.get('expectedStatus') +
  ' for ' + pm.iterationData.get('email'),
  function () {
    const expected = parseInt(pm.iterationData.get('expectedStatus'), 10);
    pm.expect(pm.response.code).to.eql(expected);
  }
);

// Run with: Collection Runner (select CSV) or:
// newman run collection.json -d credentials.csv`,
    'pm.iterationData reads the current CSV row; one request + a data file covers dozens of negative login cases, and Newman runs the same matrix in CI.', ['postman', 'data-driven', 'newman']),

  // ════════════════════════════════════════════════════════════════════
  // CODE EXERCISES — SQL for QA (type 'code')
  // ════════════════════════════════════════════════════════════════════
  cx('sql-for-qa', 'easy', 'Table orders(id, user_id, status, total). Write a query to count orders per status, highest count first.',
`-- TODO: count per status, ordered desc`,
`SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status
ORDER BY order_count DESC;`,
    'GROUP BY aggregates per status; COUNT(*) counts rows per group. A staple for verifying data distributions during testing.', ['sql', 'aggregation']),
  cx('sql-for-qa', 'medium', 'Find duplicate emails in users(id, email): list each duplicated email with how many times it appears.',
`-- TODO: emails appearing more than once`,
`SELECT email, COUNT(*) AS occurrences
FROM users
GROUP BY email
HAVING COUNT(*) > 1;`,
    'HAVING filters after aggregation (WHERE cannot see COUNT). Duplicate detection is one of the most common QA data-integrity checks.', ['sql', 'data-integrity']),
  cx('sql-for-qa', 'medium', 'Tables users(id, name) and orders(id, user_id). List users who have NEVER placed an order.',
`-- TODO: users without orders (two approaches welcome)`,
`-- LEFT JOIN approach
SELECT u.id, u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- NOT EXISTS alternative
SELECT u.id, u.name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
    'LEFT JOIN + IS NULL keeps unmatched left rows; NOT EXISTS expresses the same intent and often performs better on large tables. Knowing both is an interview plus.', ['sql', 'joins']),
  cx('sql-for-qa', 'hard', 'Table payments(id, user_id, amount, created_at). Get the most recent payment per user (id, user_id, amount, created_at).',
`-- TODO: latest payment per user`,
`-- Window function (modern, preferred)
SELECT id, user_id, amount, created_at
FROM (
  SELECT p.*,
         ROW_NUMBER() OVER (
           PARTITION BY user_id
           ORDER BY created_at DESC
         ) AS rn
  FROM payments p
) ranked
WHERE rn = 1;`,
    'ROW_NUMBER partitioned per user and ordered by date ranks each payment; rn = 1 keeps the latest. The pattern (top-N per group) appears constantly when validating data pipelines.', ['sql', 'window-functions']),

]
