/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 * 
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 * 
 *        http://www.apache.org/licenses/LICENSE-2.0
 * 
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.controller;

import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.utils.NotificationManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author raman
 *
 */
@Controller
public class PushController {

	@Autowired
	private PermissionsManager permissions;

	@Autowired
	private NotificationManager notificationManager;
	
	@RequestMapping(method = RequestMethod.PUT, value = "/parent/{appId}/register")
	public @ResponseBody Response<Void> registerUgasParent(@PathVariable String appId, @RequestParam String registrationId) {
		return registerUser(appId, registrationId, NotificationManager.APP_UGAS_PARENT);
	}
	@RequestMapping(method = RequestMethod.PUT, value = "/diary/{appId}/register")
	public @ResponseBody Response<Void> registerDiaryUser(@PathVariable String appId, @RequestParam String registrationId) {
		return registerUser(appId, registrationId, NotificationManager.APP_UGAS_DIARY);
	}

	private Response<Void> registerUser(String appId, String registrationId, String appNameSuffix) {
		try {
			notificationManager.registerUser(appId, registrationId, appNameSuffix);
			return new Response<>((Void)null);
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

}
