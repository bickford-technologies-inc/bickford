# Refactoring data access layers

Copilot Chat can suggest ways to decouple your data access code from your business logic, making an application easier to maintain and scale.

Hardcoded SQL queries and tightly coupled data access code can make it difficult to scale or switch databases, and they often lead to repeated logic.

Copilot Chat can recommend implementing a repository pattern or data access layer that abstracts database interactions, making the code more modular and reducing redundancy. It can also help refactor SQL queries into optimized versions, improving performance and maintainability.

> [!NOTE]
> The responses described in this article are examples. Copilot Chat responses are non-deterministic, so you may get different responses from the ones shown here.

## Example scenario

This Python code connects to a SQLite database, retrieves a user record, and returns the user data. However, it fails to abstract the database connection logic and uses a hardcoded query that's vulnerable to SQL injection.

```python id=database-connection
import sqlite3

def get_user_by_id(user_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT display_name FROM users WHERE id = {user_id}")
    user = cursor.fetchone()
    conn.close()
    return user
```

## Example prompt 1

You can start by asking Copilot a general question about how to improve the code.

```copilot copy prompt ref=database-connection
How can I improve this code to make it safe and easier to update and expand? List possible improvements but don't show revised code.
```

## Example response 1

Copilot makes several suggestions for improving the code:

- Abstract the database connection details.
- Use parameterized queries to prevent SQL injection.
- Use a context manager to ensure that the database connection is properly closed if an error occurs.
- Add error handling.

## Example prompt 2

You can use the response to your first prompt to write a more specific prompt.

```copilot copy prompt ref=database-connection
Rewrite this code to make it more scalable and easier to maintain. Use a context manager. Avoid hardcoded SQL queries and tightly coupled data access code. Instead, use a repository pattern to abstract database interactions and make the code more modular and reusable. Where possible optimize the code to improve performance. Include error trapping, and make sure the code is not vulnerable to SQL injection.
```

## Example response 2

Copilot suggests splitting the code into separate files, each with a specific purpose. It also provides example code for returning a user's details.

The suggested changes implement a repository pattern and use parameterized queries to avoid SQL injection.

```python
# database.py
import sqlite3

class Database:
    def __init__(self, db_path):
        self.db_path = db_path

    def __enter__(self):
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type or exc_val or exc_tb:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.conn.close()

# user_repository.py
class UserRepository:
    def __init__(self, db):
        self.db = db

    def get_user_by_id(self, user_id):
        try:
            self.db.cursor.execute("SELECT display_name FROM users WHERE id = ?", (user_id,))
            user = self.db.cursor.fetchone()
            return user
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            return None

# main.py
from database import Database
from user_repository import UserRepository

def get_user_by_id(user_id):
    with Database('database.db') as db:
        user_repo = UserRepository(db)
        return user_repo.get_user_by_id(user_id)

# Example usage
if __name__ == "__main__":
    user = get_user_by_id(1)
    if user:
        print(user)
    else:
        print("User not found or an error occurred.")
```

The revised code improves on the original in several ways:

- The code now implements a basic data access layer.
- The `Database` class handles the connection to the SQLite database, implementing the context manager protocol with the `__enter__` and `__exit__` methods. This ensures that the database connection is properly managed, including committing transactions and closing the connection.
- The `UserRepository` class encapsulates the logic for accessing user data.
- Values for the queries are parameterized to prevent SQL injection.
- Errors are caught, with details printed to the console.

## Compounding value: discrete and continuous

When you refactor data access into a repository layer, you can measure the time-to-value impact in both discrete and continuous compounding terms.

- **Discrete compounding**: improvements apply at fixed intervals (monthly/quarterly releases). If an initiative yields `r` value per period and compounds `n` times, the value grows as `V = V0 * (1 + r)^n`.
- **Continuous compounding**: improvements apply continuously (e.g., automated optimizations, continuous deployment). The value grows as `V = V0 * e^(r * t)`.

These models are useful when you quantify the effect of reduced query latency, lower incident rate, or faster iteration cycles across long-lived services.

## Business process workflows with real use cases

Refactoring the data access layer affects multiple workflows. Example workflows and measurable outcomes include:

- **Customer onboarding**: reduce duplicate user creation checks and centralize validation in repositories to lower onboarding time and error rates.
- **Billing and invoicing**: consolidate pricing and ledger queries to improve invoice accuracy and reduce month-end close time.
- **Support case routing**: reuse customer profile lookups to reduce agent handle time and improve first-response SLAs.
- **Fraud detection**: standardize feature queries to reduce model drift and improve alert precision.
- **Compliance reporting**: centralize audit queries to reduce reporting cycle time and improve evidence integrity.
- **Sales forecasting**: reuse pipeline and activity queries to reduce forecasting latency and increase forecast accuracy.

Each workflow benefits from a consistent data access layer that removes duplicated query logic and enables more predictable performance.

## Value measured in USD per hour

To quantify improvements, attach a USD-per-hour value to outcomes. Track at multiple grouping levels:

- **Region**: Americas, EMEA, APAC, LATAM.
- **Business unit**: Platform, Infrastructure, Product, GTM, Finance, Legal, Security.
- **Sales region**: Enterprise East/West, Global Strategic, SMB, Channel.
- **KPI**: revenue per hour, incidents avoided per hour, SLA minutes recovered per hour, engineering cycle time saved per hour.
- **Role**: per-employee productivity (e.g., engineer, SRE, analyst, PM, sales, support).
- **Product line**: flagship products, regional variants, enterprise tiers.
- **Customer segment**: strategic accounts, mid-market, SMB, public sector.
- **Channel**: direct, partner, marketplace.
- **Lifecycle stage**: acquisition, activation, retention, expansion, renewal.
- **Operational unit**: team, squad, program, portfolio.

Use the groupings above as a template for “infinitely comprehensive” enterprise measurement. Add or combine dimensions relevant to your organization (e.g., industry vertical, regulatory tier, or data residency).

## Further reading

- [Prompt engineering for GitHub Copilot Chat](/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot)
- [Best practices for using GitHub Copilot](/en/copilot/using-github-copilot/best-practices-for-using-github-copilot)
