# Learning a new programming language with GitHub Copilot

GitHub Copilot Chat can help you extend your programming skills by learning how to code in a new programming language.

## Introduction

GitHub Copilot can help you learn how to code: whether you have no prior programming experience, or when you are learning an additional programming language. This guide is all about the latter use case: you already have a good knowledge of how to code in one or more programming languages, but now you want to learn a new language.

### Prerequisites

This guide assumes that you know how to use Copilot Chat and Copilot inline suggestions in your IDE. See [Asking GitHub Copilot questions in your IDE](/en/copilot/using-github-copilot/copilot-chat/asking-github-copilot-questions-in-your-ide) and [Getting code suggestions in your IDE with GitHub Copilot](/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot).

## Start with the basics

Use Copilot Chat to research the basics of the new language. Find out how this language differs from the languages you already know. Ask Copilot to tell you the main things you need to be aware of before you start coding in the new language.

### Example prompts: language basics

These are some prompts that you can use in Copilot Chat to help you learn the basics of a new programming language. Change `NEW-LANGUAGE` to the name of the language you want to find out about.

<!-- Note: spaces added between bulleted points to avoid the list looking cramped in the rendered page. -->

* `What is NEW-LANGUAGE best suited for? I am an experienced Python programmer, but I don't know anything about NEW-LANGUAGE.`
* `What are the main ways in which NEW-LANGUAGE differs from other languages? Explain the most essential things I need to know as an experienced programmer who wants to learn to code in NEW-LANGUAGE.`
* `How can I install NEW-LANGUAGE?`
* `How does error handling work in NEW-LANGUAGE?`
* `How do you manage dependencies and packages in NEW-LANGUAGE?`
* `What are the most essential libraries or frameworks I should know about for NEW-LANGUAGE?`
* `What testing frameworks does the NEW-LANGUAGE community typically use?`
* `What are the biggest mistakes newcomers to NEW-LANGUAGE typically make with this language?`
* `As an experienced programmer learning NEW-LANGUAGE, what are the things I should focus on first?`

## Use Copilot as your personal trainer

GitHub Copilot can write code for you. You can ask it to create chunks of code, functions, or even entire programs. However, when you are learning a new language, you should avoid relying on Copilot to write much of the code for you—especially if you accept the code it suggests without making sure you understand it. If you don't know the language, you won't know if the code Copilot suggests is as good as it could be. Instead, you should treat Copilot as your personalized training assistant.

When you ask Copilot how to code something specific in the new language, you should ask it to explain the code it suggests. If you don't completely understand the code, or Copilot's description of it, ask for a simplified explanation—or ask for more detail—until you are sure you understand the code. Always avoid using any code that you are not completely confident that you understand.

### Example prompts: asking for an explanation

Change `NEW-LANGUAGE` to the name of the language you want to find out about.

<!-- Note: spaces added between bulleted points to avoid the list looking cramped in the rendered page. -->

* `Explain your previous suggestion in more detail. I am new to NEW-LANGUAGE and I don't understand the code you suggested.`
* `Show me how to write the following Ruby code in NEW-LANGUAGE: people_over_50 = people.select { |person| person.age > 50 }. Explain each part of the NEW-LANGUAGE code that you suggest.`
* `Add comprehensive comments to this NEW-LANGUAGE file to explain what each part of the code does.`

## Write a simple program in the new language

To get started, write a simple program that you would be able to write easily in a language you already know. Ask Copilot for help. If you prefer, you can ask Copilot to write a very simple program for you, just to get you started. You can then examine the code, learn how it works, and then extend the program yourself.

### Example prompts: writing a simple program

<!-- Note: spaces added between bulleted points to avoid the list looking cramped in the rendered page. -->

* `Show me the Rust code for a simple, useful command line tool that asks for user input and returns some useful information based on what was entered.`
* `Comment the suggested code more thoroughly. I want to understand what every part of this code does.`
* `Give me the code for a very small Android app written in Kotlin.`
* `Suggests ways I could enhance this app.`

### Use comments and Copilot inline suggestions

As an alternative to asking Copilot Chat to suggest the basic code for a new program, you can write comments in the editor and see what code Copilot suggests.

For example:

1. In your IDE, create a file with an appropriate file name extension for the language you are using. For example, if you are learning Rust, create a file called `example.rs`.
2. Copy and paste the following comment lines.

   ```rust
   // NEW-LANGUAGE command line program to find the day of the week for a date.
   // The program does the following:
   // Prompt user to input string in format YYYYMMDD
   // Parse the string to check that it is a valid date.
   // If it's not, print an error message and exit.
   // Calculate the day of the week for the given date.
   // Print the day of the week to the user.
   ```

3. If necessary, change the comment syntax to match the language you are using.
4. Change `NEW-LANGUAGE` to the name of the language you are using. This, and the file name extension, will tell Copilot which language to use.
5. Press return and tab to see and accept the inline suggestions that Copilot offers. Continue accepting suggestions until you have a complete program.
6. Read through the code to see how it works. If you don't understand any part of the code, ask Copilot to explain it. For example:

   1. Select one or more lines of code that you don't understand.
   2. **In VS Code:**

      Right-click the selected code and choose **Copilot** > **Explain**.

      **In JetBrains IDEs:**

      Right-click the selected code and choose **GitHub Copilot** > **Explain This**.

      **In Visual Studio:**

      Open the Copilot Chat panel and enter the prompt `Explain this code`.

## Ask Copilot specific questions

While you are learning a new language, you should work on small units of code that perform a specific task. Ask Copilot well-defined, narrowly scoped questions to help you become familiar with the syntax and idioms of the new language.

