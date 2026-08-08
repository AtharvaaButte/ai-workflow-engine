package com.atharva.workflow.controller;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.dto.UpdateWorkflowRequest;
import com.atharva.workflow.entity.WorkflowEntity;
import com.atharva.workflow.model.Workflow;
import com.atharva.workflow.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/v1/workflows")
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

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflow(@PathVariable UUID id) {
        return workflowService.getWorkflow(id)
                .map(workflow -> ResponseEntity.ok().body(workflow))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows() {
        System.out.println("Getting req");
        List<Workflow> workflows = workflowService.getWorkflows();
        System.out.println(workflows);
        return ResponseEntity.ok(workflows);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable UUID id) {
        boolean deleted = workflowService.deleteWorkflow(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(
            @PathVariable UUID id,
            @RequestBody UpdateWorkflowRequest request
    ){
        return workflowService.updateWorkflow(id,request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
