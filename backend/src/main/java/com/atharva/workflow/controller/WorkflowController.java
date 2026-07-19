package com.atharva.workflow.controller;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.entity.WorkflowEntity;
import com.atharva.workflow.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {
    WorkflowService workflowService;

    @Autowired
    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    //    Creating workflow
    @PostMapping
    public ResponseEntity<WorkflowEntity> createWorkflow(@RequestBody CreateWorkflowRequest request) {
        WorkflowEntity savedWorkflow =  workflowService.createWorkflow(request);
        return new ResponseEntity<>(savedWorkflow, HttpStatus.CREATED);
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<Workflow> getWorkflow(@PathVariable UUID id) {
//        return workflowService.getWorkflow(id)
//                .map(workflow -> ResponseEntity.ok().body(workflow))
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @GetMapping
//    public ResponseEntity<List<Workflow>> getWorkflows() {
//        return ResponseEntity.ok().body(workflowService.getWorkflows());
//    }
}
