package com.atharva.workflow.controller;

import com.atharva.workflow.model.Workflow;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestWorkflowController {
    @PostMapping("/workflow")
    public ResponseEntity<String> testWorkflow(@RequestBody Workflow workflow) {
        System.out.println(workflow.toString());
        System.out.println(workflow.getMetadata().getName());
        return ResponseEntity.ok("success");
    }
}
