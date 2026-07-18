package com.atharva.workflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "workflows")
@Getter
@Setter
public class WorkflowEntity {

    @Id
    @GeneratedValue
    @Column(name = "workflow_id", updatable = false, nullable = false)
    private UUID Id;

    @Embedded
    private Metadata metadata;

}
