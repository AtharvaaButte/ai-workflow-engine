package com.atharva.workflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Entity
@Table(name = "workflow_nodes")
@Getter
@Setter
public class NodeEntity {
    @Id
    @Column(name = "node_id")
    private String id;

    @Column( name =  "node_type", nullable = false)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id" , nullable = false)
    private WorkflowEntity workflow;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "node_configs", joinColumns = @JoinColumn(name = "node_id"))
    @MapKeyColumn(name = "config_key")
    @Column ( name = "config_value", length =1000)
    private Map<String,String> config;
}
