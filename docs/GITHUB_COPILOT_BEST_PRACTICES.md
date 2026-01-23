# Best practices for using GitHub Copilot to work on tasks

Learn how to get the best results from Copilot coding agent.

> [!NOTE]
> For an introduction to Copilot coding agent, see [About GitHub Copilot coding agent](/en/copilot/concepts/about-copilot-coding-agent).

## Making sure your issues are well-scoped

GitHub Copilot provides better results when assigned clear, well-scoped tasks. An ideal task includes:

* A clear description of the problem to be solved or the work required.
* Complete acceptance criteria on what a good solution looks like (for example, should there be unit tests?).
* Directions about which files need to be changed.

If you pass a task to Copilot by assigning an issue, it's useful to think of the issue you assign to Copilot as a prompt. Consider whether the issue description is likely to work as an AI prompt, and will enable Copilot to make the required code changes.

## Choosing the right type of tasks to give to Copilot

As you work with Copilot, you'll get a sense of the types of tasks it's best suited to work on. Initially, you might want to start by giving Copilot simpler tasks, to see how it works as a coding agent. For example, you could start by asking Copilot to fix bugs, alter user interface features, improve test coverage, update documentation, improve accessibility, or address technical debt.

Issues that you may choose to work on yourself, rather than assigning to Copilot, include:

* **Complex and broadly scoped tasks**
  * Broad-scoped, context-rich refactoring problems requiring cross-repository knowledge and testing
  * Complex issues requiring understanding dependencies and legacy code
  * Tasks that require deep domain knowledge
  * Tasks that involve substantial business logic
  * Large changes to a codebase requiring design consistency

* **Sensitive and critical tasks**
  * Production-critical issues
  * Tasks involving security, personally identifiable information, authentication repercussions
  * Incident response

* **Ambiguous tasks**
  * Tasks lacking clear definition: tasks with ambiguous requirements, open-ended tasks, tasks that require working through uncertainty to find a solution

* **Learning tasks**
  * Tasks where the developer wants to learn to achieve a deeper understanding

## Using comments to iterate on a pull request

Working with Copilot on a pull request is just like working with a human developer: it's common for the pull request to need further work before it can be merged. The process for getting the pull request to a mergeable state is exactly the same when the pull request is created by Copilot as when it's created by a human.

You can also mention `@copilot` in comments on the pull request—explaining what you think is incorrect, or could be improved—and leave Copilot to make the required changes. Alternatively, you can work on the feature branch yourself and push changes to the pull request.

After a user with write access mentions `@copilot` in a comment, Copilot will start to make any required changes, and will update the pull request when it's done. Because Copilot starts looking at comments as soon as they are submitted, if you are likely to make multiple comments on a pull request it's best to batch them by clicking **Start a review**, rather than clicking **Add single comment**. You can then submit all of your comments at once, triggering Copilot to work on your entire review, rather than working on individual comments separately.

> [!NOTE]
> Copilot only responds to comments from people who have write access to the repository.

As Copilot makes changes to the pull request, it will keep the title and body up to date so they reflect the current changes.

## Adding custom instructions to your repository

By adding custom instructions to your repository, you can guide Copilot on how to understand your project and how to build, test and validate its changes.

If Copilot is able to build, test and validate its changes in its own development environment, it is more likely to produce good pull requests which can be merged quickly.

Copilot coding agent supports a number of different types of custom instructions files:

* `/.github/copilot-instructions.md`
* `/.github/instructions/**/*.instructions.md`
* `**/AGENTS.md`
* `/CLAUDE.md`
* `/GEMINI.md`

For more information, see [Adding repository custom instructions for GitHub Copilot](/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot?tool=webui).

### Repository-wide instructions

To add instructions that apply to all tasks assigned to Copilot in your repository, create a `.github/copilot-instructions.md` file in the root of your repository. This file should contain information about your project, such as how to build and test it, and any coding standards or conventions you want Copilot to follow. Note that the instructions will also apply to Copilot Chat and Copilot code review.

