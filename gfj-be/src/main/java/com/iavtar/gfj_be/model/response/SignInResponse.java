package com.iavtar.gfj_be.model.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Builder
@Getter
@Setter
public class SignInResponse {

    private Long id;

    private String username;

    private String name;

    private String email;

    private String phoneNumber;

    private Set<String> roles;

    private Set<String> dashboardTabs;

    private String token;

}
