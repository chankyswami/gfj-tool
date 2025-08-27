package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.AppUser;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

public interface JwtService {

    String getJwtTokenFromRequest(HttpServletRequest request);

    boolean isValidToken(String token);

    String getUsername(String token);

    String generateToken(Optional<AppUser> appUser);

}