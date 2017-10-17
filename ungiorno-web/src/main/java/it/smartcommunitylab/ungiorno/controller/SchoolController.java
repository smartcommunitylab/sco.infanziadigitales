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
import it.smartcommunitylab.ungiorno.model.InternalNote;
import it.smartcommunitylab.ungiorno.model.Menu;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile.SectionProfile;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.model.SectionData;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TeacherCalendar;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageActor;
import it.smartcommunitylab.ungiorno.usage.UsageManager;
import it.smartcommunitylab.ungiorno.utils.JsonUtil;
import it.smartcommunitylab.ungiorno.utils.NotificationManager;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

@RestController
public class SchoolController {
    private static final transient Logger logger = LoggerFactory.getLogger(SchoolController.class);

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


    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/profile")
    public @ResponseBody Response<SchoolProfile> getSchoolProfile(@PathVariable String appId,
            @PathVariable String schoolId) {
        try {
            SchoolProfile profile = storage.getSchoolProfile(appId, schoolId);
            if (logger.isDebugEnabled()) {
                logger.debug("getSchoolProfile:" + appId + " - " + schoolId + " - "
                        + JsonUtil.convertObject(profile));
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
            @PathVariable String appId) {
        try {
            String userId = permissions.getUserId();
            SchoolProfile profile = storage.getSchoolProfileForUser(appId, userId);
            if (logger.isInfoEnabled()) {
                logger.info("getSchoolProfileForTeacher:" + userId + " - "
                        + JsonUtil.convertObject(profile));
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
            Communication result = storage.saveCommunication(comm);

            if (old == null || !old.getDescription().equals(comm.getDescription())
                    || old.getDateToCheck() != comm.getDateToCheck()
                    || old.isDoCheck() != comm.isDoCheck()) {
                notificationManager.sendCommunicationMessage(appId, schoolId, comm, old != null);

                if (old == null) {
                    usageManager.messageSent(appId, schoolId, teacherId, null, UsageActor.TEACHER,
                            UsageActor.PARENT, true);
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

    @RequestMapping(method = RequestMethod.POST, value = "/school/{appId}/{schoolId}/notes")
    public @ResponseBody Response<InternalNote> sendNote(@RequestBody InternalNote comm,
            @PathVariable String appId, @PathVariable String schoolId,
            @RequestParam(required = false) String[] kidIds,
            @RequestParam(required = false) String[] sectionIds,
            @RequestParam(required = false) String pin) {

        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
                throw new SecurityException("User is not associated to this school");
            }
            comm.setAppId(appId);
            comm.setSchoolId(schoolId);
            if (kidIds != null && kidIds.length > 0) {
                comm.setKidIds(kidIds);
            } else if (sectionIds != null && sectionIds.length > 0) {
                comm.setSectionIds(sectionIds);
            } else {
                List<SectionProfile> sections =
                        storage.getSchoolProfile(appId, schoolId).getSections();
                String[] allSections = new String[sections.size()];
                int i = 0;
                for (SectionProfile sp : sections) {
                    allSections[i++] = sp.getSectionId();
                }
                comm.setSectionIds(allSections);
                // comm.setSectionIds(storage.getTeacher(permissions.getUserId(), appId,
                // schoolId).getSectionIds().toArray(new String[0]));
            }

            return new Response<>(storage.saveInternalNote(comm));
        } catch (Exception e) {
            return new Response<>(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/notes")
    public @ResponseBody Response<List<InternalNote>> getNotes(@PathVariable String appId,
            @PathVariable String schoolId, @RequestParam(required = false) String[] sectionIds,
            @RequestParam long date) {

        try {
            if (!permissions.isSchoolTeacher(appId, schoolId, permissions.getUserId())) {
                throw new SecurityException("User is not associated to this school");
            }
            // if (sectionIds == null || sectionIds.length == 0) {
            // sectionIds = (String[])storage.getTeacher(permissions.getUserId(), appId,
            // schoolId).getSectionIds().toArray(new String[0]);
            // }
            List<InternalNote> list = storage.getInternalNotes(appId, schoolId, sectionIds, date);
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


    @RequestMapping(method = RequestMethod.GET, value = "/school/{appId}/{schoolId}/menu")
    public @ResponseBody Response<List<Menu>> getMeals(@PathVariable String appId,
            @PathVariable String schoolId, @RequestParam long from, @RequestParam long to) {

        try {
            List<Menu> list = storage.getMeals(appId, schoolId, from, to);
            return new Response<>(list);
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

    @RequestMapping(method = RequestMethod.GET,
            value = "/school/{appId}/{schoolId}/teachercalendar")
    public @ResponseBody Response<List<TeacherCalendar>> getTeacherCalendar(
            @PathVariable String appId, @PathVariable String schoolId, @RequestParam long from,
            @RequestParam long to) {

        try {
            List<TeacherCalendar> list = storage.getTeacherCalendar(appId, schoolId, from, to);
            return new Response<>(list);
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
            if (logger.isInfoEnabled()) {
                logger.info("getSections(list):" + JsonUtil.convertObject(list));
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
