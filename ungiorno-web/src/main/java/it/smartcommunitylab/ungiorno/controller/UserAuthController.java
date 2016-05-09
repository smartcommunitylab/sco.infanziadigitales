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

package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.model.RegUser;
import it.smartcommunitylab.ungiorno.security.UnGiornoUserDetails;

import java.io.IOException;
import java.net.URLEncoder;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.params.ConnManagerParams;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.ObjectMapper;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.aac.AACService;
import eu.trentorise.smartcampus.aac.model.TokenData;
import eu.trentorise.smartcampus.network.JsonUtils;
import eu.trentorise.smartcampus.profileservice.BasicProfileService;
import eu.trentorise.smartcampus.profileservice.ProfileServiceException;
import eu.trentorise.smartcampus.profileservice.model.AccountProfile;
import eu.trentorise.smartcampus.profileservice.model.BasicProfile;

@Controller
public class UserAuthController {
	private static final transient Logger logger = LoggerFactory.getLogger(UserAuthController.class);
			
	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
	private RememberMeServices rememberMeServices;
	@Autowired
	private Environment env;
	
	private AACService service;
	private BasicProfileService profileService;

	@PostConstruct
	private void init() {
		service = new AACService(env.getProperty("ext.aacURL"), env.getProperty("ext.clientId"),
				env.getProperty("ext.clientSecret"));
		profileService = new BasicProfileService(env.getProperty("ext.aacURL"));
	}

	@RequestMapping("/userlogin")
	public void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String url = service.generateAuthorizationURIForCodeFlow(env.getProperty("ext.redirect"), null, null, null);
		response.sendRedirect(url);
	}
	@RequestMapping("/userlogin/{authority}")
	public void loginAuthority(@PathVariable String authority, @RequestParam(required=false) String token, HttpServletResponse response) throws IOException {
		String url = service.generateAuthorizationURIForCodeFlow(env.getProperty("ext.redirect"), "/"+authority, null, null);
		if (token != null) {
			url += "&token="+token;
		}
		response.sendRedirect(url);
	}
	@RequestMapping("/userlogininternal")
	public @ResponseBody BasicProfile loginInternal(@RequestParam String email, @RequestParam String password, HttpServletRequest request, HttpServletResponse response) throws IOException {
		String url = String.format("%s/oauth/token?client_id=%s&client_secret=%s&grant_type=password&username=%s&password=%s", 
				env.getProperty("ext.aacURL"), 
				env.getProperty("ext.clientId"), 
				env.getProperty("ext.clientSecret"),
				email,
				password);

		try {
			HttpResponse postResult = postJSON(url, "");
			int status = postResult.getStatusLine().getStatusCode();
			if (status == 200) {
				String str = EntityUtils.toString(postResult.getEntity(),"UTF-8");
				TokenData data = TokenData.valueOf(str);
				return processTokenData(request, response, data);
			}
			response.setStatus(status);
		} catch (Exception e) {
			response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
		}
		return null;
	}
	
	private BasicProfile processTokenData(HttpServletRequest request, HttpServletResponse response,
			TokenData tokenData) throws SecurityException, ProfileServiceException {
		BasicProfile basicProfile = profileService.getBasicProfile(tokenData.getAccess_token());
		AccountProfile accountProfile = profileService.getAccountProfile(tokenData.getAccess_token());
		
		UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
				accountProfile.getAttribute("google", "OIDC_CLAIM_email"), basicProfile.getUserId(), UnGiornoUserDetails.UNGIORNO_AUTHORITIES);			
		
		token.setDetails(new WebAuthenticationDetails(request));
		Authentication authenticatedUser = authenticationManager.authenticate(token);
		SecurityContextHolder.getContext().setAuthentication(authenticatedUser);

		rememberMeServices.loginSuccess(request, response, authenticatedUser);
		return basicProfile;
	}

	@RequestMapping(value="/register", method=RequestMethod.POST)
	public void register(@RequestBody RegUser user, HttpServletResponse response) {
		String url = String.format("%s/internal/register/rest?client_id=%s&client_secret=%s", env.getProperty("ext.aacURL"), env.getProperty("ext.clientId"), env.getProperty("ext.clientSecret"));
		try {
			int result = postJSON(url, new ObjectMapper().writeValueAsString(user)).getStatusLine().getStatusCode();
			response.setStatus(result);
		} catch (Exception e) {
			response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
			e.printStackTrace();
		}
	}
	/**
	 * This is a callback for the external AAC OAuth2.0 authentication.
	 * Exchanges code for token, recover the profile and creates the user.
	 *
	 * @param request
	 * @param response
	 * @throws AACException
	 * @throws SecurityException
	 * @throws IOException
	 */
	@RequestMapping("/ext_callback")
	public void callback(HttpServletRequest request, HttpServletResponse response) {
		try {
			TokenData tokenData = service.exchngeCodeForToken(request.getParameter("code"),
					env.getProperty("ext.redirect"));
			BasicProfile basicProfile = processTokenData(request, response, tokenData);
			if(logger.isInfoEnabled()) {
				logger.info("ext_callback:" + basicProfile.getName() + " " + basicProfile.getSurname() + " - " + basicProfile.getUserId());
			}
			response.sendRedirect("userloginsuccess?profile="
					+ URLEncoder.encode(JsonUtils.toJSON(basicProfile), "UTF-8"));
		} catch (Exception e) {
			try {
				response.sendRedirect("userloginerror?error=" + e.getMessage());
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}
	}

	@RequestMapping("/userloginsuccess")
	public String success(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return "userloginsuccess";
	}

	@RequestMapping("/userloginerror")
	public String error(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return "userloginerror";
	}
	
	public static HttpResponse postJSON(String url, String body) throws Exception {

		final HttpResponse resp;
		final HttpPost post = new HttpPost(url);

		post.setHeader("Accept", "application/json");
		post.setHeader("Content-Type", "application/json");

		StringEntity input = new StringEntity(body, "UTF-8");
		input.setContentType("application/json");
		post.setEntity(input);

		HttpClient httpClient = new DefaultHttpClient();
		final HttpParams params = httpClient.getParams();
		HttpConnectionParams.setConnectionTimeout(params, 30000);
		HttpConnectionParams.setSoTimeout(params, 30000);
		ConnManagerParams.setTimeout(params, 30000);

		
		resp = httpClient.execute(post);
		return resp;
	}	
}
