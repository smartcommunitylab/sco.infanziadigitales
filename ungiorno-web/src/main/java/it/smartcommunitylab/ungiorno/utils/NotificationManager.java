/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.TreeMap;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.google.common.collect.Maps;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.communicator.CommunicatorConnector;
import eu.trentorise.smartcampus.communicator.CommunicatorConnectorException;
import eu.trentorise.smartcampus.communicator.model.AppSignature;
import eu.trentorise.smartcampus.communicator.model.Notification;
import eu.trentorise.smartcampus.communicator.model.UserSignature;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.Author;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.storage.AppSetup;

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
    private RepositoryService storage;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;


    @PostConstruct
    public void init() throws Exception {
        communicator = new CommunicatorConnector(communicatorURL);
        // registerApps();
    }


    public void registerUser(String appId, String registrationId, String platform,
            String appNameSuffix)
            throws SecurityException, CommunicatorConnectorException, AACException {
        UserSignature signature = new UserSignature();
        String appName = appSetup.getAppsMap().get(appId).getMessagingAppId() + appNameSuffix;
        signature.setAppName(appName);
        signature.setRegistrationId(registrationId);
        if (platform != null) {
            signature.setPlatform(platform);
        }
        communicator.registerUserToPush(signature, appName, permissions.getUserAccessToken());
    }

    public void sendCommunicationMessage(String appId, String schoolId, Communication message,
            boolean isUpdate) throws CommunicatorConnectorException, AACException {
        Map<String, Object> content = new TreeMap<String, Object>();
        content.put("type", "communication");
        content.put("schoolId", schoolId);
        content.put("communicationId", message.getCommunicationId());
        content.put("dateToCheck", message.getDateToCheck());
        if (message.getGroupId() != null) {
        	content.put("groupId", message.getGroupId());
        }

        Notification n = prepareMessage(message.getDescription(), content);
        if (isUpdate) {
            n.setTitle("Comunicazione modificata");
        } else {
            n.setTitle("Nuova comunicazione");
        }

        String appName = channelName(appSetup.getAppsMap().get(appId).getMessagingAppId(), schoolId,
                APP_UGAS_COMMS);
        String groupId = message.getGroupId();
        if (groupId != null) {
            List<KidProfile> kids = storage.getKidsBySection(appId, schoolId, groupId);
            Set<String> parentIds = new HashSet<>();
            for (KidProfile kid : kids) {
                for (AuthPerson p : kid.getPersons()) {
                    if (p.isParent()) {
                        LoginData loginData =
                                storage.getTokenDataByPersonId(p.getPersonId(), appId);
                        if (loginData != null) {
                            parentIds.add(loginData.getUserAACId());
                        }
                    }
                }
            }
            if (parentIds.size() > 0) {
            	logger.info("Sending group ("+groupId+") communication to "+parentIds);
                // replace channel with direct parent communication
            	appName = appSetup.getAppsMap().get(appId).getMessagingAppId() + APP_UGAS_PARENT;
                communicator.sendAppNotification(n, appName, new LinkedList<>(parentIds), permissions.getAppToken());            	
            }
        } else {
            communicator.sendAppNotification(n, appName, Collections.<String>emptyList(),
                    permissions.getAppToken());
        }
    }

    public void notifyMessageStatusByParent(String appId, String schoolId, String kidId,
            String messageId, String status) {
        simpMessagingTemplate.convertAndSend(
                "/topic/toteacher." + appId + "." + kidId + "." + status, messageId);
    }

    public void notifyMessageStatusByTeacher(String appId, String schoolId, String kidId,
            String messageId, String status) {
        simpMessagingTemplate
                .convertAndSend("/topic/toparent." + appId + "." + kidId + "." + status, messageId);
    }

    public void sendDirectMessageToParents(String appId, String schoolId, String kidId,
            String teacherId, Author author, String message, String messageId)
            throws CommunicatorConnectorException, AACException {
        KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);
        List<String> userIds = new ArrayList<String>();
        for (AuthPerson p : kid.getPersons()) {
            if (p.isParent()) {
                LoginData loginData = storage.getTokenDataByPersonId(p.getPersonId(), appId);
                if (loginData != null) {
                    userIds.add(loginData.getUserAACId());
                }
            }
        }

        logger.info("Send direct message to parents of "+kidId+": "+userIds);;
        
        Map<String, Object> content = new TreeMap<String, Object>();
        content.put("type", "chat");
        content.put("kidId", kidId);
        content.put("teacherId", teacherId);
        if (author != null) {
            content.put("author", author);
        }
        content.put("schoolId", schoolId);
        content.put("messageId", messageId);

        Notification n = prepareMessage(message, content);
        n.setTitle("Messaggio per "+ kid.getFirstName());

        String appName = appSetup.getAppsMap().get(appId).getMessagingAppId() + APP_UGAS_PARENT;
        communicator.sendAppNotification(n, appName, userIds, permissions.getAppToken());
        simpMessagingTemplate.convertAndSend("/topic/toparent." + appId + "." + kidId, n);
    }

    public void sendDirectMessageToSchool(String appId, String schoolId, String kidId,
            Author author, String message, String messageId)
            throws CommunicatorConnectorException, AACException {
        Map<String, Object> content = new TreeMap<String, Object>();
        content.put("type", "chat");
        content.put("schoolId", schoolId);
        content.put("kidId", kidId);
        content.put("messageId", messageId);
        if (author != null) {
            content.put("author", author);
        }

        Notification n = prepareMessage(message, content);
        n.setTitle("Messaggio per " + storage.getKidProfile(appId, schoolId, kidId).getFirstName());

        String appName = channelName(appSetup.getAppsMap().get(appId).getMessagingAppId(), schoolId,
                APP_UGAS_TEACHER);
        communicator.sendAppNotification(n, appName, Collections.<String>emptyList(),
                permissions.getAppToken());
        simpMessagingTemplate.convertAndSend("/topic/toteacher." + appId + "." + kidId, n);

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

                    try {
                        String appId = cred.getMessagingAppId() + APP_UGAS_PARENT;
                        signature.setAppId(appId);
                        communicator.registerApp(signature, appId, token);
                    } catch (Exception e) {
                        logger.error("Exception register app in NotificationManager",
                                e.getMessage());
                    }

                    if (cred.getSchools() != null) {
                        for (School school : cred.getSchools()) {
                            try {
                                String appId = channelName(cred.getMessagingAppId(),
                                        school.getSchoolId(), APP_UGAS_COMMS);
                                signature.setAppId(appId);
                                communicator.registerApp(signature, appId, token);
                                appId = channelName(cred.getMessagingAppId(), school.getSchoolId(),
                                        APP_UGAS_TEACHER);
                                signature.setAppId(appId);
                                communicator.registerApp(signature, appId, token);
                            } catch (Exception e) {
                                logger.error("Exception register school in NotificationManager: "
                                        + school.getSchoolId(), e.getMessage());
                            }
                        }
                    }
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
