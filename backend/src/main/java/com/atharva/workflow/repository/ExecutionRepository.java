package com.atharva.workflow.repository;

import com.atharva.workflow.entity.ExecutionEntity;
import com.atharva.workflow.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExecutionRepository extends JpaRepository<ExecutionEntity, UUID> {

    @Query("SELECT e FROM ExecutionEntity e " +
            "JOIN WorkflowEntity w ON e.workflowId = w.id " +
            "WHERE w.user = :user " +
            "ORDER BY e.startedAt DESC")
    List<ExecutionEntity> findAllByUserOrderByStartedAtDesc(@Param("user") UserEntity user);

    @Query("SELECT e FROM ExecutionEntity e " +
            "JOIN WorkflowEntity w ON e.workflowId = w.id " +
            "WHERE e.id = :id AND w.user = :user")
    Optional<ExecutionEntity> findByIdAndUser(@Param("id") UUID id, @Param("user") UserEntity user);

    List<ExecutionEntity> findAllByWorkflowIdOrderByStartedAtDesc(UUID workflowId);
}