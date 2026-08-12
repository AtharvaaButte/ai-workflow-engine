package com.atharva.workflow.repository;

import com.atharva.workflow.entity.ExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExecutionRepository extends JpaRepository<ExecutionEntity, UUID> {

    /**
     * Fetches all workflow execution records ordered by start time (newest first).
     */
    List<ExecutionEntity> findAllByOrderByStartedAtDesc();

    /**
     * Fetches all execution records for a specific workflow ID ordered by start time (newest first).
     */
    List<ExecutionEntity> findByWorkflowIdOrderByStartedAtDesc(UUID workflowId);
}