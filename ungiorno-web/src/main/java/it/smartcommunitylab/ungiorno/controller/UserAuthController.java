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
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;
import it.smartcommunitylab.ungiorno.utils.Utils;

import java.io.IOException;
import java.net.URLEncoder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.ObjectMapper;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.aac.model.TokenData;
import eu.trentorise.smartcampus.network.JsonUtils;
import eu.trentorise.smartcampus.profileservice.model.BasicProfile;

@Controller
public class UserAuthController {
	private static final transient Logger logger = LoggerFactory.getLogger(UserAuthController.class);
			
	@Autowired
	private PermissionsManager permissions;

	@RequestMapping("/userlogin")
	public void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.sendRedirect(permissions.getAuthorizationURL(null));
	}
	@RequestMapping("/userlogin/{authority}")
	public void loginAuthority(@PathVariable String authority, @RequestParam(required=false) String token, HttpServletResponse response) throws IOException {
		String url = permissions.getAuthorizationURL("/"+authority);
		if (token != null) {
			url += "&token="+token;
		}
		response.sendRedirect(url);
	}
	@RequestMapping("/userlogininternal")
	public @ResponseBody BasicProfile loginInternal(@RequestParam String email, @RequestParam String password, HttpServletRequest request, HttpServletResponse response) throws IOException {
		String url = permissions.getLoginURL(email, password);

		try {
			HttpResponse postResult = Utils.postJSON(url, "");
			int status = postResult.getStatusLine().getStatusCode();
			String contentType = postResult.getLastHeader("Content-Type").getValue();
			logger.info("login response: {} / {}", contentType, status);
			// tricky case: authentication error is returned as html page 
			if (!StringUtils.isEmpty(contentType) && !contentType.startsWith("application/json")) {
				response.setStatus(HttpStatus.SC_UNAUTHORIZED);
				return null;
			}
			if (status == 200) {
				String str = EntityUtils.toString(postResult.getEntity(),"UTF-8");
				TokenData data = TokenData.valueOf(str);
				return permissions.authenticate(request, response, data, true);
			}
			response.setStatus(status);
		} catch (Exception e) {
			logger.error("Error occured: ", e);
			response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
		}
		return null;
	}
	
	@RequestMapping(value="/register", method=RequestMethod.POST)
	public void register(@RequestBody RegUser user, HttpServletResponse response) {
		String url = permissions.getRegisterURL();
		try {
			int result = Utils.postJSON(url, new ObjectMapper().writeValueAsString(user)).getStatusLine().getStatusCode();
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
			TokenData tokenData = permissions.codeToToken(request.getParameter("code"));
					
			BasicProfile basicProfile = permissions.authenticate(request, response, tokenData, true);
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
}
