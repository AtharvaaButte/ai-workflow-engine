package com.atharva.workflow.repository;

import com.atharva.workflow.entity.UserEntity;
import com.atharva.workflow.entity.WorkflowEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkflowRepository extends JpaRepository<WorkflowEntity, UUID> {

    List<WorkflowEntity> findAllByUser(UserEntity user);

    Optional<WorkflowEntity> findByIdAndUser(UUID id, UserEntity user);
}
