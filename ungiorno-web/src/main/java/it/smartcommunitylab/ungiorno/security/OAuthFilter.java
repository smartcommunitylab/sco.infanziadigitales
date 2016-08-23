/**
 * Copyright 2015 Smart Community Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package it.smartcommunitylab.ungiorno.security;

import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import eu.trentorise.smartcampus.aac.model.TokenData;

/**
 * 
 * @author nawazk
 *
 */
public class OAuthFilter extends GenericFilterBean {
	private static final String BEARER_TYPE = "bearer ";
	private static final String AUTHORIZATION = "Authorization";


	@Autowired
	private PermissionsManager permissions;

	@Override
	public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
		if (request instanceof HttpServletRequest && isAuthenticationRequired()) {
			try {

				String authToken = extractToken((HttpServletRequest) request);

				if (authToken != null) {

					TokenData tokenData = new TokenData();
					tokenData.setAccess_token(authToken);
					tokenData.setExpires_in(Integer.MAX_VALUE);
					permissions.authenticate((HttpServletRequest)request, (HttpServletResponse)response, tokenData, false);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		chain.doFilter(request, response);
	}

	private boolean isAuthenticationRequired() {
		// apparently filters have to check this themselves. So make sure they
		// have a proper AuthenticatedAccount in their session.
		Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
		if ((existingAuth == null) || !existingAuth.isAuthenticated()) {
			return true;
		}

		return false;
	}

	private String extractToken(HttpServletRequest request) {
		String completeToken = request.getHeader(AUTHORIZATION);
		if (completeToken == null)
			return null;
		if (completeToken.toLowerCase().startsWith(BEARER_TYPE)) {
			completeToken = completeToken.substring(BEARER_TYPE.length());
		}
		return completeToken;
	}

}