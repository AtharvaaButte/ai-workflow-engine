package com.atharva.workflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
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

    @OneToMany( mappedBy = "workflow",cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<NodeEntity> nodes;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<EdgeEntity> edges;

}
