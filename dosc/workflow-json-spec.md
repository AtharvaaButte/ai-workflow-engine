# Workflow JSON Specification

This document defines the exact structural contract for representing workflows as JSON graphs. The backend parser expects this schema when creating or executing workflows.

## Schema Overview

A workflow definition is a directed graph composed of structural `metadata`, an array of processing `nodes`, and an array of routing `edges`.

```json
{
  "metadata": {
    "name": "Customer Support Router",
    "version": 1,
    "description": "Routes customer issues"
  },
  "nodes": [
    {
      "id": "http_trigger_1",
      "type": "http_trigger",
      "config": {}
    },
    {
      "id": "ai_classifier_1",
      "type": "ai_classifier",
      "config": {
        "prompt": "Classify issue into billing or technical"
      }
    },
    {
      "id": "condition_1",
      "type": "condition",
      "config": {
        "field": "category"
      }
    },
    {
      "id": "send_email_1",
      "type": "send_email",
      "config": {
        "to": "billing@company.com"
      }
    }
  ],
  "edges": [
    {
      "from": "http_trigger_1",
      "to": "ai_classifier_1",
      "condition": null
    },
    {
      "from": "ai_classifier_1",
      "to": "condition_1",
      "condition": null
    },
    {
      "from": "condition_1",
      "to": "send_email_1",
      "condition": "billing"
    }
  ]
}