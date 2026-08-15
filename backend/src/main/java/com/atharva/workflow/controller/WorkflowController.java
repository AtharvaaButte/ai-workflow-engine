package com.atharva.workflow.controller;

import com.atharva.workflow.dto.CreateWorkflowRequest;
import com.atharva.workflow.dto.UpdateWorkflowRequest;
import com.atharva.workflow.entity.UserEntity;
import com.atharva.workflow.entity.WorkflowEntity;
import com.atharva.workflow.model.Workflow;
import com.atharva.workflow.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/v1/workflows")
public class WorkflowController {
    private final WorkflowService workflowService;

    @Autowired
    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    //    Creating workflow
    @PostMapping
    public ResponseEntity<WorkflowEntity> createWorkflow(
            @RequestBody CreateWorkflowRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        WorkflowEntity savedWorkflow =  workflowService.createWorkflow(request, currentUser);
        return new ResponseEntity<>(savedWorkflow, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflow(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return workflowService.getWorkflow(id, currentUser)
                .map(workflow -> ResponseEntity.ok().body(workflow))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows(@AuthenticationPrincipal UserEntity currentUser) {
        System.out.println("Getting req");
        List<Workflow> workflows = workflowService.getWorkflows(currentUser);
        System.out.println(workflows);
        return ResponseEntity.ok(workflows);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        boolean deleted = workflowService.deleteWorkflow(id, currentUser);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(
            @PathVariable UUID id,
            @RequestBody UpdateWorkflowRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ){
        return workflowService.updateWorkflow(id,request, currentUser)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
