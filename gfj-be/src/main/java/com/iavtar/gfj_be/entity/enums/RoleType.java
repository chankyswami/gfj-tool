package com.iavtar.gfj_be.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum RoleType {

    SUPER_ADMIN("super_admin"),
    BUSINESS_ADMIN("business_admin"),
    AGENT("agent");

    private String value;

    @JsonValue
    public String getValue() {
        return this.value;
    }

    @JsonCreator
    public RoleType from(String data) {
        for (RoleType roleType : RoleType.values()) {
            if (roleType.value.equalsIgnoreCase(data)) {
                return roleType;
            } else {
                throw new IllegalArgumentException(data + " Role not present");
            }
        }
        return null;
    }

}