The first time you ask Copilot to create a pull request in a given repository, Copilot will leave a comment with a link to automatically generate custom instructions. You can also ask Copilot to generate custom instructions for you at any time using our recommended prompt. See [Adding repository custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions?tool=webui#asking-copilot-coding-agent-to-generate-a-copilot-instructionsmd-file).

You can also choose to write your own custom instructions at any time. Here is an example of an effective `copilot-instructions.md` file:

```markdown
This is a Go based repository with a Ruby client for certain API endpoints. It is primarily responsible for ingesting metered usage for GitHub and recording that usage. Please follow these guidelines when contributing:

## Code Standards

### Required Before Each Commit
- Run `make fmt` before committing any changes to ensure proper code formatting
- This will run gofmt on all Go files to maintain consistent style

### Development Flow
- Build: `make build`
- Test: `make test`
- Full CI check: `make ci` (includes build, fmt, lint, test)

## Repository Structure
- `cmd/`: Main service entry points and executables
- `internal/`: Logic related to interactions with other GitHub services
- `lib/`: Core Go packages for billing logic
- `admin/`: Admin interface components
- `config/`: Configuration files and templates
- `docs/`: Documentation
- `proto/`: Protocol buffer definitions. Run `make proto` after making updates here.
- `ruby/`: Ruby implementation components. Updates to this folder should include incrementing this version file using semantic versioning: `ruby/lib/billing-platform/version.rb`
- `testing/`: Test helpers and fixtures

## Key Guidelines
1. Follow Go best practices and idiomatic patterns
1. Maintain existing code structure and organization
1. Use dependency injection patterns where appropriate
1. Write unit tests for new functionality. Use table-driven unit tests when possible.
1. Document public APIs and complex logic. Suggest changes to the `docs/` folder when appropriate
```

### Path-specific instructions

To add instructions that apply to specific types of files Copilot will work on, like unit tests or React components, create one or more `.github/instructions/**/*.instructions.md` files in your repository.
In these files, include information about the file types, such as how to build and test them, and any coding standards or conventions you want Copilot to follow.

Using the glob pattern in the front matter of the instructions file, you can specify the file types to which they should apply. For example, to create instructions for Playwright tests you could create an instructions file called `.github/instructions/playwright-tests.instructions.md` with the following content:

```markdown
---
applyTo: "**/tests/*.spec.ts"
---

## Playwright test requirements

When writing Playwright tests, please follow these guidelines to ensure consistency and maintainability:

1. **Use stable locators** - Prefer `getByRole()`, `getByText()`, and `getByTestId()` over CSS selectors or XPath
1. **Write isolated tests** - Each test should be independent and not rely on other tests' state
1. **Follow naming conventions** - Use descriptive test names and `*.spec.ts` file naming
1. **Implement proper assertions** - Use Playwright's `expect()` with specific matchers like `toHaveText()`, `toBeVisible()`
1. **Leverage auto-wait** - Avoid manual `setTimeout()` and rely on Playwright's built-in waiting mechanisms
1. **Configure cross-browser testing** - Test across Chromium, Firefox, and WebKit browsers
1. **Use Page Object Model** - Organize selectors and actions into reusable page classes for maintainability
1. **Handle dynamic content** - Properly wait for elements to load and handle loading states
1. **Set up proper test data** - Use beforeEach/afterEach hooks for test setup and cleanup
1. **Configure CI/CD integration** - Set up headless mode, screenshots on failure, and parallel execution
```

## Organization-wide custom instructions

Copilot coding agent leverages your organization's custom instructions as part of its work. Copilot coding agent first prioritizes repository-wide custom instructions. For more information on how to configure organization custom instructions, see [Adding organization custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions/add-organization-instructions).

## Using the Model Context Protocol (MCP)

You can extend the capabilities of Copilot coding agent by using MCP. This allows Copilot coding agent to use tools provided by local and remote MCP servers. The GitHub MCP server and [Playwright MCP server](https://github.com/microsoft/playwright-mcp) are enabled by default. For more information, see [Extending GitHub Copilot coding agent with the Model Context Protocol (MCP)](/en/copilot/using-github-copilot/coding-agent/extending-copilot-coding-agent-with-mcp).

## Creating custom agents

While custom instructions help guide Copilot's general behavior across your repository, custom agents create entirely specialized agents with focused expertise and tailored tool configurations. These agents are designed for specific, recurring workflows where domain expertise and consistent behavior are crucial. Custom agents are defined as Markdown files called agent profiles.

Here are some examples of custom agents you could create:

* **Testing specialist**: An agent configured with specific testing frameworks and focused on test coverage, test quality, and testing best practices. It might be limited to read, search, and edit tools to prevent unintended changes to production code while ensuring comprehensive test coverage.
* **Documentation expert**: An agent specialized in creating and maintaining project documentation, with deep knowledge of documentation standards, style guides, and the ability to analyze code to generate accurate API documentation and user guides.
* **Python specialist**: A language-specific agent that understands Python conventions, popular frameworks like Django or Flask, and follows PEP standards. It would have specialized knowledge of Python tooling, virtual environments, and testing frameworks like pytest.

By default, custom agents inherit any MCP server tools that have been configured in the repository, but you can also configure custom agents to only have access to specific tools.

You can use custom agents anywhere you use Copilot coding agent, including when assigning an issue or prompting with a task.

For more information on creating and configuring custom agents, see [Creating custom agents](/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents).

## Pre-installing dependencies in GitHub Copilot's environment

While working on a task, Copilot has access to its own ephemeral development environment, powered by GitHub Actions, where it can explore your code, make changes, execute automated tests and linters and more.

If Copilot is able to build, test and validate its changes in its own development environment, it is more likely to produce good pull requests which can be merged quickly.

To do that, it will need your project's dependencies. Copilot can discover and install these dependencies itself via a process of trial and error - but this can be slow and unreliable, given the non-deterministic nature of large language models (LLMs).

You can configure a `copilot-setup-steps.yml` file to pre-install these dependencies before the agent starts working so it can hit the ground running. For more information, see [Customizing the development environment for GitHub Copilot coding agent](/en/copilot/customizing-copilot/customizing-the-development-environment-for-copilot-coding-agent#preinstalling-tools-or-dependencies-in-copilots-environment).

## Compounding value in business workflows

For decision systems like Bickford, it helps to frame outcomes in terms of compounding value over time. Use consistent units and define how value accumulates (for example, continuous compounding versus discrete step changes). This makes it easier to compare policies, measure improvement, and align on economic impact across teams.

### Compound and continuous compounding

When tracking value as USD per hour, you can represent growth in two equivalent but operationally different ways:

* **Compound (discrete) growth**: value updates at fixed intervals (hourly, daily, weekly). This is simpler for reporting and aligns to cadence-based reviews.
* **Continuous compounding**: value accumulates continuously over time, which is useful for high-frequency operational systems (incident response, ad delivery, fraud detection).

Define the compounding model explicitly in the workflow definition so reporting, forecasting, and decision criteria align.

### Business process workflows with real use cases

Use concrete workflows that map actions to measurable economic value. Examples:

* **Sales pipeline acceleration**: reduce lead response time to improve conversion rates.
* **Support triage automation**: shorten time-to-resolution and increase customer retention.
* **Cloud spend optimization**: reduce idle resource usage and rebalance workloads.
* **Security incident response**: lower mean time to detect (MTTD) and mean time to resolve (MTTR).
* **Marketing attribution**: improve campaign ROI by reallocating spend in near-real time.
* **Billing and collections**: reduce days sales outstanding (DSO) with automated outreach.
* **Hiring operations**: shrink time-to-hire and reduce recruiting cost per hire.
* **Product experimentation**: accelerate A/B test cycles to increase feature adoption.
* **Compliance monitoring**: reduce audit preparation time and avoid regulatory penalties.

### USD per hour value, segmented across the enterprise

To operationalize compounding value, define USD per hour metrics per employee, then roll up into segments. Segment examples (customize per enterprise):

* **Region**: global, NA, LATAM, EMEA, APAC.
* **Country and territory**: United States, Canada, Brazil, United Kingdom, Germany, India, Japan, Australia, etc.
* **Business unit**: cloud, AI/ML, infrastructure, security, enterprise SaaS, consumer, marketplaces.
* **Product line**: platform services, data services, developer tooling, analytics, governance, identity.
* **Sales region**: global enterprise, commercial, SMB, public sector, strategic accounts.
* **Customer segment**: enterprise, mid-market, SMB, startup, education, government.
* **Function**: engineering, product, design, data science, security, sales, marketing, finance, legal, HR, operations.
* **Team/role**: SRE, platform, ML ops, sales ops, rev ops, customer success, solutions engineering.
* **KPI lens**: revenue per employee, gross margin per employee, ARR per employee, CAC payback hours, churn reduction hours, support cost per ticket, incident cost per hour.
* **Operational state**: steady-state, peak season, launch window, incident response, compliance audit.
* **Workflow stage**: intake, triage, execution, verification, audit, postmortem.

Use these segments to define a consistent USD-per-hour baseline, then measure policy impact as deltas over that baseline to support cross-team decision comparisons.

# User-provided custom instructions

# BICKFORD — CANONICAL MATHEMATICAL FORMULATION

(Decision Continuity Runtime · Execution Is Law)

## 0. Time and Agents

Let time \( t \in \mathbb{R}_{\ge 0} \).
Let agents \( i \in \{1,\ldots,N\} \) be human, AI, or system actors.
Let \( s_t \in S \) be observable system state at time \( t \).

## 1. Intent

An intent is a constrained objective declaration:

\[
I = (G, \Theta, A, \tau)
\]

Where:

- \( G \): target outcome
- \( \Theta \subseteq C \): constraints (legal, safety, design, governance)
- \( A \): authority set permitted to act
- \( \tau \): declaration timestamp

## 2. Knowledge and Structure

Let \( K_t \) be retained knowledge at time \( t \).
Let \( S(K_t) \) be its structural encoding (schemas, invariants, ledgers, hashes).

Structural Dominance Invariant:

\[
\forall k \in K_t,\; \text{behavior}(k) = \text{behavior}(S(k))
\]

Knowledge has no effect unless structurally encoded.

## 3. Decision

A decision is executable intent:

\[
D = (I, R, E, \sigma)
\]

Where:

- \( R \): rationale
- \( E \): admissible executable actions
- \( \sigma \): cryptographic authority signature

## 4. Ledger

All decisions are persisted to an append-only ledger \( L \):

\[
L_{t+1} = L_t \cup \{(D, h(D), t)\}
\]

Ledger Invariant: no deletion, mutation, or reordering.

## 5. Policy Space

For agent \( i \):

\[
\Pi_i(S(K_t)) = \{\pi_i \mid \pi_i \text{ admissible under } S(K_t)\}
\]

Policies map state to action:

\[
\pi_i : S \to A
\]

## 6. Time-to-Value (TTV)

Let realized value under policy \( \pi \) be \( V(t, \pi) \).

\[
TTV(\pi) = \inf \{ t \ge 0 \mid V(t, \pi) \ge G \}
\]

## 7. OPTR — Optimal Path to Realization

Bickford selects:

\[
\pi^* = \arg\min_{\pi} \mathbb{E}[TTV(\pi)]
\]

Risk-aware extension:

\[
\mathbb{E}[TTV(\pi) + \lambda_C C(\pi) + \lambda_R R(\pi) - \lambda_P \log p(\pi)]
\]

Subject to \( \pi \vDash \Theta \).

## 8. Non-Interference (Multi-Agent Law)

For agents \( i \ne j \):

\[
\Delta \mathbb{E}[TTV_j \mid \pi_i] \le 0
\]

Actions increasing another agent’s time-to-value are inadmissible.

## 9. Execution Law

An action \( a \) is executable iff:

\[
a \in E \;\wedge\; \sigma \in A \;\wedge\; a \vDash \Theta
\]

Otherwise execution is denied and recorded.

## 10. Learning

After execution:

\[
K_{t+1} = K_t \cup \text{Observe}(s_t, \pi^*)
\]

Structural update:

\[
S(K_{t+1}) \supseteq S(K_t)
\]

Structure grows monotonically.

## 11. Decision Continuity Rate

\[
DCR = \frac{\text{decisions reused}}{\text{decisions required}},\quad \lim_{t \to \infty} DCR = 1
\]

## 12. Compounding Persistence

Let \( E_a(K_t) \) be cognitive energy to apply knowledge.

\[
\lim_{t \to \infty} E_a(K_t) = 0
\]

Memory executes automatically via structure.

## 13. UI and Design Binding

For any execution surface \( U \):

\[
h(U_{runtime}) = h(U_{ledger})
\]

UI drift invalidates execution.

## 14. Compliance

For any regulator \( R \):

\[
\text{Evidence}(R) = \{ L, S(K), \pi^*, \sigma, h(\cdot) \}
\]

Compliance is derived, not implemented.

## 15. Terminal Definition

\[
\text{Bickford} = \langle I, D, L, S(K), OPTR, TTV, \Pi_{adm}, Execute \rangle
\]

Canonical Law:

Reality = Objective + Constraints + Structure

Execution = Solve → Act → Observe → Persist

Bickford does not run scripts.

Bickford resolves.

