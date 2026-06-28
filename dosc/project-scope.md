# AI Workflow Engine — Project Scope

## What Problem This Solves
Stop hardcoding business logic. Instead of writing backend code for every custom business rule, this engine reads a dynamic JSON graph at runtime to execute AI classifications, routing, and notifications.

## Who Uses It
* **Client Admins (Business Owners):** Build and configure workflows via JSON.
* **Client Website Users:** Trigger workflows automatically by interacting with the client's website (e.g., submitting a contact form).

## SaaS Model Architecture
1. **Our Engine:** Stores configurations, processes graph traversal, logs node executions.
2. **Client Backend:** Catches user input and forwards it to our engine via webhook (`POST /webhook/{id}`).

## Execution Model (MVP Boundaries)
* **MVP Model:** 100% **Synchronous**. The client backend waits for the execution to finish and gets the result instantly. (Async queueing via Redis/Spring Async will be added later).
* **In-Scope (MVP):** Workflow CRUD, JSON parser, strategy-pattern node handlers (HTTP Trigger, AI Classifier, Condition, DB Save, Email, Slack, Response), execution logging, and basic retries.
* **Out-of-Scope (Later):** Drag-and-drop UI, user authentication, multi-tenancy, analytics dashboard, and distributed workers.