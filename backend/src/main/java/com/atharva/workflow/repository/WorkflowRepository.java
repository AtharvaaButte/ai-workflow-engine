package com.atharva.workflow.repository;

import com.atharva.workflow.entity.WorkflowEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<WorkflowEntity, UUID> {
}
