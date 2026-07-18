package com.atharva.workflow.entity;


import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class Metadata {
    private String name;
    private int version;
    private String description;
}