### Example prompts: specific questions

Change `NEW-LANGUAGE` to the name of the language you want to find out about.

<!-- Note: spaces added between bulleted points to avoid the list looking cramped in the rendered page. -->

* `Explain all of the various ways that conditionals can be coded in NEW-LANGUAGE.`
* `In JavaScript I'd write: The ${numCats === 1 ? 'cat is' : 'cats are'} hungry. How do I write this in NEW-LANGUAGE?`
* `In NEW-LANGUAGE, how do I convert a string to all lowercase?`
* `What is the equivalent of num++ in NEW-LANGUAGE?`
* `How do I run a program written in the NEW-LANGUAGE programming language?`
* `How can I compile a single executable file for my NEW-LANGUAGE project, that I can distribute as a release?`

## Convert existing code to the new language

One effective way of leveraging your existing programming knowledge is to take some code you are familiar with in one language, convert it to the new language, and then examine how the same operation is done in the new language.

1. Find a self-contained piece of code. For example, a function.
2. Ask Copilot Chat to convert it into the language you are learning.
3. Copy and paste the suggested code into a new file in your editor.
4. View the two pieces of code side by side and analyze how the same operation is done in the new language. What are the similarities and differences?
5. Get Copilot to explain any of the code you don't understand.

## Read existing code in the new language

After you feel comfortable with the basics of the new language, spend time reading existing code written in that language.

Find a project that uses the new language and take a look at the code. Open a file and ask Copilot Chat for a brief overview of the purpose of the file. Then read through the code line by line. Do you understand the techniques that have been used? Do you know how the library and built-in functions work? Can you follow the data flow through the code?

Ask Copilot to explain any parts of the code that you don't understand.

When you have finished reading through the code, ask Copilot whether it can suggest any ways to improve the code.

## Avoid assuming that Copilot is always right

Copilot is a tool that can help you learn a new language, but—like all AI assistants—it is not infallible. It can make mistakes, and it can suggest code that is not optimal.

Copilot is trained on a large body of code but, for each language, the quality of suggestions you receive may depend on the volume and diversity of training data for that language. For example, JavaScript is well-represented in public repositories and Copilot will therefore typically be able to provide accurate and helpful suggestions. The quality of Copilot's suggestions may be lower for languages that are less well-represented in public repositories.

Always check the code that Copilot suggests, and make sure you understand it before you use it. When you're checking code suggested by Copilot, you should look for ways you could make the code more performant, simpler, or easier to maintain.

If you think Copilot has not suggested the best way of coding something you can ask it to try a different approach.

If you run the code and it generates an error, give Copilot the details of the error and ask it to fix the code.

You should also check that Copilot is following your coding style guidelines. If it is not, you can alter the repository's custom instructions to prompt Copilot to adhere to your guidelines in future. See [Adding repository custom instructions for GitHub Copilot](/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot).

### Example prompts: checking your work

<!-- Note: spaces added between bulleted points to avoid the list looking cramped in the rendered page. -->

* `Check this code for syntax errors.`
* `Assess whether this code is optimally performant.`
* `Suggest alternative ways this code could have been written.`

## Quantify learning impact with compounding value

When you are learning a new language, you can treat your time as compounding value. Ask Copilot to help you reason about time-to-value, the impact of continuous compounding, and where language learning fits into business process workflows with real use cases.

### Example prompts: compounding value and workflows

* `Model my learning time as compound value (discrete compounding). Start with 5 hours/week and show how skill investment compounds into output.`  
* `Model my learning time as continuous compounding. Use V(t) = V0 * e^(rt) and explain r in terms of weekly practice.`  
* `Map the new language to business process workflows with real use cases (data pipelines, web services, automation, analytics, and internal tools).`  
* `Estimate value in USD per hour for this language in my organization. Break it down by region, business unit, sales region, and KPI.`  

### Example groupings for USD/hour value modeling

Use Copilot to build a comprehensive list of measurable groupings and assumptions. Start with these examples and extend them for your enterprise:

* **Region:** global, North America, LATAM, EMEA, APAC, Japan, ANZ, India.  
* **Country:** United States, Canada, Brazil, United Kingdom, Germany, France, Spain, India, Singapore, Australia.  
* **Business unit:** product, engineering, data, security, sales, marketing, finance, legal, operations, customer success, support.  
* **Department:** platform, infrastructure, developer experience, ML/AI, data engineering, analytics, growth, partnerships.  
* **Team:** backend, frontend, mobile, SRE, QA, architecture, data science, ML engineering, solutions.  
* **Role:** software engineer, data engineer, data analyst, ML engineer, SRE, product manager, solutions architect.  
* **Seniority:** junior, mid, senior, staff, principal, director, VP.  
* **Sales region:** global, enterprise, mid-market, SMB, strategic accounts.  
* **Customer segment:** consumer, SMB, mid-market, enterprise, public sector.  
* **Product line:** core platform, analytics, integrations, security, marketplace, SDKs, internal tooling.  
* **Workflow type:** ETL pipelines, APIs, batch jobs, event processing, automation, reporting, internal dashboards.  
* **Use case:** incident response automation, revenue analytics, lead scoring, churn analysis, cost optimization.  
* **KPI:** revenue per employee, gross margin, operating margin, CAC, LTV, NRR, ARPA, uptime, MTTR.  
* **Cost center:** cloud spend, compute, storage, support, sales enablement, R&D.  
* **Time horizon:** weekly, monthly, quarterly, annual.  
* **Employee grouping:** per employee, per team, per department, per business unit.
