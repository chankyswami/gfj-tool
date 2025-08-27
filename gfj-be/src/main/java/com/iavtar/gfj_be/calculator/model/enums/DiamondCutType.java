package com.iavtar.gfj_be.calculator.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
@AllArgsConstructor
public enum DiamondCutType {

    Round("Round"),
    BAGUETTE_STRAIGHT("Baguette Straight");

    private String value;

    public static DiamondCutType fromValue(String value) {
        for (DiamondCutType type : values()) {
            if (type.getValue().equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unexpected value " + value);
    }

}