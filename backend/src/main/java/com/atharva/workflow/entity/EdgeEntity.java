package com.atharva.workflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workflow_edges")
@Getter
@Setter
public class EdgeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_node_id" , nullable = false)
    private String source;

    @Column(name = "target_node_id" , nullable = false)
    private String target;

    @Column(name = "execution_condition")
    private String condition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private WorkflowEntity workflow;
}
