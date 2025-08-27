package com.iavtar.gfj_be.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ServiceResponse {

    private String message;
    private Object data;

}
