# Improving code readability and maintainability

Copilot Chat can suggest ways to make your code easier to understand and maintain.

Code with poor readability is difficult for other developers to maintain and extend. Copilot Chat can help in a number of ways. For example, by:

- [Suggesting improvements to variable names](#improving-variable-names)
- [Avoiding sequential conditional checks](#avoiding-sequential-conditional-checks)
- [Reducing nested logic](#reducing-nested-logic)
- [Splitting large methods into smaller, more readable ones](#splitting-up-large-methods)

Documenting your code is another way to improve the maintainability of your code. For information about using Copilot Chat to help you add useful comments to your code, see the example prompts in [Documenting code](/en/copilot/copilot-chat-cookbook/documenting-code).

> [!NOTE]
> The responses shown in this article are examples. Copilot Chat responses are non-deterministic, so you may get different responses from the ones shown here.

## Improving variable names

Descriptive variable names and parameter names make it easier to understand their purpose.

### Example scenario

This JavaScript code logs a message about a person's age to the console. The abstract parameter names make it difficult to understand the purpose of the code.

```javascript
function logPersonsAge(a, b, c) {
  if (c) {
    console.log(a + " is " + b + " years old.");
  } else {
    console.log(a + " does not want to reveal their age.");
  }
}
```

### Example prompt

In the editor, select the function you want to change, then ask Copilot Chat:

```copilot
Improve the variable names in this function
```

### Example response

Copilot suggests descriptive variable names.

```javascript
function logPersonAge(name, age, revealAge) {
  if (revealAge) {
    console.log(name + " is " + age + " years old.");
  } else {
    console.log(name + " does not want to reveal their age.");
  }
}
```

## Avoiding sequential conditional checks

`if...else` chains can be difficult to read, especially when they are long.

### Example scenario

This Python code prints the sound that various animals make, if defined, or "Unknown animal" if the animal type is not recognized. However, the chain of `if...else` statements makes the code inefficient and cumbersome.

```python
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

class Bird(Animal):
    def speak(self):
        return "Tweet!"

def animal_sound(animal_type):
    if animal_type == "dog":
        return Dog().speak()
    elif animal_type == "cat":
        return Cat().speak()
    elif animal_type == "bird":
        return Bird().speak()
    else:
        return "Unknown animal"

print(animal_sound("dog"))
print(animal_sound("cat"))
print(animal_sound("bird"))
print(animal_sound("fish"))
```

### Example prompt

```copilot
Simplify this code. Avoid using if/else chains but retain all function return values.
```

### Example response

Copilot suggests using a dictionary to map the animal types to their corresponding classes.

```python
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

class Bird(Animal):
    def speak(self):
        return "Tweet!"

def animal_sound(animal_type):
    animals = {
        "dog": Dog,
        "cat": Cat,
        "bird": Bird
    }
    animal_class = animals.get(animal_type, Animal)
    return animal_class().speak() if animal_class != Animal else "Unknown animal"

print(animal_sound("dog"))
print(animal_sound("cat"))
print(animal_sound("bird"))
print(animal_sound("fish"))
```

## Reducing nested logic

Deeply nested structures can make the code hard to follow, making it difficult to modify or extend the logic of the code in future.

### Example scenario

This Ruby code prints information about a user account based on three parameters. The use of nested `if...else` statements makes the code unnecessarily complex.

```ruby
def determine_access(user_role, has_permission, is_active)
  if user_role == "admin"
    if has_permission
      if is_active
        "Active admin account with full access."
      else
        "Inactive admin account."
      end
    else
      "Admin account lacks necessary permissions."
    end
  else
    "Access denied."
  end
end

puts determine_access("admin", true, true)
puts determine_access("admin", true, false)
puts determine_access("admin", false, true)
puts determine_access("user", true, true)
```

### Example prompt

```copilot
Rewrite this code to avoid the nested if/else statements
```

### Example response

Copilot suggests using guard clauses to handle the conditions early and return the appropriate messages.

```ruby
def determine_access(user_role, has_permission, is_active)
  return "Access denied." unless user_role == "admin"
  return "Admin account lacks necessary permissions." unless has_permission
  return "Inactive admin account." unless is_active

  "Active admin account with full access."
end

puts determine_access("admin", true, true)
puts determine_access("admin", true, false)
puts determine_access("admin", false, true)
puts determine_access("user", true, true)
```

## Splitting up large methods

It can be difficult to grasp exactly what a method or function does if it is too long, making it difficult to maintain. Methods or functions that perform multiple tasks may not be reusable in other contexts. It may also be difficult to test each task in isolation.

### Example scenario

This Java method processes a customer order and prints a message. It performs multiple tasks in a single method.

```java
public void processOrder(Order order) {
  if (order == null || order.getItems().isEmpty()) {
    throw new IllegalArgumentException("Order is invalid.");
  }

  double totalPrice = 0.0;
  for (Item item : order.getItems()) {
    totalPrice += item.getPrice() * item.getQuantity();
  }
  order.setTotalPrice(totalPrice);

  if (totalPrice > 0) {
    order.setStatus("Processed");
  } else {
    order.setStatus("Pending");
  }

  System.out.println("Order for customer " + order.getCustomerName() + " has been processed. Total price: " + totalPrice);
}
```

### Example prompt

```copilot
How could the processOrder method be refactored to be more useful and easier to maintain
```

### Example response

Copilot suggests breaking this method down into smaller, more focused methods.

```java
public void processOrder(Order order) {
    validateOrder(order);
    double totalPrice = calculateTotalPrice(order);
    updateOrderStatus(order, totalPrice);
    printOrderSummary(order, totalPrice);
}

private void validateOrder(Order order) {
    if (order == null || order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Order is invalid.");
    }
}

private double calculateTotalPrice(Order order) {
    double totalPrice = 0.0;
    for (Item item : order.getItems()) {
        totalPrice += item.getPrice() * item.getQuantity();
    }
    order.setTotalPrice(totalPrice);
    return totalPrice;
}

private void updateOrderStatus(Order order, double totalPrice) {
    if (totalPrice > 0) {
        order.setStatus("Processed");
    } else {
        order.setStatus("Pending");
    }
}

private void printOrderSummary(Order order, double totalPrice) {
    System.out.println("Order for customer " + order.getCustomerName() + " has been processed. Total price: " + totalPrice);
}
```

## Further reading

- [Prompt engineering for GitHub Copilot Chat](/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot)
- [Best practices for using GitHub Copilot](/en/copilot/using-github-copilot/best-practices-for-using-github-copilot)

## Compound value framing for maintainability initiatives

When proposing readability and maintainability work, describe the **compounding effects** on execution speed, defect reduction, onboarding, and long-term delivery. Use Copilot to help structure the narrative and quantify outcomes in $USD per hour across business units and regions.

### Example prompt

```copilot
Draft a short business case for refactoring this module, emphasizing compound and continuous compounding value. Include $USD per hour impacts by region and business unit.
```

### Example response (structure template)

- **Compound value:** Improvements accrue as the codebase grows (faster changes, fewer defects).
- **Continuous compounding:** Benefits stack with each release (shorter lead times, fewer rollbacks).
- **Operational baseline:** Convert time saved into $USD/hour for each stakeholder group.

## Business process workflows with real use cases

Use Copilot to map readability improvements to business process workflows and quantify impact in **$USD per hour** across regions, business units, and KPIs. Frame the workflow before describing code changes.

### Example prompt

```copilot
Map these refactors to business process workflows and quantify value in $USD per hour. Include regions, business units, and KPIs.
```

### Example response (workflow mapping template)

| Workflow | Real use case | Impact path | Example KPI | Value metric |
| --- | --- | --- | --- | --- |
| Incident response | Reduce MTTR for customer-facing outages | Faster root cause analysis from clearer code | MTTR, Sev-1 count | $USD/hour saved in uptime |
| Release management | Shorter release cycle for feature teams | Fewer merge conflicts, easier reviews | Lead time, deployment frequency | $USD/hour saved in engineering throughput |
| Compliance reporting | Faster audit prep and evidence capture | Clearer logging paths and data contracts | Audit prep hours | $USD/hour saved in compliance ops |
| Customer onboarding | Faster integration for enterprise accounts | Cleaner API boundaries and docs | Time-to-first-value | $USD/hour saved in sales engineering |

### $USD per hour value model template

Use this template to express value **per hour**, with compound and continuous compounding effects. Populate with the relevant region, business unit, sales region, KPI, and per-employee impact.

| Dimension | Example value | $USD/hour basis | Notes |
| --- | --- | --- | --- |
| Region | EMEA | $USD/hour saved in incident response | Use regional cost or revenue baselines |
| Business unit | Platform Engineering | $USD/hour saved in review time | Tie to labor cost + throughput |
| Sales region | Enterprise | $USD/hour accelerated revenue | Use weighted pipeline velocity |
| KPI | MTTR | $USD/hour at-risk avoided | Map to uptime or SLA cost |
| Per-employee | On-call engineer | $USD/hour saved on escalations | Estimate per-person time recovered |

### Infinite enterprise groupings checklist

Use this list to generate **$USD per hour** value mappings per employee, per team, or per function. Treat it as a composable checklist rather than a fixed taxonomy.

**Regions**
- Global, North America, South America, EMEA, APAC, LATAM, ANZ, UK/Ireland, DACH, Nordics, Japan, Korea, India, ASEAN, MENA, Sub-Saharan Africa, Central America, Eastern Europe, Southern Europe, Western Europe, GCC, Benelux, Iberia

**Business units**
- Product, Engineering, Platform, Infrastructure, Security, Data, AI/ML, Research, Customer Success, Support, Sales, Sales Engineering, Marketing, Finance, Legal, HR, Procurement, Operations, Compliance, Partnerships, IT, Developer Relations, Trust & Safety, Reliability, Growth, Analytics, Revenue Operations

**Sales regions**
- Global Strategic, Enterprise, Mid-Market, SMB, Public Sector, Healthcare, Financial Services, Education, Energy, Retail, Manufacturing, Media, Government, Defense, Nonprofit, Startup, Strategic Partnerships

**KPIs**
- Lead time for changes, deployment frequency, MTTR, change failure rate, defect escape rate, onboarding time, incident volume, audit prep time, NPS, renewal rate, ARR expansion, support ticket resolution time, cost per ticket, revenue retention, pipeline velocity, cycle time, engineering throughput

**Value lenses**
- $USD/hour saved, $USD/hour at risk avoided, $USD/hour accelerated revenue, $USD/hour reduced cost

**Per-employee framing**
- Engineering hours saved, review hours saved, on-call hours saved, compliance hours saved, support hours saved, sales engineering hours saved, research hours saved, analyst hours saved, QA hours saved
