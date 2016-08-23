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
package it.smartcommunitylab.ungiorno.utils;

import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.Person;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.TreeMap;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.common.collect.Maps;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.communicator.CommunicatorConnector;
import eu.trentorise.smartcampus.communicator.CommunicatorConnectorException;
import eu.trentorise.smartcampus.communicator.model.AppSignature;
import eu.trentorise.smartcampus.communicator.model.Notification;
import eu.trentorise.smartcampus.communicator.model.UserSignature;

/**
 * @author raman
 *
 */
@Component
public class NotificationManager {

	public static final String APP_UGAS_PARENT = ".parent";
	public static final String APP_UGAS_DIARY = ".diary";

	public static final String APP_UGAS_COMMS = "%s.comms.%s";
	public static final String APP_UGAS_TEACHER = "%s.teacher.%s";
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationManager.class);

	@Autowired
	private PermissionsManager permissions;

	@Autowired
	private AppSetup appSetup;
	
	@Autowired
	@Value("${communicatorURL}")
	private String communicatorURL;		

	private CommunicatorConnector communicator;

	@Autowired
	private RepositoryManager storage;
	
	@PostConstruct
	public void init() throws Exception {
		communicator = new CommunicatorConnector(communicatorURL);
		registerApps();
	}


	public void registerUser(String appId, String registrationId, String appNameSuffix) throws SecurityException, CommunicatorConnectorException, AACException {
		UserSignature signature = new UserSignature();
		String appName = appSetup.getAppsMap().get(appId).getMessagingAppId() + appNameSuffix;
		signature.setAppName(appName);
		signature.setRegistrationId(registrationId);
		communicator.registerUserToPush(signature, appName, permissions.getUserAccessToken());
	}

	public void sendCommunicationMessage(String appId, String schoolId, Communication message) throws CommunicatorConnectorException, AACException {
		Map<String, Object> content = new TreeMap<String, Object>();
		content.put("type", "communication");
		content.put("schoolId", schoolId);
		content.put("communicationId", message.getCommunicationId());
		content.put("dateToCheck", message.getDateToCheck());
		
		Notification n = prepareMessage(message.getText(), content);
		n.setTitle("Nuova communicazione");

		String appName = channelName(appSetup.getAppsMap().get(appId).getMessagingAppId(), schoolId, APP_UGAS_COMMS);
		communicator.sendAppNotification(n, appName, Collections.<String>emptyList(), permissions.getAppToken());
	}
	
	public void sendDirectMessageToParents(String appId, String schoolId, String kidId, String teacherId, String message, String messageId) throws CommunicatorConnectorException, AACException {
		KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);
		List<String> userIds = new ArrayList<String>();
		for (String personId : kid.getParents()) {
			Person person = storage.getPerson(appId, schoolId, personId);
			LoginData loginData = storage.getTokenData(person.getUsername());
			if (loginData != null) {
				userIds.add(loginData.getUserAACId());
			}
		}
		
		Map<String, Object> content = new TreeMap<String, Object>();
		content.put("type", "chat");
		content.put("kidId", kidId);
		content.put("teacherId", teacherId);
		content.put("schoolId", schoolId);
		content.put("messageId", messageId);

		Notification n = prepareMessage(message, content);
		n.setTitle("Nuovo messaggio");
		
		String appName = appSetup.getAppsMap().get(appId).getMessagingAppId() + APP_UGAS_PARENT;
		communicator.sendAppNotification(n, appName, userIds, permissions.getAppToken());
	}
	public void sendDirectMessageToSchool(String appId, String schoolId, String kidId, String message, String messageId) throws CommunicatorConnectorException, AACException {
		Map<String, Object> content = new TreeMap<String, Object>();
		content.put("type", "chat");
		content.put("schoolId", schoolId);
		content.put("kidId", kidId);
		content.put("messageId", messageId);
			
		Notification n = prepareMessage(message, content);
		n.setTitle("Nuovo messaggio");

		String appName = channelName(appSetup.getAppsMap().get(appId).getMessagingAppId(), schoolId, APP_UGAS_TEACHER);
		communicator.sendAppNotification(n, appName, Collections.<String>emptyList(), permissions.getAppToken());
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
							appId = cred.getMessagingAppId()+APP_UGAS_DIARY;
							signature.setAppId(appId);
							communicator.registerApp(signature, appId, token);
							
							if (cred.getSchools() != null) {
								for (School school : cred.getSchools()) {
									appId = channelName(cred.getMessagingAppId(), school.getSchoolId(), APP_UGAS_COMMS);
									signature.setAppId(appId);
									communicator.registerApp(signature, appId, token);
									appId = channelName(cred.getMessagingAppId(), school.getSchoolId(), APP_UGAS_TEACHER);
									signature.setAppId(appId);
									communicator.registerApp(signature, appId, token);
								}
							}
							
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

	private Notification prepareMessage(String text, Map<String, Object> content) {
		Notification not = new Notification();
		not.setDescription(text);
		not.setContent(content);
		long when = System.currentTimeMillis();
		not.setTimestamp(when);
		return not;
	}

	private String channelName(String appId, String schoolId, String template) {
		return String.format(template, appId, schoolId);
	}
	
}
