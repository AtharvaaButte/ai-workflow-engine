# Backend Package Architecture & Responsibilities

This document defines the strict Single Responsibility Principle (SRP) for every package inside the Spring Boot application source (`src/main/java/com/yourname/engine/...`).

---

## Architecture Overview

When a webhook or API request triggers our application, data flows predictably through these isolated layers:



```text
Client Request ➔ Controller ➔ Service ➔ Engine ➔ NodeRegistry ➔ NodeHandler ➔ Repository