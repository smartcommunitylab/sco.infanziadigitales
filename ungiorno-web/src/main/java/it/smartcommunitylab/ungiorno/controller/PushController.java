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

import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.common.collect.Maps;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.communicator.CommunicatorConnector;
import eu.trentorise.smartcampus.communicator.CommunicatorConnectorException;
import eu.trentorise.smartcampus.communicator.model.AppSignature;
import eu.trentorise.smartcampus.communicator.model.UserSignature;

/**
 * @author raman
 *
 */
@Controller
public class PushController {

	private static final Logger logger = LoggerFactory.getLogger(PushController.class);
	
	private static final String APP_UGAS_PARENT = ".parent";
	private static final String APP_UGAS_TEACHER = ".teacher";
	private static final String APP_UGAS_DIARY = ".diary";
	
	
	@Autowired
	private PermissionsManager permissions;

	@Autowired
	private AppSetup appSetup;
	
	@Autowired
	@Value("${communicatorURL}")
	private String communicatorURL;		

	private CommunicatorConnector communicator;

	@PostConstruct
	public void init() throws Exception {
		communicator = new CommunicatorConnector(communicatorURL);
		registerApps();
	}

	@RequestMapping(method = RequestMethod.GET, value = "/parent/{appId}/register")
	public @ResponseBody Response<Void> registerUgasParent(@PathVariable String appId, @RequestParam String registrationId) {
		return registerUser(appId, registrationId, APP_UGAS_PARENT);
	}
	@RequestMapping(method = RequestMethod.GET, value = "/teacher/{appId}/register")
	public @ResponseBody Response<Void> registerUgasTeacher(@PathVariable String appId, @RequestParam String registrationId) {
		return registerUser(appId, registrationId, APP_UGAS_TEACHER);
	}
	@RequestMapping(method = RequestMethod.GET, value = "/diary/{appId}/register")
	public @ResponseBody Response<Void> registerDiaryUser(@PathVariable String appId, @RequestParam String registrationId) {
		return registerUser(appId, registrationId, APP_UGAS_DIARY);
	}

	private Response<Void> registerUser(String appId, String registrationId, String appNameSuffix) {
		try {
			UserSignature signature = new UserSignature();
			String appName = appSetup.getAppsMap().get(appId).getMessagingAppId() + appNameSuffix;
			signature.setAppName(appName);
			signature.setRegistrationId(registrationId);
			
			communicator.registerUserToPush(signature, appName, permissions.getUserAccessToken());
			return new Response<>();
		} catch (Exception e) {
			return new Response<>(e.getMessage());
		}
	}

	private void registerApps() throws CommunicatorConnectorException {
		Timer timer = new Timer();

		TimerTask tt = new TimerTask() {

			@Override
			public void run() {
				String token;
				try {
					token = permissions.getAppToken();
				} catch (AACException e2) {
					logger.error("Failed generating client credentials token: " + e2.getMessage());
					return;
				}
				for (AppInfo cred : appSetup.getApps()) {
					AppSignature signature = new AppSignature();
					
					Map<String, Object> map = Maps.newHashMap();
					map.put("GCM_SENDER_API_KEY", cred.getGcmSenderApiKey());
					signature.setPrivateKey(map);
					
					map = Maps.newHashMap();
					map.put("GCM_SENDER_ID", cred.getGcmSenderId());
					signature.setPublicKey(map);
					
					boolean ok = true;

					do {
						try {
							String 
							appId = cred.getMessagingAppId()+APP_UGAS_PARENT;
							signature.setAppId(appId);
							communicator.registerApp(signature, appId, token);
							appId = cred.getMessagingAppId()+APP_UGAS_TEACHER;
							signature.setAppId(appId);
							communicator.registerApp(signature, appId, token);
							appId = cred.getMessagingAppId()+APP_UGAS_DIARY;
							signature.setAppId(appId);
							communicator.registerApp(signature, appId, token);
							
							ok = true;
						} catch (CommunicatorConnectorException e) {
							ok = false;
							try {
								Thread.sleep(10000);
							} catch (InterruptedException e1) {
							}
							e.printStackTrace();
						}
					} while (!ok);
				}

			}
		};

		timer.schedule(tt, 20000);
	}

}
