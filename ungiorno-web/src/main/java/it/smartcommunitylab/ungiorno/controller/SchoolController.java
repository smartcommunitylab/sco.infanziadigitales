/**
 * Copyright 2015 Fondazione Bruno Kessler - Trento RISE
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
 */

package it.smartcommunitylab.ungiorno.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import it.smartcommunitylab.ungiorno.model.BusData;
import it.smartcommunitylab.ungiorno.model.Communication;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;
import it.smartcommunitylab.ungiorno.usage.UsageManager;
import it.smartcommunitylab.ungiorno.utils.JsonUtil;
import it.smartcommunitylab.ungiorno.utils.NotificationManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

@RestController
public class SchoolController {
    private static final transient Logger logger = LoggerFactory.getLogger(SchoolController.class);

    @Autowired
    private AppSetup appSetup;
    
    @Autowired
    private RepositoryService storage;

    @Autowired
    private PermissionsManager permissions;

    @Autowired
    private NotificationManager notificationManager;

    @Autowired
    private UsageManager usageManager;

    @RequestMapping(method = RequestMethod.GET, value = "/ping")
    public @ResponseBody String ping(HttpServletRequest request, HttpServletResponse response,
            HttpSession session) {
        return "PONG";
    }


    @RequestMapping(method = RequestMethod.PUT, value = "/school/log/{appId}/{schoolId}/{kidId}/{action}")
    public @ResponseBody Response<Void> putLog(@PathVariable String appId, @PathVariable String schoolId,  @PathVariable String kidId, @PathVariable String action) {
        String userId = permissions.getUserId();
    	usageManager.parentAction(appId, schoolId, kidId, userId, UsageAction.valueOf(action));
    	return new Response<Void>();
    }

    
    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/profile")
    public @ResponseBody Response<SchoolProfile> getSchoolProfile(@PathVariable String appId,
            @PathVariable String schoolId) {
        try {
            SchoolProfile profile = storage.getSchoolProfile(appId, schoolId);
            if (logger.isDebugEnabled()) {
                logger.debug("appId: {}, schoolId: {}, schoolProfile: {}", appId, schoolId,
                        JsonUtil.convertObject(profile));
            }
            return new Response<SchoolProfile>(profile);
        } catch (Exception e) {
            if (logger.isWarnEnabled()) {
                logger.warn("getSchoolProfile:" + appId + " - " + schoolId);
                logger.warn("error", e);
            }
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/profile")
    public @ResponseBody Response<SchoolProfile> getSchoolProfileForTeacher(
            @PathVariable String appId, @RequestParam(required=false) String onBehalf) {
        try {
            String userId = permissions.getUserId();
            SchoolProfile profile = null;
            if (onBehalf != null) {
            	List<School> schools = appSetup.findSchoolsByAccount(userId);
            	School school = null;
            	for (School s: schools) {
            		if (s.getAccessEmail().equalsIgnoreCase(onBehalf)) {
            			school = s;
            			break;
            		}
            	}
            	if (school != null) {
            		profile = storage.getSchoolProfileForUser(appId, onBehalf);
            	}
            } else {
            	profile = storage.getSchoolProfileForUser(appId, userId);            	
            }
            
            if (logger.isDebugEnabled()) {
                logger.debug("appId: {}, schoolId: {}, schoolProfile for teacher: {}", appId,
                        JsonUtil.convertObject(profile));
            }
            return new Response<SchoolProfile>(profile);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST,
            value = "/school/{appId}/{schoolId}/communications")
    public @ResponseBody Response<Communication> sendCommunication(@RequestBody Communication comm,
            @PathVariable String appId, @PathVariable String schoolId) {

        String teacherId = permissions.getUserId();

        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, teacherId)) {
                throw new SecurityException("User is not associated to this school");
            }
            comm.setAppId(appId);
            comm.setSchoolId(schoolId);
            Communication old =
                    storage.getCommunicationById(appId, schoolId, comm.getCommunicationId());
            if (comm.getScadenzaDate() != null && comm.getScadenzaDate() == 0) comm.setScadenzaDate(null);
            Communication result = storage.saveCommunication(comm);

            if (old == null || !old.getDescription().equals(comm.getDescription())
                    || old.getDateToCheck() != comm.getDateToCheck()
                    || old.isDoCheck() != comm.isDoCheck()) {
                notificationManager.sendCommunicationMessage(appId, schoolId, comm, old != null);

                if (old == null) {
                    usageManager.messageSent(appId, schoolId, teacherId, null, null, UsageAction.COMMUNICATION);
                }
            }

            return new Response<>(result);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/communications")
    public @ResponseBody Response<List<Communication>> getComms(@PathVariable String appId,
            @PathVariable String schoolId) {

        try {
            List<Communication> list = storage.getCommunications(appId, schoolId);
            return new Response<>(list);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.DELETE,
            value = "/school/{appId}/{schoolId}/communications/{commId}")
    public @ResponseBody Response<Void> deleteCommunication(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String commId) {

        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
                throw new SecurityException("User is not associated to this school");
            }
            storage.deleteCommunication(appId, schoolId, commId);
            return new Response<>((Void) null);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/teachers")
    public @ResponseBody Response<List<Teacher>> getTeachers(@PathVariable String appId,
            @PathVariable String schoolId) {

        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
                throw new SecurityException("User is not associated to this school");
            }
            List<Teacher> list = storage.getTeachers(appId, schoolId);
            return new Response<>(list);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    // @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/teacher")
    // public @ResponseBody Response<Teacher> getTeacher(@PathVariable String appId, @PathVariable
    // String schoolId) {
    // String username = permissions.getUserId();
    // try {
    // Teacher result = storage.getTeacher(username, appId, schoolId);
    // return new Response<>(result);
    // } catch (Exception e) {
    // return new Response<>(e.getMessage());
    // }
    // }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/teacher/{pin}")
    public @ResponseBody Response<Teacher> getTeacherByPin(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String pin) {
        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
                throw new SecurityException("User is not associated to this school");
            }
            Teacher result = storage.getTeacherByPin(pin, appId, schoolId);
            return new Response<>(result);
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/buses")
    public @ResponseBody Response<BusData> getBuses(@PathVariable String appId,
            @PathVariable String schoolId, @RequestParam long date) {

        try {
            BusData buses = storage.getBusData(appId, schoolId, date);
            return new Response<>(buses);
        } catch (Exception e) {
        	logger.error("Error reading bus data", e);
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/sections")
    public @ResponseBody Response<List<SectionData>> getSections(@PathVariable String appId,
            @PathVariable String schoolId, @RequestParam long date) {
        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
                throw new SecurityException("User is not associated to this school");
            }

            // Collection<String> sections = storage.getTeacher(permissions.getUserId(), appId,
            // schoolId).getSectionIds();
            // if(logger.isInfoEnabled()) {
            // logger.info("getSections(sections):" + JsonUtil.convertObject(sections));
            // }
            List<SectionData> list = storage.getSections(appId, schoolId, null, date);
            if (logger.isDebugEnabled()) {
                logger.debug("sections: {}", JsonUtil.convertObject(list));
            }
            return new Response<>(list);
        } catch (Exception e) {
            if (logger.isWarnEnabled()) {
                logger.warn("getSections:" + appId + " - " + schoolId);
                logger.warn("erro", e);
            }
            return new Response<>(e.getMessage());
        }
    }

}
