package com.atharva.workflow.controller;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.model.Workflow;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {
    private List<Workflow> workflows = new ArrayList<>();
    //    Creating workflow
    @PostMapping
    public ResponseEntity<String> createWorkflow(@RequestBody CreateWorkflowRequest request) {
        System.out.println(request.toString());
        Workflow workflow = new Workflow(
                UUID.randomUUID(),
                request.getMetadata(),
                request.getNodes(),
                request.getEdges()
        );
        workflows.add(workflow);
        System.out.println(workflow.toString());
        return ResponseEntity.ok().body("Workflow created successfully");
    }
}
