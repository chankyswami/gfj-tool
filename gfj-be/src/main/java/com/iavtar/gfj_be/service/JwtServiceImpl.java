package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.security.SecurityConstant;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class JwtServiceImpl implements JwtService {
    @Override
    public String getJwtTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    public boolean isValidToken(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(SecurityConstant.JWT_SECRET.getBytes());
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT Signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token" + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }

    @Override
    public String getUsername(String token) {
        Key key = Keys.hmacShaKeyFor(SecurityConstant.JWT_SECRET.getBytes());
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return (String) claims.get("username");
    }

    @Override
    public String generateToken(Optional<AppUser> appUser) {
        Date date = new Date(System.currentTimeMillis());
        Date expiryDate = new Date(date.getTime() + SecurityConstant.JWT_EXPIRATION);
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", appUser.get().getUsername());
        claims.put("roles", appUser.get().getRoles());
        Key key = Keys.hmacShaKeyFor(SecurityConstant.JWT_SECRET.getBytes());
        return Jwts.builder().setClaims(claims).setIssuedAt(new Date()).setExpiration(expiryDate).signWith(key, SignatureAlgorithm.HS512).compact();
    }

}
