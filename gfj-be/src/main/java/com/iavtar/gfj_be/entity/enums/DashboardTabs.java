package com.iavtar.gfj_be.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum DashboardTabs {

    ADMINISTRATION("administration"),
    AGENT_ADMINISTRATION("agent_administration"),
    CLIENT_ADMINISTRATION("client_administration"),
    CALCULATOR("calculator"),
    LEDGER("ledger"),
    SHIPPING("shipping"),
    ANALYTICS("analytics"),
    QUOTATION("quotation");

    private final String value;

    @JsonValue
    public String getValue() {
        return this.value;
    }

    @JsonCreator
    public static DashboardTabs from(String data) {
        for (DashboardTabs dashboard : DashboardTabs.values()) {
            if (dashboard.value.equalsIgnoreCase(data)) {
                return dashboard;
            }
        }
        throw new IllegalArgumentException(data + " Dashboard not present");
    }

}
